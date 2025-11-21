#!/usr/bin/env python3
"""
JANUS TEXT-TO-IMAGE SERVER
==========================

FastAPI server for DeepSeek Janus unified multimodal model.
Provides text-to-image generation and image understanding capabilities.

Port: 9010 (configured as "fastapi-janus" in BASHER config)
Model: deepseek-ai/Janus-1.3B (auto-downloads from HuggingFace)

Endpoints:
- POST /v1/generate - Text-to-image generation
- POST /v1/understand - Image understanding
- GET /health - Health check
- GET /v1/info - Model information

Author: BASHER + K'uhul Integration
License: MIT
"""

import os
import sys
import io
import base64
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any

# Add janus directory to Python path
JANUS_DIR = Path(__file__).parent.parent / "janus"
sys.path.insert(0, str(JANUS_DIR))

import torch
import numpy as np
import PIL.Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================

DEFAULT_MODEL_PATH = "deepseek-ai/Janus-1.3B"
PORT = 9010
HOST = "0.0.0.0"

# Check device availability
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
logger.info(f"Using device: {DEVICE}")

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class GenerateRequest(BaseModel):
    """Request model for text-to-image generation"""
    prompt: str = Field(..., description="Text prompt for image generation")
    temperature: float = Field(1.0, ge=0.1, le=2.0, description="Sampling temperature")
    cfg_weight: float = Field(5.0, ge=1.0, le=20.0, description="Classifier-free guidance weight")
    num_images: int = Field(4, ge=1, le=16, description="Number of images to generate")
    img_size: int = Field(384, description="Image size (default 384x384)")
    seed: Optional[int] = Field(None, description="Random seed for reproducibility")

class GenerateResponse(BaseModel):
    """Response model for text-to-image generation"""
    ok: bool
    images: List[str] = Field(default_factory=list, description="Base64-encoded images")
    prompt: str
    num_images: int
    cfg_weight: float
    temperature: float
    error: Optional[str] = None

class UnderstandRequest(BaseModel):
    """Request model for image understanding"""
    image: str = Field(..., description="Base64-encoded image")
    question: str = Field(..., description="Question about the image")
    max_tokens: int = Field(512, ge=1, le=2048, description="Maximum tokens to generate")

class UnderstandResponse(BaseModel):
    """Response model for image understanding"""
    ok: bool
    answer: str
    question: str
    error: Optional[str] = None

class HealthResponse(BaseModel):
    """Health check response"""
    ok: bool
    status: str
    device: str
    model_loaded: bool
    model_path: str

class InfoResponse(BaseModel):
    """Model information response"""
    ok: bool
    model_name: str
    model_path: str
    device: str
    capabilities: List[str]
    version: str

# ============================================================================
# MODEL MANAGER
# ============================================================================

