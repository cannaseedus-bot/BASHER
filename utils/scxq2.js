/**
 * SCXQ2 DNS-Tunnel Encoder/Decoder
 *
 * Provides compression, fragmentation, and encoding utilities
 * for the Ghost Network DNS tunnel layer.
 */

import crypto from "crypto";

/**
 * Compress a string using base64url encoding
 * (In production, this would use real SCXQ2 compression)
 */
export function scxq2_compress(str) {
  return Buffer.from(str, "utf8").toString("base64url");
}

/**
 * Decompress a base64url encoded string
 */
export function scxq2_decompress(encoded) {
  try {
    return Buffer.from(encoded, "base64url").toString("utf8");
  } catch (err) {
    console.error("SCXQ2 decompress error:", err);
    return null;
  }
}

/**
 * Fragment a string into chunks suitable for DNS labels
 * DNS labels max at 63 chars, but we keep it safer at 40
 */
export function scxq2_fragment(str, size = 40) {
  const chunks = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}

/**
 * Generate a random nonce for packet tracking
 */
export function scxq2_nonce() {
  return crypto.randomBytes(3).toString("hex");
}

/**
 * Build a DNS query name from packet components
 * Format: <type>.<nonce>.<frag>/<total>.<payload>.<domain>
 */
export function scxq2_buildQuery(type, nonce, fragIndex, fragTotal, payload, domain) {
  const index = fragIndex.toString().padStart(2, "0");
  const total = fragTotal.toString().padStart(2, "0");

  return `${type}.${nonce}.${index}-${total}.${payload}.${domain}`;
}

/**
 * Parse a DNS TXT record response
 * Format: SCXQ2:<nonce>:<frag>/<total>:<payload>
 */
export function scxq2_parseResponse(txt) {
  if (!txt.startsWith("SCXQ2:")) {
    return null;
  }

  const parts = txt.slice(6).split(":");
  if (parts.length < 3) {
    return null;
  }

  return {
    nonce: parts[0],
    frag: parts[1],
    payload: parts[2]
  };
}

/**
 * Reconstruct a message from multiple fragments
 */
export function scxq2_reassemble(fragments) {
  // Sort by fragment index
  const sorted = fragments.sort((a, b) => {
    const aIdx = parseInt(a.frag.split("/")[0]);
    const bIdx = parseInt(b.frag.split("/")[0]);
    return aIdx - bIdx;
  });

  // Combine payloads
  const combined = sorted.map(f => f.payload).join("");

  // Decompress
  return scxq2_decompress(combined);
}

/**
 * Advanced: Packet validation
 */
export function scxq2_validatePacket(packet) {
  if (!packet || typeof packet !== "object") {
    return false;
  }

  const required = ["type", "nonce", "frag", "payload"];
  return required.every(field => field in packet);
}

/**
 * Advanced: Generate checksum for payload integrity
 */
export function scxq2_checksum(data) {
  return crypto.createHash("md5").update(data).digest("hex").slice(0, 8);
}

/**
 * Advanced: Add checksum to payload
 */
export function scxq2_addChecksum(payload) {
  const checksum = scxq2_checksum(payload);
  return `${checksum}:${payload}`;
}

/**
 * Advanced: Verify and remove checksum from payload
 */
export function scxq2_verifyChecksum(payloadWithChecksum) {
  const parts = payloadWithChecksum.split(":");
  if (parts.length < 2) {
    return { valid: false, payload: null };
  }

  const checksum = parts[0];
  const payload = parts.slice(1).join(":");
  const expected = scxq2_checksum(payload);

  return {
    valid: checksum === expected,
    payload: checksum === expected ? payload : null
  };
}
