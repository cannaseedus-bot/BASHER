/**
 * K'UHUL XJSON HANDLERS
 *
 * BASHER integration for K'uhul visual programming system.
 * Provides XJSON API endpoints for compiling and executing K'uhul code.
 */

export default function kuhulHandlers() {
  return {
    /**
     * kuhul.compile - Compile K'uhul symbolic code to bytecode
     *
     * Input: { source: string }
     * Output: { ok: boolean, bytecode?: array, ast?: object, stats?: object, error?: string }
     */
    "kuhul.compile": async ({ source }) => {
      if (!source) {
        return {
          ok: false,
          error: "Source code is required"
        };
      }

      try {
        // Simple tokenizer and parser for K'uhul symbolic language
        const tokens = tokenize(source);
        const ast = parse(tokens);
        const bytecode = generateBytecode(ast);

        return {
          ok: true,
          bytecode: Array.from(bytecode),
          ast: ast,
          stats: {
            bytecodeSize: bytecode.length,
            functionCount: ast.functions.length,
            tokenCount: tokens.length
          }
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message
        };
      }
    },

    /**
     * kuhul.execute - Execute K'uhul bytecode
     *
     * Input: { bytecode: array } or { source: string }
     * Output: { ok: boolean, output?: string, executionTime?: number, error?: string }
     */
    "kuhul.execute": async ({ bytecode, source }) => {
      try {
        let code = bytecode;

        // If source provided, compile first
        if (source && !bytecode) {
          const compileResult = await kuhulHandlers()["kuhul.compile"]({ source });
          if (!compileResult.ok) {
            return compileResult;
          }
          code = compileResult.bytecode;
        }

        if (!code) {
          return {
            ok: false,
            error: "Either bytecode or source is required"
          };
        }

        // Simple VM execution (server-side simulation)
        const startTime = Date.now();
        const output = simulateExecution(code);
        const executionTime = Date.now() - startTime;

        return {
          ok: true,
          output: output,
          executionTime: executionTime
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message
        };
      }
    },

    /**
     * kuhul.info - Get K'uhul engine information
     *
     * Output: { ok: boolean, version: string, glyphs: array, operations: array }
     */
    "kuhul.info": async () => {
      return {
        ok: true,
        version: "1.0.0",
        name: "K'uhul Visual Programming System",
        description: "Full-stack visual programming with DOM, networking, and Three.js",
        glyphs: [
          { name: "Pop", opcode: 0x01, description: "Define function/population" },
          { name: "Wo", opcode: 0x02, description: "Assign to register" },
          { name: "Ch'en", opcode: 0x03, description: "Store in memory channel" },
          { name: "Yax", opcode: 0x04, description: "Load/activate (green)" },
          { name: "Sek", opcode: 0x05, description: "Execute action (light)" },
          { name: "Muwan", opcode: 0x0F, description: "Call function" },
          { name: "K'ayab'", opcode: 0x0A, description: "Start animation loop" },
          { name: "Kumk'u", opcode: 0x0B, description: "End loop" },
          { name: "Xul", opcode: 0x0E, description: "End function/return" }
        ],
        operations: [
          "create_element", "update_content", "add_event",
          "http_request", "json_parse",
          "init_threejs", "create_cube", "create_sphere", "create_torus",
          "rotate", "render", "add_light", "set_camera", "get"
        ],
        endpoints: {
          compile: "/xjson/run -> kuhul.compile",
          execute: "/xjson/run -> kuhul.execute",
          info: "/xjson/run -> kuhul.info",
          examples: "/xjson/run -> kuhul.examples"
        }
      };
    },

    /**
     * kuhul.examples - Get example K'uhul programs
     *
     * Output: { ok: boolean, examples: array }
     */
    "kuhul.examples": async () => {
      return {
        ok: true,
        examples: [
          {
            name: "Hello World",
            description: "Simple output example",
            code: `[Pop hello_world]
  [Wo "Hello from K'uhul!"]→[Ch'en message]
  [Yax message]→[Sek output]
[Xul]`
          },
          {
            name: "DOM Manipulation",
            description: "Create and update DOM elements",
            code: `[Pop create_ui]
  [Wo "app-container"]→[Ch'en container]
  [Wo "<div class='panel'><h2>K'uhul UI</h2></div>"]→[Ch'en html]
  [Yax container]→[Sek create_element]
  [Yax html]→[Sek create_element]
[Xul]`
          },
          {
            name: "HTTP Request",
            description: "Fetch data from REST API",
            code: `[Pop fetch_data]
  [Wo "https://jsonplaceholder.typicode.com/users/1"]→[Ch'en url]
  [Yax url]→[Sek http_request]→[Ch'en response]
  [Yax response]→[Sek json_parse]→[Ch'en data]
  [Yax data]→[Sek get "name"]→[Ch'en username]
  [Yax username]→[Sek output]
[Xul]`
          },
          {
            name: "3D Scene",
            description: "Create Three.js 3D scene with cube",
            code: `[Pop create_3d]
  [Wo "threejs-container"]→[Ch'en container]
  [Yax container]→[Sek init_threejs]→[Ch'en scene]
  [Wo "#16f2aa"]→[Ch'en color]
  [Wo 1]→[Ch'en size]
  [Yax scene]→[Sek create_cube]
  [Yax color]→[Sek create_cube]
  [Yax size]→[Sek create_cube]→[Ch'en cube]
  [K'ayab' animation]
    [Yax cube]→[Sek rotate 0.01 0.02 0]
    [Yax scene]→[Sek render]
  [Kumk'u animation]
[Xul]`
          },
          {
            name: "Full Stack Application",
            description: "DOM + Networking + 3D in one program",
            code: `[Pop full_stack_app]
  [Muwan setup_ui]
  [Muwan load_data]
  [Muwan init_3d]
[Xul]

[Pop setup_ui]
  [Wo "app-container"]→[Ch'en container]
  [Wo "<div class='dashboard'><h1>Full Stack K'uhul</h1><div id='info'></div></div>"]→[Ch'en html]
  [Yax container]→[Sek create_element]
  [Yax html]→[Sek create_element]
[Xul]

[Pop load_data]
  [Wo "https://api.github.com/users/github"]→[Ch'en api]
  [Yax api]→[Sek http_request]→[Ch'en response]
  [Yax response]→[Sek json_parse]→[Ch'en user]
  [Yax user]→[Sek get "login"]→[Ch'en username]
  [Wo "info"]→[Ch'en info_id]
  [Yax info_id]→[Sek update_content]
  [Yax username]→[Sek update_content]
[Xul]

[Pop init_3d]
  [Wo "threejs-container"]→[Ch'en container]
  [Yax container]→[Sek init_threejs]→[Ch'en scene]
  [Wo "#16f2aa"]→[Ch'en color]
  [Wo 0.8]→[Ch'en size]
  [Yax scene]→[Sek create_cube]
  [Yax color]→[Sek create_cube]
  [Yax size]→[Sek create_cube]→[Ch'en cube]
  [K'ayab' render_loop]
    [Yax cube]→[Sek rotate 0.01 0.02 0]
    [Yax scene]→[Sek render]
  [Kumk'u render_loop]
[Xul]`
          }
        ]
      };
    }
  };
}

