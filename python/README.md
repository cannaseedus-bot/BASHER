# GODMODE ULTRA - Python Tools

Complete Python toolset for BASHER's GODMODE ULTRA capabilities:
- ASX-Qwen model server (port 9009)
- Dataset merger (atomic pipeline)
- Theory expansion seed generator
- HTML documentation builder
- Node.js training wrapper

---

## Directory Structure

```
python/
├── README.md                          # This file
├── requirements.txt                   # Python dependencies
├── trainer.js                         # Node wrapper for training
├── mx2lm_atomic_pipeline.py          # Dataset merger
├── mx2lm_theory_expander.py          # Theory seed generator
├── build_atomic_advanced_guide.py    # HTML guide builder
├── theory_notes.txt                   # Theory notes input (auto-created)
├── local/
│   ├── server_qwen.py                # ASX-Qwen FastAPI server
│   └── asx_ultra_trainer_qlora.py   # QLoRA trainer (create this)
├── local_out/
│   ├── atomic_ultra_merged.jsonl    # Merged dataset output
│   └── theory_expanded.jsonl        # Theory seeds output
└── local_out_godmode_ultra/
    └── GODMODE_ULTRA_ATOMIC_GUIDE.html  # Documentation
```

---

## Installation

### 1. Install Python Dependencies

```bash
cd /home/user/BASHER
pip install -r python/requirements.txt
```

**For training** (QLoRA fine-tuning), also install:
```bash
pip install peft trl bitsandbytes datasets
```

### 2. Set Model Path (Optional)

If you have a Qwen model at a custom location:

**Linux/Mac:**
```bash
export QWEN_MODEL_PATH="/path/to/your/model"
```

**Windows (Git Bash):**
```bash
export QWEN_MODEL_PATH="D:/Downloads/GODMODE_QLORA_PLUS/models/asx-qwen-asx-merged"
```

**Windows (PowerShell):**
```powershell
$env:QWEN_MODEL_PATH = "D:\Downloads\GODMODE_QLORA_PLUS\models\asx-qwen-asx-merged"
```

---

## Usage

### Quick Start - Full Pipeline

Run everything at once:

```bash
node python/trainer.js full
```

This will:
1. Merge all datasets from `dataset/` → `local_out/atomic_ultra_merged.jsonl`
2. Generate theory seeds → `local_out/theory_expanded.jsonl`
3. Build HTML guide → `local_out_godmode_ultra/GODMODE_ULTRA_ATOMIC_GUIDE.html`

### Individual Commands

**Merge datasets:**
```bash
node python/trainer.js pipeline
# or directly:
python python/mx2lm_atomic_pipeline.py
```

**Generate theory seeds:**
```bash
node python/trainer.js theory
# or:
python python/mx2lm_theory_expander.py
```

**Build HTML guide:**
```bash
node python/trainer.js guide
# or:
python python/build_atomic_advanced_guide.py
```

**Start Qwen server:**
```bash
python python/local/server_qwen.py
```

---

## The Stack

### 1. ASX-Qwen Model Server

**File:** `local/server_qwen.py`
**Port:** 9009
**Endpoints:**
- `GET /health` - Health check (BASHER swarm detection)
- `GET /v1/info` - Model information
- `POST /infer` - Simple inference (single prompt)
- `POST /v1/chat` - Chat completion (compatible with `model.chat` handler)

**Start server:**
```bash
python python/local/server_qwen.py
```

**Test health:**
```bash
curl http://localhost:9009/health
```

**Test inference:**
```bash
curl -X POST http://localhost:9009/infer \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "You are ASX-Qwen. Explain XJSON in one sentence.",
    "max_new_tokens": 100,
    "temperature": 0.7
  }'
```

**Mock Mode:**
If no model is found, server runs in mock mode for testing the stack without requiring a large model download.

---

### 2. Atomic Pipeline (Dataset Merger)

**File:** `mx2lm_atomic_pipeline.py`
**Purpose:** Collects all JSONL files from `dataset/` subdirectories and merges them into a single training dataset.

**Supported groups:**
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

**Input structure:**
```
dataset/
  xjson/
    *.jsonl
  kuhul/
    *.jsonl
  ...
```

**Output:**
```
python/local_out/atomic_ultra_merged.jsonl
```

Each sample gets metadata:
```json
{
  "input": "...",
  "output": "...",
  "meta": {
    "group": "xjson",
    "source_file": "dataset/xjson/handlers.jsonl"
  }
}
```

---

### 3. Theory Expander

**File:** `mx2lm_theory_expander.py`
**Purpose:** Converts brain-dump notes into structured training prompts for theory expansion.

**Input:** `python/theory_notes.txt` (plain text, notes separated by blank lines)

**Output:** `python/local_out/theory_expanded.jsonl`

**Format:**
```json
{
  "input": "You are MX2LM... Expand the following design note...",
  "output": "",
  "instruction": "Expand this design note into a technical specification",
  "meta": {
    "kind": "theory_expansion",
    "note_index": 1,
    "created_at": "2025-11-20T12:34:56Z",
    "note_preview": "XJSON handler composition rules..."
  }
}
```

