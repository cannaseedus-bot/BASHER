<svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#0b1b24"/>
      <stop offset="50%" stop-color="#050b10"/>
      <stop offset="100%" stop-color="#020308"/>
    </radialGradient>

    <!-- Neon stroke -->
    <linearGradient id="neonStroke" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f5a0"/>
      <stop offset="50%" stop-color="#00d8ff"/>
      <stop offset="100%" stop-color="#00ffa8"/>
    </linearGradient>

    <!-- Matrix glyph gradient -->
    <linearGradient id="matrixGlyphGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00ffa8"/>
      <stop offset="40%" stop-color="#00f5a0"/>
      <stop offset="100%" stop-color="#00d8ff"/>
    </linearGradient>

    <!-- Terminal glow -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feColorMatrix in="blur" type="matrix"
        values="
          0 0 0 0 0
          0 1 0 0 0
          0 0 0.7 0 0
          0 0 0 1 0"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect x="0" y="0" width="320" height="320" fill="url(#bgGrad)" />

  <!-- Outer ring -->
  <circle cx="160" cy="160" r="132"
          fill="none"
          stroke="url(#neonStroke)"
          stroke-width="3"
          opacity="0.6" />

  <!-- Inner disk -->
  <circle cx="160" cy="160" r="110"
          fill="#02060b"
          stroke="#07241b"
          stroke-width="2" />

  <!-- ===================================================== -->
  <!-- MATRIX RAIN PLACED HERE — ABOVE DISK, BELOW TERMINAL -->
  <!-- ===================================================== -->
  <g id="matrix-rain" font-family="monospace" font-size="14"
     fill="url(#matrixGlyphGrad)" opacity="0.95">

    <!-- Column 1 -->
    <g>
      <g transform="translate(95, -180)">
        <text y="0">A</text><text y="16">S</text><text y="32">X</text><text y="48">ϕ</text>
        <text y="64">S</text><text y="80">C</text><text y="96">X</text><text y="112">λ</text>

        <animateTransform attributeName="transform" type="translate"
          from="95,-180" to="95,300"
          dur="4.1s" repeatCount="indefinite"/>
      </g>
    </g>

    <!-- Column 2 -->
    <g>
      <g transform="translate(120, -240)">
        <text y="0">S</text><text y="16">C</text><text y="32">X</text><text y="48">Ξ</text>
        <text y="64">A</text><text y="80">S</text><text y="96">X</text><text y="112">⌐</text>

        <animateTransform attributeName="transform" type="translate"
          from="120,-240" to="120,300"
          dur="5.2s" repeatCount="indefinite"/>
      </g>
    </g>

    <!-- Column 3 -->
    <g>
      <g transform="translate(145, -200)">
        <text y="0">λ</text><text y="16">A</text><text y="32">S</text><text y="48">X</text>
        <text y="64">∑</text><text y="80">S</text><text y="96">C</text><text y="112">X</text>

        <animateTransform attributeName="transform" type="translate"
          from="145,-200" to="145,300"
          dur="3.5s" repeatCount="indefinite"/>
      </g>
    </g>

    <!-- Column 4 -->
    <g>
      <g transform="translate(170, -220)">
        <text y="0">S</text><text y="16">X</text><text y="32">⚙</text><text y="48">S</text>
        <text y="64">C</text><text y="80">X</text><text y="96">A</text><text y="112">Σ</text>

        <animateTransform attributeName="transform" type="translate"
          from="170,-220" to="170,300"
          dur="6.0s" repeatCount="indefinite"/>
      </g>
    </g>

    <!-- Column 5 -->
    <g>
      <g transform="translate(195, -250)">
        <text y="0">C</text><text y="16">X</text><text y="32">A</text><text y="48">S</text>
        <text y="64">X</text><text y="80">⌁</text><text y="96">S</text><text y="112">C</text>

        <animateTransform attributeName="transform" type="translate"
          from="195,-250" to="195,300"
          dur="5.7s" repeatCount="indefinite"/>
      </g>
    </g>

  </g>
  <!-- END MATRIX RAIN -->

  <!-- ===================================================== -->
  <!-- TERMINAL (FRONT LAYER) -->
  <!-- ===================================================== -->
  <g transform="translate(75, 105)">
    <rect x="0" y="0" width="170" height="120" rx="14" ry="14"
          fill="#050c11" stroke="#0af5c0" stroke-width="2" />

    <rect x="0" y="0" width="170" height="26" rx="14" ry="14" fill="#071720" />
    <circle cx="18" cy="13" r="4" fill="#ff5f57"/>
    <circle cx="32" cy="13" r="4" fill="#febc2e"/>
    <circle cx="46" cy="13" r="4" fill="#28c840"/>

    <text x="160" y="16" text-anchor="end"
          font-family="monospace" font-size="10"
          fill="#45f5d1" opacity="0.9">
      basher://tri-tunnel
    </text>

    <rect x="10" y="32" width="150" height="78" rx="8" ry="8"
          fill="#02070c" stroke="#083728" stroke-width="1.2"/>

    <g font-family="monospace" font-size="13">
      <text x="20" y="55" fill="#00f5a0">&gt;_ basher v4</text>
      <text x="20" y="74" fill="#00e0ff">[CF] [DNS] [RIG]</text>
      <text x="20" y="93" fill="#00ffa8">SWARM ONLINE ●</text>
    </g>

    <rect x="10" y="32" width="150" height="78" rx="8" ry="8"
          fill="none" stroke="#00f5a0" stroke-width="1.2"
          filter="url(#glow)" opacity="0.85"/>
  </g>

  <!-- Label -->
  <text x="160" y="272" text-anchor="middle"
        font-family="monospace" font-size="20"
        letter-spacing="4" fill="#00f5a0">
    BASHER
  </text>

  <text x="160" y="292" text-anchor="middle"
        font-family="monospace" font-size="10"
        fill="#46e8ff" opacity="0.8">
    ASX · SCX · TRI-TUNNEL SWARM
  </text>

</svg>


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
