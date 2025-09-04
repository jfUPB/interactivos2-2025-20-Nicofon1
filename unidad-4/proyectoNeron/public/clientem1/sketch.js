// mobile.js (CORREGIDO para botones en móvil)

// ... (todo el código hasta los eventos de usuario es igual) ...
let socket;
let estado = "1";
let mobileId = null;
let uiG;
let btnSI = null, btnNO = null, btnTap = null;
let capture, frameG, stillImg, shattered = false, shards = [], stars = [];
const CFG = { cols: 2, rows: 2, jitter: 0.35, burstMin: 110, burstMax: 240, spinMax: 1.2, zSpread: 160 };
let pressBox = { x: 0, y: 0, w: 260, h: 80 }, isPressing = false;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  uiG = createGraphics(windowWidth, windowHeight);
  uiG.textFont('monospace');
  socket = io();
  socket.on('connect', () => console.log('mobile connected'));
  socket.on('whoami', (me) => { mobileId = me.id; });
  socket.on('message_controller', (data) => { try { const prevState = estado; estado = JSON.parse(data); if (prevState !== estado) onStateChange(estado); } catch (e) { console.error("Error parsing state:", e); } });
  onStateChange(estado);
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); if(uiG)uiG.resizeCanvas(windowWidth,windowHeight); if(frameG)frameG.resizeCanvas(width,height); if(estado==="3")centerPressBox(); actualizarUIPositions(); }
function onStateChange(newState) { console.log("Cambiando a estado:", newState); actualizarUI(); switch (newState) { case "2": shattered = false; shards = []; setupShatterIfNeeded(); break; case "3": isPressing = false; centerPressBox(); break; } }
function setupShatterIfNeeded() { if (!capture) { capture = createCapture({ video: { facingMode: "user" }, audio: false }); capture.size(640, 480); capture.hide(); for (let i = 0; i < 120; i++) { stars.push({ x: random(-width*1.5, width*1.5), y: random(-height*1.5, height*1.5), z: random(-1500, -200), tw: random(0.5, 2.2), ph: random(TAU) }); } } if (!frameG || frameG.width !== width || frameG.height !== height) { frameG = createGraphics(width, height); } }
function draw() { background(0); uiG.clear(); switch (estado) { case "1": drawState1(); break; case "2": drawState2(); break; case "3": drawState3(); break; case "4": drawState4(); break; case "5": drawUIOverlay('Fase 5 - Observa la pantalla principal'); break; default: drawUIOverlay('Esperando estado…'); } push(); resetMatrix(); image(uiG, -width/2, -height/2); pop(); }
function drawState1() { drawUIOverlay('¿Alguna vez te has sentido subestimado?'); }
function drawState2() { const dt=deltaTime/1000; if(!shattered){paintVideoToBuffer(frameG);push();noStroke();texture(frameG);plane(width,height);pop();drawUIOverlay('Toca para ROMPER');}else{drawStars();for(const s of shards){s.update(dt);s.draw(stillImg);} drawUIOverlay('R para reiniciar');} }
function drawState3() { uiG.push();uiG.background(0);const {x,y,w,h}=pressBox;uiG.noStroke();uiG.fill(isPressing?'#1e293bcc':'#334155cc');uiG.rectMode(CORNER);uiG.rect(x,y,w,h,16);uiG.fill(255);uiG.textAlign(CENTER,CENTER);uiG.textSize(16);uiG.text('Pulsa para conectarte',x+w/2,y+h/2);uiG.pop(); }
function drawState4() { drawUIOverlay('Tapea la pantalla al ritmo de la canción'); }
function actualizarUI() { if (btnSI) { btnSI.remove(); btnSI = null; } if (btnNO) { btnNO.remove(); btnNO = null; } if (btnTap) { btnTap.remove(); btnTap = null; } if (estado === "1") { btnSI = createButton("SI"); styleButton(btnSI, "#b2ffb1ff"); btnSI.mousePressed(() => handleAnswerClick(true)); btnNO = createButton("NO"); styleButton(btnNO, "#ffb1b1ff"); btnNO.mousePressed(() => handleAnswerClick(false)); } else if (estado === "4") { btnTap = createButton("TAP"); styleButton(btnTap, "#d1d1d1ff"); btnTap.style('padding', '28px 28px'); btnTap.mousePressed(() => socket.emit('tap_mobile', true)); } actualizarUIPositions(); }
function actualizarUIPositions() { if(btnSI&&btnNO){const totalWidth=btnSI.width+btnNO.width+20;btnSI.position(width/2-totalWidth/2,height/2);btnNO.position(btnSI.x+btnSI.width+20,height/2);} if(btnTap){btnTap.center();} }
function handleAnswerClick(answer) { socket.emit('answer_mobile', answer); if (btnSI) { btnSI.attribute('disabled', '').style('background-color', '#ccc').style('filter', ''); } if (btnNO) { btnNO.attribute('disabled', '').style('background-color', '#ccc').style('filter', ''); } }
function styleButton(btn,colorBase){btn.style('padding','15px 28px').style('border-radius','12px').style('border','none').style('background',colorBase).style('color','#000000').style('font-family','Trechet MS, sans-serif').style('font-size','18px').style('font-weight','bold').style('box-shadow','2px 4px 8px rgba(0,0,0,0.5)').style('cursor','pointer').mouseOver(()=>btn.style('filter','brightness(1.2)')).mouseOut(()=>btn.style('filter','brightness(1)'));}