class JanusModelManager:
    """Manages Janus model loading and inference"""

    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = None
        self.vl_chat_processor = None
        self.tokenizer = None
        self.mock_mode = False

    def load_model(self):
        """Load Janus model from HuggingFace or use mock mode"""
        try:
            from transformers import AutoModelForCausalLM
            from janus.models import MultiModalityCausalLM, VLChatProcessor
            from janus.utils.io import load_pil_images

            logger.info(f"Loading Janus model from {self.model_path}...")

            # Load processor and tokenizer
            self.vl_chat_processor = VLChatProcessor.from_pretrained(self.model_path)
            self.tokenizer = self.vl_chat_processor.tokenizer

            # Load model
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                trust_remote_code=True
            )

            # Move to device
            if DEVICE == "cuda":
                self.model = self.model.to(torch.bfloat16).cuda().eval()
                logger.info("Model loaded on GPU (bfloat16)")
            else:
                self.model = self.model.to(torch.float32).cpu().eval()
                logger.info("Model loaded on CPU (float32)")

            logger.info("✓ Janus model loaded successfully")

        except Exception as e:
            logger.error(f"Failed to load Janus model: {e}")
            logger.warning("Running in MOCK MODE - will return placeholder responses")
            self.mock_mode = True

    @torch.inference_mode()
    def generate_images(
        self,
        prompt: str,
        temperature: float = 1.0,
        cfg_weight: float = 5.0,
        num_images: int = 4,
        img_size: int = 384,
        seed: Optional[int] = None
    ) -> List[str]:
        """Generate images from text prompt"""

        if self.mock_mode:
            return self._generate_mock_images(num_images)

        try:
            # Set seed if provided
            if seed is not None:
                torch.manual_seed(seed)
                if DEVICE == "cuda":
                    torch.cuda.manual_seed(seed)

            # Prepare conversation
            conversation = [
                {"role": "User", "content": prompt},
                {"role": "Assistant", "content": ""}
            ]

            # Format prompt
            sft_format = self.vl_chat_processor.apply_sft_template_for_multi_turn_prompts(
                conversations=conversation,
                sft_format=self.vl_chat_processor.sft_format,
                system_prompt=""
            )
            prompt_formatted = sft_format + self.vl_chat_processor.image_start_tag

            # Encode prompt
            input_ids = self.vl_chat_processor.tokenizer.encode(prompt_formatted)
            input_ids = torch.LongTensor(input_ids)

            # Prepare tokens for CFG (doubled for conditional + unconditional)
            parallel_size = num_images
            tokens = torch.zeros((parallel_size * 2, len(input_ids)), dtype=torch.int)

            if DEVICE == "cuda":
                tokens = tokens.cuda()

            for i in range(parallel_size * 2):
                tokens[i, :] = input_ids
                if i % 2 != 0:  # Unconditional (padded)
                    tokens[i, 1:-1] = self.vl_chat_processor.pad_id

            # Get input embeddings
            inputs_embeds = self.model.language_model.get_input_embeddings()(tokens)

            # Generate image tokens
            image_token_num_per_image = 576
            patch_size = 16
            generated_tokens = torch.zeros((parallel_size, image_token_num_per_image), dtype=torch.int)

            if DEVICE == "cuda":
                generated_tokens = generated_tokens.cuda()

            logger.info(f"Generating {num_images} images with CFG weight {cfg_weight}...")

            outputs = None
            for i in range(image_token_num_per_image):
                # Forward pass
                outputs = self.model.language_model.model(
                    inputs_embeds=inputs_embeds,
                    use_cache=True,
                    past_key_values=outputs.past_key_values if i != 0 else None
                )
                hidden_states = outputs.last_hidden_state

                # Get logits from generation head
                logits = self.model.gen_head(hidden_states[:, -1, :])
                logit_cond = logits[0::2, :]     # Conditional
                logit_uncond = logits[1::2, :]   # Unconditional

                # Apply classifier-free guidance
                logits = logit_uncond + cfg_weight * (logit_cond - logit_uncond)
                probs = torch.softmax(logits / temperature, dim=-1)

                # Sample next token
                next_token = torch.multinomial(probs, num_samples=1)
                generated_tokens[:, i] = next_token.squeeze(dim=-1)

                # Prepare embeddings for next iteration
                next_token_doubled = torch.cat([
                    next_token.unsqueeze(dim=1),
                    next_token.unsqueeze(dim=1)
                ], dim=1).view(-1)

                img_embeds = self.model.prepare_gen_img_embeds(next_token_doubled)
                inputs_embeds = img_embeds.unsqueeze(dim=1)

            # Decode tokens to images
            logger.info("Decoding generated tokens to images...")
            dec = self.model.gen_vision_model.decode_code(
                generated_tokens.to(dtype=torch.int),
                shape=[parallel_size, 8, img_size // patch_size, img_size // patch_size]
            )
            dec = dec.to(torch.float32).cpu().numpy().transpose(0, 2, 3, 1)

            # Convert to RGB [0, 255]
            dec = np.clip((dec + 1) / 2 * 255, 0, 255)

            visual_img = np.zeros((parallel_size, img_size, img_size, 3), dtype=np.uint8)
            visual_img[:, :, :] = dec

            # Convert to base64
            images_base64 = []
            for i in range(parallel_size):
                img_pil = PIL.Image.fromarray(visual_img[i])
                buffered = io.BytesIO()
                img_pil.save(buffered, format="JPEG", quality=95)
                img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
                images_base64.append(img_base64)

            logger.info(f"✓ Successfully generated {len(images_base64)} images")
            return images_base64

        except Exception as e:
            logger.error(f"Image generation failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    def _generate_mock_images(self, num_images: int) -> List[str]:
        """Generate mock placeholder images"""
        images = []
        for i in range(num_images):
            # Create a simple colored square
            img_array = np.random.randint(0, 255, (384, 384, 3), dtype=np.uint8)
            img_pil = PIL.Image.fromarray(img_array)
            buffered = io.BytesIO()
            img_pil.save(buffered, format="JPEG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
            images.append(img_base64)
        return images

    @torch.inference_mode()
    def understand_image(self, image_base64: str, question: str, max_tokens: int = 512) -> str:
        """Understand image and answer question"""

        if self.mock_mode:
            return f"[MOCK MODE] This would analyze the image and answer: {question}"

        try:
            from janus.utils.io import load_pil_images

            # Decode base64 image
            image_bytes = base64.b64decode(image_base64)
            image_pil = PIL.Image.open(io.BytesIO(image_bytes))

            # Save temporarily for loading
            temp_path = "/tmp/temp_janus_image.png"
            image_pil.save(temp_path)

            # Prepare conversation
            conversation = [
                {
                    "role": "User",
                    "content": f"<image_placeholder>\n{question}",
                    "images": [temp_path]
                },
                {"role": "Assistant", "content": ""}
            ]

            # Load images
            pil_images = load_pil_images(conversation)
            prepare_inputs = self.vl_chat_processor(
                conversations=conversation,
                images=pil_images,
                force_batchify=True
            ).to(self.model.device)

            # Get image embeddings
            inputs_embeds = self.model.prepare_inputs_embeds(**prepare_inputs)

            # Generate response
            outputs = self.model.language_model.generate(
                inputs_embeds=inputs_embeds,
                attention_mask=prepare_inputs.attention_mask,
                pad_token_id=self.tokenizer.eos_token_id,
                bos_token_id=self.tokenizer.bos_token_id,
                eos_token_id=self.tokenizer.eos_token_id,
                max_new_tokens=max_tokens,
                do_sample=False,
                use_cache=True
            )

            # Decode answer
            answer = self.tokenizer.decode(outputs[0].cpu().tolist(), skip_special_tokens=True)

            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)

            return answer

        except Exception as e:
            logger.error(f"Image understanding failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="Janus Text-to-Image Server",
    description="DeepSeek Janus unified multimodal model for BASHER",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model manager
model_manager = None

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize model on startup"""
    global model_manager
    model_manager = JanusModelManager(DEFAULT_MODEL_PATH)
    model_manager.load_model()

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    return HealthResponse(
        ok=True,
        status="running",
        device=DEVICE,
        model_loaded=model_manager is not None and not model_manager.mock_mode,
        model_path=DEFAULT_MODEL_PATH
    )

@app.get("/v1/info", response_model=InfoResponse)
async def info():
    """Model information endpoint"""
    return InfoResponse(
        ok=True,
        model_name="Janus-1.3B",
        model_path=DEFAULT_MODEL_PATH,
        device=DEVICE,
        capabilities=[
            "text-to-image generation",
            "image understanding",
            "multimodal chat",
            "classifier-free guidance"
        ],
        version="1.0.0"
    )

@app.post("/v1/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    """Generate images from text prompt"""

    if model_manager is None:
        raise HTTPException(status_code=500, detail="Model not initialized")

    try:
        images = model_manager.generate_images(
            prompt=request.prompt,
            temperature=request.temperature,
            cfg_weight=request.cfg_weight,
            num_images=request.num_images,
            img_size=request.img_size,
            seed=request.seed
        )

        return GenerateResponse(
            ok=True,
            images=images,
            prompt=request.prompt,
            num_images=len(images),
            cfg_weight=request.cfg_weight,
            temperature=request.temperature
        )

    except Exception as e:
        logger.error(f"Generation failed: {e}")
        return GenerateResponse(
            ok=False,
            images=[],
            prompt=request.prompt,
            num_images=0,
            cfg_weight=request.cfg_weight,
            temperature=request.temperature,
            error=str(e)
        )

@app.post("/v1/understand", response_model=UnderstandResponse)
async def understand(request: UnderstandRequest):
    """Understand image and answer question"""

    if model_manager is None:
        raise HTTPException(status_code=500, detail="Model not initialized")

    try:
        answer = model_manager.understand_image(
            image_base64=request.image,
            question=request.question,
            max_tokens=request.max_tokens
        )

        return UnderstandResponse(
            ok=True,
            answer=answer,
            question=request.question
        )

    except Exception as e:
        logger.error(f"Understanding failed: {e}")
        return UnderstandResponse(
            ok=False,
            answer="",
            question=request.question,
            error=str(e)
        )

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    logger.info("=" * 80)
    logger.info("JANUS TEXT-TO-IMAGE SERVER")
    logger.info("=" * 80)
    logger.info(f"Model: {DEFAULT_MODEL_PATH}")
    logger.info(f"Device: {DEVICE}")
    logger.info(f"Host: {HOST}:{PORT}")
    logger.info("=" * 80)

    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        log_level="info"
    )