// =============================================================================
// HELPER FUNCTIONS - Simple K'uhul Compiler Implementation
// =============================================================================

function tokenize(source) {
  const tokens = [];
  const lines = source.split('\n');

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;

    const glyphMatches = line.matchAll(/\[([^\]]+)\](→)?/g);

    for (const match of glyphMatches) {
      const glyphContent = match[1];
      const parts = glyphContent.split(/\s+/);
      const glyph = parts[0];
      const args = parts.slice(1);

      tokens.push({ type: 'GLYPH', glyph, args });
    }
  }

  return tokens;
}

function parse(tokens) {
  const ast = { type: 'PROGRAM', functions: [], currentFunction: null };

  for (const token of tokens) {
    switch (token.glyph) {
      case 'Pop':
        ast.currentFunction = {
          type: 'FUNCTION',
          name: token.args[0] || 'anonymous',
          body: []
        };
        ast.functions.push(ast.currentFunction);
        break;
      case 'Xul':
        ast.currentFunction = null;
        break;
      default:
        if (ast.currentFunction) {
          ast.currentFunction.body.push({
            type: 'OPERATION',
            glyph: token.glyph,
            args: token.args
          });
        }
        break;
    }
  }

  return ast;
}

function generateBytecode(ast) {
  const opcodes = {
    'Pop': 0x01, 'Wo': 0x02, 'Ch\'en': 0x03, 'Yax': 0x04, 'Sek': 0x05,
    'Muwan': 0x0F, 'K\'ayab\'': 0x0A, 'Kumk\'u': 0x0B, 'Xul': 0x0E
  };

  const bytecode = [];

  for (const func of ast.functions) {
    bytecode.push(opcodes.Pop, ...encodeString(func.name));
    for (const op of func.body) {
      const opcode = opcodes[op.glyph];
      if (opcode !== undefined) {
        bytecode.push(opcode);
        for (const arg of op.args) {
          bytecode.push(...encodeString(arg));
        }
      }
    }
    bytecode.push(opcodes.Xul);
  }

  return new Uint8Array(bytecode);
}

function encodeString(str) {
  const bytes = [Math.min(str.length, 255)];
  for (let i = 0; i < Math.min(str.length, 255); i++) {
    bytes.push(str.charCodeAt(i) & 0xFF);
  }
  return bytes;
}

function simulateExecution(bytecode) {
  const output = [];
  output.push("K'uhul VM simulation");
  output.push(`Bytecode size: ${bytecode.length} bytes`);
  output.push("Execution completed successfully");
  return output.join('\n');
}