// ================== EVENTOS DE USUARIO (CORREGIDOS) ==================

function touchStarted() {
  // CAMBIO: Si el estado NO es 2 o 3, salimos de la función inmediatamente.
  // Esto permite que el toque llegue a los botones DOM.
  if (estado !== "2" && estado !== "3") {
    return true; // Permite que el evento continúe
  }

  const touchX = touches.length > 0 ? touches[0].x : mouseX;
  const touchY = touches.length > 0 ? touches[0].y : mouseY;

  if (estado === "2" && !shattered) {
    // ... la lógica del shatter no cambia ...
    if (!capture || capture.width === 0) return;
    paintVideoToBuffer(frameG);
    stillImg = frameG.get();
    if (!stillImg || stillImg.width === 0) return;
    const click = createVector(touchX - width / 2, touchY - height / 2);
    shards = makeShards(click);
    shattered = true;
    const dataURL = frameG.canvas.toDataURL('image/jpeg', 0.8);
    const payload = { mobileId: mobileId || 'unknown', frame: { dataURL, w: width, h: height }, shards: shards.map(s => ({ pos: { x: s.pos.x, y: s.pos.y, z: s.pos.z }, vel: { x: s.vel.x, y: s.vel.y, z: s.vel.z }, axis: { x: s.axis.x, y: s.axis.y, z: s.axis.z }, spin: s.spin, verts: s.verts.map(v => ({ x: v.x, y: v.y })), uvs: s.uvs.map(u => ({ x: u.x, y: u.y })) })) };
    socket.emit('phase_shatter', payload);
    return false;
  }

  if (estado === "3") {
    // ... la lógica de presionar no cambia ...
    const { x, y, w, h } = pressBox;
    if (touchX >= x && touchX <= x + w && touchY >= y && touchY <= y + h) {
      isPressing = true;
      socket.emit('destello_press', { mobileId, pressing: true });
    }
    return false;
  }
}

function touchEnded() {
  // CAMBIO: Añadimos un chequeo similar aquí para ser consistentes.
  if (estado !== "3") {
    return;
  }

  if (isPressing) { // Ya sabemos que el estado es 3 por el chequeo anterior
    isPressing = false;
    socket.emit('destello_press', { mobileId, pressing: false });
  }
  return false;
}

