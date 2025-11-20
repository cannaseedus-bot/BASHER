#!/usr/bin/env python3
"""
MX2LM Atomic Pipeline - GODMODE ULTRA Dataset Merger

Collects all JSONL training files from dataset/ subdirectories and merges them
into a single atomic ultra dataset for fine-tuning.

Supports all BASHER/XJSON dataset groups:
- xjson
- kuhul (K'uhul)
- violations
- scxq2
- xcfe
- hive
- retro
- fusion
- battlemode
- klh_router
- compiler
- primeos
"""

import json
import os
from pathlib import Path
from typing import List, Dict
import sys

# Determine project root
if __name__ == "__main__":
    ROOT = Path(__file__).resolve().parent.parent  # BASHER root
else:
    ROOT = Path(__file__).resolve().parent.parent

DATASET_DIR = ROOT / "dataset"
OUT_DIR = ROOT / "python" / "local_out"
OUT_DIR.mkdir(parents=True, exist_ok=True)

OUT_JSONL = OUT_DIR / "atomic_ultra_merged.jsonl"

# Dataset groups to merge
DATASET_GROUPS = [
    "xjson",
    "kuhul",
    "violations",
    "scxq2",
    "xcfe",
    "hive",
    "retro",
    "fusion",
    "battlemode",
    "klh_router",
    "compiler",
    "primeos",
]

def iter_jsonl(path: Path):
    """Iterate over JSONL file, yielding parsed objects"""
    if not path.is_file():
        return
    with path.open("r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError as e:
                print(f"[WARN] Skipping invalid JSON in {path.name}:{line_num}: {e}", file=sys.stderr)
                continue

def collect_samples() -> List[Dict]:
    """Collect all samples from dataset/ subdirectories"""
    all_samples: List[Dict] = []

    # Check if dataset dir exists
    if not DATASET_DIR.is_dir():
        print(f"[WARN] Dataset directory not found: {DATASET_DIR}")
        print(f"[WARN] Creating empty directory...")
        DATASET_DIR.mkdir(parents=True, exist_ok=True)
        return all_samples

    for group in DATASET_GROUPS:
        group_dir = DATASET_DIR / group
        if not group_dir.is_dir():
            print(f"[INFO] Group directory not found, skipping: {group}")
            continue

        group_count = 0
        for file in group_dir.glob("*.jsonl"):
            file_count = 0
            for sample in iter_jsonl(file):
                # Add metadata if not present
                if "meta" not in sample:
                    sample["meta"] = {}

                sample["meta"].setdefault("group", group)
                sample["meta"].setdefault("source_file", str(file.relative_to(ROOT)))

                all_samples.append(sample)
                file_count += 1
                group_count += 1

            if file_count > 0:
                print(f"[INFO] {group}/{file.name}: {file_count} samples")

        if group_count > 0:
            print(f"[INFO] {group} total: {group_count} samples")

    return all_samples

def main():
    """Main pipeline execution"""
    print("=" * 60)
    print("MX2LM ATOMIC PIPELINE - GODMODE ULTRA")
    print("=" * 60)
    print()

    print("[PIPELINE] Collecting samples from dataset/...")
    samples = collect_samples()

    print()
    print(f"[PIPELINE] Total samples collected: {len(samples)}")

    if not samples:
        print("[PIPELINE] No samples found.")
        print("[PIPELINE] Check that dataset/ folder contains JSONL files.")
        print()
        print("Expected structure:")
        print("  dataset/")
        print("    xjson/*.jsonl")
        print("    kuhul/*.jsonl")
        print("    violations/*.jsonl")
        print("    ...")
        return

    print()
    print(f"[PIPELINE] Writing merged JSONL → {OUT_JSONL}")

    with OUT_JSONL.open("w", encoding="utf-8") as f:
        for s in samples:
            f.write(json.dumps(s, ensure_ascii=False) + "\n")

    print()
    print("=" * 60)
    print("[PIPELINE] ✓ DONE")
    print("=" * 60)
    print()
    print(f"Output: {OUT_JSONL}")
    print(f"Total samples: {len(samples)}")
    print()
    print("Next steps:")
    print("  1. Review output: cat python/local_out/atomic_ultra_merged.jsonl | head")
    print("  2. Generate theory seeds: python python/mx2lm_theory_expander.py")
    print("  3. Build guide: python python/build_atomic_advanced_guide.py")

if __name__ == "__main__":
    main()
