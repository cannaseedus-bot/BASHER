/**
 * K'UHUL FULL-STACK COMPILER & VM
 *
 * Complete compiler and virtual machine for K'uhul symbolic language.
 * Compiles symbolic code to bytecode and executes with full DOM, networking,
 * and Three.js integration.
 */

// =============================================================================
// K'UHUL FULL-STACK COMPILER
// =============================================================================

class KuhulFullStackCompiler {
  constructor() {
    this.opcodes = {
      // Core glyphs
      'Pop': 0x01, 'Wo': 0x02, 'Ch\'en': 0x03, 'Yax': 0x04, 'Sek': 0x05,
      'Slp': 0x06, 'Zotz\'': 0x07, 'Yaxk\'in': 0x08, 'Mol': 0x09,
      'K\'ayab\'': 0x0A, 'Kumk\'u': 0x0B, 'Sak': 0x0C, 'K\'ank\'in': 0x0D,
      'Xul': 0x0E, 'Muwan': 0x0F,

      // Extended operations
      'create_element': 0x20,
      'update_content': 0x21,
      'add_event': 0x22,
      'http_request': 0x23,
      'json_parse': 0x24,
      'init_threejs': 0x25,
      'create_cube': 0x26,
      'rotate': 0x27,
      'render': 0x28,
      'get': 0x29,
      'create_sphere': 0x2A,
      'create_torus': 0x2B,
      'add_light': 0x2C,
      'set_camera': 0x2D
    };

    // Initialize engines
    if (typeof window !== 'undefined' && window.Kuhul3D) {
      this.threejs = window.Kuhul3D.engine;
      this.networking = window.Kuhul3D.networking;
      this.dom = window.Kuhul3D.dom;
    }
  }

  tokenize(source) {
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

        tokens.push({ type: 'GLYPH', glyph, args, line });
      }
    }

    return tokens;
  }

  parse(tokens) {
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

  generateBytecode(ast) {
    const bytecode = [];

    for (const func of ast.functions) {
      bytecode.push(this.opcodes.Pop, ...this.encodeString(func.name));
      this.generateFunctionBytecode(func.body, bytecode);
      bytecode.push(this.opcodes.Xul);
    }

    return new Uint8Array(bytecode);
  }

  generateFunctionBytecode(body, bytecode) {
    for (const node of body) {
      const opcode = this.opcodes[node.glyph];
      if (opcode !== undefined) {
        bytecode.push(opcode);
        for (const arg of node.args) {
          bytecode.push(...this.encodeArgument(arg));
        }
      } else {
        // Try to encode as extended operation
        const extendedOp = this.opcodes[node.args[0]];
        if (extendedOp !== undefined) {
          bytecode.push(extendedOp);
          for (const arg of node.args.slice(1)) {
            bytecode.push(...this.encodeArgument(arg));
          }
        }
      }
    }
  }

  encodeArgument(arg) {
    if (this.isNumber(arg)) {
      return [0x01, ...this.encodeNumber(parseFloat(arg))];
    } else if (arg.startsWith('"') && arg.endsWith('"')) {
      return [0x02, ...this.encodeString(arg.slice(1, -1))];
    } else if (arg.startsWith('#')) {
      return [0x04, ...this.encodeString(arg)]; // Color
    } else {
      return [0x03, ...this.encodeString(arg)];
    }
  }

  encodeNumber(num) {
    // Simple float encoding (4 bytes)
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, num, true);
    return Array.from(new Uint8Array(buffer));
  }

  encodeString(str) {
    const bytes = [Math.min(str.length, 255)];
    for (let i = 0; i < Math.min(str.length, 255); i++) {
      bytes.push(str.charCodeAt(i) & 0xFF);
    }
    return bytes;
  }

  isNumber(str) {
    return !isNaN(str) && !isNaN(parseFloat(str));
  }

  compile(source) {
    try {
      const startTime = performance.now();
      const tokens = this.tokenize(source);
      const ast = this.parse(tokens);
      const bytecode = this.generateBytecode(ast);
      const compileTime = performance.now() - startTime;

      return {
        success: true,
        bytecode,
        ast,
        tokens,
        stats: {
          bytecodeSize: bytecode.length,
          functionCount: ast.functions.length,
          tokenCount: tokens.length,
          compileTime: compileTime.toFixed(2)
        }
      };
    } catch (error) {
      return { success: false, error: error.message, stack: error.stack };
    }
  }
}

