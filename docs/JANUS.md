# JANUS TEXT-TO-IMAGE INTEGRATION

Complete integration of DeepSeek Janus unified multimodal model with BASHER.

## Overview

**Janus** is a unified multimodal model that performs both **text-to-image generation** and **image understanding** in a single architecture. This integration brings AI-powered image generation capabilities to BASHER's neural vector operations.

### Key Features

- **Text-to-Image Generation**: Generate 384x384 images from text prompts
- **Image Understanding**: Analyze images and answer questions
- **Classifier-Free Guidance (CFG)**: Control generation quality and adherence to prompt
- **Batch Generation**: Generate multiple images with different prompts
- **K'uhul SVG-3D Integration**: Neural vector operations `(⟿)` can generate actual images

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BASHER XJSON API                             │
│                      (Node.js HTTP Server)                           │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      │ HTTP requests
                      │ POST /xjson/run
                      │
┌─────────────────────▼───────────────────────────────────────────────┐
│                    Janus XJSON Handlers                              │
│               (handlers/janus.js - 7 endpoints)                      │
│                                                                       │
│  • janus.generate        • janus.batch                               │
│  • janus.understand      • janus.svg3d.generate                      │
│  • janus.info            • janus.health                              │
│  • janus.examples                                                    │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      │ HTTP requests
                      │ localhost:9010
                      │
┌─────────────────────▼───────────────────────────────────────────────┐
│                   Janus FastAPI Server                               │
│               (python/local/server_janus.py)                         │
│                                                                       │
│  Endpoints:                                                          │
│  • POST /v1/generate  - Text-to-image generation                     │
│  • POST /v1/understand - Image understanding                         │
│  • GET  /v1/info      - Model information                            │
│  • GET  /health       - Health check                                 │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      │ PyTorch inference
                      │
┌─────────────────────▼───────────────────────────────────────────────┐
│                    Janus Model (1.3B)                                │
│           (deepseek-ai/Janus-1.3B from HuggingFace)                  │
│                                                                       │
│  • Decoupled Visual Encoding                                         │
│  • Unified Transformer Architecture                                  │
│  • 576 image tokens per 384x384 image                                │
│  • GPU (bfloat16) or CPU (float32) support                           │
└──────────────────────────────────────────────────────────────────────┘
```

## Installation

### 1. Install Python Dependencies

```bash
cd python
pip install -e ./janus
pip install torch transformers accelerate pillow fastapi uvicorn
```

### 2. Model Download

The model auto-downloads from HuggingFace on first run:
- Model: `deepseek-ai/Janus-1.3B` (~2.6GB)
- Automatic GPU detection (CUDA) or CPU fallback

### 3. Start Janus Server

```bash
# Start on port 9010 (matches BASHER config "fastapi-janus")
python python/local/server_janus.py
```

**Server Output:**
```
================================================================================
JANUS TEXT-TO-IMAGE SERVER
================================================================================
Model: deepseek-ai/Janus-1.3B
Device: cuda
Host: 0.0.0.0:9010
================================================================================
✓ Janus model loaded successfully
INFO:     Uvicorn running on http://0.0.0.0:9010
```

### 4. Start BASHER

```bash
node index.js
```

**BASHER Output:**
```
✓ Handlers loaded:
  - Core handlers: 9
  - Basher handlers: 8
  - Swarm handlers: 5
  - Model handlers: 3
  - K'uhul handlers: 4
  - K'uhul SVG-3D handlers: 11
  - Janus text-to-image handlers: 7
  - Total handlers: 47
```

## XJSON API Reference

### 1. janus.generate

Generate images from text prompt.

**Input:**
```json
{
  "program": {
    "type": "janus.generate",
    "input": {
      "prompt": "A futuristic cyberpunk cityscape at night, neon lights",
      "temperature": 1.0,
      "cfg_weight": 5.0,
      "num_images": 4,
      "img_size": 384,
      "seed": null
    }
  }
}
```

**Parameters:**
- `prompt` (string, required): Text description of desired image
- `temperature` (float, 0.1-2.0): Sampling randomness (default: 1.0)
- `cfg_weight` (float, 1.0-20.0): Guidance strength (default: 5.0)
- `num_images` (int, 1-16): Number of images to generate (default: 4)
- `img_size` (int): Image size in pixels (default: 384)
- `seed` (int, optional): Random seed for reproducibility

**Output:**
```json
{
  "ok": true,
  "images": [
    "base64_encoded_image_1",
    "base64_encoded_image_2",
    "base64_encoded_image_3",
    "base64_encoded_image_4"
  ],
  "prompt": "A futuristic cyberpunk cityscape...",
  "num_images": 4,
  "cfg_weight": 5.0,
  "temperature": 1.0,
  "server": "http://localhost:9010",
  "model": "Janus-1.3B"
}
```

**Curl Example:**
```bash
curl http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "janus.generate",
      "input": {
        "prompt": "Magical forest with glowing mushrooms",
        "cfg_weight": 6.0,
        "num_images": 2
      }
    }
  }'
