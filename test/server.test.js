"use strict";

const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");

const port = 18080 + Math.floor(Math.random() * 1000);
const baseUrl = `http://127.0.0.1:${port}`;
let child;

before(async () => {
  child = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Server did not start")), 3000);
    child.once("error", reject);
    child.stdout.once("data", () => { clearTimeout(timer); resolve(); });
  });
});

after(() => child?.kill());

test("serves the application and health endpoint", async () => {
  const page = await fetch(`${baseUrl}/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /CodeForge/);

  const health = await fetch(`${baseUrl}/healthz`);
  assert.equal(await health.text(), "ok");
});

test("supports HEAD requests without a response body", async () => {
  const response = await fetch(`${baseUrl}/app.css`, { method: "HEAD" });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "");
  assert.match(response.headers.get("content-type"), /^text\/css/);
});

test("does not expose server-side project files", async () => {
  for (const pathname of ["/server.js", "/package.json", "/Dockerfile", "/../server.js"]) {
    const response = await fetch(`${baseUrl}${pathname}`);
    assert.equal(response.status, 404, pathname);
  }
});

test("rejects unsupported methods", async () => {
  const response = await fetch(`${baseUrl}/`, { method: "POST" });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD");
});