**Workflow:**
1. Edit `python/theory_notes.txt` with your design notes
2. Run `python python/mx2lm_theory_expander.py`
3. Manually fill in the `output` field with expanded specs
4. Optionally merge with atomic dataset: `cat theory_expanded.jsonl >> atomic_ultra_merged.jsonl`

---

### 4. Guide Builder

**File:** `build_atomic_advanced_guide.py`
**Purpose:** Generates beautiful HTML documentation of your dataset and theory work.

**Output:** `python/local_out_godmode_ultra/GODMODE_ULTRA_ATOMIC_GUIDE.html`

**Includes:**
- Dataset statistics and group breakdown
- Sample previews from merged dataset
- Theory seed previews
- Usage instructions
- Training workflow

**View guide:**
```bash
# Direct file access
xdg-open python/local_out_godmode_ultra/GODMODE_ULTRA_ATOMIC_GUIDE.html

# Or serve via BASHER
cp python/local_out_godmode_ultra/GODMODE_ULTRA_ATOMIC_GUIDE.html public/
npm start
# Then open: http://localhost:3000/public/GODMODE_ULTRA_ATOMIC_GUIDE.html
```

---

### 5. Training Wrapper

**File:** `trainer.js`
**Purpose:** Node.js wrapper for Python training scripts. Allows BASHER/UI to trigger training runs.

**Commands:**
```bash
# Show help
node python/trainer.js help

# Run full pipeline (merge + theory + guide)
node python/trainer.js full

# Individual tools
node python/trainer.js pipeline
node python/trainer.js theory
node python/trainer.js guide

# Run trainer (requires local/asx_ultra_trainer_qlora.py)
node python/trainer.js train -- --model Qwen/Qwen2-0.5B --epochs 3
```

**Custom Python executable:**
```bash
PYTHON_EXE=python3.11 node python/trainer.js full
```

---

## Integration with BASHER

### Swarm Configuration

BASHER's `config/basher.config.json` includes the Qwen server as a swarm node:

```json
{
  "swarm": {
    "nodes": [
      {
        "id": "kuhul-core",
        "transport": "fastapi",
        "url": "http://localhost:9009",
        "roles": ["kuhul", "inference", "mx2lm"]
      }
    ]
  }
}
```

### XJSON Handlers

BASHER's `handlers/model.js` provides XJSON handlers that route to the Qwen server:

- `model.chat` - Chat completion
- `model.info` - Model information
- `model.health` - Health check
- `model.complete` - Simple completion

**Example XJSON request:**
```bash
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "model.chat",
      "input": {
        "messages": [
          {"role": "user", "content": "Hello!"}
        ]
      }
    }
  }'
```

---

## Full Stack Test

### Terminal 1: Start Qwen Server
```bash
python python/local/server_qwen.py
```

Expected output:
```
============================================================
ASX-Qwen GODMODE ULTRA Server Starting
============================================================
[INFO] Loading model from: /path/to/model
[INFO] Device: cuda
[INFO] Loading tokenizer...
[INFO] Loading model weights...
[INFO] ✓ Model loaded successfully
============================================================
Server ready to accept requests on port 9009
============================================================
INFO: Uvicorn running on http://0.0.0.0:9009
```

### Terminal 2: Start BASHER
```bash
npm start
```

Expected output:
```
✓ Configuration loaded
✓ Handlers loaded:
  - Core handlers: 5
  - Basher handlers: 6
  - Swarm handlers: 6
  - Model handlers: 4
  - Total handlers: 21

✓ BASHER daemon running
  http://0.0.0.0:3000
```

### Terminal 3: Run Pipeline
```bash
node python/trainer.js full
```

### Terminal 4: Test Stack
```bash
# Test Qwen server directly
curl http://localhost:9009/health

# Test via BASHER XJSON
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "model.chat",
      "input": {
        "messages": [{"role": "user", "content": "Hi!"}]
      }
    }
  }'

# Open chat UI
open http://localhost:3000/public/chat.html
```

---

## Creating a QLoRA Trainer

To enable training, create `local/asx_ultra_trainer_qlora.py`:

```python
#!/usr/bin/env python3
"""
ASX-Qwen ULTRA QLoRA Trainer
"""
import argparse
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer
from datasets import load_dataset
import torch

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="Qwen/Qwen2-0.5B")
    parser.add_argument("--dataset", default="./python/local_out/atomic_ultra_merged.jsonl")
    parser.add_argument("--output", default="./python/local_out/model_checkpoint")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch-size", type=int, default=4)
    parser.add_argument("--lr", type=float, default=2e-4)
    args = parser.parse_args()

    print(f"Loading base model: {args.model}")
    tokenizer = AutoTokenizer.from_pretrained(args.model)

    model = AutoModelForCausalLM.from_pretrained(
        args.model,
        load_in_8bit=True,
        device_map="auto",
        torch_dtype=torch.float16
    )

    model = prepare_model_for_kbit_training(model)

    # LoRA config
    lora_config = LoraConfig(
        r=8,
        lora_alpha=16,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )

    model = get_peft_model(model, lora_config)

    # Load dataset
    dataset = load_dataset("json", data_files=args.dataset)

    # Training args
    training_args = TrainingArguments(
        output_dir=args.output,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        learning_rate=args.lr,
        save_steps=100,
        logging_steps=10,
    )

    # Train
    trainer = SFTTrainer(
        model=model,
        args=training_args,
        train_dataset=dataset["train"],
        tokenizer=tokenizer,
        dataset_text_field="input",
    )

    trainer.train()

    # Save
    model.save_pretrained(args.output)
    print(f"Model saved to {args.output}")

if __name__ == "__main__":
    main()
```

