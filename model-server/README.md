# ASX-Qwen Model Server + Chat UI

Production-ready chat interface for your fine-tuned ASX-Qwen model with XJSON integration.

## Stack

1. **Python FastAPI Server** - Loads your model, serves inference API
2. **XJSON Handlers** - Wraps model API in BASHER's XJSON format
3. **Chat UI** - Production browser interface

## Quick Start

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Start model server
python model_server.py

# 3. Start BASHER (in another terminal)
cd /path/to/BASHER
npm start

# 4. Open browser
open http://localhost:3000
```

## Files

- `model_server.py` - FastAPI server that loads your ASX-Qwen model
- `requirements.txt` - Python dependencies
- `handlers/model.js` - XJSON handlers for model integration
- `public/chat.html` - Production chat UI
- `config/model.config.json` - Model configuration

## Architecture

```
Browser (chat.html)
    ↓ HTTP
BASHER :3000 (XJSON)
    ↓ model.chat handler
FastAPI :8000 (Model Server)
    ↓ transformers
ASX-Qwen Model (GPU/CPU)
```
