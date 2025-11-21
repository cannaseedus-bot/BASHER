/**
 * K'UHUL THREE.JS RENDER ENGINE
 *
 * Complete 3D rendering engine with symbolic Maya-inspired programming language.
 * Integrates Three.js, DOM manipulation, and networking into a unified visual
 * programming system.
 *
 * Architecture:
 * - KuhulThreeJSEngine: Core Three.js scene management
 * - KuhulNetworking: REST API and HTTP operations
 * - KuhulDOM: DOM manipulation and event handling
 * - KuhulFullStackCompiler: Symbolic code → bytecode compiler
 * - KuhulFullStackVM: Bytecode execution engine
 * - KuhulThreeJSBridge: High-level API interface
 */

// =============================================================================
// K'UHUL THREE.JS ENGINE - Core 3D Scene Management
// =============================================================================

class KuhulThreeJSEngine {
    constructor() {
        this.scenes = new Map();
        this.meshes = new Map();
        this.animations = new Map();
        this.containers = new Map();
        this.renderers = new Map();

        this.initEngine();
    }

    initEngine() {
        console.log('🎮 K\'UHUL THREE.JS ENGINE INITIALIZED');
        this.setupDefaultScene();
    }

    setupDefaultScene() {
        // Default scene for immediate rendering
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x0a0a1a, 1); // K'UHUL dark theme
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.scenes.set('default', { scene, camera, renderer, objects: [] });
        this.renderers.set('default', renderer);

