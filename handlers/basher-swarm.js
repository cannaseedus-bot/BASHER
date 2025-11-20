/**
 * BASHER v4 - Swarm Mode (Multi-Agent Mesh)
 *
 * Manages a mesh network of BASHER nodes with intelligent routing:
 * - HTTP/FastAPI endpoints
 * - DNS Ghost Network nodes
 * - Cloudflare Tunnel gateways
 *
 * Features:
 * - Health monitoring across all transports
 * - Role-based routing
 * - Latency-aware selection
 * - Broadcast to all nodes
 * - Automatic failover
 */

import { scxq2_compress, scxq2_decompress, scxq2_fragment, scxq2_nonce } from "../utils/scxq2.js";

/**
 * HTTP Health Check
 */
async function httpHealthCheck(url, timeout = 3000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const start = Date.now();
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "ASX-BASHER-SWARM/4.0" }
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    return {
      ok: response.ok,
      status: response.status,
      latency
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message,
      latency: null
    };
  }
}

/**
 * DNS Ghost Health Check (via simple ping query)
 */
async function dnsGhostHealthCheck(domain, resolver = "1.1.1.1", timeout = 5000) {
  try {
    const dns = await import("dns/promises");
    const resolverObj = new dns.Resolver();
    resolverObj.setServers([resolver]);

    const nonce = scxq2_nonce();
    const query = `ping.${nonce}.${domain}`;

    const start = Date.now();
    const txt = await resolverObj.resolveTxt(query);
    const latency = Date.now() - start;

    return {
      ok: txt && txt.length > 0,
      latency,
      response: txt.flat().join("")
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message,
      latency: null
    };
  }
}

/**
 * XJSON Call via HTTP
 */
async function xjsonCall(baseUrl, program, timeout = 10000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const url = baseUrl.endsWith("/") ? baseUrl + "xjson/run" : baseUrl + "/xjson/run";

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ program }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    return await response.json();
  } catch (err) {
    return {
      ok: false,
      error: err.message
    };
  }
}

/**
 * Swarm Handler Factory
 */
