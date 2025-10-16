import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createNoise3D } from 'simplex-noise';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

// --- PARÁMETROS ---
const params = {
    // Estado 1
    columns: 50, rows: 60, noise_period: 3, base_amp: 5,
    bass_reactivity: 250.0, amp_smoothing: 0.1,
    audio_index_low: 1, audio_index_high: 10,
    // Estados 1, 2, 4 (Bloom)
    exposure: 1, bloom_threshold: 0, bloom_strength: 0.2, bloom_radius: 0.2,
    // Estado 3
    freqFactor: 0.03, amplitudeFactor: 0.2, pointSize: 3, rotationSpeed: 0.5,
    // Estado 4
    tunnel_radius: 3, tunnel_noise_amp: 0.5, tunnel_speed: 0.8, tunnel_point_size: 0.03
};
let estadoActual = 1; // Estado inicial

// --- VARIABLES GLOBALES ---
let scene, cameraPersp, cameraOrtho, activeCamera, renderer, controls, clock, socket;
let lines = [];
let display_amp = params.base_amp;
const noise3D = createNoise3D();
let analyser, listener;
let systems = [];
const BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);
const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
const materials = {};
let bloomComposer, finalComposer;
let frameCount = 0;

// --- Variables para ESTADO 3 (puntos desde imagen) ---
let points = [];
const ptsPerRing = 200;
const numRings = 60;
const minR = 0;
const maxR = 300;
let imageDataForPoints = null;
let orthoSize = { width: 600, height: 600 };
let orthoTextureLoaded = false;

// --- VARIABLES PARA ESTADO 4 ---
let tubes = [];

// ---------- utilidades de bloom ----------
function darkenNonBloomed(obj) {
    if ((obj.isLine || obj.isMesh || obj.isPoints) && bloomLayer.test(obj.layers) === false) {
        materials[obj.uuid] = obj.material;
        obj.material = darkMaterial;
    }
}
function restoreMaterial(obj) {
    if (materials[obj.uuid]) {
        obj.material = materials[obj.uuid];
        delete materials[obj.uuid];
    }
}

// ---------- regenerateLines (para estado 1) ----------
function regenerateLines() {
    console.log(`[LOG 3] --- Iniciando regenerateLines() ---`);
    console.log(`         Valores actuales: params.columns=${params.columns}, params.rows=${params.rows}`);

    lines.forEach(line => {
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
        scene.remove(line);
    });
    lines = [];

    const material = new THREE.LineBasicMaterial({ color: 0x96c8ff });
    for (let i = 0; i < params.columns; i++) {
        const pointsArr = [];
        for (let j = 0; j < params.rows; j++) { pointsArr.push(new THREE.Vector3(0, 0, 0)); }
        const geometry = new THREE.BufferGeometry().setFromPoints(pointsArr);
        const line = new THREE.Line(geometry, material);
        line.layers.enable(BLOOM_SCENE);
        lines.push(line);
        scene.add(line);
    }
    console.log(`[LOG 4] --- Finalizado regenerateLines(). ${lines.length} líneas nuevas creadas. ---`);
}

// ---------- Postprocessing ----------
function setupPostprocessing() {
    const renderScene = new RenderPass(scene, activeCamera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    const mixPass = new ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: null },
                bloomTexture: { value: bloomComposer.renderTarget2.texture }
            },
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
            fragmentShader: `uniform sampler2D baseTexture; uniform sampler2D bloomTexture; varying vec2 vUv; void main() { gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) ); }`
        }), 'baseTexture'
    );
    mixPass.needsSwap = true;
    const outputPass = new OutputPass();
    finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderScene);
    finalComposer.addPass(mixPass);
    finalComposer.addPass(outputPass);
}

