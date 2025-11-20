<img style="width:100%;" src="https://github.com/cannaseedus-bot/BASHER/blob/claude/setup-basher-daemon-016dZdodw71eiUkikUWWLGR4/basher-logo.svg" />

# BASHER v4.0 - Swarm Mode Multi-Agent Mesh

```
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
```

**Fast as a jackrabbit. Focused like a neural laser. Networked like a swarm.**

---

## Overview

BASHER v4.0 is a **production-ready network daemon** with multi-agent mesh capabilities:

1. **Cloudflare Tunnel** - Public HTTP gateway for KHL/KUHUL services
2. **DNS Ghost Network** - Stealth covert channel using DNS-over-SCXQ2 encoding
3. **FastAPI Monitoring** - Health checks for local model servers
4. **🆕 Swarm Mode** - Multi-agent mesh routing with intelligent task distribution

This is **operational ASX-grade networking infrastructure** with swarm intelligence.

---

## What's New in v4.0

### 🐝 Swarm Mode

A mesh network of BASHER nodes with:

- **Role-based routing**: Automatically route tasks to nodes with matching roles
- **Health monitoring**: Continuous health checks across all transports
- **Latency-aware selection**: Pick the fastest node for each task
- **Broadcast**: Send to all healthy nodes simultaneously
- **Multi-transport**: HTTP, FastAPI, Cloudflare, and DNS Ghost
- **Automatic failover**: Routes around unhealthy nodes

### Architecture

```
                    ┌─────────────────┐
                    │   BASHER v4.0   │
                    │   Orchestrator  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ rig-main      │   │ kuhul-core    │   │ ghost-edge    │
│ (FastAPI)     │   │ (FastAPI)     │   │ (DNS)         │
│ trainer+kuhul │   │ inference+mx2lm│   │ relay+covert  │
└───────────────┘   └───────────────┘   └───────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                      Swarm Mesh Network
```

---

## Features

### 🌐 Tri-Tunnel Architecture

- **Cloudflare Tunnel**: Auto-spawns and monitors `cloudflared` process
- **DNS Ghost**: SCXQ2-encoded DNS tunnel for covert communication
- **FastAPI Health**: Monitors local endpoints (KUHUL, Mx2LM, etc.)

### 🔒 SCXQ2 DNS-Tunnel

- Works when HTTPS is blocked ✓
- Works behind corporate firewalls ✓
- Uses DNS (UDP 53) - the ONE port nobody blocks ✓
- Fragmentation support for large payloads ✓
- Checksum validation ✓
- Bidirectional communication ✓

### 🐝 Swarm Mode Features

- **Intelligent routing**: Role-based + latency-aware
- **Health monitoring**: Continuous checks for all nodes
- **Multi-transport**: HTTP, DNS, Cloudflare
- **Task distribution**: Automatic best-node selection
- **Broadcast mode**: Send to all nodes
- **Failover**: Auto-routes around unhealthy nodes

### 🎮 XJSON Integration

- Full XJSON handler support
- Drop-in integration with KHL
- Browser console interface
- RESTful API

---

## Installation

### Prerequisites

- Node.js >= 18.0.0
- Python 3.8+ (for Ghost DNS server)
- `cloudflared` (optional, for Cloudflare tunnel)

### Quick Start

```bash
cd BASHER

# Install
./install.sh

# Run daemon
npm start

# Open browser console
open http://localhost:3000
```

---

## Configuration

Edit `config/basher.config.json` to configure the four subsystems:

### Swarm Configuration

```json
{
  "swarm": {
    "enabled": true,
    "heartbeatIntervalSec": 20,
    "nodes": [
      {
        "id": "rig-main",
        "transport": "fastapi",
        "url": "http://localhost:8000",
        "roles": ["kuhul", "trainer", "primary"]
      },
      {
        "id": "kuhul-core",
        "transport": "fastapi",
        "url": "http://localhost:9009",
        "roles": ["kuhul", "inference", "mx2lm"]
      },
      {
        "id": "ghost-edge",
        "transport": "dns",
        "domain": "ghost.asx.net",
        "roles": ["relay", "ghost", "covert"]
      },
      {
        "id": "cloud-gateway",
        "transport": "cloudflare",
        "url": "https://asx-tunnel.trycloudflare.com",
        "roles": ["public", "api-gateway", "external"]
      }
    ]
  }
}
```

### Node Properties

- `id`: Unique identifier for the node
- `transport`: `fastapi`, `http`, `cloudflare`, or `dns`
- `url` or `domain`: Endpoint address
- `roles`: Array of roles for intelligent routing

---

## XJSON Handlers

BASHER v4.0 exposes these handlers for KHL/KUHUL integration:

### Core Handlers

- `core.ping` - Health check
- `core.info` - System information
- `core.stats` - Process statistics
- `core.version` - Version info

### Basher Handlers (Tri-Tunnel)