// =============================================================================
// K'UHUL FULL-STACK VM
// =============================================================================

class KuhulFullStackVM {
  constructor() {
    this.registers = new Array(16).fill(null);
    this.memory = new Map();
    this.stack = [];
    this.callStack = [];
    this.output = [];
    this.pc = 0;
    this.running = false;

    this.compiler = new KuhulFullStackCompiler();

    // Engine references
    if (typeof window !== 'undefined' && window.Kuhul3D) {
      this.threejs = window.Kuhul3D.engine;
      this.networking = window.Kuhul3D.networking;
      this.dom = window.Kuhul3D.dom;
    }
  }

  async execute(bytecode) {
    this.bytecode = bytecode;
    this.pc = 0;
    this.running = true;
    this.output = [];
    this.registers.fill(null);
    this.memory.clear();
    this.stack = [];
    this.callStack = [];

    const startTime = performance.now();
    this.log("🎮 K'uhul Full-Stack VM Started");

    try {
      while (this.running && this.pc < bytecode.length) {
        await this.executeInstruction(this.bytecode[this.pc++]);
      }
    } catch (error) {
      this.log(`❌ Runtime Error: ${error.message}`);
      console.error(error);
    }

    const executionTime = performance.now() - startTime;
    this.log(`✅ K'uhul VM Finished (${executionTime.toFixed(2)}ms)`);

    return {
      output: this.output.join('\n'),
      executionTime: executionTime.toFixed(2)
    };
  }

  async executeInstruction(opcode) {
    switch (opcode) {
      case 0x01: // Pop
        this.callStack.push(this.pc);
        const funcName = this.decodeString();
        this.log(`📦 Function: ${funcName}`);
        break;

      case 0x02: // Wo
        const value = this.decodeArgument();
        this.registers[0] = value;
        this.log(`💾 Register R0 = ${this.formatValue(value)}`);
        break;

      case 0x03: // Ch'en
        const varName = this.decodeString();
        this.memory.set(varName, this.registers[0]);
        this.log(`📌 Memory[${varName}] = ${this.formatValue(this.registers[0])}`);
        break;

      case 0x04: // Yax
        const loadVar = this.decodeString();
        this.registers[0] = this.memory.get(loadVar);
        this.log(`🟢 Loaded ${loadVar} = ${this.formatValue(this.registers[0])}`);
        break;

      case 0x05: // Sek
        const action = this.decodeString();
        this.output.push(String(this.registers[0] || action));
        this.log(`💡 Output: ${this.formatValue(this.registers[0] || action)}`);
        break;

      case 0x0F: // Muwan
        const callFunc = this.decodeString();
        this.log(`📞 Calling: ${callFunc}`);
        break;

      // DOM Operations
      case 0x20: // create_element
        const containerId = this.decodeString();
        const html = this.decodeString();
        if (this.dom) {
          this.registers[0] = this.dom.createElement(containerId, html);
          this.log(`🎨 Created DOM element in #${containerId}`);
        }
        break;

      case 0x21: // update_content
        const elementId = this.decodeString();
        const content = this.decodeString();
        if (this.dom) {
          this.dom.updateContent(elementId, content);
          this.log(`✏️ Updated #${elementId} content`);
        }
        break;

      case 0x22: // add_event
        const eventElement = this.decodeString();
        const eventType = this.decodeString();
        const selector = this.decodeString();
        const handler = this.decodeString();
        if (this.dom) {
          this.dom.addEvent(eventElement, eventType, selector, handler);
          this.log(`🎯 Event ${eventType} added to ${selector}`);
        }
        break;

      // Networking Operations
      case 0x23: // http_request
        const url = this.decodeString();
        const method = this.decodeString() || 'GET';
        if (this.networking) {
          this.log(`🌐 HTTP ${method} ${url}`);
          this.registers[0] = await this.networking.httpRequest(url, method, {});
        }
        break;

      case 0x24: // json_parse
        if (this.networking && this.registers[0]) {
          this.registers[0] = this.networking.jsonParse(this.registers[0]);
          this.log(`📋 Parsed JSON`);
        }
        break;

      // Three.js Operations
      case 0x25: // init_threejs
        const container = this.decodeString();
        if (this.threejs) {
          this.registers[0] = this.threejs.initThreeJS(container);
          this.log(`🎮 Three.js initialized in #${container}`);
        }
        break;

      case 0x26: // create_cube
        const color = this.decodeString();
        const size = this.decodeNumber();
        if (this.threejs && this.registers[0]) {
          const cube = this.threejs.addGeometry('cube', {
            color: color,
            size: size
          }, this.registers[0]);
          this.registers[0] = cube.mesh;
          this.log(`🎲 Created cube (${color}, ${size})`);
        }
        break;

      case 0x27: // rotate
        const rx = this.decodeNumber();
        const ry = this.decodeNumber();
        const rz = this.decodeNumber();
        if (this.registers[0] && this.registers[0].rotation) {
          this.registers[0].rotation.x += rx;
          this.registers[0].rotation.y += ry;
          this.registers[0].rotation.z += rz;
        }
        break;

      case 0x28: // render
        if (this.threejs && this.registers[0]) {
          const sceneId = typeof this.registers[0] === 'string'
            ? this.registers[0]
            : 'default';
          this.threejs.renderScene(sceneId);
        }
        break;

      case 0x29: // get
        const key = this.decodeString();
        if (this.registers[0] && typeof this.registers[0] === 'object') {
          this.registers[0] = this.registers[0][key];
          this.log(`🔑 Get [${key}] = ${this.formatValue(this.registers[0])}`);
        }
        break;

      case 0x0A: // K'ayab' (animation start)
        const loopName = this.decodeString();
        this.log(`🔄 Animation loop: ${loopName}`);
        break;

      case 0x0B: // Kumk'u (animation end)
        this.log(`⏹ Animation loop end`);
        break;

      case 0x0E: // Xul
        if (this.callStack.length > 0) {
          this.pc = this.callStack.pop();
        } else {
          this.running = false;
        }
        break;
    }
  }