// ---------- Sistema de partículas (estado 2) ----------
class Particle {
  constructor(x, y) {
    const geometry = new THREE.SphereGeometry(1.5, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.layers.enable(BLOOM_SCENE);
    this.mesh.position.set(x, y, 0);
    this.pos = new THREE.Vector3(x, y, 0);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.acc = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(0.05);
    this.life = 255;
    this.done = false;
  }
  update() {
    this.life -= 2;
    if (this.life < 0) { this.done = true; return; }
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.mesh.position.copy(this.pos);
    const hue = mapValue(this.life, 255, 0, 240, 170) / 360;
    let alpha = mapValue(this.life, 128, 0, 1.0, 0.0);
    alpha = Math.max(0, Math.min(alpha, 1.0));
    this.mesh.material.color.setHSL(hue, 1.0, 0.5);
    this.mesh.material.opacity = alpha;
  }
  destroy() {
    if (this.mesh.geometry) this.mesh.geometry.dispose();
    if (this.mesh.material) this.mesh.material.dispose();
    scene.remove(this.mesh);
  }
}
class System {
  constructor(x, y) {
    this.origin = new THREE.Vector2(x, y);
    this.particles = [];
    this.num = 50;
    for (let i = 0; i < this.num; i++) {
      const p = new Particle(this.origin.x, this.origin.y);
      this.particles.push(p);
      scene.add(p.mesh);
    }
    this.done = false;
  }
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      if (p.done) { p.destroy(); this.particles.splice(i, 1); }
    }
    if (this.particles.length === 0) this.done = true;
  }
}

// ---------- Limpieza ----------
function cleanupScene() {
    console.log("--- Limpiando la escena para el cambio de estado ---");
    // Limpiar líneas (estado 1)
    lines.forEach(line => {
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
        scene.remove(line);
    });
    lines = [];

    // Limpiar los sistemas de partículas (estado 2)
    systems.forEach(system => {
        system.particles.forEach(particle => { particle.destroy(); });
    });
    systems = [];

    // Limpiar puntos (estado 3)
    points.forEach(pt => {
        if (pt.geometry) pt.geometry.dispose();
        if (pt.material) pt.material.dispose();
        scene.remove(pt);
    });
    points = [];
    imageDataForPoints = null;
    orthoTextureLoaded = false;
    
    // Limpiar túneles (estado 4)
    tubes.forEach(tube => {
        scene.remove(tube.points);
        if (tube.points.children.length > 0) {
            const doorway = tube.points.children[0];
            if (doorway.geometry) doorway.geometry.dispose();
            if (doorway.material) doorway.material.dispose();
        }
        if (tube.points.geometry) tube.points.geometry.dispose();
        if (tube.points.material) tube.points.material.dispose();
    });
    tubes = [];
}

// ---------- FUNCIONES PARA ESTADO 3 (puntos desde imagen) ----------
function createPointsFromImage(texture) {
    const image = texture.image;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    tempCtx.drawImage(image, 0, 0);
    imageDataForPoints = tempCtx.getImageData(0, 0, image.width, image.height).data;

    const pointGeometry = new THREE.CircleGeometry(1, 8);

    for (let i = 0; i < numRings; i++) {
        let r = minR + ((maxR - minR) / numRings) * i;
        for (let j = 0; j < ptsPerRing; j++) {
            const pointMaterial = new THREE.MeshBasicMaterial({ transparent: true });
            const point = new THREE.Mesh(pointGeometry, pointMaterial);
            point.userData = {
                radius: r,
                initialAngle: (Math.PI * 2 / ptsPerRing) * j,
                imgWidth: image.width,
                imgHeight: image.height
            };
            points.push(point);
            scene.add(point);
        }
    }
    orthoTextureLoaded = true;
}

