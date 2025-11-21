/**
 * JANUS TEXT-TO-IMAGE XJSON HANDLERS
 *
 * BASHER integration for DeepSeek Janus unified multimodal model.
 * Provides XJSON API endpoints for text-to-image generation and image understanding.
 *
 * Server: http://localhost:9010 (FastAPI)
 * Model: deepseek-ai/Janus-1.3B
 *
 * Handlers:
 * - janus.generate - Generate images from text prompts
 * - janus.understand - Understand images and answer questions
 * - janus.info - Get model information
 * - janus.health - Check server health
 * - janus.examples - Get example prompts
 */

const JANUS_SERVER = "http://localhost:9010";

/**
 * Make HTTP request to Janus server
 */
async function callJanusAPI(endpoint, method = "GET", body = null) {
  try {
    const url = `${JANUS_SERVER}${endpoint}`;

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Janus API error: ${response.status} - ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Janus API call failed:`, error);
    return {
      ok: false,
      error: error.message,
      server: JANUS_SERVER,
      endpoint,
    };
  }
}

export default function janusHandlers() {
  return {
    /**
     * janus.generate - Generate images from text prompt
     *
     * Input: {
     *   prompt: string,
     *   temperature?: number (0.1-2.0, default 1.0),
     *   cfg_weight?: number (1.0-20.0, default 5.0),
     *   num_images?: number (1-16, default 4),
     *   img_size?: number (default 384),
     *   seed?: number (optional, for reproducibility)
     * }
     *
     * Output: {
     *   ok: boolean,
     *   images: string[] (base64-encoded JPEG images),
     *   prompt: string,
     *   num_images: number,
     *   cfg_weight: number,
     *   temperature: number,
     *   error?: string
     * }
     */
    "janus.generate": async ({
      prompt,
      temperature = 1.0,
      cfg_weight = 5.0,
      num_images = 4,
      img_size = 384,
      seed = null,
    }) => {
      if (!prompt) {
        return {
          ok: false,
          error: "Prompt is required",
        };
      }

      try {
        const result = await callJanusAPI("/v1/generate", "POST", {
          prompt,
          temperature,
          cfg_weight,
          num_images,
          img_size,
          seed,
        });

        if (!result.ok) {
          return {
            ok: false,
            error: result.error || "Generation failed",
            prompt,
          };
        }

        return {
          ok: true,
          images: result.images,
          prompt: result.prompt,
          num_images: result.num_images,
          cfg_weight: result.cfg_weight,
          temperature: result.temperature,
          server: JANUS_SERVER,
          model: "Janus-1.3B",
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message,
          prompt,
        };
      }
    },

    /**
     * janus.understand - Understand image and answer question
     *
     * Input: {
     *   image: string (base64-encoded image),
     *   question: string,
     *   max_tokens?: number (1-2048, default 512)
     * }
     *
     * Output: {
     *   ok: boolean,
     *   answer: string,
     *   question: string,
     *   error?: string
     * }
     */
    "janus.understand": async ({ image, question, max_tokens = 512 }) => {
      if (!image || !question) {
        return {
          ok: false,
          error: "Image and question are required",
        };
      }

      try {
        const result = await callJanusAPI("/v1/understand", "POST", {
          image,
          question,
          max_tokens,
        });

        if (!result.ok) {
          return {
            ok: false,
            error: result.error || "Understanding failed",
            question,
          };
        }

        return {
          ok: true,
          answer: result.answer,
          question: result.question,
          server: JANUS_SERVER,
          model: "Janus-1.3B",
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message,
          question,
        };
      }
    },

    /**
     * janus.info - Get Janus model information
     *
     * Output: {
     *   ok: boolean,
     *   model_name: string,
     *   model_path: string,
     *   device: string (cuda or cpu),
     *   capabilities: string[],
     *   version: string
     * }
     */
    "janus.info": async () => {
      try {
        const result = await callJanusAPI("/v1/info", "GET");

        return {
          ok: true,
          ...result,
          server: JANUS_SERVER,
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message,
          server: JANUS_SERVER,
        };
      }
    },

    /**
     * janus.health - Check Janus server health
     *
     * Output: {
     *   ok: boolean,
     *   status: string,
     *   device: string,
     *   model_loaded: boolean,
     *   model_path: string
     * }
     */
    "janus.health": async () => {
      try {
        const result = await callJanusAPI("/health", "GET");

        return {
          ok: true,
          ...result,
          server: JANUS_SERVER,
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message,
          status: "unreachable",
          server: JANUS_SERVER,
        };
      }
    },

    /**
     * janus.examples - Get example prompts for image generation
     *
     * Output: {
     *   ok: boolean,
     *   examples: Array<{
     *     name: string,
     *     prompt: string,
     *     description: string,
     *     suggested_cfg: number,
     *     category: string
     *   }>
     * }
     */
    "janus.examples": async () => {
      return {
        ok: true,
        examples: [
          {
            name: "Cyberpunk City",
            prompt:
              "A futuristic cyberpunk cityscape at night, neon lights reflecting on wet streets, flying cars, towering skyscrapers with holographic advertisements",
            description: "Sci-fi urban scene with neon aesthetics",
            suggested_cfg: 7.0,
            category: "sci-fi",
          },
          {
            name: "Fantasy Landscape",
            prompt:
              "A magical fantasy landscape with floating islands, waterfalls cascading into clouds, mystical forests, ancient ruins, dramatic sunset lighting",
            description: "Epic fantasy environment",
            suggested_cfg: 6.0,
            category: "fantasy",
          },
          {
            name: "Steampunk Workshop",
            prompt:
              "Victorian-era steampunk inventor's workshop, brass gears, copper pipes, vintage machinery, warm gas lamp lighting, intricate mechanical devices",
            description: "Detailed steampunk interior",
            suggested_cfg: 5.5,
            category: "steampunk",
          },
          {
            name: "Abstract Art",
            prompt:
              "Abstract geometric composition with vibrant colors, fluid shapes, dynamic movement, gradient transitions, modern minimalist style",
            description: "Contemporary abstract design",
            suggested_cfg: 4.0,
            category: "abstract",
          },
          {
            name: "Nature Scene",
            prompt:
              "Serene natural landscape, mountain lake reflection, autumn forest colors, misty morning atmosphere, wildlife in foreground, photorealistic",
            description: "Peaceful nature photography style",
            suggested_cfg: 6.5,
            category: "nature",
          },
          {
            name: "Character Portrait",
            prompt:
              "Portrait of a cybernetic samurai warrior, traditional armor mixed with futuristic technology, dramatic lighting, intense expression, detailed face",
            description: "Character concept art",
            suggested_cfg: 7.5,
            category: "character",
          },
          {
            name: "Architectural Design",
            prompt:
              "Modern architectural masterpiece, curved glass facade, sustainable design, indoor garden integration, natural lighting, minimalist interior",
            description: "Contemporary architecture visualization",
            suggested_cfg: 6.0,
            category: "architecture",
          },
          {
            name: "Space Exploration",
            prompt:
              "Deep space exploration scene, distant galaxies, nebula clouds, astronaut floating near spacecraft, Earth visible in background, cosmic wonder",
            description: "Astronomical space scene",
            suggested_cfg: 7.0,
            category: "space",
          },
          {
            name: "K'uhul Integration",
            prompt:
              "3D Maya glyph symbols floating in sacred geometric space, ethereal light rays, ancient civilization meets quantum computing, mystical atmosphere",
            description: "K'uhul symbolic visualization",
            suggested_cfg: 8.0,
            category: "symbolic",
          },
          {
            name: "SVG-3D Concept",
            prompt:
              "Vector graphics coming to life in 3D space, geometric transformations, mathematical beauty, compression algorithms visualized as art",
            description: "Technical art visualization",
            suggested_cfg: 5.0,
            category: "technical",
          },
        ],
        server: JANUS_SERVER,
        model: "Janus-1.3B",
      };
    },

    /**
     * janus.batch - Generate multiple images with different prompts
     *
     * Input: {
     *   prompts: string[],
     *   temperature?: number,
     *   cfg_weight?: number,
     *   num_images_per_prompt?: number
     * }
     *
     * Output: {
     *   ok: boolean,
     *   results: Array<{
     *     prompt: string,
     *     images: string[],
     *     success: boolean
     *   }>,
     *   total_images: number
     * }
     */
    "janus.batch": async ({
      prompts,
      temperature = 1.0,
      cfg_weight = 5.0,
      num_images_per_prompt = 2,
    }) => {
      if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
        return {
          ok: false,
          error: "Prompts array is required",
        };
      }

      try {
        const results = [];
        let total_images = 0;

        for (const prompt of prompts) {
          const result = await callJanusAPI("/v1/generate", "POST", {
            prompt,
            temperature,
            cfg_weight,
            num_images: num_images_per_prompt,
          });

          results.push({
            prompt,
            images: result.images || [],
            success: result.ok,
            error: result.error,
          });

          if (result.ok) {
            total_images += result.images.length;
          }
        }

        return {
          ok: true,
          results,
          total_images,
          total_prompts: prompts.length,
          server: JANUS_SERVER,
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message,
        };
      }
    },

    /**
     * janus.svg3d.generate - Generate image for SVG-3D neural operator
     *
     * This integrates with K'uhul SVG-3D neural path generation (⟿)
     *
     * Input: {
     *   neural_input: string,
     *   complexity?: number,
     *   style?: string
     * }
     *
     * Output: {
     *   ok: boolean,
     *   image: string (base64),
     *   neural_input: string,
     *   complexity: number
     * }
     */
    "janus.svg3d.generate": async ({
      neural_input,
      complexity = 100,
      style = "abstract geometric",
    }) => {
      if (!neural_input) {
        return {
          ok: false,
          error: "Neural input is required",
        };
      }

      try {
        // Enhance prompt with style and complexity
        const prompt = `${style} visualization of "${neural_input}", complexity level ${complexity}, vector-inspired design, geometric patterns`;

        const result = await callJanusAPI("/v1/generate", "POST", {
          prompt,
          temperature: 1.0,
          cfg_weight: 6.0,
          num_images: 1,
        });

        if (!result.ok || !result.images || result.images.length === 0) {
          return {
            ok: false,
            error: result.error || "Generation failed",
            neural_input,
          };
        }

        return {
          ok: true,
          image: result.images[0],
          neural_input,
          complexity,
          style,
          prompt_used: prompt,
          algorithm: "Janus-Neural-SVG3D",
          server: JANUS_SERVER,
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message,
          neural_input,
        };
      }
    },
  };
}
