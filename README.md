# BASHER v3.5 - Tri-Tunnel Orchestrator + Ghost Network Mode

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
║  v3.5 - Ghost Network Mode            ║
╚═══════════════════════════════════════╝
```

**Fast as a jackrabbit. Focused like a neural laser.**

---

## Overview

BASHER v3.5 is a **production-ready network daemon** that orchestrates three independent tunnel modes:

1. **Cloudflare Tunnel** - Public HTTP gateway for KHL/KUHUL services
2. **DNS Ghost Network** - Stealth covert channel using DNS-over-SCXQ2 encoding
3. **FastAPI Monitoring** - Health checks for local model servers

This is not a toy. This is an **operational ASX-grade networking daemon**.

---

## Features

### 🌐 Tri-Tunnel Architecture

- **Cloudflare Tunnel**: Auto-spawns and monitors `cloudflared` process
- **DNS Ghost**: SCXQ2-encoded DNS tunnel for covert communication
- **FastAPI Health**: Monitors local endpoints (KUHUL, Mx2LM, etc.)

### 🔒 SCXQ2 DNS-Tunnel

- Works when HTTPS is blocked
- Works behind corporate firewalls
- Uses DNS (UDP 53) - the ONE port nobody blocks
- Fragmentation support for large payloads
- Checksum validation
- Bidirectional communication

### 🎮 XJSON Integration

- Full XJSON handler support
- Drop-in integration with KHL
- Browser console interface
- RESTful API

### 📊 Monitoring

- Network connectivity checks
- Automatic tunnel restart
- Health statistics
- Error tracking

---

## Installation

### Prerequisites

- Node.js >= 18.0.0
- Python 3.8+ (for Ghost DNS server)
- `cloudflared` (optional, for Cloudflare tunnel)

### Quick Start

```bash
# Clone or extract BASHER
cd BASHER

# Install Node dependencies
npm install

# Install Python dependencies (for Ghost DNS server)
cd ghost-server
pip3 install -r requirements.txt
cd ..

# Start BASHER daemon
npm start
```

---

## Configuration

Edit `config/basher.config.json`:

```json
{
  "server": {
    "port": 3000,
    "host": "0.0.0.0",
    "enableCors": true
  },
  "cloudflare": {
    "enabled": true,
    "label": "asx-basher",
    "url": "http://localhost:3000",
    "command": "cloudflared",
    "args": ["tunnel", "--url", "http://localhost:3000"],
    "heartbeatIntervalSec": 30,
    "autoRestart": true
  },
  "dnsGhost": {
    "enabled": true,
    "resolver": "1.1.1.1",
    "domain": "ghost.asx.net",
    "heartbeatIntervalSec": 60,
    "tunnel": {
      "enabled": true,
      "fragmentSize": 40,
      "maxFragments": 10
    }
  },
  "fastapi": {
    "enabled": true,
    "targets": [
      { "name": "fastapi-main", "url": "http://localhost:8000/health" },
      { "name": "fastapi-kuhul", "url": "http://localhost:9009/health" }
    ],
    "heartbeatIntervalSec": 15
  }
}
```

### Key Configuration Options

- **cloudflare.enabled**: Enable/disable Cloudflare tunnel
- **dnsGhost.enabled**: Enable/disable Ghost DNS tunnel
- **dnsGhost.tunnel.enabled**: Enable DNS tunnel data transport
- **fastapi.targets**: Add your local service endpoints

---

## XJSON Handlers

BASHER exposes the following XJSON handlers:

### Core Handlers

- `core.ping` - Health check
- `core.info` - System information
- `core.stats` - Process statistics
- `core.version` - Version info

### BASHER Handlers

- `basher.status` - Full tri-tunnel status
- `basher.network` - Network and endpoints (KHL-friendly)
- `basher.forceCloudflareRestart` - Restart Cloudflare tunnel
- `basher.dnsSend` - Send message via DNS tunnel
- `basher.dnsPing` - Ping Ghost DNS network
- `basher.checkTarget` - Check specific FastAPI target

### Example XJSON Call

```bash
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "basher.status",
      "input": {}
    }
  }'
```

---

## DNS Ghost Network

### Architecture

The DNS Ghost Network is a **covert communication channel** that uses DNS queries to transport SCXQ2-encoded messages.

```
┌─────────────┐           DNS Query            ┌─────────────┐
│   BASHER    │ ────────────────────────────> │  Ghost DNS  │
│   Client    │                                 │   Server    │
│             │ <──────────────────────────── │             │
└─────────────┘           TXT Record           └─────────────┘
```

### Packet Format

DNS query name:
```
<type>.<nonce>.<frag>-<total>.<payload>.ghost.asx.net
```

Example:
```
cmd.9f3a.00-03.YXN4LWJhc2hlcg.ghost.asx.net
```

TXT record response:
```
SCXQ2:<nonce>:<frag>-<total>:<payload>
```

### Using the DNS Tunnel

#### From XJSON

```json
{
  "program": {
    "type": "basher.dnsSend",
    "input": {
      "message": "{\"task\": \"ping\"}"
    }
  }
}
```

#### From KHL

```javascript
const result = await xjsonCall('basher.dnsSend', {
  message: JSON.stringify({ task: 'status' })
});

