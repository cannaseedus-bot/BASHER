/**
 * K'UHUL SVG-3D LANGUAGE RUNTIME
 *
 * Revolutionary vector-native programming language that uses SVG primitives
 * as the foundation for spatial programming, encryption, compression, and
 * neural network operations.
 *
 * Core Systems:
 * - ASC Cipher: Vector-based encryption using SVG path commands
 * - SCX Compression: Geometric compression using spatial relationships
 * - 3D Control Flow: Spatial programming constructs
 * - Neural Vector Ops: AI operations on vector primitives
 */

class KuhulSVG3DLanguage {
    constructor() {
        this.svgCanvas = document.getElementById('kuhul-svg-demo');
        this.outputConsole = document.getElementById('output-console');
        this.operations = new Map();
        this.vectorMemory = new Map();
        this.initializeRuntime();
    }

    initializeRuntime() {
        this.log('SYSTEM', 'K\'UHUL SVG-3D Language Runtime Initialized');

        // Initialize ASC Cipher primitives
        this.initializeASCCipher();

        // Initialize SCX Compression
        this.initializeSCXCompression();

        // Initialize 3D Control Flow
        this.initialize3DControlFlow();

        // Initialize Neural Vector Operations
        this.initializeNeuralVectorOps();
    }

    // =============================================================================
    // ASC CIPHER SYSTEM
    // =============================================================================

    initializeASCCipher() {
        // ASC Cipher: Vector-based encryption
        this.operations.set('(⤍)', this.vectorEncrypt.bind(this));
        this.operations.set('(⤎)', this.vectorDecrypt.bind(this));
        this.operations.set('(⤏)', this.pathKeyDerivation.bind(this));
        this.operations.set('(⤐)', this.bezierCryptography.bind(this));

        this.log('ASC-CIPHER', 'Vector encryption primitives loaded');
    }

    vectorEncrypt(data, pathKey) {
        this.log('ASC-ENCRYPT', `Encrypting data with path: ${pathKey.substring(0, 30)}...`);

        // Create visual encryption effect
        this.createEncryptionVisualization(pathKey);

        // Simulate vector encryption
        const encrypted = this.pathBasedXOR(data, pathKey);
        this.vectorMemory.set('encrypted.data', encrypted);

        return encrypted;
    }

    vectorDecrypt(encryptedData, pathKey) {
        this.log('ASC-DECRYPT', `Decrypting data with path: ${pathKey.substring(0, 30)}...`);

        // Create visual decryption effect
        this.createDecryptionVisualization(pathKey);

        // Simulate vector decryption
        const decrypted = this.pathBasedXOR(encryptedData, pathKey);
        this.vectorMemory.set('decrypted.data', decrypted);

        return decrypted;
    }

    pathKeyDerivation(sourcePath) {
        this.log('ASC-KEY', 'Deriving encryption key from path');

        // Extract geometric properties as key material
        const points = this.extractPathPoints(sourcePath);
        const distances = this.calculateDistances(points);
        const angles = this.calculateAngles(points);

        return {
            geometric: true,
            points: points.length,
            avgDistance: distances.reduce((a, b) => a + b, 0) / distances.length,
            avgAngle: angles.reduce((a, b) => a + b, 0) / angles.length
        };
    }

    bezierCryptography(data, controlPoints) {
        this.log('ASC-BEZIER', 'Applying Bezier curve cryptography');

        // Use Bezier control points as encryption parameters
        const key = controlPoints.map(p => p.x * p.y).reduce((a, b) => a + b, 0);
        return this.simpleXOR(data, key.toString());
    }