- `basher.status` - Full tri-tunnel status dump
- `basher.network` - Network and endpoints (KHL-friendly)
- `basher.dnsSend` - Send message via DNS tunnel
- `basher.dnsPing` - Ping Ghost DNS network
- `basher.forceCloudflareRestart` - Restart Cloudflare tunnel
- `basher.checkTarget` - Check specific FastAPI target

### 🆕 Swarm Handlers

- `basher.swarm.status` - Get swarm mesh status
- `basher.swarm.pick` - Pick best node for a task
- `basher.swarm.route` - Route payload to best node
- `basher.swarm.broadcast` - Broadcast to all healthy nodes
- `basher.swarm.send` - Send to specific node by ID
- `basher.swarm.healthCheck` - Force health check

---

## Swarm Mode Usage

### Get Swarm Status

```bash
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "basher.swarm.status",
      "input": {}
    }
  }'
```

Response:
```json
{
  "ok": true,
  "swarm": {
    "enabled": true,
    "nodes": [
      {
        "id": "rig-main",
        "transport": "fastapi",
        "url": "http://localhost:8000",
        "roles": ["kuhul", "trainer"],
        "healthy": true,
        "latency": 23,
        "lastCheck": 1732064123456
      }
    ],
    "healthyCount": 3,
    "lastHeartbeat": 1732064123456
  }
}
```

### Pick Best Node for a Task

```bash
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "basher.swarm.pick",
      "input": {
        "task": "kuhul inference job"
      }
    }
  }'
```

The router will:
1. Find nodes with "kuhul" or "inference" in roles
2. Prefer nodes with lower latency
3. Return the best match

### Route a Payload

```bash
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "basher.swarm.route",
      "input": {
        "task": "kuhul trainer",
        "payload": {
          "type": "core.ping",
          "input": {}
        }
      }
    }
  }'
```

Response:
```json
{
  "ok": true,
  "node": {
    "id": "rig-main",
    "transport": "fastapi"
  },
  "result": {
    "ok": true,
    "pong": true,
    "timestamp": 1732064123456
  }
}
```

### Broadcast to All Nodes

```bash
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "basher.swarm.broadcast",
      "input": {
        "payload": {
          "type": "core.version",
          "input": {}
        }
      }
    }
  }'
```

Returns results from all healthy nodes.

---

## DNS Ghost Network

### Packet Format

DNS query:
```
cmd.9f3a.00-03.YXN4LWJhc2hlcg.ghost.asx.net
└┬┘ └┬─┘ └┬──┘ └──────┬──────┘
 │   │    │           │
 │   │    │           └─ SCXQ2-encoded payload
 │   │    └───────────── Fragment index/total
 │   └────────────────── Nonce (replay protection)
 └────────────────────── Message type
```

TXT record response:
```
SCXQ2:9f3a:00-01:checksum:payload
```

### Using the DNS Tunnel

```bash
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "basher.dnsSend",
      "input": {
        "message": "{\"task\": \"ping\"}"
      }
    }
  }'
```

---

## Browser Console

Access at `http://localhost:3000`

### Available Commands

```
# Swarm commands
swarm-status         Full swarm mesh status
swarm-pick [task]    Pick best node for task
swarm-health         Force health check

# BASHER commands
basher-status        Full BASHER daemon status
basher-network       Network and endpoints
dns-ping             Ping DNS ghost network
dns-send [msg]       Send message via DNS tunnel

# System commands
handlers             List available XJSON handlers
core-ping            Ping daemon
core-info            System information
core-stats           Process statistics

# Terminal commands
clear                Clear screen
history              Show command history
help                 Show help
about                About BASHER
```

---

## KHL Integration

### From KHL Runtime

```javascript
// Get swarm status
async function getSwarmStatus() {
  const response = await fetch('http://localhost:3000/xjson/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      program: {
        type: 'basher.swarm.status',
        input: {}
      }
    })
  });

  return await response.json();
}

// Route a task through swarm
async function routeTask(task, payload) {
  const response = await fetch('http://localhost:3000/xjson/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      program: {
        type: 'basher.swarm.route',
        input: { task, payload }
      }
    })
  });

  const data = await response.json();
  return data.result;
}
```

### From KHL Tape

```json
{
  "routes": {
    "train_model": {
      "call": {
        "xjson": {
          "program": {
            "type": "basher.swarm.route",
            "input": {
              "task": "kuhul trainer",
              "payload": {
                "type": "kuhul.train",
                "input": { "model": "mx2lm", "epochs": 10 }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## Bind9 DNS Setup

For production Ghost Network deployment:

```bash
# See bind9/ directory for full setup
cd bind9
cat README.md

# Quick setup
sudo cp named.conf.local.ghost /etc/bind/
sudo nano /etc/bind/named.conf.local
# Add: include "/etc/bind/named.conf.local.ghost";

# Start Ghost DNS engine
cd /opt/basher/ghost-server
python3 index.py

