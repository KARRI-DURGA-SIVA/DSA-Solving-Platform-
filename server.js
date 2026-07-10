"use strict";

const http = require("http");
const path = require("path");
const { createReadStream, statSync } = require("fs");

const PORT = Number(process.env.PORT || 8080);
const ROOT = __dirname;
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};
const PUBLIC_FILES = new Set(["app.css", "app.js", "index.html"]);

const server = http.createServer((request, response) => {
  if (!request.method || !["GET", "HEAD"].includes(request.method)) {
    response.setHeader("Allow", "GET, HEAD");
    return sendText(response, 405, "Method not allowed", request.method === "HEAD");
  }
  const pathname = decodePathname(request.url || "/");
  const headOnly = request.method === "HEAD";
  if (!pathname) return sendText(response, 400, "Bad request", headOnly);
  if (pathname === "/healthz") return sendText(response, 200, "ok", headOnly);

  const filePath = resolveStaticPath(pathname);
  if (!filePath) return sendText(response, 404, "Not found", headOnly);

  try {
    const fileStat = statSync(filePath);
    if (!fileStat.isFile()) return sendText(response, 404, "Not found", headOnly);

    response.writeHead(200, {
      "Content-Length": fileStat.size,
      "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": filePath.endsWith("index.html") ? "no-cache" : "public, max-age=3600"
    });
    if (headOnly) return response.end();
    const stream = createReadStream(filePath);
    stream.on("error", () => {
      if (!response.headersSent) sendText(response, 500, "Internal server error");
      else response.destroy();
    });
    stream.pipe(response);
  } catch (error) {
    sendText(response, 404, "Not found", headOnly);
  }
});

server.listen(PORT, () => {
  console.log(`CodeForge server listening on port ${PORT}`);
});

function decodePathname(url) {
  try {
    return decodeURIComponent(new URL(url, `http://localhost:${PORT}`).pathname);
  } catch (error) {
    return "";
  }
}

function resolveStaticPath(pathname) {
  const normalized = pathname === "/" ? "/index.html" : pathname;
  const publicName = normalized.slice(1);
  if (!PUBLIC_FILES.has(publicName)) return "";
  const filePath = path.resolve(ROOT, `.${normalized}`);
  const relative = path.relative(ROOT, filePath);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative) ? filePath : "";
}

function sendText(response, statusCode, message, headOnly = false) {
  const body = Buffer.from(message);
  response.writeHead(statusCode, {
    "Content-Length": body.length,
    "Content-Type": "text/plain; charset=utf-8"
  });
  response.end(headOnly ? undefined : body);
}
