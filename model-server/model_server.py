#!/usr/bin/env python3
"""
ASX-Qwen Model Server

FastAPI server that loads your fine-tuned ASX-Qwen model and serves it via REST API.
Integrates with BASHER's XJSON ecosystem.
"""

import os
import sys
import json
import logging
from typing import List, Dict, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# ==================== Configuration ====================

# Default model path (Windows path from your system)
DEFAULT_MODEL_PATH = r"D:\Downloads\GODMODE_QLORA_PLUS\models\asx-qwen-asx-merged"

# Override with environment variable if set
MODEL_PATH = os.environ.get("ASX_MODEL_PATH", DEFAULT_MODEL_PATH)

# Device selection (cuda if available, else cpu)
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Generation defaults
DEFAULT_MAX_TOKENS = 512
DEFAULT_TEMPERATURE = 0.7
DEFAULT_TOP_P = 0.9

# ==================== Models ====================

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

class ASXQwenModel:
    def __init__(self, model_path: str, device: str):
        self.model_path = model_path
        self.device = device
        self.tokenizer = None
        self.model = None
        self.loaded = False

    def load(self):
        """Load model and tokenizer"""
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
            raise

    def generate(self, messages: List[Dict], max_tokens: int, temperature: float, top_p: float) -> str:
        """Generate response from messages"""
        if not self.loaded:
            raise RuntimeError("Model not loaded")

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
            logger.error(f"Generation error: {e}")
            raise

# ==================== FastAPI App ====================

app = FastAPI(
    title="ASX-Qwen Model Server",
    description="Fine-tuned ASX-Qwen model inference API",
    version="1.0.0"
)

# Enable CORS for browser access
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
    logger.info("ASX-Qwen Model Server Starting")
    logger.info("=" * 60)

    try:
        model_instance = ASXQwenModel(MODEL_PATH, DEVICE)
        model_instance.load()
        logger.info("=" * 60)
        logger.info("Server ready to accept requests")
        logger.info("=" * 60)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "ok": True,
        "status": "healthy",
        "model_loaded": model_instance is not None and model_instance.loaded,
        "device": DEVICE,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "ASX-Qwen Model Server",
        "version": "1.0.0",
        "model": "asx-qwen-asx-merged",
        "endpoints": [
            "/health",
            "/v1/chat",
            "/v1/info"
        ]
    }

@app.get("/v1/info")
async def model_info():
    """Get model information"""
    if not model_instance or not model_instance.loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    return {
        "ok": True,
        "model": {
            "path": MODEL_PATH,
            "type": type(model_instance.model).__name__,
            "device": DEVICE,
            "loaded": model_instance.loaded
        },
        "defaults": {
            "max_tokens": DEFAULT_MAX_TOKENS,
            "temperature": DEFAULT_TEMPERATURE,
            "top_p": DEFAULT_TOP_P
        }
    }

@app.post("/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat completion endpoint"""
    if not model_instance or not model_instance.loaded:
        return ChatResponse(
            ok=False,
            error="Model not loaded"
        )

    try:
        # Convert Pydantic models to dicts
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]

        # Generate response
        response_text = model_instance.generate(
            messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            top_p=request.top_p
        )

        # Calculate token usage (approximate)
        input_text = " ".join([msg["content"] for msg in messages])
        input_tokens = len(model_instance.tokenizer.encode(input_text))
        output_tokens = len(model_instance.tokenizer.encode(response_text))

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
    import uvicorn

    # Configuration
    host = "0.0.0.0"
    port = 8000

    logger.info(f"Starting server on http://{host}:{port}")
    logger.info(f"Model path: {MODEL_PATH}")
    logger.info(f"Device: {DEVICE}")

    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