  decodeArgument() {
    const type = this.bytecode[this.pc++];
    switch (type) {
      case 0x01: // Number
        return this.decodeNumber();
      case 0x02: // String
        return this.decodeString();
      case 0x03: // Identifier
        return this.decodeString();
      case 0x04: // Color
        return this.decodeString();
      default:
        return null;
    }
  }

  decodeNumber() {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    for (let i = 0; i < 4; i++) {
      view.setUint8(i, this.bytecode[this.pc++]);
    }
    return view.getFloat32(0, true);
  }

  decodeString() {
    const length = this.bytecode[this.pc++];
    let str = '';
    for (let i = 0; i < length; i++) {
      str += String.fromCharCode(this.bytecode[this.pc++]);
    }
    return str;
  }

  formatValue(value) {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value).substring(0, 50);
    return String(value);
  }

  log(message) {
    const executionLog = document.getElementById('executionLog');
    if (executionLog) {
      const div = document.createElement('div');
      div.textContent = message;
      executionLog.appendChild(div);
      executionLog.scrollTop = executionLog.scrollHeight;
    }
    console.log(message);
  }
}

// =============================================================================
// UI INTEGRATION
// =============================================================================

const compiler = new KuhulFullStackCompiler();
const vm = new KuhulFullStackVM();

// Block templates
const BLOCK_TEMPLATES = {
  'DOM': `[Pop create_ui_element]
  [Wo "app-container"]→[Ch'en container_id]
  [Wo "<div class='ui-panel'><h3>New UI Element</h3></div>"]→[Ch'en html_content]
  [Yax container_id]→[Sek create_element]
  [Yax html_content]→[Sek create_element]
[Xul]`,

  'NETWORK': `[Pop fetch_external_data]
  [Wo "https://jsonplaceholder.typicode.com/posts/1"]→[Ch'en api_url]
  [Yax api_url]→[Sek http_request]→[Ch'en response]
  [Yax response]→[Sek json_parse]→[Ch'en data]
  [Sek "Data loaded successfully"]
[Xul]`,

  '3D': `[Pop create_3d_scene]
  [Wo "threejs-container"]→[Ch'en container]
  [Yax container]→[Sek init_threejs]→[Ch'en scene]
  [Wo "#16f2aa"]→[Ch'en color]
  [Wo 1]→[Ch'en size]
  [Yax scene]→[Sek create_cube]
  [Yax color]→[Sek create_cube]
  [Yax size]→[Sek create_cube]→[Ch'en cube]
[Xul]`,

  'ANIMATION': `[K'ayab' rotation_animation]
  [Yax cube]→[Sek rotate 0.01 0.02 0]
  [Yax scene]→[Sek render]
[Kumk'u rotation_animation]`,

  'FUNCTION': `[Pop new_function]
  # Add your code here
  [Sek "Function executed"]
[Xul]`,

  'LOOP': `[K'ayab' my_loop]
  # Loop body
[Kumk'u my_loop]`
};

