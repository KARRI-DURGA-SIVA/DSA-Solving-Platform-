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

const server = http.createServer((request, response) => {
  const pathname = decodePathname(request.url || "/");
  if (!pathname) return sendText(response, 400, "Bad request");
  if (pathname === "/healthz") return sendText(response, 200, "ok");

  const filePath = resolveStaticPath(pathname);
  if (!filePath) return sendText(response, 403, "Forbidden");

  try {
    const fileStat = statSync(filePath);
    if (!fileStat.isFile()) return sendText(response, 404, "Not found");

    response.writeHead(200, {
      "Content-Length": fileStat.size,
      "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": filePath.endsWith("index.html") ? "no-cache" : "public, max-age=3600"
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    sendText(response, 404, "Not found");
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
  const filePath = path.resolve(ROOT, `.${normalized}`);
  const relative = path.relative(ROOT, filePath);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative) ? filePath : "";
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}
