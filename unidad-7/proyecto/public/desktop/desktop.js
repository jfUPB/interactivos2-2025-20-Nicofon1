import * as THREE from "https://cdn.skypack.dev/three@0.133.1";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import { ImprovedNoise } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/math/ImprovedNoise.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.set(0, 0, 15);
const renderer = new THREE.WebGLRenderer({ antialias: true });
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000000, 0.025);
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const radius = 3;
const tubeLength = 200;
const tubeGeo = new THREE.CylinderGeometry(radius, radius, tubeLength, 128, 4096, true);
const tubeVerts = tubeGeo.attributes.position;
const colors = [];
const noise = new ImprovedNoise();
let p = new THREE.Vector3();
let v3 = new THREE.Vector3();
const noisefreq = 0.1;
const noiseAmp = 0.5;
const color = new THREE.Color();
const hueNoiseFreq = 0.005;

// La creación de la geometría del túnel no cambia
for (let i = 0; i < tubeVerts.count; i += 1) {
  p.fromBufferAttribute(tubeVerts, i);
  v3.copy(p);
  let vertexNoise = noise.noise(v3.x * noisefreq, v3.y * noisefreq, v3.z);
  v3.addScaledVector(p, vertexNoise * noiseAmp);
  tubeVerts.setXYZ(i, v3.x, p.y, v3.z);
  
  let colorNoise = noise.noise(v3.x * hueNoiseFreq, v3.y * hueNoiseFreq, i * 0.001 * hueNoiseFreq);
  color.setHSL(0.5 - colorNoise, 1, 0.5);
  colors.push(color.r, color.g, color.b);
}

const tubeMat = new THREE.PointsMaterial({ size: 0.03, vertexColors: true });

function getTube(index) {
  const startPosZ =  -tubeLength * index;
  const endPosZ = tubeLength;
  const resetPosZ =  -tubeLength;

  // Crear el cuerpo del túnel
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", tubeVerts);
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const points = new THREE.Points(geo, tubeMat);
  points.rotation.x = Math.PI * 0.5; // El túnel se rota para alinearse con el eje Z
  points.position.z = startPosZ;
  
  // Crear el anillo conector
  const doorwayGeo = new THREE.TorusGeometry(radius, 4, 15, 200);
  const doorwayMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      blending: THREE.AdditiveBlending, // Mantenemos esto para que el anillo se vea brillante
      transparent: true,
  });
  const doorway = new THREE.Points(doorwayGeo, doorwayMat);
  
  // --- LA CORRECCIÓN CLAVE ESTÁ AQUÍ ---
  // Rotamos el anillo 90 grados en su propio eje X para "ponerlo de pie"
  // ANTES de que sea añadido al túnel padre. Esto alinea su orientación
  // con la del túnel, evitando que se forme la "cruz".
  doorway.rotation.x = Math.PI * 0.5;
  
  // Posicionamos el anillo en el borde frontal del cilindro (en su espacio local)
  doorway.position.y = tubeLength / 2;

  // Hacemos el anillo "hijo" del túnel para que se mueva y rote con él.
  points.add(doorway);

  const speed = 0.2;
  function update() {
    points.position.z += speed;
    if (points.position.z > endPosZ) {
      points.position.z = resetPosZ;
    }
  }

  // Devolvemos el objeto padre que contiene tanto el túnel como su anillo conector.
  return { points, update };
}

const tubes = [getTube(0), getTube(1)]; 
scene.add(tubes[0].points, tubes[1].points);

function animate(t) {
  requestAnimationFrame(animate);
  
  // Actualizamos los tubos. Sus anillos hijos se actualizarán automáticamente.
  tubes.forEach((tb) => tb.update());
  
  // La animación de la cámara no cambia.
  camera.position.x = Math.cos(t * 0.001) * 1.5;
  camera.position.y = Math.sin(t * 0.001) * 1.5;

  controls.update();
  
  // Usamos el renderizador simple, sin post-procesamiento.
  renderer.render(scene, camera);
}

animate(0);

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);