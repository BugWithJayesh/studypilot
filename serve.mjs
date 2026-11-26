// StudyPilot static server — this PC + your phone (same Wi-Fi).
// Usage: node serve.mjs [port]   (default 5188)
//
// Everything is served from memory after the first request, gzipped when the
// browser supports it, and revalidated with ETag (a repeat visitor downloads
// nothing). That is what keeps a single small machine responsive.

import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
// Some terminals set PORT=0; treat 0/empty as "not specified".
const PORT = Number(process.argv[2]) || Number(process.env.PORT) || 5188;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

const COMPRESSIBLE = /^(text\/|application\/(json|javascript)|image\/svg)/;
const cache = new Map(); // filePath -> { key, buf, gz, etag, type }

async function loadFile(filePath) {
  const stat = await fsp.stat(filePath);
  const key = stat.size + ":" + stat.mtimeMs;
  const cached = cache.get(filePath);
  if (cached && cached.key === key) return cached;

  const buf = await fsp.readFile(filePath);
  const type = TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
  const gz = COMPRESSIBLE.test(type) && buf.length > 512 ? zlib.gzipSync(buf, { level: 6 }) : null;
  const entry = {
    key,
    buf,
    gz,
    type,
    etag: 'W/"' + stat.size.toString(16) + "-" + Math.round(stat.mtimeMs).toString(16) + '"'
  };
  cache.set(filePath, entry);
  return entry;
}

async function handle(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
    return;
  }

  let requested;
  try {
    requested = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("Bad request");
    return;
  }

  if (requested.endsWith("/")) requested += "index.html";
  const filePath = path.join(ROOT, path.normalize(requested).replace(/^[/\\]+/, ""));

  // Keep the server inside the project and out of tooling folders.
  if (!filePath.startsWith(ROOT) || /[\\/](node_modules|\.git|\.freebuff)([\\/]|$)/.test(filePath)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  let entry;
  try {
    entry = await loadFile(filePath);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
    return;
  }

  res.setHeader("ETag", entry.etag);
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.setHeader("Vary", "Accept-Encoding");

  if (req.headers["if-none-match"] === entry.etag) {
    res.writeHead(304).end();
    return;
  }

  const useGzip = !!entry.gz && /\bgzip\b/.test(req.headers["accept-encoding"] || "");
  const body = useGzip ? entry.gz : entry.buf;
  const headers = {
    "Content-Type": entry.type,
    "Content-Length": body.length
  };
  if (useGzip) headers["Content-Encoding"] = "gzip";

  res.writeHead(200, headers);
  res.end(req.method === "HEAD" ? undefined : body);
}

function lanAddresses() {
  const list = [];
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const net of nets || []) {
      if (net.family === "IPv4" && !net.internal) list.push(net.address);
    }
  }
  return list;
}

function listen(host) {
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      handle(req, res).catch(() => {
        if (!res.headersSent) res.writeHead(500);
        res.end("Server error");
      });
    });
    s.keepAliveTimeout = 65000;
    s.headersTimeout = 66000;
    s.once("error", (e) => {
      console.log(`  ! could not listen on ${host}:${PORT} (${e.code || e.message})`);
      resolve(null);
    });
    s.listen(PORT, host, () => resolve(s));
  });
}

const lan = lanAddresses();
const started = [];

started.push(await listen("127.0.0.1"));
for (const ip of lan) {
  const s = await listen(ip);
  if (s) started.push(s);
}

console.log("\n  StudyPilot running\n");
console.log(`  This PC : http://127.0.0.1:${PORT}/index.html`);
if (lan.length) {
  for (const ip of lan) console.log(`  Phone   : http://${ip}:${PORT}/index.html`);
  console.log("\n  Phone must be on the same Wi-Fi. Ctrl+C to stop.\n");
} else {
  console.log("  No Wi-Fi/LAN address found — phone access needs a network connection.\n");
}

process.on("SIGINT", () => {
  for (const s of started) if (s) s.close();
  process.exit(0);
});
