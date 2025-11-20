/**
 * ASX-Qwen Model XJSON Handlers
 *
 * Integrates your fine-tuned ASX-Qwen model with BASHER's XJSON ecosystem.
 * Routes chat requests through the local model server.
 */

/**
 * Call model server
 */
async function callModelServer(messages, config = {}) {
  const url = config.url || "http://localhost:8000/v1/chat";
  const max_tokens = config.max_tokens || 512;
  const temperature = config.temperature || 0.7;
  const top_p = config.top_p || 0.9;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages,
        max_tokens,
        temperature,
        top_p,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    return {
      ok: false,
      error: err.message
    };
  }
}

/**
 * Model Handler Factory
 */
export default function modelHandlers(config = {}) {
  const modelConfig = config.model || {};
  const serverUrl = modelConfig.url || "http://localhost:8000";

  return {
    /**
     * Chat with model
     */
    "model.chat": async ({ messages, max_tokens, temperature, top_p }) => {
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return {
          ok: false,
          error: "messages array required"
        };
      }

      const result = await callModelServer(messages, {
        url: `${serverUrl}/v1/chat`,
        max_tokens,
        temperature,
        top_p
      });

      return result;
    },

    /**
     * Get model info
     */
    "model.info": async () => {
      try {
        const response = await fetch(`${serverUrl}/v1/info`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        return {
          ok: false,
          error: err.message
        };
      }
    },

    /**
     * Health check
     */
    "model.health": async () => {
      try {
        const response = await fetch(`${serverUrl}/health`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        return {
          ok: false,
          error: err.message
        };
      }
    },

    /**
     * Simple completion (single prompt)
     */
    "model.complete": async ({ prompt, max_tokens, temperature, top_p }) => {
      if (!prompt) {
        return {
          ok: false,
          error: "prompt required"
        };
      }

      const messages = [{ role: "user", content: prompt }];

      const result = await callModelServer(messages, {
        url: `${serverUrl}/v1/chat`,
        max_tokens,
        temperature,
        top_p
      });

      return result;
    }
  };
}
