/**
 * BASHER v3.5 - Tri-Tunnel Orchestrator + DNS-Ghost Mode
 *
 * Monitors and manages:
 * 1. Cloudflare Tunnel (public HTTP gateway)
 * 2. DNS Ghost Network (stealth covert channel)
 * 3. FastAPI Endpoints (local service health)
 */

import { spawn } from "child_process";
import dns from "dns/promises";
import {
  scxq2_compress,
  scxq2_decompress,
  scxq2_fragment,
  scxq2_nonce,
  scxq2_buildQuery,
  scxq2_parseResponse,
  scxq2_reassemble,
  scxq2_addChecksum,
  scxq2_verifyChecksum
} from "../utils/scxq2.js";

/**
 * DNS Query Helper (with timeout)
 */
async function dnsQuery(name, resolver = "1.1.1.1", type = "TXT") {
  const resolverObj = new dns.Resolver();
  resolverObj.setServers([resolver]);

  try {
    if (type === "TXT") {
      const txt = await resolverObj.resolveTxt(name);
      return txt.flat().join("");
    } else if (type === "A") {
      return await resolverObj.resolve4(name);
    }
  } catch (err) {
    return null;
  }
}

/**
 * DNS Tunnel Send (SCXQ2-encoded)
 */
async function dnsTunnelSend(domain, message, resolver = "1.1.1.1") {
  const nonce = scxq2_nonce();
  const compressed = scxq2_compress(message);
  const checksummed = scxq2_addChecksum(compressed);
  const frags = scxq2_fragment(checksummed, 40);

  const responses = [];

  for (let i = 0; i < frags.length; i++) {
    const frag = frags[i];
    const query = scxq2_buildQuery("cmd", nonce, i, frags.length, frag, domain);

    const reply = await dnsQuery(query, resolver, "TXT");
    if (reply) {
      const parsed = scxq2_parseResponse(reply);
      if (parsed) {
        responses.push(parsed);
      }
    }
  }

  if (responses.length === 0) {
    return null;
  }

  const reassembled = scxq2_reassemble(responses);
  const verified = scxq2_verifyChecksum(reassembled);

  return verified.valid ? verified.payload : null;
}

/**
 * HTTP Health Check
 */
async function httpHealthCheck(url, timeout = 3000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "ASX-BASHER/3.5" }
    });

    clearTimeout(timeoutId);

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message
    };
  }
}

/**
 * Basher Handler Factory
 */