function updateState3(dt) {
    if (!orthoTextureLoaded || points.length === 0) return;
    const elapsedTime = clock.getElapsedTime();
    const startColor = new THREE.Color(0x0000ff);
    const endColor = new THREE.Color(0x00ffee);

    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const { radius, initialAngle, imgWidth, imgHeight } = point.userData;
        const distortedAngle = initialAngle + params.amplitudeFactor * Math.sin(params.freqFactor * radius + elapsedTime * params.rotationSpeed);
        const x = radius * Math.cos(distortedAngle);
        const y = radius * Math.sin(distortedAngle);
        point.position.set(x, y, 0);

        const repeatX = 1;
        const sampleX = Math.floor(((initialAngle * repeatX) % (Math.PI * 2)) / (Math.PI * 2) * imgWidth);
        const repeatY = 2;
        const sampleY = Math.floor((((radius - minR) / (maxR - minR)) * repeatY) % 1.0 * imgHeight);

        const sx = Math.max(0, Math.min(imgWidth - 1, sampleX));
        const sy = Math.max(0, Math.min(imgHeight - 1, sampleY));
        const pixelIndex = (sy * imgWidth + sx) * 4;
        const redValue = imageDataForPoints ? imageDataForPoints[pixelIndex] : 0;
        const shapeSize = mapValue(redValue, 0, 255, 0, params.pointSize);
        point.scale.set(shapeSize, shapeSize, 1);

        const amount = mapValue(x, -300, 300, 0, 1);
        point.material.color.copy(startColor).lerp(endColor, amount);
        point.visible = shapeSize > 0.05;
    }
}

// --- Lógica del Túnel (ESTADO 4) ---
const tunnelBaseParams = {
    tubeLength: 200,
    noisefreq: 0.1,
    hueNoiseFreq: 0.005
};

function getTube(index) {
    const tubeGeo = new THREE.CylinderGeometry(params.tunnel_radius, params.tunnel_radius, tunnelBaseParams.tubeLength, 128, 4096, true);
    const tubeVerts = tubeGeo.attributes.position;
    const colors = [];
    const noise = new ImprovedNoise();
    let p = new THREE.Vector3();
    let v3 = new THREE.Vector3();
    const color = new THREE.Color();

    for (let i = 0; i < tubeVerts.count; i += 1) {
        p.fromBufferAttribute(tubeVerts, i);
        v3.copy(p);
        let vertexNoise = noise.noise(v3.x * tunnelBaseParams.noisefreq, v3.y * tunnelBaseParams.noisefreq, v3.z);
        v3.addScaledVector(p, vertexNoise * params.tunnel_noise_amp);
        tubeVerts.setXYZ(i, v3.x, p.y, v3.z);

        let colorNoise = noise.noise(v3.x * tunnelBaseParams.hueNoiseFreq, v3.y * tunnelBaseParams.hueNoiseFreq, i * 0.001 * tunnelBaseParams.hueNoiseFreq);
        color.setHSL(0.5 - colorNoise, 1, 0.5);
        colors.push(color.r, color.g, color.b);
    }

    const tubeMat = new THREE.PointsMaterial({ size: params.tunnel_point_size, vertexColors: true });
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", tubeVerts);
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    
    const points = new THREE.Points(geo, tubeMat);
    points.rotation.x = Math.PI * 0.5;
    points.position.z = -tunnelBaseParams.tubeLength * index;
    points.layers.enable(BLOOM_SCENE);

    const doorwayGeo = new THREE.TorusGeometry(params.tunnel_radius, 4, 15, 200);
    const doorwayMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15,
        blending: THREE.AdditiveBlending,
        transparent: true,
    });
    const doorway = new THREE.Points(doorwayGeo, doorwayMat);
    doorway.rotation.x = Math.PI * 0.5;
    doorway.position.y = tunnelBaseParams.tubeLength / 2;
    doorway.layers.enable(BLOOM_SCENE);
    points.add(doorway);

    function update() {
        points.position.z += params.tunnel_speed;
        if (points.position.z > tunnelBaseParams.tubeLength) {
            points.position.z = -tunnelBaseParams.tubeLength;
        }
    }
    return { points, update };
}


function setupState4() {
    console.log("--- Configurando Estado 4: Túnel ---");
    cleanupScene(); // Asegura limpieza antes de crear nuevos tubos
    scene.fog = new THREE.FogExp2(0x000000, 0.025);
    tubes = [getTube(0), getTube(1)];
    scene.add(tubes[0].points, tubes[1].points);
    
    cameraPersp.position.set(0, 0, 15);
    controls.target.set(0, 0, 0);
    controls.enabled = false;
}