# Restart Bind9
sudo systemctl restart bind9
```

See `bind9/README.md` for complete instructions.

---

## Running as Systemd Service

```bash
# Install BASHER daemon
sudo cp systemd/basher.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable basher
sudo systemctl start basher

# Install Ghost DNS server (optional)
sudo cp systemd/basher-ghost.service /etc/systemd/system/
sudo systemctl enable basher-ghost
sudo systemctl start basher-ghost

# View logs
journalctl -u basher -f
journalctl -u basher-ghost -f
```

---

## Development

### Run in Dev Mode

```bash
npm run dev
```

### Testing Swarm Handlers

```bash
# List all handlers
curl http://localhost:3000/xjson/handlers

# Test swarm status
curl -X POST http://localhost:3000/xjson/run \
  -d '{"program": {"type": "basher.swarm.status", "input": {}}}'

# Test routing
curl -X POST http://localhost:3000/xjson/run \
  -d '{"program": {"type": "basher.swarm.pick", "input": {"task": "inference"}}}'
```

---

## Architecture Diagrams

### Swarm Routing Flow

```
User Request
     │
     ▼
┌─────────────────┐
│  BASHER v4.0    │
│  Orchestrator   │
└────────┬────────┘
         │
         │ basher.swarm.route
         │ task="kuhul trainer"
         ▼
┌─────────────────┐
│  Swarm Router   │
│  - Role matching│
│  - Latency sort │
└────────┬────────┘
         │
         │ Pick: rig-main (50ms)
         ▼
┌─────────────────┐
│   rig-main      │
│   FastAPI Node  │
│   POST /xjson/run│
└────────┬────────┘
         │
         ▼
    Execute Task
```

### Tri-Tunnel + Swarm Stack

```
┌─────────────────────────────────────────────────────────┐
│                    BASHER v4.0                          │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Cloudflare  │  │  DNS Ghost   │  │   FastAPI    │ │
│  │   Tunnel     │  │   Network    │  │   Monitor    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌────────────────────────────────────────────────────┐│
│  │           Swarm Router (Multi-Agent Mesh)         ││
│  └────────────────────────────────────────────────────┘│
│                                                         │
├─────────────────────────────────────────────────────────┤
│                 XJSON Handler Layer                     │
├─────────────────────────────────────────────────────────┤
│                    HTTP Server (port 3000)              │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    Cloudflare          Ghost DNS              Swarm Nodes
    (Public)            (Covert)               (Distributed)
```

---

## Security Considerations

### DNS Ghost Network

- **Stealth**: DNS traffic is rarely inspected
- **Fragmentation**: Large messages split across multiple queries
- **Checksums**: Payload integrity validation
- **Nonces**: Prevents replay attacks

### Swarm Mode

- **Node authentication**: Verify node identity before routing
- **Rate limiting**: Prevent abuse of broadcast operations
- **Health checks**: Detect and isolate compromised nodes
- **Transport security**: Use HTTPS for HTTP-based transports

### Production Deployment

- Use HTTPS for XJSON endpoints
- Restrict CORS origins
- Implement authentication for sensitive handlers
- Monitor for anomalous DNS patterns
- Encrypt swarm communication

---

## Troubleshooting

### Swarm Nodes Not Healthy

```bash
# Check swarm status
curl http://localhost:3000/xjson/run \
  -d '{"program": {"type": "basher.swarm.status", "input": {}}}'

# Force health check
curl http://localhost:3000/xjson/run \
  -d '{"program": {"type": "basher.swarm.healthCheck", "input": {}}}'

# Check specific node
curl http://localhost:8000/health
```

### DNS Ghost Not Responding

1. Check Ghost DNS engine is running:
```bash
sudo systemctl status basher-ghost
```

2. Test DNS resolution:
```bash
dig @localhost -p 5353 ping.test.ghost.asx.net TXT
```

3. Check Bind9 forwarding:
```bash
dig @localhost ghost.asx.net TXT
```

### Cloudflare Tunnel Issues

```bash
# Check if cloudflared is installed
which cloudflared

# Force restart
curl http://localhost:3000/xjson/run \
  -d '{"program": {"type": "basher.forceCloudflareRestart", "input": {}}}'
```

---

## Roadmap

- [ ] SCXQ2 v2 compression algorithm
- [ ] DNS-over-HTTPS (DoH) support
- [ ] Swarm consensus protocols
- [ ] Distributed task queue
- [ ] Node-to-node direct routing
- [ ] Encrypted swarm channels
- [ ] Auto-discovery of swarm nodes
- [ ] Load balancing across nodes
- [ ] Swarm analytics and insights

---

## License

MIT

---

## Credits

Built with:
- Node.js
- XJSON Server
- ASX Language Framework
- dnslib (Python)
- Cloudflare Tunnel

---

**ASX BASHER v4.0 - Swarm Mode**

*When the network goes dark, BASHER goes Ghost.*
*When tasks get complex, BASHER goes Swarm.*
