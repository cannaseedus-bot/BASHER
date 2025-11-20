#!/usr/bin/env node

/**
 * BASHER v4.0 - Swarm Mode Multi-Agent Mesh Daemon
 *
 * A network daemon that manages:
 * - Cloudflare Tunnel (public HTTP gateway)
 * - DNS Ghost Network (stealth covert channel)
 * - FastAPI Endpoints (local service health)
 * - Swarm Mode (multi-agent mesh routing)
 *
 * Powered by XJSON Server
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import http from "http";
import coreHandlers from "./handlers/core.js";
import basherHandlers from "./handlers/basher.js";
import swarmHandlers from "./handlers/basher-swarm.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ASCII Banner
const BANNER = `
╔═══════════════════════════════════════╗
║   █████╗ ███████╗██╗  ██╗            ║
║  ██╔══██╗██╔════╝╚██╗██╔╝            ║
║  ███████║███████╗ ╚███╔╝             ║
║  ██╔══██║╚════██║ ██╔██╗             ║
║  ██║  ██║███████║██╔╝ ██╗            ║
║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝            ║
║                                       ║
║  B A S H E R   D A E M O N            ║
║  v4.0 - Swarm Mode                    ║
╚═══════════════════════════════════════╝
`;

// Load configuration
let config = {};
try {
  const configPath = path.join(__dirname, "config", "basher.config.json");
  config = JSON.parse(readFileSync(configPath, "utf8"));
  console.log("✓ Configuration loaded");
} catch (err) {
  console.warn("⚠ Could not load config, using defaults:", err.message);
}

// Initialize handlers
console.log("\n" + BANNER);
console.log("Initializing BASHER daemon...\n");

// Create basher handlers first (they contain dnsSend function)
const basherHandlerMap = basherHandlers(config);

// Extract DNS send function for swarm integration
const dnsSendFn = async (message) => {
  // Call basher.dnsSend internally
  const result = await basherHandlerMap["basher.dnsSend"]({ message });
  return result.response;
};

// Create swarm handlers with DNS send function
const swarmHandlerMap = swarmHandlers(config, dnsSendFn);

// Merge all handlers
const handlers = {
  ...coreHandlers,
  ...basherHandlerMap,
  ...swarmHandlerMap
};

console.log("✓ Handlers loaded:");
console.log("  - Core handlers:", Object.keys(coreHandlers).length);
console.log("  - Basher handlers:", Object.keys(basherHandlerMap).length);
console.log("  - Swarm handlers:", Object.keys(swarmHandlerMap).length);
console.log("  - Total handlers:", Object.keys(handlers).length);

// Create lightweight XJSON-compatible server
const server = http.createServer(async (req, res) => {
  // Enable CORS if configured
  if (config.server?.enableCors) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }
  }

  // Serve static files for browser console
  if (req.url.startsWith("/public/") || req.url === "/") {
    const filePath = req.url === "/"
      ? path.join(__dirname, "public", "index.html")
      : path.join(__dirname, req.url);

    try {
      const content = readFileSync(filePath);
      const ext = path.extname(filePath);
      const contentType = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json"
      }[ext] || "text/plain";

      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    } catch (err) {
      res.writeHead(404);
      res.end("Not found");
    }
    return;
  }

  // XJSON endpoint: /xjson/run
  if (req.url === "/xjson/run" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        const request = JSON.parse(body);
        const program = request.program || {};
        const handler = handlers[program.type];

        if (!handler) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            ok: false,
            error: `Handler not found: ${program.type}`,
            available: Object.keys(handlers)
          }));
          return;
        }

        const result = await handler(program.input || {});
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          ok: false,
          error: err.message,
          stack: err.stack
        }));
      }
    });
    return;
  }

  // List available handlers
  if (req.url === "/xjson/handlers" || req.url === "/handlers") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      ok: true,
      handlers: Object.keys(handlers),
      count: Object.keys(handlers).length,
      groups: {
        core: Object.keys(coreHandlers),
        basher: Object.keys(basherHandlerMap),
        swarm: Object.keys(swarmHandlerMap)
      }
    }));
    return;
  }

  // Health check
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      ok: true,
      status: "healthy",
      version: "4.0.0",
      uptime: process.uptime(),
      timestamp: Date.now()
    }));
    return;
  }

  // Default: 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    ok: false,
    error: "Not found",
    endpoints: [
      "/xjson/run",
      "/xjson/handlers",
      "/health",
      "/public/"
    ]
  }));
});

// Start server
const port = config.server?.port || 3000;
const host = config.server?.host || "0.0.0.0";

server.listen(port, host, () => {
  console.log(`\n✓ BASHER daemon running`);
  console.log(`  http://${host}:${port}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /xjson/run          - Execute XJSON programs`);
  console.log(`  GET  /xjson/handlers     - List available handlers`);
  console.log(`  GET  /health             - Health check`);
  console.log(`  GET  /                   - Browser console\n`);

  console.log("System Status:");
  console.log(`  Cloudflare:  ${config.cloudflare?.enabled ? "✓ Enabled" : "✗ Disabled"}`);
  console.log(`  DNS Ghost:   ${config.dnsGhost?.enabled ? "✓ Enabled" : "✗ Disabled"}`);
  console.log(`  FastAPI:     ${config.fastapi?.enabled ? "✓ Enabled" : "✗ Disabled"}`);
  console.log(`  Swarm Mode:  ${config.swarm?.enabled ? "✓ Enabled" : "✗ Disabled"}`);
  if (config.swarm?.enabled) {
    console.log(`  Swarm Nodes: ${config.swarm.nodes?.length || 0} configured\n`);
  } else {
    console.log();
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n[BASHER] Shutting down...");
  server.close(() => {
    console.log("[BASHER] Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n\n[BASHER] Received SIGTERM, shutting down...");
  server.close(() => {
    console.log("[BASHER] Server closed");
    process.exit(0);
  });
});
