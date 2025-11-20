#!/usr/bin/env python3
"""
GODMODE ULTRA - Atomic Advanced Guide Builder

Reads outputs from atomic pipeline and theory expander, then builds
a comprehensive HTML documentation page.

This gives you a visual overview of your entire training dataset
and theory expansion work.
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

LOCAL_OUT = ROOT / "python" / "local_out"
DOC_OUT_DIR = ROOT / "python" / "local_out_godmode_ultra"
DOC_OUT_DIR.mkdir(parents=True, exist_ok=True)

MERGED_FILE = LOCAL_OUT / "atomic_ultra_merged.jsonl"
THEORY_FILE = LOCAL_OUT / "theory_expanded.jsonl"
HTML_OUT = DOC_OUT_DIR / "GODMODE_ULTRA_ATOMIC_GUIDE.html"

def read_jsonl(path: Path, limit: int = 500):
    """Read JSONL file with optional limit"""
    if not path.is_file():
        print(f"[GUIDE] File not found: {path}")
        return []

    rows = []
    with path.open("r", encoding="utf-8") as f:
        for idx, line in enumerate(f):
            if idx >= limit:
                break
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError as e:
                print(f"[WARN] Skipping invalid JSON at line {idx+1}: {e}", file=sys.stderr)
                continue

    return rows

def count_lines(path: Path) -> int:
    """Count total lines in file"""
    if not path.is_file():
        return 0
    with path.open("r", encoding="utf-8") as f:
        return sum(1 for _ in f)

def html_escape(text: str) -> str:
    """Escape HTML special characters"""
    return (text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&#39;"))

def main():
    """Main guide builder execution"""
    print("=" * 60)
    print("GODMODE ULTRA - ATOMIC ADVANCED GUIDE BUILDER")
    print("=" * 60)
    print()

    print("[GUIDE] Reading atomic pipeline output...")
    merged = read_jsonl(MERGED_FILE, limit=200)
    total_merged = count_lines(MERGED_FILE)

    print("[GUIDE] Reading theory expander output...")
    theory = read_jsonl(THEORY_FILE, limit=100)
    total_theory = count_lines(THEORY_FILE)

    now = datetime.utcnow().isoformat() + "Z"

    print()
    print(f"[GUIDE] Merged samples: {len(merged)} (showing first 200 of {total_merged} total)")
    print(f"[GUIDE] Theory seeds: {len(theory)} (showing first 100 of {total_theory} total)")
    print()

    # Build HTML document
    html = []

    # Header
    html.extend([
        "<!doctype html>",
        "<html lang='en'>",
        "<head>",
        "<meta charset='utf-8'/>",
        "<meta name='viewport' content='width=device-width, initial-scale=1.0'/>",
        "<title>GODMODE ULTRA – Atomic Advanced Guide</title>",
        "<style>",
        "* { margin: 0; padding: 0; box-sizing: border-box; }",
        "body {",
        "  background: linear-gradient(135deg, #050814 0%, #0a1028 100%);",
        "  color: #e8fff6;",
        "  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;",
        "  line-height: 1.6;",
        "  padding: 40px 20px;",
        "}",
        ".container { max-width: 1200px; margin: 0 auto; }",
        "h1 {",
        "  font-size: 2.5rem;",
        "  color: #16f2aa;",
        "  text-align: center;",
        "  margin-bottom: 10px;",
        "  text-shadow: 0 0 20px rgba(22, 242, 170, 0.5);",
        "}",
        ".subtitle {",
        "  text-align: center;",
        "  color: #8899aa;",
        "  margin-bottom: 40px;",
        "  font-size: 0.9rem;",
        "}",
        "h2 {",
        "  font-size: 1.8rem;",
        "  color: #16f2aa;",
        "  margin: 40px 0 20px;",
        "  padding-bottom: 10px;",
        "  border-bottom: 2px solid rgba(22, 242, 170, 0.3);",
        "}",
        "h3 {",
        "  font-size: 1.3rem;",
        "  color: #4af2c8;",
        "  margin: 30px 0 15px;",
        "}",
        ".panel {",
        "  border: 1px solid rgba(22, 242, 170, 0.4);",
        "  border-radius: 12px;",
        "  padding: 20px;",
        "  margin-bottom: 20px;",
        "  background: rgba(6, 11, 24, 0.6);",
        "  backdrop-filter: blur(10px);",
        "}",
        ".stats {",
        "  display: grid;",
        "  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));",
        "  gap: 20px;",
        "  margin-bottom: 30px;",
        "}",
        ".stat-card {",
        "  background: linear-gradient(135deg, #060b18 0%, #0a1530 100%);",
        "  border: 1px solid #16f2aa;",
        "  border-radius: 8px;",
        "  padding: 20px;",
        "  text-align: center;",
        "}",
        ".stat-value {",
        "  font-size: 2rem;",
        "  color: #16f2aa;",
        "  font-weight: bold;",
        "}",
        ".stat-label {",
        "  color: #8899aa;",
        "  font-size: 0.85rem;",
        "  margin-top: 5px;",
        "}",
        ".tag {",
        "  display: inline-block;",
        "  padding: 4px 10px;",
        "  border-radius: 6px;",
        "  border: 1px solid #16f2aa;",
        "  font-size: 0.75rem;",
        "  margin-right: 8px;",
        "  margin-bottom: 8px;",
        "  background: rgba(22, 242, 170, 0.1);",
        "}",
        ".sample-list {",
        "  list-style: none;",
        "  padding: 0;",
        "}",
        ".sample-item {",
        "  padding: 12px;",
        "  margin-bottom: 10px;",
        "  background: rgba(0, 0, 0, 0.3);",
        "  border-left: 3px solid #16f2aa;",
        "  border-radius: 4px;",
        "}",
        ".sample-item code {",
        "  color: #8899aa;",
        "  font-size: 0.85rem;",
        "}",
        "pre {",
        "  background: #000;",
        "  color: #16f2aa;",
        "  padding: 15px;",
        "  border-radius: 8px;",
        "  overflow-x: auto;",
        "  font-size: 0.85rem;",
        "  border: 1px solid rgba(22, 242, 170, 0.2);",
        "}",
        ".theory-card {",
        "  background: rgba(10, 20, 40, 0.5);",
        "  border: 1px solid #4af2c8;",
        "  border-radius: 8px;",
        "  padding: 15px;",
        "  margin-bottom: 15px;",
        "}",
        ".theory-header {",
        "  color: #4af2c8;",
        "  font-weight: bold;",
        "  margin-bottom: 10px;",
        "}",
        ".group-summary {",
        "  display: flex;",
        "  flex-wrap: wrap;",
        "  gap: 10px;",
        "  margin-top: 15px;",
        "}",
        "</style>",
        "</head>",
        "<body>",
        "<div class='container'>",
    ])

    # Title
    html.extend([
        "<h1>GODMODE ULTRA</h1>",
        "<div class='subtitle'>Atomic Advanced Guide – Generated " + now + "</div>",
    ])

    # Stats overview
    html.append("<div class='stats'>")

    # Count samples by group
    group_counts = {}
    for s in merged:
        group = s.get("meta", {}).get("group", "unknown")
        group_counts[group] = group_counts.get(group, 0) + 1

    html.extend([
        "<div class='stat-card'>",
        f"<div class='stat-value'>{total_merged}</div>",
        "<div class='stat-label'>Total Merged Samples</div>",
        "</div>",
        "<div class='stat-card'>",
        f"<div class='stat-value'>{len(group_counts)}</div>",
        "<div class='stat-label'>Dataset Groups</div>",
        "</div>",
        "<div class='stat-card'>",
        f"<div class='stat-value'>{total_theory}</div>",
        "<div class='stat-label'>Theory Seeds</div>",
        "</div>",
    ])
    html.append("</div>")

    # Dataset Overview
    html.append("<h2>1. Dataset Overview</h2>")
    html.append("<div class='panel'>")
    html.append(f"<p>Previewing first {len(merged)} of {total_merged} total merged samples from atomic pipeline.</p>")

    # Group summary tags
    html.append("<div class='group-summary'>")
    for group, count in sorted(group_counts.items(), key=lambda x: -x[1]):
        html.append(f"<span class='tag'>{group}: {count}</span>")
    html.append("</div>")

    # Sample list (first 20)
    if merged:
        html.append("<h3>Sample Preview</h3>")
        html.append("<ul class='sample-list'>")
        for s in merged[:20]:
            meta = s.get("meta", {})
            group = meta.get("group", "unknown")
            src = meta.get("source_file", "n/a")
            html.append("<li class='sample-item'>")
            html.append(f"<span class='tag'>{group}</span>")
            html.append(f"<code>{html_escape(src)}</code>")
            html.append("</li>")
        html.append("</ul>")

    html.append("</div>")

    # Theory Seeds
    if theory:
        html.append("<h2>2. Theory Expansion Seeds</h2>")
        html.append("<div class='panel'>")
        html.append(f"<p>Showing first {len(theory)} of {total_theory} theory expansion prompts.</p>")

        for t in theory[:20]:
            meta = t.get("meta", {})
            idx = meta.get("note_index", "?")
            note_preview = meta.get("note_preview", "")
            note_input = t.get("input", "")

            html.append("<div class='theory-card'>")
            html.append(f"<div class='theory-header'>Theory Seed #{idx}</div>")

            if note_preview:
                html.append(f"<p><strong>Preview:</strong> {html_escape(note_preview)}</p>")

            # Show truncated input
            if len(note_input) > 500:
                html.append("<pre>" + html_escape(note_input[:500]) + "\n\n[... truncated ...]</pre>")
            else:
                html.append("<pre>" + html_escape(note_input) + "</pre>")

            html.append("</div>")

        html.append("</div>")

    # Usage guide
    html.append("<h2>3. Usage</h2>")
    html.append("<div class='panel'>")
    html.append("<h3>Pipeline Commands</h3>")
    html.append("<pre>")
    html.append("# 1. Collect and merge all datasets\n")
    html.append("python python/mx2lm_atomic_pipeline.py\n\n")
    html.append("# 2. Generate theory expansion seeds\n")
    html.append("python python/mx2lm_theory_expander.py\n\n")
    html.append("# 3. Build this guide\n")
    html.append("python python/build_atomic_advanced_guide.py\n\n")
    html.append("# 4. Start Qwen server (port 9009)\n")
    html.append("python python/local/server_qwen.py\n\n")
    html.append("# 5. Start BASHER daemon\n")
    html.append("npm start\n")
    html.append("</pre>")

    html.append("<h3>Training Flow</h3>")
    html.append("<pre>")
    html.append("1. Merge datasets → atomic_ultra_merged.jsonl\n")
    html.append("2. Expand theory → theory_expanded.jsonl\n")
    html.append("3. (Optional) Combine: cat theory_expanded.jsonl >> atomic_ultra_merged.jsonl\n")
    html.append("4. Train with QLoRA on merged dataset\n")
    html.append("5. Deploy fine-tuned model to BASHER swarm\n")
    html.append("</pre>")

    html.append("</div>")

    # Footer
    html.extend([
        "</div>",  # container
        "</body>",
        "</html>",
    ])

    # Write HTML file
    html_content = "\n".join(html)
    HTML_OUT.write_text(html_content, encoding="utf-8")

    print("=" * 60)
    print("[GUIDE] ✓ DONE")
    print("=" * 60)
    print()
    print(f"Output: {HTML_OUT}")
    print()
    print("Open in browser:")
    print(f"  file://{HTML_OUT.absolute()}")
    print()
    print("Or serve via BASHER:")
    print(f"  cp {HTML_OUT} public/godmode_ultra_guide.html")
    print("  npm start")
    print("  open http://localhost:3000/public/godmode_ultra_guide.html")

if __name__ == "__main__":
    main()
