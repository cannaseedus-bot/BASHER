#!/usr/bin/env python3
"""
ASX BASHER Ghost DNS Server

A DNS-based covert channel server that receives SCXQ2-encoded
messages via DNS queries and responds via TXT records.

This is the server-side component for BASHER's Ghost Network mode.
"""

import base64
import hashlib
import json
import logging
from datetime import datetime
from typing import Dict, Optional

from dnslib import DNSRecord, DNSHeader, RR, TXT, A, QTYPE
from dnslib.server import DNSServer, BaseResolver

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s'
)

logger = logging.getLogger(__name__)


class SCXQ2Decoder:
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
        encoded = base64.b64encode(data.encode('utf-8')).decode('ascii')
        # Make URL-safe
        return encoded.replace('+', '-').replace('/', '_').rstrip('=')

    @staticmethod
    def checksum(data: str) -> str:
        """Generate MD5 checksum (first 8 chars)"""
        return hashlib.md5(data.encode()).hexdigest()[:8]

    @staticmethod
    def add_checksum(payload: str) -> str:
        """Add checksum to payload"""
        cs = SCXQ2Decoder.checksum(payload)
        return f"{cs}:{payload}"

    @staticmethod
    def verify_checksum(payload_with_checksum: str) -> tuple[bool, Optional[str]]:
        """Verify and remove checksum from payload"""
        parts = payload_with_checksum.split(':', 1)
        if len(parts) < 2:
            return False, None

        checksum, payload = parts
        expected = SCXQ2Decoder.checksum(payload)

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

            if len(parts) < 5:
                return

            self.type = parts[0]
            self.nonce = parts[1]

            # Parse frag/total
            frag_parts = parts[2].split('-')
            if len(frag_parts) == 2:
                self.frag_index = int(frag_parts[0])
                self.frag_total = int(frag_parts[1])

            self.payload = parts[3]
            self.valid = True

        except Exception as e:
            logger.error(f"Parse error: {e}")

    def __repr__(self):
        return f"GhostMessage(type={self.type}, nonce={self.nonce}, frag={self.frag_index}/{self.frag_total})"


class GhostResolver(BaseResolver):
    """DNS Resolver for Ghost Network tunnel"""

    def __init__(self, domain='ghost.asx.net'):
        self.domain = domain
        self.message_cache: Dict[str, list] = {}
        self.stats = {
            'queries': 0,
            'messages_received': 0,
            'messages_sent': 0,
            'errors': 0
        }

    def resolve(self, request, handler):
        """Handle DNS query"""
        reply = request.reply()
        qname = str(request.q.qname).rstrip('.')

        logger.info(f"Query: {qname}")
        self.stats['queries'] += 1

        # Check if it's a ghost network query
        if not qname.endswith(self.domain):
            # Not for us
            return reply

        # Parse message
        msg = GhostMessage(qname)

        if not msg.valid:
            logger.warning(f"Invalid message: {qname}")
            self.stats['errors'] += 1
            return reply

        # Handle different message types
        if msg.type == 'ping':
            response = self._handle_ping(msg)
        elif msg.type == 'cmd':
            response = self._handle_command(msg)
        else:
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

        self.stats['messages_sent'] += 1
        return reply

    def _handle_ping(self, msg: GhostMessage) -> str:
        """Handle ping messages"""
        logger.info(f"Ping from {msg.nonce}")

        response = {
            'type': 'pong',
            'timestamp': datetime.utcnow().isoformat(),
            'nonce': msg.nonce
        }

        encoded = SCXQ2Decoder.compress(json.dumps(response))
        checksummed = SCXQ2Decoder.add_checksum(encoded)

        return f"SCXQ2:{msg.nonce}:00-01:{checksummed}"

    def _handle_command(self, msg: GhostMessage) -> str:
        """Handle command messages"""
        # Decode payload
        decoded = SCXQ2Decoder.decompress(msg.payload)

        if not decoded:
            logger.error(f"Failed to decode payload from {msg.nonce}")
            self.stats['errors'] += 1
            return f"SCXQ2:{msg.nonce}:00-01:error_decode"

        # Cache fragment
        cache_key = msg.nonce
        if cache_key not in self.message_cache:
            self.message_cache[cache_key] = []

        self.message_cache[cache_key].append({
            'index': msg.frag_index,
            'total': msg.frag_total,
            'payload': decoded
        })

        # Check if we have all fragments
        if len(self.message_cache[cache_key]) == msg.frag_total:
            # Reassemble
            fragments = sorted(self.message_cache[cache_key], key=lambda x: x['index'])
            full_payload = ''.join([f['payload'] for f in fragments])

            # Verify checksum
            valid, message = SCXQ2Decoder.verify_checksum(full_payload)

            if valid:
                logger.info(f"Complete message from {msg.nonce}: {message}")
                self.stats['messages_received'] += 1

                # Process message
                response = self._process_message(message, msg.nonce)
            else:
                logger.error(f"Checksum verification failed for {msg.nonce}")
                response = "error:checksum_failed"

            # Clear cache
            del self.message_cache[cache_key]

        else:
            # Still waiting for more fragments
            response = f"ack:fragment_{msg.frag_index}_received"

        # Encode response
        encoded = SCXQ2Decoder.compress(response)
        checksummed = SCXQ2Decoder.add_checksum(encoded)

        return f"SCXQ2:{msg.nonce}:00-01:{checksummed}"

    def _process_message(self, message: str, nonce: str) -> str:
        """Process complete message and generate response"""
        try:
            # Try to parse as JSON
            data = json.loads(message)

            if data.get('task') == 'ping':
                response = {
                    'status': 'pong',
                    'timestamp': datetime.utcnow().isoformat()
                }
            elif data.get('task') == 'status':
                response = {
                    'status': 'online',
                    'stats': self.stats
                }
            else:
                response = {
                    'status': 'ok',
                    'echo': message
                }

            return json.dumps(response)

        except json.JSONDecodeError:
            # Not JSON, just echo
            return f"echo:{message}"


def main():
    """Start Ghost DNS Server"""
    print("""
╔═══════════════════════════════════════╗
║   ASX BASHER GHOST DNS SERVER         ║
║   DNS-Tunnel Covert Channel           ║
╚═══════════════════════════════════════╝
    """)

    domain = 'ghost.asx.net'
    port = 5353
    host = '0.0.0.0'

    logger.info(f"Starting Ghost DNS Server")
    logger.info(f"Domain: {domain}")
    logger.info(f"Listening: {host}:{port}")

    resolver = GhostResolver(domain=domain)
    server = DNSServer(resolver, port=port, address=host)

    try:
        logger.info("Ghost DNS Server is ONLINE")
        server.start()
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.error(f"Server error: {e}")
    finally:
        server.stop()


if __name__ == '__main__':
    main()