        // Add lighting
        this.setupLighting(scene);

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    setupLighting(scene) {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // K'UHUL accent lights
        const pointLight1 = new THREE.PointLight(0x16f2aa, 0.5, 100); // Primary
        pointLight1.position.set(25, 25, 25);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x9966ff, 0.3, 100); // Accent
        pointLight2.position.set(-25, -25, 25);
        scene.add(pointLight2);
    }

    // K'UHUL SYMBOLIC COMMAND PROCESSOR
    processKuhulCommand(command) {
        const [pop, operation, ...args] = command.split('→');

        switch(operation.trim()) {
            case 'Sek init_threejs':
                return this.initThreeJS(args[0]);
            case 'Sek create_text_3d':
                return this.create3DText(args[0], args[1]);
            case 'Sek rotate':
                return this.rotateMesh(args[0], args[1], args[2], args[3]);
            case 'Sek render':
                return this.renderScene(args[0]);
            case 'Sek add_geometry':
                return this.addGeometry(args[0], args[1], args[2]);
            case 'Sek add_light':
                return this.addLight(args[0], args[1]);
            case 'Sek set_camera':
                return this.setCamera(args[0], args[1], args[2]);
            default:
                console.warn(`Unknown K'UHUL operation: ${operation}`);
        }
    }

    // K'UHUL COMMAND IMPLEMENTATIONS
    initThreeJS(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return null;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x070b12, 1); // K'UHUL panel color
        container.appendChild(renderer.domElement);

        const sceneObj = { scene, camera, renderer, objects: [] };
        this.scenes.set(containerId, sceneObj);
        this.containers.set(containerId, container);
        this.renderers.set(containerId, renderer);

        // Setup lighting for this scene
        this.setupLighting(scene);

        // Position camera
        camera.position.z = 5;

        console.log(`✅ K'UHUL Three.js initialized in ${containerId}`);
        return sceneObj;
    }

    create3DText(text, options = {}) {
        const {
            font = 'Arial',
            size = 1,
            height = 0.1,
            color = 0x16f2aa,
            bevelEnabled = true,
            container = 'default'
        } = options;

        const sceneData = this.scenes.get(container);
        if (!sceneData) {
            console.error(`Scene ${container} not found`);
            return null;
        }

        // Create text geometry (simplified - in reality would need font loader)
        const geometry = new THREE.BoxGeometry(size, size * 0.6, height);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 100,
            specular: 0x222222
        });

        const textMesh = new THREE.Mesh(geometry, material);
        textMesh.castShadow = true;
        textMesh.receiveShadow = true;

        // Add wireframe for K'UHUL aesthetic
        const wireframe = new THREE.WireframeGeometry(geometry);
        const line = new THREE.LineSegments(wireframe);
        line.material.color.set(0x00e0ff); // K'UHUL secondary
        textMesh.add(line);

        sceneData.scene.add(textMesh);
        sceneData.objects.push(textMesh);

        const meshId = `text_${Date.now()}`;
        this.meshes.set(meshId, textMesh);

        return textMesh;
    }

    rotateMesh(meshId, x = 0, y = 0.01, z = 0) {
        const mesh = this.meshes.get(meshId);
        if (mesh) {
            mesh.rotation.x += parseFloat(x);
            mesh.rotation.y += parseFloat(y);
            mesh.rotation.z += parseFloat(z);
            return true;
        }
        return false;
    }

    renderScene(containerId = 'default') {
        const sceneData = this.scenes.get(containerId);
        if (sceneData) {
            sceneData.renderer.render(sceneData.scene, sceneData.camera);
            return true;
        }
        return false;
    }

    addGeometry(type, options = {}, container = 'default') {
        const sceneData = this.scenes.get(container);
        if (!sceneData) return null;

        let geometry;
        let material;

        switch(type) {
            case 'cube':
                geometry = new THREE.BoxGeometry(
                    options.size || 1,
                    options.size || 1,
                    options.size || 1
                );
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(
                    options.radius || 1,
                    options.segments || 32,
                    options.segments || 32
                );
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(
                    options.radius || 1,
                    options.tube || 0.4,
                    options.radialSegments || 16,
                    options.tubularSegments || 100
                );
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(
                    options.radiusTop || 0.5,
                    options.radiusBottom || 0.5,
                    options.height || 1,
                    options.segments || 32
                );
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(
                    options.radius || 0.5,
                    options.height || 1,
                    options.segments || 32
                );
                break;
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
        }

        material = new THREE.MeshPhongMaterial({
            color: options.color || 0x16f2aa,
            transparent: options.transparent || false,
            opacity: options.opacity || 1.0,
            wireframe: options.wireframe || false,
            shininess: options.shininess || 100
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (options.position) {
            mesh.position.set(
                options.position.x || 0,
                options.position.y || 0,
                options.position.z || 0
            );
        }

        if (options.rotation) {
            mesh.rotation.set(
                options.rotation.x || 0,
                options.rotation.y || 0,
                options.rotation.z || 0
            );
        }

        sceneData.scene.add(mesh);
        sceneData.objects.push(mesh);

        const meshId = `mesh_${type}_${Date.now()}`;
        this.meshes.set(meshId, mesh);

        return { id: meshId, mesh };
    }

    addLight(type, options = {}, container = 'default') {
        const sceneData = this.scenes.get(container);
        if (!sceneData) return null;

        let light;
        switch(type) {
            case 'point':
                light = new THREE.PointLight(
                    options.color || 0xffffff,
                    options.intensity || 1,
                    options.distance || 100
                );
                break;
            case 'directional':
                light = new THREE.DirectionalLight(
                    options.color || 0xffffff,
                    options.intensity || 1
                );
                if (options.castShadow) {
                    light.castShadow = true;
                    light.shadow.mapSize.width = 2048;
                    light.shadow.mapSize.height = 2048;
                }
                break;
            case 'ambient':
                light = new THREE.AmbientLight(
                    options.color || 0x404040,
                    options.intensity || 0.6
                );
                break;
            case 'spot':
                light = new THREE.SpotLight(
                    options.color || 0xffffff,
                    options.intensity || 1,
                    options.distance || 100,
                    options.angle || Math.PI / 4
                );
                break;
            default:
                light = new THREE.AmbientLight(0x404040, 0.6);
        }

        if (options.position) {
            light.position.set(
                options.position.x || 0,
                options.position.y || 0,
                options.position.z || 0
            );
        }

        sceneData.scene.add(light);
        return light;
    }

    setCamera(position, lookAt = null, container = 'default') {
        const sceneData = this.scenes.get(container);
        if (!sceneData) return false;

        sceneData.camera.position.set(
            position.x || 0,
            position.y || 0,
            position.z || 5
        );

        if (lookAt) {
            sceneData.camera.lookAt(
                new THREE.Vector3(lookAt.x || 0, lookAt.y || 0, lookAt.z || 0)
            );
        }

        return true;
    }

    // ANIMATION SYSTEM
    startAnimation(animationId, callback, container = 'default') {
        const animate = () => {
            if (this.animations.has(animationId)) {
                callback();
                this.renderScene(container);
                requestAnimationFrame(animate);
            }
        };

        this.animations.set(animationId, true);
        animate();

        return animationId;
    }

    stopAnimation(animationId) {
        this.animations.delete(animationId);
    }

    // K'UHUL SYMBOLIC ANIMATION BUILDER
    createKuhulAnimation(commands, container = 'default') {
        const animationId = `kuhul_anim_${Date.now()}`;

        this.startAnimation(animationId, () => {
            commands.forEach(cmd => {
                this.processKuhulCommand(cmd);
            });
        }, container);

        return animationId;
    }

    handleResize() {
        this.scenes.forEach((sceneData, containerId) => {
            if (containerId === 'default') {
                sceneData.camera.aspect = window.innerWidth / window.innerHeight;
                sceneData.camera.updateProjectionMatrix();
                sceneData.renderer.setSize(window.innerWidth, window.innerHeight);
            } else {
                const container = this.containers.get(containerId);
                if (container) {
                    sceneData.camera.aspect = container.clientWidth / container.clientHeight;
                    sceneData.camera.updateProjectionMatrix();
                    sceneData.renderer.setSize(container.clientWidth, container.clientHeight);
                }
            }
        });
    }

    // K'UHUL SYMBOLIC INTERFACE
    executeKuhulScript(script) {
        const lines = script.split('\n').filter(line => line.trim());

        lines.forEach(line => {
            try {
                this.processKuhulCommand(line);
            } catch (error) {
                console.error(`K'UHUL script error: ${error}`, line);
            }
        });
    }
}

// =============================================================================
// K'UHUL NETWORKING ENGINE - REST API & HTTP Operations
// =============================================================================

class KuhulNetworking {
    constructor() {
        this.cache = new Map();
    }

    async httpRequest(url, method = 'GET', headers = {}) {
        try {
            const response = await fetch(url, { method, headers });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.text();
        } catch (error) {
            return `ERROR: ${error.message}`;
        }
    }

    jsonParse(data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return { error: "Invalid JSON" };
        }
    }
}