console.log('Ghost response:', result.response);
```

### Setting Up Ghost DNS Server

#### Option 1: Local Testing (Port 5353)

```bash
cd ghost-server
python3 index.py
```

Then point BASHER to your local resolver:
```json
"dnsGhost": {
  "resolver": "127.0.0.1:5353",
  "domain": "ghost.asx.net"
}
```

#### Option 2: Production (Authoritative DNS)

1. **Get a domain** (e.g., `ghost.yourdomain.com`)
2. **Point NS records** to your VPS
3. **Run Ghost DNS server** on port 53:

```bash
sudo python3 ghost-server/index.py
```

4. **Configure BASHER**:

```json
"dnsGhost": {
  "resolver": "1.1.1.1",
  "domain": "ghost.yourdomain.com"
}
```

---

## Browser Console

BASHER includes a browser-based terminal console.

Access it at: `http://localhost:3000/`

### Available Commands

```
basher-status       Full BASHER daemon status
basher-network      Network and endpoints
dns-ping            Ping DNS ghost network
dns-send [msg]      Send message via DNS tunnel
handlers            List available XJSON handlers
core-ping           Ping daemon
core-info           System information
clear               Clear screen
help                Show help
```

---

## KHL Integration

### From KHL Runtime

```javascript
// In khl-runtime.js
async function getBasherStatus() {
  const response = await fetch('http://localhost:3000/xjson/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      program: {
        type: 'basher.network',
        input: {}
      }
    })
  });

  const data = await response.json();
  return data;
}
```

### From KHL Tape

```json
{
  "routes": {
    "refresh_basher": {
      "call": {
        "xjson": {
          "program": {
            "type": "basher.network",
            "input": {}
          }
        }
      }
    }
  }
}
```

---

## Running as Systemd Service

Create `/etc/systemd/system/basher.service`:

```ini
[Unit]
Description=BASHER v3.5 Daemon
After=network.target

[Service]
Type=simple
User=basher
WorkingDirectory=/opt/basher
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=basher

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable basher
sudo systemctl start basher
sudo systemctl status basher
```

View logs:

```bash
journalctl -u basher -f
```

---

## Development

### Run in Dev Mode

```bash
npm run dev
```

This uses `node --watch` for auto-reload on file changes.

### Testing XJSON Handlers

```bash
# List handlers
curl http://localhost:3000/xjson/handlers

# Ping
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{"program": {"type": "core.ping", "input": {}}}'

# Get BASHER status
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{"program": {"type": "basher.status", "input": {}}}'
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BASHER Daemon                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Cloudflare  │  │  DNS Ghost   │  │   FastAPI    │ │
│  │   Tunnel     │  │   Network    │  │   Monitor    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                 XJSON Handler Layer                     │
├─────────────────────────────────────────────────────────┤
│                    HTTP Server                          │
│                  (port 3000)                            │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    Cloudflare          Ghost DNS              FastAPI
    (Public)            (Covert)               (Local)
```

---

## Security Considerations

### DNS Ghost Network

- **Stealth**: DNS traffic is rarely inspected
- **Fragmentation**: Large messages split across multiple queries
- **Checksums**: Payload integrity validation
- **Nonces**: Prevents replay attacks

### Production Deployment

- Use HTTPS for XJSON endpoints
- Restrict CORS origins
- Implement authentication for sensitive handlers
- Rate limit DNS queries
- Monitor for anomalous DNS patterns

---

## Troubleshooting

### Cloudflare Tunnel Won't Start

```bash
# Check if cloudflared is installed
which cloudflared

# Install if needed
# macOS
brew install cloudflare/cloudflare/cloudflared

# Linux
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared
```

### DNS Ghost Not Responding

1. Check resolver is reachable:
```bash
dig @1.1.1.1 google.com
```

2. Test Ghost DNS server:
```bash
dig @localhost -p 5353 ping.test.ghost.asx.net TXT
```

3. Check firewall:
```bash
sudo ufw allow 5353/udp
```

### FastAPI Targets Unreachable

```bash
# Check if services are running
curl http://localhost:8000/health
curl http://localhost:9009/health

# Check BASHER logs
journalctl -u basher -f
```

---

## Roadmap

- [ ] SCXQ2 v2 compression algorithm
- [ ] DNS-over-HTTPS (DoH) support
- [ ] Multi-agent mesh networking
- [ ] Swarm mode (agent-to-agent routing)
- [ ] KUHUL direct integration
- [ ] Mx2LM actor switching via DNS
- [ ] Ghost Network encryption layer

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

**ASX BASHER v3.5 - Ghost Network Mode**

*When the network goes dark, BASHER goes Ghost.*