// ---------- Inicialización unificada ----------
function init() {
    clock = new THREE.Clock();
    const container = document.getElementById('container') || document.body;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    cameraPersp = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    cameraPersp.position.set(0, 150, 600);

    const w = orthoSize.width;
    const h = orthoSize.height;
    cameraOrtho = new THREE.OrthographicCamera(w / -2, w / 2, h / 2, h / -2, -1000, 1000);
    cameraOrtho.position.z = 10;

    activeCamera = cameraPersp;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(cameraPersp, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 50;
    controls.maxDistance = 2000;
    controls.maxPolarAngle = Math.PI / 2 + 0.3;

    regenerateLines();
    setupPostprocessing();

    window.addEventListener('resize', handleResize);
    document.body.addEventListener('click', startAudio, { once: true });

    socket = io();
    socket.on('connect', () => {
        console.log('🖼️  Visuals client conectado');
        socket.emit('messageClienteVisuales');
    });

    socket.on('slider_changed', (data) => {
        if (params.hasOwnProperty(data.label)) {
            const oldValue = params[data.label];
            params[data.label] = data.value;

            if ((data.label === 'columns' || data.label === 'rows') && data.value !== oldValue) {
                regenerateLines();
            }
            // Si cambia un parámetro del túnel, se regenera
            if (data.label.startsWith('tunnel_') && data.value !== oldValue) {
                if (estadoActual === 4) {
                    setupState4(); 
                }
            }
        }
    });

    const baseColumns = 50; 

    socket.on('state1_update_count', (userCount) => {
        const newColumnCount = baseColumns + userCount;

        if (params.columns !== newColumnCount) {
            console.log(`Usuarios activos: ${userCount}. Actualizando columnas a: ${newColumnCount}`);
            params.columns = newColumnCount;
            regenerateLines();
        }
    });

    socket.on('cambio_estado', (data) => {
        if (estadoActual === data) return;
        console.warn(`Cambiando de estado ${estadoActual} a ${data}`);
        
        scene.fog = null;
        controls.enabled = true;
        cleanupScene();
        
        estadoActual = data;

        if (estadoActual == 1) {
            activeCamera = cameraPersp;
            cameraPersp.position.set(0, 150, 600);
            controls.target.set(0, 0, 0);
            regenerateLines();
            updateComposerCamera(activeCamera);
        } else if (estadoActual == 2) {
            activeCamera = cameraPersp;
            cameraPersp.position.set(0, 150, 600);
            controls.target.set(0, 0, 0);
            updateComposerCamera(activeCamera);
        } else if (estadoActual == 3) {
            activeCamera = cameraOrtho;
            controls.enabled = false;
            updateComposerCamera(activeCamera);
            loadImageAndCreatePoints('BE.png');
        } else if (estadoActual == 4) {
            activeCamera = cameraPersp;
            setupState4();
            updateComposerCamera(activeCamera);
        }
    });
}

function updateComposerCamera(cam) {
    if (bloomComposer) bloomComposer.passes.forEach(pass => {
        if (pass instanceof RenderPass) pass.camera = cam;
    });
    if (finalComposer) finalComposer.passes.forEach(pass => {
        if (pass instanceof RenderPass) pass.camera = cam;
    });
}

// ---------- animate unificado ----------
function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();


    let normalizedLevel = 0;
        if (analyser) {
            const data = analyser.getFrequencyData();
            const lowIndex = params.audio_index_low;
            const highIndex = params.audio_index_high;
            let bassTotal = 0;
            for (let i = lowIndex; i <= highIndex; i++) { bassTotal += data[i]; }
            const bassLevel = (bassTotal / (highIndex - lowIndex + 1)) || 0;
            normalizedLevel = mapValue(bassLevel, 0, 255, 0, 1);
        }
        const target_amp = params.base_amp + (params.bass_reactivity * normalizedLevel);
        display_amp = THREE.MathUtils.lerp(display_amp, target_amp, params.amp_smoothing);
    if (bloomComposer) {
        const bloomPass = bloomComposer.passes[1];
        bloomPass.threshold = params.bloom_threshold;
        bloomPass.strength = params.bloom_strength;
        bloomPass.radius = params.bloom_radius;
        renderer.toneMappingExposure = Math.pow(params.exposure+(estadoActual==4?0.05:0.02)* (display_amp / 5), 4.0);
    }
    if (estadoActual == 1) {
        frameCount++;
        if (frameCount % 300 === 0) {
            console.info(`[LOG 5 - Animate Check] Estado actual: lines.length=${lines.length}, params.columns=${params.columns}`);
        }
        
        const time = clock.getElapsedTime();
        const sceneWidth = 1200;
        const sceneHeight = 800;
        lines.forEach((line, i) => {
            if (!line.geometry.attributes.position) return;
            const positions = line.geometry.attributes.position;
            for (let j = 0; j < params.rows; j++) {
                if (j < positions.count) {
                    const x = mapValue(i, 0, params.columns - 1, -sceneWidth / 2, sceneWidth / 2);
                    const y = mapValue(j, 0, params.rows - 1, -sceneHeight / 2, sceneHeight / 2);
                    const cornerY = 200;
                    let finalY, finalZ;
                    if (y < cornerY) { finalY = y; finalZ = 0; } else { finalY = cornerY; finalZ = (y - cornerY) * 2; }
                    const noiseScale = 1 / params.noise_period;
                    const noiseValue = noise3D(i * noiseScale, j * noiseScale, time);
                    const offsetX = mapValue(noiseValue, -1, 1, -1, 1) * (display_amp / 5);
                    positions.setXYZ(j, x + offsetX, finalY, finalZ);
                }
            }
            positions.needsUpdate = true;
        });
        controls.update();
        scene.traverse(darkenNonBloomed);
        bloomComposer.render();
        scene.traverse(restoreMaterial);
        finalComposer.render();
    } else if (estadoActual == 2) {
        if (Math.random() < 0.05) systems.push(new System(0, 0));
        for (let i = systems.length - 1; i >= 0; i--) {
            systems[i].update();
            if (systems[i].done) systems.splice(i, 1);
        }
        controls.update();
        scene.traverse(darkenNonBloomed);
        bloomComposer.render();
        scene.traverse(restoreMaterial);
        finalComposer.render();
    } else if (estadoActual == 3) {
        updateState3(dt);
        // El estado 3 no usa post-procesamiento por defecto, renderiza directo.
        renderer.render(scene, activeCamera);
    } else if (estadoActual == 4) {
        tubes.forEach((tb) => tb.update());
        // La cámara ahora es estática
        controls.update();
        scene.traverse(darkenNonBloomed);
        bloomComposer.render();
        scene.traverse(restoreMaterial);
        finalComposer.render();
    }
}