// =============================================================================
// K'UHUL DOM ENGINE - DOM Manipulation & Event Handling
// =============================================================================

class KuhulDOM {
    constructor() {
        this.elements = new Map();
        this.eventHandlers = new Map();
    }

    createElement(containerId, html) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        container.innerHTML = html;
        return container;
    }

    updateContent(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = content;
        }
    }

    addEvent(element, eventType, selector, handlerName) {
        const container = typeof element === 'string' ? document.getElementById(element) : element;
        if (!container) return;

        container.addEventListener('click', (e) => {
            if (e.target.matches(selector)) {
                this.eventHandlers.get(handlerName)?.();
            }
        });
    }

    registerHandler(name, handler) {
        this.eventHandlers.set(name, handler);
    }
}

// =============================================================================
// K'UHUL THREE.JS BRIDGE - Symbolic Language Interface
// =============================================================================

class KuhulThreeJSBridge {
    constructor() {
        this.engine = new KuhulThreeJSEngine();
        this.networking = new KuhulNetworking();
        this.dom = new KuhulDOM();
        this.symbolTable = new Map();
    }

    // PROCESS YOUR K'UHUL SYMBOLIC CODE
    processSymbolicCode(symbolicCode) {
        const tokens = this.parseSymbolicTokens(symbolicCode);
        return this.executeTokens(tokens);
    }

