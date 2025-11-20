#!/usr/bin/env python3
"""
ASX BASHER Ghost DNS Server v4.0

Production-ready DNS-based covert channel server with:
- SCXQ2 encoding/decoding
- Fragment reassembly
- Checksum validation
- Message caching
- Multi-transport support

Receives SCXQ2-encoded messages via DNS queries and responds via TXT records.
"""

import base64
import hashlib
import json
import logging
import sys
from datetime import datetime
from typing import Dict, Optional, List
from collections import defaultdict

try:
    from dnslib import DNSRecord, DNSHeader, RR, TXT, A, QTYPE
    from dnslib.server import DNSServer, BaseResolver
except ImportError:
    print("ERROR: dnslib not installed. Run: pip3 install dnslib")
    sys.exit(1)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(__name__)


class SCXQ2Codec:
    """SCXQ2 Encoding/Decoding utilities"""

    @staticmethod
    def decompress(encoded: str) -> Optional[str]:
        """Decompress base64url encoded string"""
        try:
            # Add padding if needed
            padding = (4 - len(encoded) % 4) % 4
            encoded_padded = encoded + ('=' * padding)
            # Replace URL-safe chars
            encoded_std = encoded_padded.replace('-', '+').replace('_', '/')
            return base64.b64decode(encoded_std).decode('utf-8')
        except Exception as e:
            logger.error(f"Decompress error: {e}")
            return None

    @staticmethod
    def compress(data: str) -> str:
        """Compress string to base64url encoding"""
        try:
            encoded = base64.b64encode(data.encode('utf-8')).decode('ascii')
            # Make URL-safe
            return encoded.replace('+', '-').replace('/', '_').rstrip('=')
        except Exception as e:
            logger.error(f"Compress error: {e}")
            return ""

    @staticmethod
    def checksum(data: str) -> str:
        """Generate MD5 checksum (first 8 chars)"""
        return hashlib.md5(data.encode()).hexdigest()[:8]

    @staticmethod
    def add_checksum(payload: str) -> str:
        """Add checksum to payload"""
        cs = SCXQ2Codec.checksum(payload)
        return f"{cs}:{payload}"

    @staticmethod
    def verify_checksum(payload_with_checksum: str) -> tuple:
        """Verify and remove checksum from payload"""
        if ':' not in payload_with_checksum:
            return False, None

        parts = payload_with_checksum.split(':', 1)
        if len(parts) < 2:
            return False, None

        checksum, payload = parts
        expected = SCXQ2Codec.checksum(payload)

        return checksum == expected, payload if checksum == expected else None


class GhostMessage:
    """Represents a parsed DNS tunnel message"""

    def __init__(self, query_name: str):
        self.raw = query_name
        self.type = None
        self.nonce = None
        self.frag_index = None
        self.frag_total = None
        self.payload = None
        self.valid = False

        self._parse()

    def _parse(self):
        """Parse DNS query name into components"""
        try:
            # Format: <type>.<nonce>.<frag>-<total>.<payload>.ghost.asx.net
            parts = self.raw.split('.')

            if len(parts) < 4:
                logger.warning(f"Invalid query format: {self.raw}")
                return

            self.type = parts[0]
            self.nonce = parts[1]

            # Parse frag/total (format: 00-03)
            frag_parts = parts[2].split('-')
            if len(frag_parts) == 2:
                try:
                    self.frag_index = int(frag_parts[0])
                    self.frag_total = int(frag_parts[1])
                except ValueError:
                    logger.warning(f"Invalid frag format: {parts[2]}")
                    return

            self.payload = parts[3]
            self.valid = True

            logger.debug(f"Parsed: type={self.type}, nonce={self.nonce}, "
                        f"frag={self.frag_index}/{self.frag_total}")

        except Exception as e:
            logger.error(f"Parse error for {self.raw}: {e}")

    def __repr__(self):
        return (f"GhostMessage(type={self.type}, nonce={self.nonce}, "
                f"frag={self.frag_index}/{self.frag_total}, "
                f"payload_len={len(self.payload) if self.payload else 0})")