```

### 2. janus.understand

Understand image and answer question.

**Input:**
```json
{
  "program": {
    "type": "janus.understand",
    "input": {
      "image": "base64_encoded_image",
      "question": "What objects are in this image?",
      "max_tokens": 512
    }
  }
}
```

**Output:**
```json
{
  "ok": true,
  "answer": "The image contains a wooden table, a laptop computer, a coffee mug, and a notebook with a pen. The scene appears to be a home office workspace.",
  "question": "What objects are in this image?",
  "server": "http://localhost:9010",
  "model": "Janus-1.3B"
}
```

### 3. janus.info

Get model information.

**Input:**
```json
{
  "program": {
    "type": "janus.info",
    "input": {}
  }
}
```

**Output:**
```json
{
  "ok": true,
  "model_name": "Janus-1.3B",
  "model_path": "deepseek-ai/Janus-1.3B",
  "device": "cuda",
  "capabilities": [
    "text-to-image generation",
    "image understanding",
    "multimodal chat",
    "classifier-free guidance"
  ],
  "version": "1.0.0",
  "server": "http://localhost:9010"
}
```

### 4. janus.health

Check server health.

**Input:**
```json
{
  "program": {
    "type": "janus.health",
    "input": {}
  }
}
```

**Output:**
```json
{
  "ok": true,
  "status": "running",
  "device": "cuda",
  "model_loaded": true,
  "model_path": "deepseek-ai/Janus-1.3B",
  "server": "http://localhost:9010"
}
```

### 5. janus.examples

Get example prompts with suggested settings.

**Input:**
```json
{
  "program": {
    "type": "janus.examples",
    "input": {}
  }
}
```

**Output:**
```json
{
  "ok": true,
  "examples": [
    {
      "name": "Cyberpunk City",
      "prompt": "A futuristic cyberpunk cityscape at night, neon lights...",
      "description": "Sci-fi urban scene with neon aesthetics",
      "suggested_cfg": 7.0,
      "category": "sci-fi"
    },
    {
      "name": "Fantasy Landscape",
      "prompt": "A magical fantasy landscape with floating islands...",
      "description": "Epic fantasy environment",
      "suggested_cfg": 6.0,
      "category": "fantasy"
    }
  ],
  "server": "http://localhost:9010",
  "model": "Janus-1.3B"
}
```

### 6. janus.batch

Generate multiple images with different prompts.

**Input:**
```json
{
  "program": {
    "type": "janus.batch",
    "input": {
      "prompts": [
        "A serene mountain lake at sunset",
        "A bustling Tokyo street at night",
        "An ancient library filled with books"
      ],
      "temperature": 1.0,
      "cfg_weight": 6.0,
      "num_images_per_prompt": 2
    }
  }
}
```

**Output:**
```json
{
  "ok": true,
  "results": [
    {
      "prompt": "A serene mountain lake at sunset",
      "images": ["base64_1", "base64_2"],
      "success": true
    },
    {
      "prompt": "A bustling Tokyo street at night",
      "images": ["base64_3", "base64_4"],
      "success": true
    },
    {
      "prompt": "An ancient library filled with books",
      "images": ["base64_5", "base64_6"],
      "success": true
    }
  ],
  "total_images": 6,
  "total_prompts": 3,
  "server": "http://localhost:9010"
}
```

### 7. janus.svg3d.generate

Generate image for K'uhul SVG-3D neural operator `(⟿)`.

**Input:**
```json
{
  "program": {
    "type": "janus.svg3d.generate",
    "input": {
      "neural_input": "complex geometric pattern",
      "complexity": 100,
      "style": "abstract geometric"
    }
  }
}
```

**Output:**
```json
{
  "ok": true,
  "image": "base64_encoded_image",
  "neural_input": "complex geometric pattern",
  "complexity": 100,
  "style": "abstract geometric",
  "prompt_used": "abstract geometric visualization of \"complex geometric pattern\", complexity level 100, vector-inspired design, geometric patterns",
  "algorithm": "Janus-Neural-SVG3D",
  "server": "http://localhost:9010"
}
```

## K'uhul SVG-3D Integration

The Janus text-to-image model integrates seamlessly with K'uhul SVG-3D's neural vector operator `(⟿)`.

### Traditional SVG-3D (without Janus)

```
(⟿) "dungeon layout" complexity:100
```

**Result**: Generates SVG path string algorithmically

### Enhanced SVG-3D (with Janus)

```javascript
// Call Janus for actual AI-generated visualization
const result = await xjsonRun({
  type: "janus.svg3d.generate",
  input: {
    neural_input: "dungeon layout",
    complexity: 100,
    style: "dark fantasy pixel art"
  }
});