// ---------- Resize ----------
function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    cameraPersp.aspect = width / height;
    cameraPersp.updateProjectionMatrix();

    orthoSize.width = Math.min(800, width);
    orthoSize.height = Math.min(800, height);
    cameraOrtho.left = orthoSize.width / -2;
    cameraOrtho.right = orthoSize.width / 2;
    cameraOrtho.top = orthoSize.height / 2;
    cameraOrtho.bottom = orthoSize.height / -2;
    cameraOrtho.updateProjectionMatrix();

    renderer.setSize(width, height);
    if (bloomComposer) bloomComposer.setSize(width, height);
    if (finalComposer) finalComposer.setSize(width, height);
}

// ---------- util ----------
function mapValue(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

// ---------- Audio ----------
function startAudio() {
    listener = new THREE.AudioListener();
    cameraPersp.add(listener);
    const audio = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('song.mp3', function(buffer) {
        audio.setBuffer(buffer);
        audio.setLoop(true);
        audio.setVolume(0.5);
        audio.play();
        analyser = new THREE.AudioAnalyser(audio, 512);
    });
}

// ---------- Carga de imagen para estado 3 ----------
function loadImageAndCreatePoints(url) {
    const loader = new THREE.TextureLoader();
    loader.load(url, (texture) => {
        console.log('Imagen cargada para ESTADO 3:', url);
        createPointsFromImage(texture);
    }, undefined, (err) => {
        console.error('Error cargando imagen para estado 3:', err);
    });
}

// ---------- Lanzamiento ----------
init();
animate();