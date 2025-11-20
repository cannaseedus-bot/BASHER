# ASX-Qwen Model Server Setup Guide

Complete guide to set up your fine-tuned ASX-Qwen model with BASHER's chat UI.

## Your Model Location

```
D:\Downloads\GODMODE_QLORA_PLUS\models\asx-qwen-asx-merged\
├── config.json
├── generation_config.json
├── model.safetensors
├── tokenizer.json
├── tokenizer_config.json
├── vocab.json
├── merges.txt
├── special_tokens_map.json
├── added_tokens.json
└── chat_template.jinja
```

## Installation Steps

### 1. Install Python Dependencies

```bash
cd model-server
pip install -r requirements.txt
```

This installs:
- FastAPI (REST API server)
- Transformers (HuggingFace model loader)
- PyTorch (model inference)
- Accelerate (GPU acceleration)

### 2. Start Model Server

```bash
# The server will automatically use your model path:
# D:\Downloads\GODMODE_QLORA_PLUS\models\asx-qwen-asx-merged

python model_server.py
```

You should see:
```
INFO: Loading model from: D:\Downloads\GODMODE_QLORA_PLUS\models\asx-qwen-asx-merged
INFO: Device: cuda (or cpu)
INFO: Loading tokenizer...
INFO: Loading model weights...
INFO: ✓ Model loaded successfully
INFO: Server ready to accept requests
INFO: Application startup complete.
INFO: Uvicorn running on http://0.0.0.0:8000
```

**GPU vs CPU:**
- If you have an NVIDIA GPU, the model will use CUDA automatically
- If no GPU, it will use CPU (slower but works)

### 3. Test Model Server

Open a new terminal and test:

```bash
# Health check
curl http://localhost:8000/health

# Should return:
# {
#   "ok": true,
#   "status": "healthy",
#   "model_loaded": true,
#   "device": "cuda"  # or "cpu"
# }
```

### 4. Start BASHER

In a new terminal:

```bash
cd ..  # Go back to BASHER root
npm start
```

You should see:
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

### 5. Open Chat UI

Open your browser to:

```
http://localhost:3000/public/chat.html
```

You should see:
- Status: "Model Ready" (green dot)
- Model info showing device (GPU/CPU)
- Chat interface ready

## Testing the Stack

### Test 1: Direct Model API

```bash
curl -X POST http://localhost:8000/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello! What can you do?"}
    ],
    "max_tokens": 100,
    "temperature": 0.7
  }'
```

Should return:
```json
{
  "ok": true,
  "message": "...(model response)...",
  "model": "asx-qwen-asx-merged",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50,
    "total_tokens": 60
  }
}
```

### Test 2: XJSON Handler

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

### Test 3: Chat UI

1. Go to http://localhost:3000/public/chat.html
2. Type a message: "Hello! What are you?"
3. Click Send
4. You should get a response from your fine-tuned model

## Configuration

### Change Model Path

If your model is in a different location, set environment variable:

```bash
# Windows PowerShell
$env:ASX_MODEL_PATH = "C:\path\to\your\model"
python model_server.py

# Windows CMD
set ASX_MODEL_PATH=C:\path\to\your\model
python model_server.py

# Linux/Mac
export ASX_MODEL_PATH=/path/to/your/model
python model_server.py
```

### Adjust Generation Settings

Edit `config/basher.config.json`:

```json
{
  "model": {
    "enabled": true,
    "url": "http://localhost:8000",
    "defaults": {
      "max_tokens": 512,      // Increase for longer responses
      "temperature": 0.7,     // 0.0 = deterministic, 1.0 = creative
      "top_p": 0.9           // Nucleus sampling
    }
  }
}
```

Or adjust in the chat UI:
- Use sliders to change Temperature and Top-P
- Use input box to change Max Tokens

## Troubleshooting

### Model Server Won't Start

**Error**: `FileNotFoundError: Model path does not exist`

**Fix**: Check the path in `model_server.py` line 30:
```python
DEFAULT_MODEL_PATH = r"D:\Downloads\GODMODE_QLORA_PLUS\models\asx-qwen-asx-merged"
```

Make sure this matches your actual model location.

---

**Error**: `OutOfMemoryError: CUDA out of memory`

**Fix**: Your GPU doesn't have enough VRAM. Try:

1. Use CPU instead (slower):
```python
# In model_server.py, line 36
DEVICE = "cpu"
```

2. Or use 8-bit quantization (edit model_server.py):
```python
self.model = AutoModelForCausalLM.from_pretrained(
    self.model_path,
    torch_dtype=torch.float16,
    device_map="auto",
    load_in_8bit=True,  # Add this
    trust_remote_code=True
)
```

---

**Error**: `Module not found: transformers`

**Fix**: Install dependencies:
```bash
pip install -r requirements.txt
```

### BASHER Won't Connect to Model

**Check**: Is model server running?
```bash
curl http://localhost:8000/health
```

**Check**: BASHER config has correct URL:
```json
{
  "model": {
    "url": "http://localhost:8000"  // Should match model server
  }
}
```

### Chat UI Shows "Model Not Loaded"

1. **Check model server health**:
   - Go to http://localhost:8000/health
   - Should show `"model_loaded": true`

2. **Check BASHER is running**:
   - Go to http://localhost:3000/health
   - Should show `"status": "healthy"`

3. **Check model handler**:
```bash
curl http://localhost:3000/xjson/handlers
# Should include "model.chat", "model.health", etc.
```

### Slow Responses

**If on CPU**: This is normal. CPU inference is 10-100x slower than GPU.

**Solutions**:
1. Get a GPU (NVIDIA with CUDA)
2. Reduce `max_tokens` (fewer tokens = faster)
3. Use a smaller model (if available)

### Chat UI Not Loading

**Check CORS**: Make sure BASHER has CORS enabled in `config/basher.config.json`:
```json
{
  "server": {
    "enableCors": true
  }
}
```

**Check browser console**: Press F12, look for errors

## Architecture

```
┌─────────────────────┐
│   Browser           │
│   chat.html         │
└──────────┬──────────┘
           │ HTTP
           ▼
┌─────────────────────┐
│   BASHER :3000      │
│   XJSON Server      │
│   model.chat        │
└──────────┬──────────┘
           │ HTTP
           ▼
┌─────────────────────┐
│   Model Server      │
│   FastAPI :8000     │
│   /v1/chat          │
└──────────┬──────────┘
           │ transformers
           ▼
┌─────────────────────┐
│   ASX-Qwen Model    │
│   GPU/CPU Inference │
└─────────────────────┘
```

## Next Steps

Once everything works:

1. **Integrate with KHL**: Use `model.chat` handler from KHL tapes
2. **Add to Swarm**: Add model server as a swarm node
3. **Fine-tune further**: Train on more ASX-specific data
4. **Deploy**: Run as systemd service for production

## Performance Tips

### GPU Memory

- **4GB VRAM**: Works but tight, use 8-bit
- **8GB VRAM**: Comfortable for Qwen-7B
- **16GB+ VRAM**: No problem

### CPU RAM

- **8GB RAM**: Minimum, will swap
- **16GB RAM**: Comfortable
- **32GB+ RAM**: No problem

### Batch Size

For serving multiple users, increase batch size in model server (advanced).

## Support

If you get stuck:
1. Check logs in model server terminal
2. Check BASHER logs
3. Check browser console (F12)
4. Verify all endpoints with curl

The stack is: Browser → BASHER (XJSON) → Model Server (FastAPI) → Model (Transformers)

Each layer can be tested independently.