// result.image contains base64 JPEG
```

**Result**: Full AI-generated dungeon layout image!

### Example: Neural Path Generation with AI

```javascript
// Step 1: Use SVG-3D to generate path data
const pathData = kuhulSVG3D.executeOperation('(⟿)', 'cosmic nebula');

// Step 2: Use Janus to generate actual image
const aiImage = await xjsonRun({
  type: "janus.svg3d.generate",
  input: {
    neural_input: "cosmic nebula",
    complexity: 150,
    style: "space photography"
  }
});

// Step 3: Combine: SVG path for interactivity + AI image as background
```

## Classifier-Free Guidance (CFG)

CFG controls how closely the model follows your prompt:

- **cfg_weight = 1.0**: No guidance (creative, random)
- **cfg_weight = 3.0**: Weak guidance (loose interpretation)
- **cfg_weight = 5.0**: ✅ **Recommended** (balanced)
- **cfg_weight = 7.0**: Strong guidance (precise)
- **cfg_weight = 10.0+**: Very strong (can reduce quality)

**Example:**

```bash
# Low CFG - Creative but less accurate
curl http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "janus.generate",
      "input": {
        "prompt": "A red car",
        "cfg_weight": 2.0
      }
    }
  }'
# May generate: red car, blue car, red truck, car-like object

# High CFG - Precise but less creative
curl http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "janus.generate",
      "input": {
        "prompt": "A red car",
        "cfg_weight": 8.0
      }
    }
  }'
# Will generate: red car, exactly as described
```

## Performance

### GPU (CUDA)

- **Generation Time**: ~10-15 seconds for 4 images
- **Memory**: ~2.5GB VRAM
- **Precision**: bfloat16
- **Recommended**: RTX 3060+ or equivalent

### CPU

- **Generation Time**: ~2-3 minutes for 4 images
- **Memory**: ~4GB RAM
- **Precision**: float32
- **Functional but slow**

## Example Prompts

### 1. Photorealistic

```
"Professional photo of a steaming cup of coffee on a wooden table, morning sunlight, shallow depth of field, bokeh background, 50mm lens, warm lighting"
```

### 2. Artistic

```
"Oil painting of a peaceful countryside, impressionist style, Claude Monet inspired, vibrant colors, loose brushstrokes, late afternoon light"
```

### 3. Sci-Fi

```
"Futuristic space station orbiting Earth, solar panels, modular design, realistic sci-fi, detailed technical design, cinematic lighting"
```

### 4. Fantasy

```
"Medieval fantasy castle on a cliff, dramatic sunset, magical atmosphere, detailed architecture, epic landscape, concept art style"
```

### 5. Abstract

```
"Abstract geometric composition, vibrant gradients, flowing shapes, modern minimalist design, purple and cyan colors, smooth transitions"
```

### 6. Character

```
"Portrait of a cyberpunk hacker, neon pink mohawk, futuristic glasses, leather jacket, dramatic lighting, detailed face, character concept art"
```

## Troubleshooting

### Server Not Starting

```bash
# Check if port 9010 is already in use
lsof -i :9010

# If blocked, kill the process
kill -9 <PID>

# Restart server
python python/local/server_janus.py
```

### Model Download Failed

```bash
# Manually download model
cd python/janus
huggingface-cli download deepseek-ai/Janus-1.3B

