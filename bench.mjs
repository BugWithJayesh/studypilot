// StudyPilot load check — how the static server behaves under many visitors.
// Usage: node bench.mjs [url] [concurrency] [requests]
// Default: http://127.0.0.1:5188/index.html 300 6000

import http from "node:http";

const target = new URL(process.argv[2] || "http://127.0.0.1:5188/index.html");
const concurrency = Number(process.argv[3] || 300);
const total = Number(process.argv[4] || 6000);

const agent = new http.Agent({ keepAlive: true, maxSockets: concurrency });

const latencies = [];
let done = 0;
let failed = 0;
let bytes = 0;

const started = process.hrtime.bigint();

function request() {
  return new Promise((resolve) => {
    const t0 = process.hrtime.bigint();
    const req = http.get(
      {
        hostname: target.hostname,
        port: target.port,
        path: target.pathname + target.search,
        agent,
        headers: { "Accept-Encoding": "gzip" }
      },
      (res) => {
        res.on("data", (c) => { bytes += c.length; });
        res.on("end", () => {
          latencies.push(Number(process.hrtime.bigint() - t0) / 1e6);
          if (res.statusCode >= 400) failed++;
          resolve();
        });
      }
    );
    req.on("error", () => { failed++; resolve(); });
  });
}

async function worker() {
  while (done + failed < total) {
    done++;
    await request();
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));

const ms = Number(process.hrtime.bigint() - started) / 1e6;
latencies.sort((a, b) => a - b);
const pick = (p) => latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * p))] || 0;

console.log(`url          ${target.href}`);
console.log(`requests     ${total} at concurrency ${concurrency}`);
console.log(`failed       ${failed}`);
console.log(`time         ${(ms / 1000).toFixed(2)} s`);
console.log(`throughput   ${Math.round((total / ms) * 1000)} req/s`);
console.log(`latency      p50 ${pick(0.5).toFixed(1)} ms | p95 ${pick(0.95).toFixed(1)} ms | p99 ${pick(0.99).toFixed(1)} ms`);
console.log(`transferred  ${(bytes / 1024 / 1024).toFixed(1)} MB`);

agent.destroy();
process.exit(failed ? 1 : 0);
