/**
 * Core XJSON Handlers
 *
 * Basic system information and health check endpoints
 */

import os from "os";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json for version info
let packageInfo = { version: "unknown" };
try {
  const pkgPath = path.join(__dirname, "..", "package.json");
  packageInfo = JSON.parse(readFileSync(pkgPath, "utf8"));
} catch (err) {
  console.warn("Could not read package.json:", err.message);
}

export default {
  /**
   * Simple ping/pong health check
   */
  "core.ping": async () => {
    return {
      ok: true,
      pong: true,
      timestamp: Date.now(),
      uptime: process.uptime()
    };
  },

  /**
   * System information
   */
  "core.info": async () => {
    return {
      ok: true,
      info: {
        version: packageInfo.version,
        name: packageInfo.name,
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd(),
        pid: process.pid,
        uptime: process.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: process.memoryUsage()
        },
        cpu: {
          model: os.cpus()[0].model,
          cores: os.cpus().length,
          load: os.loadavg()
        }
      }
    };
  },

  /**
   * Environment variables (filtered for security)
   */
  "core.env": async () => {
    const safeEnv = {};
    const allowedKeys = [
      "NODE_ENV",
      "PORT",
      "HOST",
      "BASHER_MODE",
      "ASX_ENV"
    ];

    for (const key of allowedKeys) {
      if (process.env[key]) {
        safeEnv[key] = process.env[key];
      }
    }

    return {
      ok: true,
      env: safeEnv
    };
  },

  /**
   * Process stats
   */
  "core.stats": async () => {
    const usage = process.cpuUsage();
    const mem = process.memoryUsage();

    return {
      ok: true,
      stats: {
        cpu: {
          user: usage.user,
          system: usage.system
        },
        memory: {
          rss: mem.rss,
          heapTotal: mem.heapTotal,
          heapUsed: mem.heapUsed,
          external: mem.external
        },
        uptime: process.uptime(),
        pid: process.pid
      }
    };
  },

  /**
   * Version information
   */
  "core.version": async () => {
    return {
      ok: true,
      version: packageInfo.version,
      name: packageInfo.name,
      node: process.version
    };
  }
};
