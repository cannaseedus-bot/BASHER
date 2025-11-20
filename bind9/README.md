# Bind9 Configuration for Ghost DNS Network

This directory contains Bind9 configuration files for setting up the authoritative DNS server for the Ghost Network.

## Quick Setup

### 1. Install Bind9

```bash
# Ubuntu/Debian
sudo apt-get install bind9 bind9utils bind9-doc

# CentOS/RHEL
sudo yum install bind bind-utils
```

### 2. Install Ghost DNS Engine

```bash
cd /opt/basher/ghost-server
pip3 install -r requirements.txt
```

### 3. Configure Bind9

#### Option A: Forward Zone (Recommended for development)

This makes Bind9 forward all `ghost.asx.net` queries to your local Ghost DNS engine.

```bash
# Copy the forward zone config
sudo cp named.conf.local.ghost /etc/bind/named.conf.local.ghost

# Include it in main config
sudo nano /etc/bind/named.conf.local
```

Add this line:
```conf
include "/etc/bind/named.conf.local.ghost";
```

#### Option B: Full Authority Zone (Production)

For production deployment where you own `ghost.asx.net`:

```bash
# Copy zone file
sudo cp db.ghost.asx.net.example /var/cache/bind/db.ghost.asx.net

# Edit with your IP addresses
sudo nano /var/cache/bind/db.ghost.asx.net

# Update named.conf.local
sudo nano /etc/bind/named.conf.local
```

Add:
```conf
zone "ghost.asx.net" {
    type master;
    file "/var/cache/bind/db.ghost.asx.net";
    allow-transfer { trusted-slaves; };
};
```

### 4. Start Ghost DNS Engine

```bash
# Run manually
cd /opt/basher/ghost-server
python3 index.py

# Or as systemd service
sudo systemctl start basher-ghost
sudo systemctl enable basher-ghost
```

### 5. Restart Bind9

```bash
# Check configuration
sudo named-checkconf

# Check zone file (if using full authority)
sudo named-checkzone ghost.asx.net /var/cache/bind/db.ghost.asx.net

# Restart
sudo systemctl restart bind9

# Check status
sudo systemctl status bind9
```

## Testing

### Test Local Resolution

```bash
# Test from localhost
dig @localhost ghost.asx.net

# Test SCXQ2 ping query
dig @localhost ping.abc123.ghost.asx.net TXT
```

### Test DNS Tunnel

```bash
# From BASHER client
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "basher.dnsPing",
      "input": {}
    }
  }'
```

## Architecture

```
┌─────────────┐          DNS Query           ┌─────────────┐
│   Internet  │ ────────────────────────────> │   Bind9     │
│   Client    │                                │   (port 53) │
└─────────────┘                                └──────┬──────┘
                                                      │
                                                      │ Forward
                                                      ▼
                                               ┌─────────────┐
                                               │ Ghost DNS   │
                                               │ Engine      │
                                               │ (port 5353) │
                                               └─────────────┘
```

## Firewall Configuration

```bash
# Allow DNS traffic
sudo ufw allow 53/udp
sudo ufw allow 53/tcp

# Reload firewall
sudo ufw reload
```

## Troubleshooting

### Check Bind9 Logs

```bash
sudo journalctl -u bind9 -f

# Or
sudo tail -f /var/log/syslog | grep named
```

### Check Ghost DNS Engine

```bash
# If running via systemd
sudo journalctl -u basher-ghost -f

# If running manually, check console output
```

### Test Forwarding

```bash
# Query Bind9 directly
dig @localhost ghost.asx.net TXT

# Query Ghost DNS engine directly
dig @localhost -p 5353 ghost.asx.net TXT
```

### Common Issues

**Issue**: "connection refused" when querying Bind9
- **Solution**: Check if Bind9 is running: `sudo systemctl status bind9`

**Issue**: No response from Ghost DNS queries
- **Solution**: Verify Ghost DNS engine is running on port 5353

**Issue**: "SERVFAIL" response
- **Solution**: Check Bind9 logs for forwarding errors

## Production Deployment

### DNS Provider Setup

1. **Register domain** or subdomain (e.g., `ghost.yourdomain.com`)
2. **Set NS records** to point to your Bind9 server:
   ```
   ghost.yourdomain.com.  IN  NS  ns1.yourdomain.com.
   ns1.yourdomain.com.    IN  A   YOUR_SERVER_IP
   ```

3. **Verify delegation**:
   ```bash
   dig ghost.yourdomain.com NS +trace
   ```

### Security

- **Restrict queries** in production (don't use `allow-query { any; };`)
- **Enable DNSSEC** for zone integrity
- **Rate limit** queries to prevent abuse
- **Monitor** for suspicious SCXQ2 traffic patterns

### High Availability

For production, run multiple Ghost DNS engines behind a load balancer:

```
Bind9 → (Round Robin) → Ghost DNS Engine 1
                      → Ghost DNS Engine 2
                      → Ghost DNS Engine 3
```

## Files

- `named.conf.local.ghost` - Forward zone configuration
- `named.conf.options.sample` - Sample Bind9 options
- `db.ghost.asx.net.example` - Example zone file
- `README.md` - This file