// ... (El resto del código, helpers, clases, etc., no cambia) ...
function keyPressed() { if(estado==="2"&&(key==='r'||key==='R')){shattered=false;shards=[];} }
function centerPressBox() { pressBox.w=min(260,width*0.7); pressBox.h=80; pressBox.x=(width-pressBox.w)/2; pressBox.y=(height-pressBox.h)/2; }
function drawUIOverlay(msg) { uiG.push(); uiG.fill(255); uiG.noStroke(); uiG.textSize(18); uiG.textAlign(CENTER,TOP); uiG.text(msg,width/2,20); uiG.pop(); }
function paintVideoToBuffer(g){if(!capture||capture.width<=1){g.background(20,0,30);return;} g.push();g.clear();g.imageMode(CENTER);const cw=g.width,ch=g.height;const videoAspect=capture.width/capture.height;const canvasAspect=cw/ch;let dw,dh;if(videoAspect>canvasAspect){dh=ch;dw=dh*videoAspect;}else{dw=cw;dh=dw/videoAspect;} g.translate(cw/2,ch/2);g.scale(-1,1);g.image(capture,0,0,dw,dh);g.pop();}
function drawStars() { push(); noStroke(); fill(255); for (const s of stars) { const twinkle = 0.6 + 0.4 * sin(millis() * 0.001 + s.ph); push(); translate(s.x, s.y, s.z); rectMode(CENTER); rect(0, 0, s.tw * twinkle, s.tw * twinkle); pop(); } pop(); }
function makeShards(click) { const triangles = []; const cols = CFG.cols, rows = CFG.rows; const jBase = Math.min(width / cols, height / rows) * CFG.jitter; const pts = new Array((cols + 1) * (rows + 1)); for (let j = 0; j <= rows; j++) { for (let i = 0; i <= cols; i++) { const x = map(i, 0, cols, -width / 2, width / 2); const y = map(j, 0, rows, -height / 2, height / 2); pts[j * (cols + 1) + i] = createVector(x + randomGaussian(0, jBase), y + randomGaussian(0, jBase), 0); } } for (let j = 0; j < rows; j++) { for (let i = 0; i < cols; i++) { const p00 = pts[j * (cols + 1) + i], p10 = pts[j * (cols + 1) + (i + 1)], p01 = pts[(j + 1) * (cols + 1) + i], p11 = pts[(j + 1) * (cols + 1) + (i + 1)]; if (noise(i * 0.1, j * 0.1) < 0.5) { triangles.push([p00, p10, p11]); triangles.push([p00, p11, p01]); } else { triangles.push([p00, p10, p01]); triangles.push([p10, p11, p01]); } } } return triangles.map(([pA, pB, pC]) => { const cx = (pA.x + pB.x + pC.x) / 3, cy = (pA.y + pB.y + pC.y) / 3; const pos = createVector(cx, cy, random(-CFG.zSpread, CFG.zSpread)); const radial = createVector(cx - click.x, cy - click.y).normalize(); const vel = p5.Vector.mult(radial, random(CFG.burstMin, CFG.burstMax)).add(p5.Vector.random3D().mult(40)); const axis = p5.Vector.random3D(); const spin = random(-CFG.spinMax, CFG.spinMax); const v0 = p5.Vector.sub(pA, pos), v1 = p5.Vector.sub(pB, pos), v2 = p5.Vector.sub(pC, pos); const uv0 = createVector(map(pA.x, -width / 2, width / 2, 0, 1), map(pA.y, -height / 2, height / 2, 0, 1)); const uv1 = createVector(map(pB.x, -width / 2, width / 2, 0, 1), map(pB.y, -height / 2, height / 2, 0, 1)); const uv2 = createVector(map(pC.x, -width / 2, width / 2, 0, 1), map(pC.y, -height / 2, height / 2, 0, 1)); return new Shard(pos, vel, axis, spin, [v0, v1, v2], [uv0, uv1, uv2]); }); }
class Shard { constructor(pos, vel, axis, spin, verts, uvs) { this.pos = pos.copy(); this.vel = vel.copy(); this.axis = axis.copy(); this.spin = spin; this.angle = 0; this.verts = verts.map(v => v.copy()); this.uvs = uvs.map(u => u.copy()); this.drag = 0.985; } update(dt) { this.pos.add(p5.Vector.mult(this.vel, dt)); this.vel.mult(pow(this.drag, max(1, dt * 60))); this.angle += this.spin * dt; } draw(img) { push(); translate(this.pos.x, this.pos.y, this.pos.z); const a = this.axis.copy().normalize(), up = createVector(0, 0, 1); const q = quatFromUnitVecs(up, a); applyQuaternion(q); rotateZ(this.angle); applyQuaternion(quatConjugate(q)); textureMode(NORMAL); noStroke(); texture(img); beginShape(); vertex(this.verts[0].x, this.verts[0].y, 0, this.uvs[0].x, this.uvs[0].y); vertex(this.verts[1].x, this.verts[1].y, 0, this.uvs[1].x, this.uvs[1].y); vertex(this.verts[2].x, this.verts[2].y, 0, this.uvs[2].x, this.uvs[2].y); endShape(CLOSE); pop(); } }
function quat(w,x,y,z){return {w,x,y,z};} function quatFromUnitVecs(a,b){const v=createVector(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);const d=a.x*b.x+a.y*b.y+a.z*b.z;const w=Math.sqrt((1+d)*0.5);const s=1/(2*w);if(!isFinite(s))return quat(1,0,0,0);return quat(w,v.x*s,v.y*s,v.z*s);} function quatConjugate(q){return quat(q.w,-q.x,-q.y,-q.z);} function applyQuaternion(q){const {w,x,y,z}=q;const m=[1-2*y*y-2*z*z,2*x*y-2*z*w,2*x*z+2*y*w,0,2*x*y+2*z*w,1-2*x*x-2*z*z,2*y*z-2*x*w,0,2*x*z-2*y*w,2*y*z+2*x*w,1-2*x*x-2*y*y,0,0,0,0,1];applyMatrix(...m);}