    pathBasedXOR(data, path) {
        // Simplified path-based encryption
        let result = '';
        const pathHash = this.hashPath(path);

        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i);
            const keyChar = pathHash.charCodeAt(i % pathHash.length);
            result += String.fromCharCode(charCode ^ keyChar);
        }

        return result;
    }

    simpleXOR(data, key) {
        let result = '';
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i);
            const keyChar = key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode ^ keyChar);
        }
        return result;
    }

    hashPath(path) {
        // Create hash from SVG path
        let hash = 0;
        for (let i = 0; i < path.length; i++) {
            hash = ((hash << 5) - hash) + path.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    extractPathPoints(path) {
        // Simplified point extraction from SVG path
        const matches = path.match(/[\d.-]+/g);
        const points = [];

        if (matches) {
            for (let i = 0; i < matches.length; i += 2) {
                if (matches[i + 1]) {
                    points.push({
                        x: parseFloat(matches[i]),
                        y: parseFloat(matches[i + 1])
                    });
                }
            }
        }

        return points;
    }

    calculateDistances(points) {
        const distances = [];
        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i - 1].x;
            const dy = points[i].y - points[i - 1].y;
            distances.push(Math.sqrt(dx * dx + dy * dy));
        }
        return distances;
    }

    calculateAngles(points) {
        const angles = [];
        for (let i = 1; i < points.length - 1; i++) {
            const dx1 = points[i].x - points[i - 1].x;
            const dy1 = points[i].y - points[i - 1].y;
            const dx2 = points[i + 1].x - points[i].x;
            const dy2 = points[i + 1].y - points[i].y;

            const angle1 = Math.atan2(dy1, dx1);
            const angle2 = Math.atan2(dy2, dx2);
            angles.push(angle2 - angle1);
        }
        return angles;
    }

    // =============================================================================
    // SCX COMPRESSION SYSTEM
    // =============================================================================

    initializeSCXCompression() {
        // SCX Compression: Geometric data compression
        this.operations.set('(↻)', this.rotationalCompression.bind(this));
        this.operations.set('(↔)', this.symmetricalCompression.bind(this));
        this.operations.set('(⤒)', this.hierarchicalCompression.bind(this));
        this.operations.set('(⤓)', this.progressiveDetail.bind(this));

        this.log('SCX-COMPRESS', 'Geometric compression algorithms initialized');
    }

    rotationalCompression(geometry, angle) {
        this.log('SCX-COMPRESS', `Applying rotational compression: ${angle}°`);

        // Create compression visualization
        this.createCompressionVisualization('rotational', angle);

        // Simulate geometric compression
        const compressed = this.compressByRotation(geometry, angle);
        return compressed;
    }

    symmetricalCompression(geometry, symmetryPlane) {
        this.log('SCX-COMPRESS', `Applying symmetrical compression: ${symmetryPlane}`);

        // Create symmetry visualization
        this.createSymmetryVisualization(symmetryPlane);

        // Simulate symmetry-based compression
        const compressed = this.compressBySymmetry(geometry, symmetryPlane);
        return compressed;
    }

    hierarchicalCompression(geometry, levels) {
        this.log('SCX-COMPRESS', `Applying hierarchical compression: ${levels} levels`);

        // Create multi-level compression
        let compressed = geometry;
        for (let i = 0; i < levels; i++) {
            compressed = this.compressLevel(compressed, i + 1);
        }

        return {
            original: geometry,
            compressed: compressed,
            levels: levels,
            ratio: geometry.size / compressed.size
        };
    }

    progressiveDetail(geometry, adaptiveLevel) {
        this.log('SCX-COMPRESS', `Applying progressive detail: level ${adaptiveLevel}`);

        // Adaptive detail based on importance
        return {
            original: geometry,
            detail: adaptiveLevel,
            optimized: geometry.complexity / adaptiveLevel
        };
    }

    compressByRotation(geometry, angle) {
        // Simplified rotational compression
        const compressionRatio = Math.abs(Math.sin(angle * Math.PI / 180));
        return {
            original: geometry,
            compressed: { ...geometry, size: Math.floor(geometry.size * compressionRatio) },
            ratio: compressionRatio,
            angle: angle
        };
    }

    compressBySymmetry(geometry, plane) {
        // Simplified symmetry compression
        return {
            original: geometry,
            compressed: { ...geometry, size: Math.floor(geometry.size / 2) },
            ratio: 0.5,
            symmetry: plane
        };
    }

    compressLevel(geometry, level) {
        // Hierarchical level compression
        const factor = Math.pow(0.8, level);
        return {
            ...geometry,
            size: Math.floor(geometry.size * factor),
            level: level
        };
    }

    // =============================================================================
    // 3D CONTROL FLOW SYSTEM
    // =============================================================================

    initialize3DControlFlow() {
        // 3D Control Flow: Spatial programming constructs
        this.operations.set('(⟲)', this.sphericalLoop.bind(this));
        this.operations.set('(⤦)', this.vectorConditional.bind(this));
        this.operations.set('(⤧)', this.pathIteration.bind(this));
        this.operations.set('(⤨)', this.gradientFlowControl.bind(this));

        this.log('3D-CONTROL', 'Spatial control flow operators ready');
    }

    sphericalLoop(radius, degrees, callback) {
        this.log('3D-CONTROL', `Executing spherical loop: radius=${radius}, degrees=${degrees}`);

        // Create spherical visualization
        this.createSphericalVisualization(radius, degrees);

        // Execute callback at spherical coordinates
        const steps = Math.floor(degrees / 15); // 15-degree steps
        for (let i = 0; i < steps; i++) {
            const angle = (i * 15) * Math.PI / 180;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);

            if (callback) {
                callback(x, y, angle);
            }
        }
    }

    vectorConditional(condition, trueCallback, falseCallback) {
        this.log('3D-CONTROL', `Vector conditional evaluation: ${condition}`);

        // Create conditional visualization
        this.createConditionalVisualization(condition);

        // Execute based on vector condition
        if (this.evaluateVectorCondition(condition)) {
            return trueCallback ? trueCallback() : null;
        } else {
            return falseCallback ? falseCallback() : null;
        }
    }

    pathIteration(path, steps, callback) {
        this.log('3D-CONTROL', `Path iteration: ${steps} steps`);

        // Iterate along path
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const point = this.getPointOnPath(path, t);

            if (callback) {
                callback(point, t, i);
            }
        }
    }

    gradientFlowControl(gradient, threshold) {
        this.log('3D-CONTROL', `Gradient flow control: threshold=${threshold}`);

        // Flow control based on gradient
        return {
            gradient: gradient,
            threshold: threshold,
            flow: gradient > threshold
        };
    }

    evaluateVectorCondition(condition) {
        // Simplified vector condition evaluation
        return condition.includes('visible') || Math.random() > 0.3;
    }

    getPointOnPath(path, t) {
        // Simplified point on path calculation
        const points = this.extractPathPoints(path);
        const index = Math.floor(t * (points.length - 1));
        return points[index] || points[0];
    }

    // =============================================================================
    // NEURAL VECTOR OPERATIONS
    // =============================================================================

    initializeNeuralVectorOps() {
        // Neural Vector Operations: AI + Vector graphics
        this.operations.set('(⟿)', this.neuralPathGeneration.bind(this));
        this.operations.set('(⤂)', this.weightVectorApplication.bind(this));
        this.operations.set('(⤃)', this.activationShapeMorph.bind(this));
        this.operations.set('(⤄)', this.gradientBackpropagation.bind(this));

        this.log('NEURAL-VECTOR', 'Neural vector operations initialized');
    }

    neuralPathGeneration(input) {
        this.log('NEURAL-VECTOR', `Generating neural path for: ${input}`);

        // Create neural path visualization
        this.createNeuralPathVisualization(input);

        // Generate path using neural-like algorithm
        const path = this.generateNeuralPath(input);
        return path;
    }

    generateNeuralPath(input) {
        // Neural-like path generation
        const complexity = Math.min(input.length * 10, 100);
        let path = `M${Math.random() * 100},${Math.random() * 100}`;

        for (let i = 0; i < complexity; i += 20) {
            const x = Math.random() * 300;
            const y = Math.random() * 200;

            if (Math.random() > 0.5) {
                // Curve
                const cx1 = Math.random() * 300;
                const cy1 = Math.random() * 200;
                const cx2 = Math.random() * 300;
                const cy2 = Math.random() * 200;
                path += ` C${cx1},${cy1} ${cx2},${cy2} ${x},${y}`;
            } else {
                // Line
                path += ` L${x},${y}`;
            }
        }

        return path;
    }

    weightVectorApplication(weights, geometry) {
        this.log('NEURAL-VECTOR', `Applying ${weights.length} weight vectors to geometry`);

        // Create weight application visualization
        this.createWeightApplicationVisualization(weights);

        // Simulate weight application
        const transformed = this.applyWeightsToGeometry(weights, geometry);
        return transformed;
    }

    applyWeightsToGeometry(weights, geometry) {
        // Simplified weight application
        const weightSum = weights.reduce((a, b) => a + b, 0);
        const weightAvg = weightSum / weights.length;

        return {
            original: geometry,
            weighted: {
                ...geometry,
                complexity: Math.floor(geometry.complexity * weightAvg)
            },
            weights: weights.length,
            avgWeight: weightAvg
        };
    }

    activationShapeMorph(shape, activationFunction) {
        this.log('NEURAL-VECTOR', `Morphing shape with activation: ${activationFunction}`);

        // Morph shape based on activation function
        return {
            original: shape,
            morphed: this.applyActivation(shape, activationFunction),
            activation: activationFunction
        };
    }

    applyActivation(shape, func) {
        // Simplified activation application
        const factor = func === 'relu' ? Math.max(0, shape.value) :
                      func === 'sigmoid' ? 1 / (1 + Math.exp(-shape.value)) :
                      shape.value;

        return {
            ...shape,
            value: factor
        };
    }

    gradientBackpropagation(error, learningRate) {
        this.log('NEURAL-VECTOR', `Backpropagating gradients: lr=${learningRate}`);

        // Simulate gradient backpropagation
        return {
            error: error,
            learningRate: learningRate,
            gradient: error * learningRate
        };
    }

    // =============================================================================
    // VISUALIZATION METHODS
    // =============================================================================

    createEncryptionVisualization(pathKey) {
        this.clearSVG();

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathKey);
        path.setAttribute('stroke', '#16f2aa');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('filter', 'url(#glow-effect)');
        path.setAttribute('stroke-dasharray', '100');

        // Add animation
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'stroke-dashoffset');
        animate.setAttribute('from', '0');
        animate.setAttribute('to', '200');
        animate.setAttribute('dur', '2s');
        animate.setAttribute('repeatCount', 'indefinite');
        path.appendChild(animate);

        this.svgCanvas.appendChild(path);
    }

    createDecryptionVisualization(pathKey) {
        this.clearSVG();

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathKey);
        path.setAttribute('stroke', '#00e0ff');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('filter', 'url(#glow-effect)');
        path.setAttribute('stroke-dasharray', '100');

        // Reverse animation
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'stroke-dashoffset');
        animate.setAttribute('from', '200');
        animate.setAttribute('to', '0');
        animate.setAttribute('dur', '2s');
        animate.setAttribute('repeatCount', 'indefinite');
        path.appendChild(animate);

        this.svgCanvas.appendChild(path);
    }

    createCompressionVisualization(type, parameter) {
        this.clearSVG();

        if (type === 'rotational') {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '200');
            circle.setAttribute('cy', '150');
            circle.setAttribute('r', '50');
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', '#9966ff');
            circle.setAttribute('stroke-width', '2');

            // Rotation animation
            const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
            animate.setAttribute('attributeName', 'transform');
            animate.setAttribute('type', 'rotate');
            animate.setAttribute('from', `0 200 150`);
            animate.setAttribute('to', `${parameter} 200 150`);
            animate.setAttribute('dur', '3s');
            animate.setAttribute('repeatCount', 'indefinite');
            circle.appendChild(animate);

            this.svgCanvas.appendChild(circle);

            // Add inner circles showing compression
            for (let r = 40; r > 10; r -= 10) {
                const inner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                inner.setAttribute('cx', '200');
                inner.setAttribute('cy', '150');
                inner.setAttribute('r', r.toString());
                inner.setAttribute('fill', 'none');
                inner.setAttribute('stroke', '#9966ff');
                inner.setAttribute('stroke-width', '1');
                inner.setAttribute('opacity', String(r / 50));
                this.svgCanvas.appendChild(inner);
            }
        }
    }

    createSymmetryVisualization(symmetryPlane) {
        this.clearSVG();

        // Draw symmetry line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        if (symmetryPlane === 'vertical') {
            line.setAttribute('x1', '200');
            line.setAttribute('y1', '0');
            line.setAttribute('x2', '200');
            line.setAttribute('y2', '300');
        } else {
            line.setAttribute('x1', '0');
            line.setAttribute('y1', '150');
            line.setAttribute('x2', '400');
            line.setAttribute('y2', '150');
        }
        line.setAttribute('stroke', '#ffaa00');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '5,5');
        this.svgCanvas.appendChild(line);

        // Add symmetric shapes
        const shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shape.setAttribute('x', '150');
        shape.setAttribute('y', '100');
        shape.setAttribute('width', '40');
        shape.setAttribute('height', '60');
        shape.setAttribute('fill', 'url(#demo-gradient)');
        shape.setAttribute('opacity', '0.7');
        this.svgCanvas.appendChild(shape);

        const mirror = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        if (symmetryPlane === 'vertical') {
            mirror.setAttribute('x', '210');
            mirror.setAttribute('y', '100');
        } else {
            mirror.setAttribute('x', '150');
            mirror.setAttribute('y', '140');
        }
        mirror.setAttribute('width', '40');
        mirror.setAttribute('height', '60');
        mirror.setAttribute('fill', 'url(#demo-gradient)');
        mirror.setAttribute('opacity', '0.7');
        this.svgCanvas.appendChild(mirror);
    }

    createSphericalVisualization(radius, degrees) {
        this.clearSVG();

        // Create sphere
        const sphere = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        sphere.setAttribute('cx', '200');
        sphere.setAttribute('cy', '150');
        sphere.setAttribute('r', radius.toString());
        sphere.setAttribute('fill', 'none');
        sphere.setAttribute('stroke', '#00e0ff');
        sphere.setAttribute('stroke-width', '2');
        sphere.setAttribute('stroke-dasharray', '5,5');

        this.svgCanvas.appendChild(sphere);

        // Create orbiting points
        const points = Math.min(Math.floor(degrees / 30), 12);
        for (let i = 0; i < points; i++) {
            const angle = (i * 30) * Math.PI / 180;
            const x = 200 + radius * Math.cos(angle);
            const y = 150 + radius * Math.sin(angle);

            const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            point.setAttribute('cx', x.toString());
            point.setAttribute('cy', y.toString());
            point.setAttribute('r', '3');
            point.setAttribute('fill', '#ffaa00');

            // Pulsing animation
            const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animate.setAttribute('attributeName', 'r');
            animate.setAttribute('values', '3;5;3');
            animate.setAttribute('dur', '1s');
            animate.setAttribute('repeatCount', 'indefinite');
            animate.setAttribute('begin', `${i * 0.1}s`);
            point.appendChild(animate);

            this.svgCanvas.appendChild(point);
        }
    }

    createConditionalVisualization(condition) {
        this.clearSVG();

        const result = this.evaluateVectorCondition(condition);
        const color = result ? '#00cc88' : '#ff0066';

        // Draw conditional branches
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M200,50 L200,150 M200,150 L150,250 M200,150 L250,250');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '3');
        path.setAttribute('fill', 'none');
        path.setAttribute('filter', 'url(#glow-effect)');

        this.svgCanvas.appendChild(path);

        // Highlight active branch
        const activePath = result ? 'M200,150 L250,250' : 'M200,150 L150,250';
        const active = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        active.setAttribute('d', activePath);
        active.setAttribute('stroke', color);
        active.setAttribute('stroke-width', '5');
        active.setAttribute('fill', 'none');

        this.svgCanvas.appendChild(active);
    }

    createNeuralPathVisualization(input) {
        this.clearSVG();

        const path = this.generateNeuralPath(input);
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('d', path);
        pathElement.setAttribute('stroke', '#ff0066');
        pathElement.setAttribute('stroke-width', '1.5');
        pathElement.setAttribute('fill', 'none');
        pathElement.setAttribute('filter', 'url(#glow-effect)');

        // Pulsing animation
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'opacity');
        animate.setAttribute('values', '0.3;1;0.3');
        animate.setAttribute('dur', '1.5s');
        animate.setAttribute('repeatCount', 'indefinite');
        pathElement.appendChild(animate);

        this.svgCanvas.appendChild(pathElement);
    }

    createWeightApplicationVisualization(weights) {
        this.clearSVG();

        // Draw weight vectors
        const centerX = 200;
        const centerY = 150;

        weights.forEach((weight, i) => {
            const angle = (i / weights.length) * 2 * Math.PI;
            const length = weight * 80;
            const x = centerX + length * Math.cos(angle);
            const y = centerY + length * Math.sin(angle);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', centerX.toString());
            line.setAttribute('y1', centerY.toString());
            line.setAttribute('x2', x.toString());
            line.setAttribute('y2', y.toString());
            line.setAttribute('stroke', '#9966ff');
            line.setAttribute('stroke-width', String(2 + weight * 2));

            this.svgCanvas.appendChild(line);

            // Add endpoint circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x.toString());
            circle.setAttribute('cy', y.toString());
            circle.setAttribute('r', String(3 + weight * 3));
            circle.setAttribute('fill', '#16f2aa');

            this.svgCanvas.appendChild(circle);
        });
    }

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    clearSVG() {
        // Keep defs, remove other elements
        const defs = this.svgCanvas.querySelector('defs');
        this.svgCanvas.innerHTML = '';
        if (defs) {
            this.svgCanvas.appendChild(defs);
        }
    }

    log(module, message, type = 'message') {
        if (!this.outputConsole) return;

        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';

        logEntry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span>
            <span class="log-${type}">${module}: ${message}</span>
        `;

        this.outputConsole.appendChild(logEntry);
        this.outputConsole.scrollTop = this.outputConsole.scrollHeight;
    }

    // PUBLIC API
    executeOperation(operation, ...args) {
        const opFunction = this.operations.get(operation);
        if (opFunction) {
            return opFunction(...args);
        } else {
            this.log('ERROR', `Unknown operation: ${operation}`, 'error');
            return null;
        }
    }

    getOperations() {
        return Array.from(this.operations.keys());
    }

    getVectorMemory() {
        return Array.from(this.vectorMemory.entries());
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KuhulSVG3DLanguage };
}

// Auto-initialize if window object exists
if (typeof window !== 'undefined') {
    window.KuhulSVG3DLanguage = KuhulSVG3DLanguage;
    console.log('✅ K\'UHUL SVG-3D Language Runtime loaded');
}