// Demo code
const DEMO_CODE = `[Pop main_application]
  [Muwan setup_interface]
  [Muwan init_3d_scene]
  [Muwan start_animation]
[Xul]

[Pop setup_interface]
  [Wo "app-container"]→[Ch'en container]
  [Wo "<div class='dashboard'><h2>K'uhul 3D Dashboard</h2><div id='info'>Initializing...</div></div>"]→[Ch'en html]
  [Yax container]→[Sek create_element]
  [Yax html]→[Sek create_element]→[Ch'en dashboard]
[Xul]

[Pop init_3d_scene]
  [Wo "threejs-container"]→[Ch'en container]
  [Yax container]→[Sek init_threejs]→[Ch'en scene]

  [Wo "#16f2aa"]→[Ch'en color1]
  [Wo 0.8]→[Ch'en size1]
  [Yax scene]→[Sek create_cube]
  [Yax color1]→[Sek create_cube]
  [Yax size1]→[Sek create_cube]→[Ch'en cube1]

  [Wo "#00f5ff"]→[Ch'en color2]
  [Wo 0.6]→[Ch'en size2]
  [Yax scene]→[Sek create_cube]
  [Yax color2]→[Sek create_cube]
  [Yax size2]→[Sek create_cube]→[Ch'en cube2]

  [Sek "3D scene initialized"]
[Xul]

[Pop start_animation]
  [K'ayab' render_loop]
    [Yax cube1]→[Sek rotate 0.01 0.02 0]
    [Yax cube2]→[Sek rotate 0.02 0.01 0.01]
    [Yax scene]→[Sek render]
  [Kumk'u render_loop]
[Xul]`;

// Event handlers
function addBlock(type) {
  const source = document.getElementById('kuhulSource');
  const template = BLOCK_TEMPLATES[type] || BLOCK_TEMPLATES['FUNCTION'];
  source.value += '\n\n' + template;
}

document.getElementById('btnCompile').addEventListener('click', () => {
  const source = document.getElementById('kuhulSource').value;
  const result = compiler.compile(source);

  const output = document.getElementById('compilationOutput');

  if (result.success) {
    output.textContent = `✅ COMPILATION SUCCESS!

Bytecode Size: ${result.stats.bytecodeSize} bytes
Functions: ${result.ast.functions.map(f => f.name).join(', ')}
Tokens: ${result.stats.tokenCount}
Compile Time: ${result.stats.compileTime}ms

Ready for execution.`;

    // Update stats
    document.getElementById('bytecode-size').textContent = result.stats.bytecodeSize;
    document.getElementById('function-count').textContent = result.stats.functionCount;
    document.getElementById('operation-count').textContent = result.stats.tokenCount;
  } else {
    output.textContent = `❌ COMPILATION ERROR:

${result.error}

${result.stack || ''}`;
  }
});

document.getElementById('btnExecute').addEventListener('click', async () => {
  const source = document.getElementById('kuhulSource').value;
  const result = compiler.compile(source);

  if (result.success) {
    // Clear logs and preview
    document.getElementById('executionLog').innerHTML = '';
    document.getElementById('preview').innerHTML = `
      <div id="app-container"></div>
      <div id="threejs-container"></div>
    `;

    // Execute
    const execResult = await vm.execute(result.bytecode);

    // Update execution time
    document.getElementById('execution-time').textContent = execResult.executionTime + 'ms';
  } else {
    alert('Compilation failed. Please fix errors first.');
  }
});

document.getElementById('btnLoadDemo').addEventListener('click', () => {
  document.getElementById('kuhulSource').value = DEMO_CODE;
});

document.getElementById('btnClear').addEventListener('click', () => {
  if (confirm('Clear all code?')) {
    document.getElementById('kuhulSource').value = '';
    document.getElementById('compilationOutput').textContent = 'Ready to compile...';
    document.getElementById('executionLog').innerHTML = '<div>Waiting for execution...</div>';
  }
});

document.getElementById('btnExport').addEventListener('click', () => {
  const source = document.getElementById('kuhulSource').value;
  const blob = new Blob([source], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kuhul-program.txt';
  a.click();
  URL.revokeObjectURL(url);
});

console.log('✅ K\'uhul Studio initialized');