export default function swarmHandlers(config = {}, dnsSendFn = null) {
  const swarmConfig = config.swarm || {};
  const nodes = swarmConfig.nodes || [];

  // Swarm state
  const state = {
    enabled: swarmConfig.enabled || false,
    nodes: nodes.map(n => ({
      ...n,
      healthy: false,
      latency: null,
      lastCheck: null,
      lastError: null
    })),
    lastHeartbeat: null
  };

  /**
   * Health check for a single node
   */
  async function checkNode(node) {
    try {
      let result;

      if (node.transport === "fastapi" || node.transport === "http") {
        const healthUrl = node.url.endsWith("/")
          ? node.url + "health"
          : node.url + "/health";
        result = await httpHealthCheck(healthUrl);
      } else if (node.transport === "cloudflare") {
        const healthUrl = node.url.endsWith("/")
          ? node.url + "health"
          : node.url + "/health";
        result = await httpHealthCheck(healthUrl);
      } else if (node.transport === "dns") {
        result = await dnsGhostHealthCheck(node.domain || "ghost.asx.net");
      } else {
        result = { ok: false, error: "Unknown transport" };
      }

      node.healthy = result.ok;
      node.latency = result.latency;
      node.lastCheck = Date.now();
      node.lastError = result.ok ? null : result.error;

      return result;
    } catch (err) {
      node.healthy = false;
      node.lastError = err.message;
      node.lastCheck = Date.now();
      return { ok: false, error: err.message };
    }
  }

  /**
   * Health check all nodes
   */
  async function heartbeat() {
    if (!state.enabled) return;

    const checks = state.nodes.map(node => checkNode(node));
    await Promise.all(checks);
    state.lastHeartbeat = Date.now();
  }

  /**
   * Pick best node for a task
   */
  function pickNode(task = "") {
    const healthyNodes = state.nodes.filter(n => n.healthy);

    if (healthyNodes.length === 0) {
      return null;
    }

    // Score nodes based on role match and latency
    const scored = healthyNodes.map(node => {
      let score = 0;

      // Role matching
      const roles = node.roles || [];
      for (const role of roles) {
        if (task.toLowerCase().includes(role.toLowerCase())) {
          score += 100;
        }
      }

      // Latency penalty (lower is better)
      if (node.latency !== null) {
        score -= node.latency / 10;
      }

      return { node, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored[0].node;
  }

  /**
   * Route payload to specific node
   */
  async function routeToNode(node, payload) {
    try {
      if (node.transport === "fastapi" || node.transport === "http" || node.transport === "cloudflare") {
        // HTTP-based transport
        return await xjsonCall(node.url, payload);
      } else if (node.transport === "dns") {
        // DNS Ghost transport
        if (!dnsSendFn) {
          return {
            ok: false,
            error: "DNS send function not available"
          };
        }

        const message = JSON.stringify(payload);
        const response = await dnsSendFn(message);

        if (response) {
          try {
            return JSON.parse(response);
          } catch {
            return { ok: true, response };
          }
        } else {
          return { ok: false, error: "No DNS response" };
        }
      } else {
        return {
          ok: false,
          error: `Unknown transport: ${node.transport}`
        };
      }
    } catch (err) {
      return {
        ok: false,
        error: err.message
      };
    }
  }

  // Start heartbeat if enabled
  if (state.enabled) {
    const interval = (swarmConfig.heartbeatIntervalSec || 20) * 1000;
    setInterval(heartbeat, interval);
    heartbeat(); // Initial check
  }

  // Return XJSON handlers
  return {
    /**
     * Get swarm status
     */
    "basher.swarm.status": async () => {
      return {
        ok: true,
        swarm: {
          enabled: state.enabled,
          nodes: state.nodes.map(n => ({
            id: n.id,
            transport: n.transport,
            url: n.url || n.domain,
            roles: n.roles || [],
            healthy: n.healthy,
            latency: n.latency,
            lastCheck: n.lastCheck,
            lastError: n.lastError
          })),
          healthyCount: state.nodes.filter(n => n.healthy).length,
          lastHeartbeat: state.lastHeartbeat
        }
      };
    },

    /**
     * Pick best node for a task
     */
    "basher.swarm.pick": async ({ task = "" }) => {
      const node = pickNode(task);

      if (!node) {
        return {
          ok: false,
          error: "No healthy nodes available"
        };
      }

      return {
        ok: true,
        node: {
          id: node.id,
          transport: node.transport,
          url: node.url || node.domain,
          roles: node.roles,
          latency: node.latency
        }
      };
    },

    /**
     * Route payload to best node for task
     */
    "basher.swarm.route": async ({ task = "", payload }) => {
      const node = pickNode(task);

      if (!node) {
        return {
          ok: false,
          error: "No healthy nodes available"
        };
      }

      const result = await routeToNode(node, payload);

      return {
        ok: result.ok,
        node: {
          id: node.id,
          transport: node.transport
        },
        result
      };
    },

    /**
     * Broadcast payload to all healthy nodes
     */
    "basher.swarm.broadcast": async ({ payload }) => {
      const healthyNodes = state.nodes.filter(n => n.healthy);

      if (healthyNodes.length === 0) {
        return {
          ok: false,
          error: "No healthy nodes available"
        };
      }

      const results = await Promise.all(
        healthyNodes.map(async node => {
          const result = await routeToNode(node, payload);
          return {
            node: { id: node.id, transport: node.transport },
            result
          };
        })
      );

      return {
        ok: true,
        count: results.length,
        results
      };
    },

    /**
     * Send to specific node by ID
     */
    "basher.swarm.send": async ({ nodeId, payload }) => {
      const node = state.nodes.find(n => n.id === nodeId);

      if (!node) {
        return {
          ok: false,
          error: `Node not found: ${nodeId}`
        };
      }

      if (!node.healthy) {
        return {
          ok: false,
          error: `Node unhealthy: ${nodeId}`
        };
      }

      const result = await routeToNode(node, payload);

      return {
        ok: result.ok,
        node: { id: node.id, transport: node.transport },
        result
      };
    },

    /**
     * Force health check
     */
    "basher.swarm.healthCheck": async ({ nodeId = null }) => {
      if (nodeId) {
        const node = state.nodes.find(n => n.id === nodeId);
        if (!node) {
          return { ok: false, error: "Node not found" };
        }

        await checkNode(node);
        return {
          ok: true,
          node: {
            id: node.id,
            healthy: node.healthy,
            latency: node.latency,
            lastCheck: node.lastCheck
          }
        };
      } else {
        await heartbeat();
        return {
          ok: true,
          healthyCount: state.nodes.filter(n => n.healthy).length,
          totalCount: state.nodes.length
        };
      }
    }
  };
}
