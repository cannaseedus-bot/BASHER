#!/usr/bin/env python3
"""
MX2LM Theory Expander - GODMODE ULTRA

Reads design notes/brain-dumps and produces templated theory cards for training.
Creates structured training seeds from unstructured technical notes.

Input: Plain text file with design notes (separated by blank lines)
Output: JSONL file with theory expansion prompts
"""

import json
from pathlib import Path
from datetime import datetime
import sys

# Determine project root
if __name__ == "__main__":
    ROOT = Path(__file__).resolve().parent.parent  # BASHER root
else:
    ROOT = Path(__file__).resolve().parent.parent

# Default notes file - create one if it doesn't exist
NOTES_FILE = ROOT / "python" / "theory_notes.txt"
OUT_DIR = ROOT / "python" / "local_out"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_JSONL = OUT_DIR / "theory_expanded.jsonl"

# Template for theory expansion
TEMPLATE = """You are MX2LM, an ASX/XJSON/K'uhul research model specializing in:
- XJSON execution semantics
- K'uhul Handler Language (KHL) protocol design
- SCXQ2 encoding for DNS tunnels
- Multi-agent swarm coordination
- XCFE cross-language fusion execution

Expand the following design note into a precise, technical specification
with examples, edge cases, and integration details:

NOTE:
{note}

RESPONSE (write as if documenting the official spec):"""

def load_notes():
    """Load notes from text file, splitting by blank lines"""
    if not NOTES_FILE.is_file():
        print(f"[THEORY] Notes file not found: {NOTES_FILE}")
        print(f"[THEORY] Creating sample notes file...")

        # Create sample notes
        sample_notes = """XJSON handler composition rules
Handlers can return other XJSON programs for chaining.
Need to define recursion limits and error propagation.

SCXQ2 DNS tunnel packet size optimization
Current implementation uses 253 byte limit per TXT record.
Could we compress better with custom dictionary?

K'uhul async execution model
Handlers run concurrently but need coordination.
Define happens-before relationships and memory consistency.

Swarm role assignment algorithm
How do we pick which agent handles which task?
Need latency-aware routing with fallback chains.

XCFE language bridge safety
Calling between JS/Python/Shell needs sandboxing.
Define capability model and resource limits."""

        NOTES_FILE.write_text(sample_notes, encoding="utf-8")
        print(f"[THEORY] Created sample notes at: {NOTES_FILE}")
        print(f"[THEORY] Edit this file and run again to generate theory seeds.")

    with NOTES_FILE.open("r", encoding="utf-8") as f:
        raw = f.read()

    # Split by blank lines (two or more newlines)
    chunks = [c.strip() for c in raw.split("\n\n") if c.strip()]
    return chunks

def main():
    """Main theory expander execution"""
    print("=" * 60)
    print("MX2LM THEORY EXPANDER - GODMODE ULTRA")
    print("=" * 60)
    print()

    print(f"[THEORY] Loading notes from: {NOTES_FILE}")
    notes = load_notes()

    if not notes:
        print("[THEORY] No notes found.")
        return

    print(f"[THEORY] Found {len(notes)} theory notes")
    print()

    now = datetime.utcnow().isoformat() + "Z"

    theory_seeds = []
    with OUT_JSONL.open("w", encoding="utf-8") as f:
        for idx, note in enumerate(notes, start=1):
            # Create prompt for theory expansion
            prompt = TEMPLATE.format(note=note)

            # Create training sample
            # (output field left empty for later expansion by model or human)
            sample = {
                "input": prompt,
                "output": "",  # Fill this in later with model-expanded text
                "instruction": "Expand this design note into a technical specification",
                "meta": {
                    "kind": "theory_expansion",
                    "note_index": idx,
                    "created_at": now,
                    "note_preview": note[:100] + "..." if len(note) > 100 else note
                },
            }

            f.write(json.dumps(sample, ensure_ascii=False) + "\n")
            theory_seeds.append(sample)

            print(f"[THEORY] #{idx}: {note.split(chr(10))[0][:60]}...")

    print()
    print("=" * 60)
    print("[THEORY] ✓ DONE")
    print("=" * 60)
    print()
    print(f"Output: {OUT_JSONL}")
    print(f"Theory seeds: {len(theory_seeds)}")
    print()
    print("Next steps:")
    print("  1. Review seeds: cat python/local_out/theory_expanded.jsonl | jq")
    print("  2. Fill output field with model expansions (manual or automated)")
    print("  3. Merge with atomic pipeline: cat theory_expanded.jsonl >> atomic_ultra_merged.jsonl")
    print("  4. Build guide: python python/build_atomic_advanced_guide.py")

if __name__ == "__main__":
    main()
