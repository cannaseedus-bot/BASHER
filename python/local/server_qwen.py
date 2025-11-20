#!/usr/bin/env python3
"""
ASX-Qwen FastAPI Server for GODMODE ULTRA
Serves fine-tuned Qwen model on port 9009 for BASHER swarm integration.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from typing import Optional, List, Dict
import torch
import os
import sys
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Try to import transformers
try:
    from transformers import AutoTokenizer, AutoModelForCausalLM
except ImportError:
    logger.error("transformers not installed. Run: pip install transformers torch")
    sys.exit(1)

# ==================== Configuration ====================

# Model path - check multiple common locations
DEFAULT_PATHS = [
    r"D:\Downloads\GODMODE_QLORA_PLUS\models\asx-qwen-asx-merged",  # Windows
    "/home/user/models/asx-qwen-asx-merged",  # Linux
    "./models/asx-qwen-asx-merged",  # Relative
]

MODEL_PATH = os.environ.get("QWEN_MODEL_PATH", None)

if not MODEL_PATH:
    for path in DEFAULT_PATHS:
        if os.path.exists(path):
            MODEL_PATH = path
            break

if not MODEL_PATH:
    logger.warning("No model found. Set QWEN_MODEL_PATH env var or place model in expected location.")
    logger.warning(f"Checked: {DEFAULT_PATHS}")
    # Allow server to start anyway for testing
    MODEL_PATH = None

# Device selection (cuda if available, else cpu)
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Generation defaults
DEFAULT_MAX_TOKENS = 256
DEFAULT_TEMPERATURE = 0.7
DEFAULT_TOP_P = 0.9

# ==================== Models ====================

class InferenceRequest(BaseModel):
    prompt: str
    max_new_tokens: int = DEFAULT_MAX_TOKENS
    temperature: float = DEFAULT_TEMPERATURE
    top_p: float = DEFAULT_TOP_P
    do_sample: bool = True
    stop: Optional[str] = None

class InferenceResponse(BaseModel):
    ok: bool
    output: Optional[str] = None
    error: Optional[str] = None
    usage: Optional[Dict] = None

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    max_tokens: Optional[int] = DEFAULT_MAX_TOKENS
    temperature: Optional[float] = DEFAULT_TEMPERATURE
    top_p: Optional[float] = DEFAULT_TOP_P
    stream: Optional[bool] = False

class ChatResponse(BaseModel):
    ok: bool
    message: Optional[str] = None
    error: Optional[str] = None
    model: str = "asx-qwen-asx-merged"
    usage: Optional[Dict] = None

# ==================== Model Loading ====================

class QwenModel:
    def __init__(self, model_path: Optional[str], device: str):
        self.model_path = model_path
        self.device = device
        self.tokenizer = None
        self.model = None
        self.loaded = False

    def load(self):
        """Load model and tokenizer"""
        if not self.model_path:
            logger.warning("No model path specified. Server will run in mock mode.")
            return

        try:
            logger.info(f"Loading model from: {self.model_path}")
            logger.info(f"Device: {self.device}")

            # Check if path exists
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model path does not exist: {self.model_path}")

            # Load tokenizer
            logger.info("Loading tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_path,
                trust_remote_code=True
            )

            # Load model
            logger.info("Loading model weights...")
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto" if self.device == "cuda" else None,
                trust_remote_code=True
            )

            if self.device == "cpu":
                self.model = self.model.to(self.device)

            self.model.eval()
            self.loaded = True

            logger.info("✓ Model loaded successfully")
            logger.info(f"Model type: {type(self.model).__name__}")
            logger.info(f"Tokenizer type: {type(self.tokenizer).__name__}")

        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            logger.warning("Server will run in mock mode.")
            raise

    def generate(self, prompt: str, max_new_tokens: int, temperature: float, top_p: float, do_sample: bool, stop: Optional[str] = None) -> str:
        """Generate response from prompt"""
        if not self.loaded:
            # Mock response for testing
            return f"[MOCK] Echo: {prompt[:100]}... (Model not loaded. Set QWEN_MODEL_PATH)"

        try:
            # Tokenize
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)

            # Generate
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_new_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    do_sample=do_sample,
                    pad_token_id=self.tokenizer.eos_token_id
                )

            # Decode
            generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

            # Remove prompt from output
            if generated_text.startswith(prompt):
                response = generated_text[len(prompt):].strip()
            else:
                response = generated_text.strip()

            # Handle stop sequence
            if stop and stop in response:
                response = response.split(stop)[0]

            return response

        except Exception as e:
            logger.error(f"Generation error: {e}")
            raise

    def generate_chat(self, messages: List[Dict], max_tokens: int, temperature: float, top_p: float) -> str:
        """Generate response from chat messages"""
        if not self.loaded:
            # Mock response
            last_msg = messages[-1]["content"] if messages else "Hello"
            return f"[MOCK] I'm a mock Qwen model. You said: '{last_msg}'. Set QWEN_MODEL_PATH to use real model."

        try:
            # Format messages using chat template if available
            if hasattr(self.tokenizer, 'apply_chat_template'):
                prompt = self.tokenizer.apply_chat_template(
                    messages,
                    tokenize=False,
                    add_generation_prompt=True
                )
            else:
                # Fallback: simple formatting
                prompt = ""
                for msg in messages:
                    role = msg["role"]
                    content = msg["content"]
                    if role == "user":
                        prompt += f"User: {content}\n"
                    elif role == "assistant":
                        prompt += f"Assistant: {content}\n"
                prompt += "Assistant:"

            # Tokenize
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)

            # Generate
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id
                )

            # Decode
            generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

            # Extract assistant response
            if hasattr(self.tokenizer, 'apply_chat_template'):
                # Remove the prompt part
                response = generated_text[len(prompt):].strip()
            else:
                # Extract after last "Assistant:"
                if "Assistant:" in generated_text:
                    parts = generated_text.split("Assistant:")
                    response = parts[-1].strip()
                else:
                    response = generated_text.strip()

            return response

        except Exception as e:
            logger.error(f"Chat generation error: {e}")
            raise

# ==================== FastAPI App ====================

app = FastAPI(
    title="ASX-Qwen GODMODE ULTRA Server",
    description="Fine-tuned Qwen model inference for BASHER swarm integration",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instance
model_instance = None

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    global model_instance

    logger.info("=" * 60)
    logger.info("ASX-Qwen GODMODE ULTRA Server Starting")
    logger.info("=" * 60)

    model_instance = QwenModel(MODEL_PATH, DEVICE)
    try:
        model_instance.load()
    except Exception as e:
        logger.warning(f"Model loading failed: {e}")
        logger.warning("Server running in MOCK mode")

    logger.info("=" * 60)
    logger.info("Server ready to accept requests on port 9009")
    logger.info("=" * 60)

@app.get("/health")
async def health():
    """Health check endpoint - BASHER swarm detection"""
    return {
        "ok": True,
        "status": "healthy",
        "model_loaded": model_instance is not None and model_instance.loaded,
        "device": DEVICE,
        "model_path": MODEL_PATH,
        "mode": "real" if (model_instance and model_instance.loaded) else "mock"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "ASX-Qwen GODMODE ULTRA Server",
        "version": "1.0.0",
        "model": "asx-qwen-asx-merged",
        "port": 9009,
        "endpoints": [
            "/health",
            "/infer",
            "/v1/chat",
            "/v1/info"
        ]
    }

@app.get("/v1/info")
async def model_info():
    """Get model information"""
    if not model_instance:
        raise HTTPException(status_code=503, detail="Model instance not initialized")

    return {
        "ok": True,
        "model": {
            "path": MODEL_PATH,
            "type": type(model_instance.model).__name__ if model_instance.model else "Mock",
            "device": DEVICE,
            "loaded": model_instance.loaded
        },
        "defaults": {
            "max_tokens": DEFAULT_MAX_TOKENS,
            "temperature": DEFAULT_TEMPERATURE,
            "top_p": DEFAULT_TOP_P
        }
    }

@app.post("/infer", response_model=InferenceResponse)
async def infer(request: InferenceRequest):
    """Simple inference endpoint - single prompt"""
    if not model_instance:
        return InferenceResponse(
            ok=False,
            error="Model not initialized"
        )

    try:
        output_text = model_instance.generate(
            prompt=request.prompt,
            max_new_tokens=request.max_new_tokens,
            temperature=request.temperature,
            top_p=request.top_p,
            do_sample=request.do_sample,
            stop=request.stop
        )

        # Calculate approximate token usage
        if model_instance.loaded and model_instance.tokenizer:
            input_tokens = len(model_instance.tokenizer.encode(request.prompt))
            output_tokens = len(model_instance.tokenizer.encode(output_text))
        else:
            input_tokens = len(request.prompt.split())
            output_tokens = len(output_text.split())

        return InferenceResponse(
            ok=True,
            output=output_text,
            usage={
                "prompt_tokens": input_tokens,
                "completion_tokens": output_tokens,
                "total_tokens": input_tokens + output_tokens
            }
        )

    except Exception as e:
        logger.error(f"Inference error: {e}")
        return InferenceResponse(
            ok=False,
            error=str(e)
        )

@app.post("/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat completion endpoint - compatible with model.chat handler"""
    if not model_instance:
        return ChatResponse(
            ok=False,
            error="Model not initialized"
        )

    try:
        # Convert Pydantic models to dicts
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]

        # Generate response
        response_text = model_instance.generate_chat(
            messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            top_p=request.top_p
        )

        # Calculate token usage (approximate)
        if model_instance.loaded and model_instance.tokenizer:
            input_text = " ".join([msg["content"] for msg in messages])
            input_tokens = len(model_instance.tokenizer.encode(input_text))
            output_tokens = len(model_instance.tokenizer.encode(response_text))
        else:
            input_text = " ".join([msg["content"] for msg in messages])
            input_tokens = len(input_text.split())
            output_tokens = len(response_text.split())

        return ChatResponse(
            ok=True,
            message=response_text,
            usage={
                "prompt_tokens": input_tokens,
                "completion_tokens": output_tokens,
                "total_tokens": input_tokens + output_tokens
            }
        )

    except Exception as e:
        logger.error(f"Chat error: {e}")
        return ChatResponse(
            ok=False,
            error=str(e)
        )

# ==================== Main ====================

if __name__ == "__main__":
    # Configuration
    host = "0.0.0.0"
    port = 9009

    logger.info(f"Starting server on http://{host}:{port}")
    logger.info(f"Model path: {MODEL_PATH or 'Not set (mock mode)'}")
    logger.info(f"Device: {DEVICE}")

    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