export default function basherHandlers(config = {}) {
  const cloudflareConfig = config.cloudflare || {};
  const dnsGhostConfig = config.dnsGhost || {};
  const fastapiConfig = config.fastapi || {};
  const networkConfig = config.network || {};

  // Internal state
  const state = {
    cloudflare: {
      enabled: cloudflareConfig.enabled || false,
      status: "idle",
      process: null,
      pid: null,
      url: null,
      lastHeartbeat: null,
      errors: [],
      restartCount: 0
    },
    dnsGhost: {
      enabled: dnsGhostConfig.enabled || false,
      status: "idle",
      domain: dnsGhostConfig.domain || "ghost.asx.net",
      resolver: dnsGhostConfig.resolver || "1.1.1.1",
      lastHeartbeat: null,
      lastResponse: null,
      errors: [],
      tunnel: {
        enabled: dnsGhostConfig.tunnel?.enabled || false,
        messagessent: 0,
        messagesReceived: 0
      }
    },
    fastapi: {
      enabled: fastapiConfig.enabled || false,
      status: "idle",
      targets: [],
      healthyTargets: [],
      lastCheck: null,
      errors: []
    },
    network: {
      online: false,
      lastDnsCheck: null,
      error: null
    }
  };

  // Cloudflare Tunnel Management
  function startCloudflare() {
    if (!state.cloudflare.enabled) return;

    const cmd = cloudflareConfig.command || "cloudflared";
    const args = cloudflareConfig.args || ["tunnel", "--url", "http://localhost:3000"];

    console.log(`[BASHER] Starting Cloudflare tunnel: ${cmd} ${args.join(" ")}`);

    const proc = spawn(cmd, args, {
      stdio: ["ignore", "pipe", "pipe"]
    });

    state.cloudflare.process = proc;
    state.cloudflare.pid = proc.pid;
    state.cloudflare.status = "starting";

    proc.stdout.on("data", (data) => {
      const output = data.toString();
      console.log(`[Cloudflare] ${output}`);

      // Extract tunnel URL
      const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (match) {
        state.cloudflare.url = match[0];
        state.cloudflare.status = "running";
        console.log(`[BASHER] Cloudflare tunnel established: ${state.cloudflare.url}`);
      }
    });

    proc.stderr.on("data", (data) => {
      const error = data.toString();
      console.error(`[Cloudflare Error] ${error}`);
      state.cloudflare.errors.push({ time: Date.now(), message: error });
    });

    proc.on("exit", (code) => {
      console.log(`[BASHER] Cloudflare tunnel exited with code ${code}`);
      state.cloudflare.status = "stopped";
      state.cloudflare.process = null;
      state.cloudflare.pid = null;

      // Auto-restart if configured
      if (cloudflareConfig.autoRestart && state.network.online) {
        const maxRestarts = cloudflareConfig.maxRestarts || 5;
        if (state.cloudflare.restartCount < maxRestarts) {
          state.cloudflare.restartCount++;
          console.log(`[BASHER] Auto-restarting Cloudflare (attempt ${state.cloudflare.restartCount})`);
          setTimeout(() => startCloudflare(), 5000);
        }
      }
    });
  }

  // DNS Ghost Heartbeat
  async function dnsGhostHeartbeat() {
    if (!state.dnsGhost.enabled) return;

    try {
      const query = `ping.${scxq2_nonce()}.${state.dnsGhost.domain}`;
      const response = await dnsQuery(query, state.dnsGhost.resolver, "TXT");

      if (response) {
        state.dnsGhost.status = "online";
        state.dnsGhost.lastResponse = response;
        state.dnsGhost.lastHeartbeat = Date.now();
      } else {
        state.dnsGhost.status = "offline";
      }
    } catch (err) {
      state.dnsGhost.status = "error";
      state.dnsGhost.errors.push({ time: Date.now(), message: err.message });
    }
  }

  // FastAPI Health Checks
  async function fastapiHealthCheck() {
    if (!state.fastapi.enabled) return;

    const targets = fastapiConfig.targets || [];
    const results = [];

    for (const target of targets) {
      const result = await httpHealthCheck(target.url, fastapiConfig.timeout);
      results.push({
        name: target.name,
        url: target.url,
        critical: target.critical || false,
        ...result
      });
    }

    state.fastapi.targets = results;
    state.fastapi.healthyTargets = results.filter(r => r.ok);
    state.fastapi.lastCheck = Date.now();
    state.fastapi.status = results.every(r => r.ok || !r.critical) ? "online" : "degraded";
  }

  // Network Connectivity Check
  async function networkCheck() {
    try {
      const testHost = networkConfig.dnsTestHost || "one.one.one.one";
      const ips = await dnsQuery(testHost, "1.1.1.1", "A");

      state.network.online = !!ips;
      state.network.lastDnsCheck = Date.now();
      state.network.error = null;
    } catch (err) {
      state.network.online = false;
      state.network.error = err.message;
    }
  }

  // Monitor Loop
  async function startMonitoring() {
    console.log("[BASHER] Starting tri-tunnel monitoring...");

    // Network check interval
    const networkInterval = (networkConfig.checkIntervalSec || 15) * 1000;
    setInterval(networkCheck, networkInterval);
    await networkCheck(); // Initial check

    // Start Cloudflare if enabled
    if (state.cloudflare.enabled && state.network.online) {
      startCloudflare();
    }

    // DNS Ghost heartbeat
    if (state.dnsGhost.enabled) {
      const dnsInterval = (dnsGhostConfig.heartbeatIntervalSec || 60) * 1000;
      setInterval(dnsGhostHeartbeat, dnsInterval);
      await dnsGhostHeartbeat(); // Initial check
    }

    // FastAPI health checks
    if (state.fastapi.enabled) {
      const fastapiInterval = (fastapiConfig.heartbeatIntervalSec || 15) * 1000;
      setInterval(fastapiHealthCheck, fastapiInterval);
      await fastapiHealthCheck(); // Initial check
    }

    console.log("[BASHER] Monitoring active");
  }

  // Start monitoring immediately
  startMonitoring();

  // Return XJSON handlers
  return {
    /**
     * Full status dump
     */
    "basher.status": async () => {
      return {
        ok: true,
        state: {
          cloudflare: {
            enabled: state.cloudflare.enabled,
            status: state.cloudflare.status,
            url: state.cloudflare.url,
            pid: state.cloudflare.pid,
            lastHeartbeat: state.cloudflare.lastHeartbeat,
            restartCount: state.cloudflare.restartCount,
            errors: state.cloudflare.errors.slice(-5) // Last 5 errors
          },
          dnsGhost: {
            enabled: state.dnsGhost.enabled,
            status: state.dnsGhost.status,
            domain: state.dnsGhost.domain,
            lastHeartbeat: state.dnsGhost.lastHeartbeat,
            lastResponse: state.dnsGhost.lastResponse,
            tunnel: state.dnsGhost.tunnel,
            errors: state.dnsGhost.errors.slice(-5)
          },
          fastapi: {
            enabled: state.fastapi.enabled,
            status: state.fastapi.status,
            targets: state.fastapi.targets,
            healthyTargets: state.fastapi.healthyTargets.map(t => t.name),
            lastCheck: state.fastapi.lastCheck,
            errors: state.fastapi.errors.slice(-5)
          },
          network: state.network
        }
      };
    },

    /**
     * Compact network view (KHL-friendly)
     */
    "basher.network": async () => {
      return {
        ok: true,
        network: state.network,
        endpoints: {
          cloudflare: state.cloudflare.url,
          dnsGhost: state.dnsGhost.domain,
          fastapi: state.fastapi.healthyTargets.map(t => t.url)
        }
      };
    },

    /**
     * Force Cloudflare restart
     */
    "basher.forceCloudflareRestart": async () => {
      if (state.cloudflare.process) {
        state.cloudflare.process.kill();
      }

      setTimeout(() => startCloudflare(), 2000);

      return {
        ok: true,
        message: "Cloudflare restart initiated"
      };
    },

    /**
     * DNS Ghost Tunnel Send
     */
    "basher.dnsSend": async ({ message }) => {
      if (!state.dnsGhost.tunnel.enabled) {
        return {
          ok: false,
          error: "DNS tunnel not enabled"
        };
      }

      const response = await dnsTunnelSend(
        state.dnsGhost.domain,
        message,
        state.dnsGhost.resolver
      );

      if (response) {
        state.dnsGhost.tunnel.messagesReceived++;
      }
      state.dnsGhost.tunnel.messagesSent++;

      return {
        ok: !!response,
        response,
        stats: state.dnsGhost.tunnel
      };
    },

    /**
     * DNS Ghost Ping
     */
    "basher.dnsPing": async () => {
      const start = Date.now();
      await dnsGhostHeartbeat();
      const latency = Date.now() - start;

      return {
        ok: state.dnsGhost.status === "online",
        status: state.dnsGhost.status,
        latency,
        response: state.dnsGhost.lastResponse
      };
    },

    /**
     * FastAPI target check
     */
    "basher.checkTarget": async ({ url }) => {
      const result = await httpHealthCheck(url, fastapiConfig.timeout);
      return {
        ok: true,
        target: url,
        ...result
      };
    }
  };
}
