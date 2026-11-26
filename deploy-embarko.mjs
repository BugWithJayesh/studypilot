// Publish StudyPilot to Embarko as a static site (no server needed).
// Usage: node deploy-embarko.mjs <app-name>
// Only the runtime files are sent (index.html, css/, js/) — not the QA
// scripts, node_modules or local server.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const appName = process.argv[2];

if (!appName) {
  console.error("usage: node deploy-embarko.mjs <app-name>   (lowercase letters, numbers, dashes)");
  process.exit(1);
}

const files = [];

async function add(relPath) {
  const content = await fs.readFile(path.join(ROOT, relPath), "utf8");
  files.push({ path: relPath.split(path.sep).join("/"), content, encoding: "utf8" });
}

await add("index.html");
await add("css/styles.css");
for (const name of (await fs.readdir(path.join(ROOT, "js"))).sort()) {
  if (name.endsWith(".js")) await add(path.join("js", name));
}

// Keeps redeploys pointed at the same app even if it is renamed later.
try {
  await fs.access(path.join(ROOT, "embarko.json"));
  await add("embarko.json");
} catch {
  /* first deploy: nothing saved yet */
}

const bytes = files.reduce((n, f) => n + Buffer.byteLength(f.content), 0);

// The Embarko key stays out of the console and out of chat: it is read from
// DEPLOY_TOKEN or from .embarko-token in this folder (never uploaded).
let token = process.env.DEPLOY_TOKEN || "";
if (!token) {
  try {
    token = (await fs.readFile(path.join(ROOT, ".embarko-token"), "utf8")).trim();
  } catch {
    /* no key saved yet: anonymous deploy */
  }
}

const headers = { "Content-Type": "application/json" };
if (token) headers.Authorization = `Bearer ${token}`;

console.log(`uploading ${files.length} files, ${(bytes / 1024).toFixed(0)} KB, as "${appName}" -> ship.embarko.ai/apps`);
console.log(token ? "using saved Embarko key: app stays permanent" : "no Embarko key: anonymous deploy, temporary 24h");

const res = await fetch("https://ship.embarko.ai/apps", {
  method: "POST",
  headers,
  body: JSON.stringify({ appName, agentName: "freebuff", files })
});

const text = await res.text();
let data = null;
try {
  data = JSON.parse(text);
} catch {
  /* non-JSON error page */
}

console.log(`HTTP ${res.status}`);
if (!data) {
  console.log(text.slice(0, 800));
  process.exit(1);
}

if (!data.success) {
  console.log(JSON.stringify(data, null, 2).slice(0, 1200));
  process.exit(1);
}

await fs.writeFile(
  path.join(ROOT, "embarko.json"),
  JSON.stringify({ appId: data.app.id, name: data.app.name }, null, 2) + "\n"
);

console.log(`status   ${data.status}`);
console.log(`claimed  ${data.app.claimed}`);
console.log(`app      ${data.app.name} (${data.app.kind}), id ${data.app.id}`);
if (data.app.expiresAt) console.log(`expires  ${data.app.expiresAt}  <- claim it before then, or it is deleted`);
if (data.links?.app) console.log(`link     ${data.links.app}`);
if (data.links?.status) console.log(`progress ${data.links.status}`);