Then run:
```bash
node python/trainer.js train -- --model Qwen/Qwen2-0.5B --epochs 3
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│  Browser                                            │
│  - public/chat.html                                 │
│  - GODMODE_ULTRA_ATOMIC_GUIDE.html                 │
└────────────────┬────────────────────────────────────┘
                 │ HTTP
                 ▼
┌─────────────────────────────────────────────────────┐
│  BASHER (:3000)                                     │
│  - XJSON handlers (model.chat, etc.)                │
│  - Swarm routing                                    │
│  - Static file serving                              │
└────────────────┬────────────────────────────────────┘
                 │ HTTP
                 ▼
┌─────────────────────────────────────────────────────┐
│  ASX-Qwen Server (:9009)                            │
│  - FastAPI                                          │
│  - /health, /infer, /v1/chat                        │
└────────────────┬────────────────────────────────────┘
                 │ transformers
                 ▼
┌─────────────────────────────────────────────────────┐
│  ASX-Qwen Model                                     │
│  - GPU/CPU inference                                │
│  - Fine-tuned on GODMODE ULTRA dataset              │
└─────────────────────────────────────────────────────┘
```

**Dataset flow:**
```
dataset/xjson/*.jsonl ─┐
dataset/kuhul/*.jsonl ─┼─► mx2lm_atomic_pipeline.py
dataset/scxq2/*.jsonl ─┘         │
                                 ▼
theory_notes.txt ───► theory_expander.py
                                 │
                                 ▼
                    atomic_ultra_merged.jsonl
                                 │
                                 ▼
                         QLoRA Trainer
                                 │
                                 ▼
                         Fine-tuned Model
                                 │
                                 ▼
                      ASX-Qwen Server (:9009)
                                 │
                                 ▼
                         BASHER Swarm
```

---

## Troubleshooting

### Server won't start

**Error:** `transformers not installed`

**Fix:**
```bash
pip install -r python/requirements.txt
```

---

**Error:** `Model path does not exist`

**Fix:** Set `QWEN_MODEL_PATH` environment variable or place model in expected location:
```bash
export QWEN_MODEL_PATH="/path/to/your/model"
python python/local/server_qwen.py
```

Or run in mock mode (no model required):
```bash
python python/local/server_qwen.py
# Server runs with mock responses
```

---

**Error:** `CUDA out of memory`

**Fix:** Use CPU mode or 8-bit quantization:
```python
# In server_qwen.py, change:
DEVICE = "cpu"
```

---

### No dataset samples found

**Error:** `[PIPELINE] No samples found`

**Fix:** Create dataset structure:
```bash
mkdir -p dataset/xjson
echo '{"input": "test", "output": "response"}' > dataset/xjson/test.jsonl
python python/mx2lm_atomic_pipeline.py
```

---

### Trainer not found

**Error:** `[TRAINER] ⚠ Trainer module not found`

**Fix:** Create `local/asx_ultra_trainer_qlora.py` (see example above) or use individual tools instead of training.

---

## Performance Tips

### GPU Memory
- **4GB VRAM**: Use 8-bit quantization
- **8GB VRAM**: Comfortable for Qwen-7B
- **16GB+ VRAM**: No problem

### CPU RAM
- **8GB RAM**: Minimum (will swap)
- **16GB RAM**: Comfortable
- **32GB+ RAM**: No problem

### Dataset Size
- **Small (<1K samples)**: Fast iteration, good for testing
- **Medium (1K-10K)**: Good balance for fine-tuning
- **Large (10K+)**: Best results, longer training

---

## Next Steps

1. **Run full pipeline:** `node python/trainer.js full`
2. **Start Qwen server:** `python python/local/server_qwen.py`
3. **Start BASHER:** `npm start`
4. **Test chat UI:** `http://localhost:3000/public/chat.html`
5. **View guide:** `http://localhost:3000/public/GODMODE_ULTRA_ATOMIC_GUIDE.html`
6. **Create trainer** (optional): `local/asx_ultra_trainer_qlora.py`
7. **Fine-tune model** (optional): `node python/trainer.js train`

---

## Support

For issues:
1. Check server logs (Terminal 1)
2. Check BASHER logs (Terminal 2)
3. Check browser console (F12)
4. Test each layer independently with curl

The stack is: **Browser → BASHER (XJSON) → Qwen Server (FastAPI) → Model (Transformers)**

Each layer can be tested independently.