class GhostResolver(BaseResolver):
    """DNS Resolver for Ghost Network tunnel"""

    def __init__(self, domain='ghost.asx.net'):
        self.domain = domain
        self.message_cache: Dict[str, List] = defaultdict(list)
        self.stats = {
            'queries_total': 0,
            'queries_ping': 0,
            'queries_cmd': 0,
            'messages_received': 0,
            'messages_sent': 0,
            'errors': 0,
            'fragments_received': 0
        }
        logger.info(f"Ghost Resolver initialized for domain: {domain}")

    def resolve(self, request, handler):
        """Handle DNS query"""
        reply = request.reply()
        qname = str(request.q.qname).rstrip('.')

        logger.info(f"← Query: {qname}")
        self.stats['queries_total'] += 1

        # Check if it's a ghost network query
        if not qname.endswith(self.domain):
            logger.debug(f"Not for us: {qname}")
            return reply

        # Parse message
        msg = GhostMessage(qname)

        if not msg.valid:
            logger.warning(f"Invalid message: {qname}")
            self.stats['errors'] += 1
            return reply

        # Handle different message types
        if msg.type == 'ping':
            self.stats['queries_ping'] += 1
            response = self._handle_ping(msg)
        elif msg.type == 'cmd':
            self.stats['queries_cmd'] += 1
            self.stats['fragments_received'] += 1
            response = self._handle_command(msg)
        else:
            logger.warning(f"Unknown type: {msg.type}")
            response = f"SCXQ2:{msg.nonce}:00-01:unknown_type"

        # Add TXT record with response
        reply.add_answer(
            RR(
                request.q.qname,
                QTYPE.TXT,
                rdata=TXT(response),
                ttl=0
            )
        )

        logger.info(f"→ Response: {response[:80]}...")
        self.stats['messages_sent'] += 1
        return reply

    def _handle_ping(self, msg: GhostMessage) -> str:
        """Handle ping messages"""
        logger.info(f"🏓 Ping from nonce={msg.nonce}")

        response = {
            'type': 'pong',
            'timestamp': datetime.utcnow().isoformat(),
            'nonce': msg.nonce,
            'stats': {
                'queries': self.stats['queries_total'],
                'messages': self.stats['messages_received']
            }
        }

        encoded = SCXQ2Codec.compress(json.dumps(response))
        checksummed = SCXQ2Codec.add_checksum(encoded)

        return f"SCXQ2:{msg.nonce}:00-01:{checksummed}"

    def _handle_command(self, msg: GhostMessage) -> str:
        """Handle command messages with fragment reassembly"""
        # Decode payload
        decoded = SCXQ2Codec.decompress(msg.payload)

        if not decoded:
            logger.error(f"Failed to decode payload from {msg.nonce}")
            self.stats['errors'] += 1
            return f"SCXQ2:{msg.nonce}:00-01:error_decode"

        # Cache fragment
        cache_key = msg.nonce
        self.message_cache[cache_key].append({
            'index': msg.frag_index,
            'total': msg.frag_total,
            'payload': decoded
        })

        logger.debug(f"Cached fragment {msg.frag_index}/{msg.frag_total} "
                    f"for nonce {msg.nonce}")

        # Check if we have all fragments
        if len(self.message_cache[cache_key]) == msg.frag_total:
            # Reassemble
            fragments = sorted(self.message_cache[cache_key],
                             key=lambda x: x['index'])
            full_payload = ''.join([f['payload'] for f in fragments])

            logger.info(f"✓ Complete message from {msg.nonce}: "
                       f"{len(fragments)} fragments, "
                       f"{len(full_payload)} bytes")

            # Verify checksum
            valid, message = SCXQ2Codec.verify_checksum(full_payload)

            if valid:
                logger.info(f"✓ Checksum verified for {msg.nonce}")
                self.stats['messages_received'] += 1

                # Process message
                response = self._process_message(message, msg.nonce)
            else:
                logger.error(f"✗ Checksum verification failed for {msg.nonce}")
                self.stats['errors'] += 1
                response = "error:checksum_failed"

            # Clear cache
            del self.message_cache[cache_key]

        else:
            # Still waiting for more fragments
            current = len(self.message_cache[cache_key])
            total = msg.frag_total
            logger.debug(f"Waiting for fragments: {current}/{total}")
            response = f"ack:fragment_{msg.frag_index}_received"

        # Encode response
        encoded = SCXQ2Codec.compress(response)
        checksummed = SCXQ2Codec.add_checksum(encoded)

        return f"SCXQ2:{msg.nonce}:00-01:{checksummed}"

    def _process_message(self, message: str, nonce: str) -> str:
        """Process complete message and generate response"""
        try:
            # Try to parse as JSON
            data = json.loads(message)

            logger.info(f"📨 Processing message: {data}")

            if data.get('task') == 'ping':
                response = {
                    'status': 'pong',
                    'timestamp': datetime.utcnow().isoformat(),
                    'nonce': nonce
                }
            elif data.get('task') == 'status':
                response = {
                    'status': 'online',
                    'stats': self.stats,
                    'domain': self.domain,
                    'cached_messages': len(self.message_cache)
                }
            elif data.get('task') == 'echo':
                response = {
                    'status': 'ok',
                    'echo': data.get('message', 'no message')
                }
            else:
                # Generic response
                response = {
                    'status': 'ok',
                    'received': data,
                    'timestamp': datetime.utcnow().isoformat()
                }

            return json.dumps(response)

        except json.JSONDecodeError:
            # Not JSON, just echo
            logger.warning(f"Non-JSON message: {message[:50]}")
            return f"echo:{message}"


def main():
    """Start Ghost DNS Server"""
    print("""
╔═══════════════════════════════════════╗
║   ASX BASHER GHOST DNS SERVER v4.0    ║
║   DNS-Tunnel Covert Channel           ║
║   SCXQ2 Encoded                       ║
╚═══════════════════════════════════════╝
    """)

    # Configuration
    domain = 'ghost.asx.net'
    port = 5353
    host = '0.0.0.0'

    logger.info(f"Starting Ghost DNS Server")
    logger.info(f"Domain:    {domain}")
    logger.info(f"Listening: {host}:{port}")
    logger.info(f"Protocol:  DNS-over-SCXQ2")

    resolver = GhostResolver(domain=domain)
    server = DNSServer(resolver, port=port, address=host)

    try:
        logger.info("✓ Ghost DNS Server is ONLINE")
        logger.info("Waiting for SCXQ2-encoded DNS queries...")
        server.start_thread()

        # Keep main thread alive
        import time
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.error(f"Server error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        server.stop()
        logger.info("Ghost DNS Server stopped")


if __name__ == '__main__':
    main()