    parseSymbolicTokens(code) {
        // Parse [Pop X]→[Wo Y]→[Ch'en Z] syntax
        const tokenRegex = /\[([^\]]+)\]/g;
        const tokens = [];
        let match;

        while ((match = tokenRegex.exec(code)) !== null) {
            tokens.push(match[1].trim());
        }

        return tokens;
    }

    executeTokens(tokens) {
        const results = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const [command, ...args] = token.split(' ');

            switch(command) {
                case 'Pop':
                    // Population/creation command
                    const target = tokens[i + 1]?.split(' ')[1]?.replace(/"/g, '');
                    results.push(this.handlePopCommand(args[0], target));
                    break;

                case 'Wo':
                    // Object assignment
                    this.symbolTable.set(args[0], args[1]?.replace(/"/g, ''));
                    break;

                case 'Ch\'en':
                    // Channel/connection
                    const from = this.symbolTable.get(args[0]);
                    const to = args[1]?.replace(/"/g, '');
                    results.push(this.handleChenCommand(from, to));
                    break;

                case 'Yax':
                    // Green/activation
                    results.push(this.handleYaxCommand(args[0]));
                    break;

                case 'Sek':
                    // Light/action
                    results.push(this.handleSekCommand(args[0], args.slice(1)));
                    break;

                case 'K\'ayab\'':
                    // Animation start
                    results.push(this.handleKayabCommand());
                    break;

                case 'Kumk\'u':
                    // Animation end/loop
                    results.push(this.handleKumkuCommand(args[0]));
                    break;

                case 'Xul':
                    // End/return
                    return results;
            }
        }

        return results;
    }

    handlePopCommand(type, target) {
        switch(type) {
            case 'render_3d_text':
                return this.engine.create3DText(target, { color: 0x16f2aa });
            default:
                return this.engine.addGeometry('cube', { color: 0x16f2aa });
        }
    }

    handleChenCommand(from, to) {
        // Connect objects in 3D space
        console.log(`Connecting ${from} to ${to}`);
        return { connected: true, from, to };
    }

    handleYaxCommand(target) {
        // Activate/start animation
        return this.engine.startAnimation(`anim_${target}`, () => {
            // Default rotation animation
            this.engine.rotateMesh(target, 0, 0.01, 0);
        });
    }

    handleSekCommand(action, args) {
        switch(action) {
            case 'init_threejs':
                return this.engine.initThreeJS(args[0]);
            case 'create_text_3d':
                return this.engine.create3DText(args[0], { color: 0x16f2aa });
            case 'rotate':
                return this.engine.rotateMesh(args[0], args[1], args[2], args[3]);
            case 'render':
                return this.engine.renderScene(args[0]);
            default:
                return this.engine.processKuhulCommand(`Sek ${action}→${args.join('→')}`);
        }
    }

    handleKayabCommand() {
        return { animation: 'started' };
    }

    handleKumkuCommand(target) {
        return this.engine.stopAnimation(target);
    }
}

// =============================================================================
// GLOBAL EXPORTS
// =============================================================================

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        KuhulThreeJSEngine,
        KuhulNetworking,
        KuhulDOM,
        KuhulThreeJSBridge
    };
}

// Global browser instance
if (typeof window !== 'undefined') {
    window.KuhulThreeJSEngine = KuhulThreeJSEngine;
    window.KuhulNetworking = KuhulNetworking;
    window.KuhulDOM = KuhulDOM;
    window.KuhulThreeJSBridge = KuhulThreeJSBridge;

    // Auto-initialize
    window.Kuhul3D = new KuhulThreeJSBridge();

    console.log('✅ K\'UHUL THREE.JS ENGINE LOADED');
}