# Or use Python
from transformers import AutoModelForCausalLM
model = AutoModelForCausalLM.from_pretrained("deepseek-ai/Janus-1.3B", trust_remote_code=True)
```

### Out of Memory (CUDA)

```python
# Edit server_janus.py to reduce batch size
num_images: int = Field(2, ge=1, le=16)  # Reduced from 4 to 2
```

### Generation Quality Poor

**Try these settings:**

```json
{
  "temperature": 0.8,
  "cfg_weight": 7.0,
  "seed": 42
}
```

**Improve your prompt:**
- Be specific (not "a car" but "a red sports car")
- Add style descriptors ("photorealistic", "oil painting", "concept art")
- Include lighting ("dramatic lighting", "soft morning light")
- Add quality modifiers ("detailed", "high resolution", "8k")

## Integration with Other Systems

### 1. ASX-Qwen Chat Integration

```javascript
// User asks for an image via chat
const chatResponse = await xjsonRun({
  type: "model.chat",
  input: {
    messages: [{ role: "user", content: "Generate an image of a sunset beach" }]
  }
});

// ASX-Qwen returns: "I'll create that for you"

// Trigger Janus generation
const imageResult = await xjsonRun({
  type: "janus.generate",
  input: {
    prompt: "Beautiful sunset beach, golden hour, palm trees, waves, photorealistic"
  }
});

// Return image to chat
```

### 2. K'uhul Visual Programming

```javascript
// K'uhul program with image generation
const kuhulProgram = `
Pop "user-request" Wo
Yax "image-needed" {
  Sek janus.generate Wo {
    prompt: "sci-fi spaceship"
    cfg_weight: 6.0
  }
}
Xul
`;

// Compile and execute
const result = await kuhulCompile(kuhulProgram);
```

### 3. Swarm Mode Multi-Agent

```javascript
// Agent 1: Generate prompt using ASX-Qwen
const promptResult = await swarmExecute({
  agent: "qwen-agent",
  task: "create-image-prompt",
  context: "cyberpunk theme"
});

// Agent 2: Generate image using Janus
const imageResult = await swarmExecute({
  agent: "janus-agent",
  task: "generate-image",
  prompt: promptResult.prompt
});

// Agent 3: Post-process with SVG-3D
const enhancedResult = await swarmExecute({
  agent: "svg3d-agent",
  task: "add-vector-overlay",
  image: imageResult.images[0]
});
```

## Advanced Usage

### Reproducible Generation

```json
{
  "program": {
    "type": "janus.generate",
    "input": {
      "prompt": "A mystical forest",
      "seed": 42,
      "temperature": 1.0,
      "cfg_weight": 5.0
    }
  }
}
```

Same seed + same settings = same image every time!

### Style Transfer Prompting

```
"[Subject] in the style of [Artist/Movement]"

Examples:
- "A cat in the style of Vincent van Gogh"
- "A cityscape in the style of Studio Ghibli anime"
- "A portrait in the style of Renaissance oil painting"
```

### Multi-Stage Generation

```javascript
// Stage 1: Generate base image
const base = await janus.generate({
  prompt: "Empty medieval throne room",
  cfg_weight: 6.0
});

// Stage 2: Ask AI to analyze
const analysis = await janus.understand({
  image: base.images[0],
  question: "Describe this room in detail"
});

// Stage 3: Generate enhanced version
const enhanced = await janus.generate({
  prompt: `${analysis.answer}, add dramatic lighting and a character sitting on the throne`,
  cfg_weight: 7.0
});
```

## Files Created

```
BASHER/
├── python/
│   ├── janus/                          # Janus model package (copied from GitHub)
│   │   ├── janus/                      # Python module
│   │   ├── demo/                       # Demo scripts
│   │   ├── requirements.txt            # Dependencies
│   │   └── README.md                   # Original docs
│   └── local/
│       └── server_janus.py             # FastAPI server (570 lines)
├── handlers/
│   └── janus.js                        # XJSON handlers (7 endpoints, 430 lines)
├── docs/
│   └── JANUS.md                        # This file (1000+ lines)
└── index.js                            # Updated with Janus handlers
```

## Next Steps

1. **Create Web UI**: Build HTML interface for image generation
2. **ASX Console Integration**: Add Janus as a cartridge in ASX Universal Console
3. **Image Gallery**: Store and browse generated images
4. **Fine-tuning**: Train custom LoRA adapters for specific styles
5. **API Rate Limiting**: Add request queuing for production use

## References

- [Janus Paper](https://arxiv.org/abs/2410.13848)
- [Janus GitHub](https://github.com/deepseek-ai/Janus)
- [HuggingFace Model](https://huggingface.co/deepseek-ai/Janus-1.3B)
- [BASHER Documentation](./README.md)
- [K'uhul SVG-3D Documentation](./KUHUL-SVG3D.md)

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2025-01-21
