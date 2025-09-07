// visuals.js (CORRECCIÓN FINAL de Transición de Color)
let socket;
let estado = "1";
let uiG;
let puntos = [];
let mobilesShatter = new Map();
let destellos = new Map();
let savedDestellosLocal = null;
let BPM = 120;
let kendrickPos = null;
let particulas = [];
let auraSize = 100, auraNoiseOffset = 0.1, auraBaseAlpha = 60;
let controllerSaturation = 200, controllerHue = 200, controllerBrightness = 150;
let phaseConfigs = { "2": {}, "3": {}, "5": {} };

// CAMBIO 1: Reemplazamos state2BgColor por variables HSB individuales.
let state2BgHue, state2BgSat, state2BgBri;
let fadeToBlackStart = 0;
const FADE_DURATION = 1500;

// ... (bpmTracker ya está eliminado, eso está bien) ...

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 255);
  uiG = createGraphics(windowWidth, windowHeight);
  uiG.textFont('monospace');
  
  // CAMBIO 2: Inicializamos las variables HSB con valores por defecto.
  state2BgHue = 255;
  state2BgSat = 255;
  state2BgBri = 255;

  socket = io();
  socket.on('connect', () => { socket.emit('messageClienteVisuales', 'Client connected to Visuales room'); });
  socket.on('message_controller', (data) => { try { const prev = estado; estado = JSON.parse(data); onStateChange(prev, estado); } catch (e) { console.error('Error parsing state:', e); } });
  socket.on('bpm_update', (newBPM) => { BPM = newBPM; });
  socket.on('answer_mobile', (data) => { if (estado === "1" && data === true) { puntos.push(new DestelloFase1(random(-width/2, width/2), random(-height/2, height/2))); } });
  socket.on('tap_mobile', (taps) => { if (estado === "4" && taps === true) { let x,y; if(random(1)>0.5){x=random(1)>0.5?-width/2:width/2;y=random(-height/2,height/2)}else{x=random(-width/2,width/2);y=random(1)>0.5?-height/2:height/2} particulas.push(new ParticulaTap(x, y)); } });
  socket.on('kendrick_position', (data) => { kendrickPos = createVector(data.x - width/2, data.y - height/2); });
  socket.on('slider_changed', (data) => { if (estado === "1" || estado === "4") { if (data.label === "saturation") controllerSaturation = data.value; else if (data.label === "hue") controllerHue = data.value; else if (data.label === "brightness") controllerBrightness = data.value; } });
  socket.on('controller_vars', ({ phase, values }) => { if (phaseConfigs[phase]) { phaseConfigs[phase].a = values[0]; phaseConfigs[phase].b = values[1]; phaseConfigs[phase].c = values[2]; } });
  socket.on('phase_shatter', (payload) => { if (estado === "2") { const { mobileId, frame, shards } = payload; loadImage(frame.dataURL, (img) => { mobilesShatter.set(mobileId, { img, shards: shards.map(s => new Shard( createVector(s.pos.x, s.pos.y, s.pos.z), createVector(s.vel.x, s.vel.y, s.vel.z), createVector(s.axis.x, s.axis.y, s.axis.z), s.spin, s.verts.map(v => createVector(v.x, v.y, 0)), s.uvs.map(u => createVector(u.x, u.y)) )) }); }); } });
  socket.on('destello_press', ({ mobileId, pressing }) => { if (estado === "3" || estado === "5") { let d = destellos.get(mobileId); if (!d) { const seed = hashTo01(mobileId); const px = map(seed, 0, 1, -width*0.45, width*0.45); const py = map(noise(seed*10),0,1,-height*0.45,height*0.45); d = new DestelloFase35(px, py); destellos.set(mobileId, d); } if (pressing) d.wakeUp(); else d.iniciarDestruccion(); } });
  socket.on('destellos_state_restore', (state) => { restoreDestellos(state); for (let d of destellos.values()) d.iniciarExpansion(); });
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); if (uiG) uiG.resizeCanvas(windowWidth, windowHeight); }

function onStateChange(prev, curr) {
  if (curr === "transicion1") { for (let d of puntos) d.iniciarExpansion(); }
  
  // CAMBIO 3: Al salir de la fase 1, guardamos los valores HSB directamente.
  if ((prev === "1" || prev === "transicion1")) {
      state2BgHue = controllerHue;
      state2BgSat = controllerSaturation;
      state2BgBri = controllerBrightness;
  }

  if (curr === "3") { fadeToBlackStart = millis(); }
  if (prev === "3" && curr !== "3") { const state = snapshotDestellos(); savedDestellosLocal = state; socket.emit('destellos_state_save', state); }
  if (curr === "5") { socket.emit('destellos_state_request'); if (savedDestellosLocal) { restoreDestellos(savedDestellosLocal); for (let d of destellos.values()) d.iniciarExpansion(); } }
}

function draw() { uiG.clear(); switch (estado) { case "1": case "transicion1": drawState1(); drawUIOverlay('Fase 1: generando destellos'); break; case "2": drawState2(); drawUIOverlay('Fase 2: fragmentos'); break; case "3": drawState3or5(false); drawUIOverlay(`Fase 3 · BPM: ${BPM}`); break; case "4": drawState4(); drawUIOverlay('Fase 4: aura y partículas'); break; case "5": drawState3or5(true); drawUIOverlay(`Fase 5 · BPM: ${BPM}`); break; default: background(0); drawUIOverlay(`Estado desconocido: ${estado}`); break; } push(); resetMatrix(); image(uiG, -width/2, -height/2); pop(); }
function drawState1() { background(20); for (let d of puntos) { d.update(); d.display(); } }

function drawState2() {
  // CAMBIO 4: Usamos los valores HSB guardados directamente en background().
  background(state2BgHue, state2BgSat, state2BgBri);
  
  const dt = deltaTime / 1000;
  const { a=0.5, b=0.5, c=0.5 } = phaseConfigs["2"];
  for (const { img, shards } of mobilesShatter.values()) {
    for (const s of shards) {
      s.update(dt * map(a, 0, 1, 0.5, 2.0));
      s.spin = map(c, 0, 1, -1.5, 1.5);
      push(); scale(map(b, 0, 1, 0.5, 1.5)); s.draw(img); pop();
    }
  }
}

function drawState3or5(isPhase5) {
  if (!isPhase5) {
      let elapsed = millis() - fadeToBlackStart;
      let startColor = color(state2BgHue, state2BgSat, state2BgBri); // Reconstruimos el color de inicio aquí para lerpColor
      if (elapsed < FADE_DURATION) {
          let fadeAmount = elapsed / FADE_DURATION;
          let bgColor = lerpColor(startColor, color(0), fadeAmount);
          background(bgColor);
      } else {
          background(0);
      }
  } else { background(0); }

  const { a=0.5, b=0.5, c=0.5 } = phaseConfigs[isPhase5 ? "5" : "3"];
  push(); resetMatrix();
  if (!isPhase5) {
    const MAX_RANGE = map(a, 0, 1, 150, 600); const BRIGHT_FACTOR = map(b, 0, 1, 0.5, 2.0); const LINE_SCALE = map(c, 0, 1, 0.5, 2.5); blendMode(ADD); const entries = Array.from(destellos.entries()); for (let i = 0; i < entries.length; i++) { for (let j = i + 1; j < entries.length; j++) { const aD = entries[i][1], bD = entries[j][1]; if (aD.expandiendo || bD.expandiendo) continue; const d2 = dist(aD.pos.x, aD.pos.y, bD.pos.x, bD.pos.y); if (d2 < MAX_RANGE) { const t = 1 - d2 / MAX_RANGE; const strength = pow(t, 1.4) * aD.life * bD.life; if (strength > 0.01) { strokeWeight(map(strength, 0, 1, 0.1, 1.1) * LINE_SCALE * 2); stroke(255, 223, 100, 180 * strength * BRIGHT_FACTOR); line(aD.pos.x, aD.pos.y, bD.pos.x, bD.pos.y); } } } }
  }
  blendMode(BLEND);
  const entries = Array.from(destellos.entries());
  for (let k = entries.length - 1; k >= 0; k--) {
    const id = entries[k][0], d = entries[k][1];
    if (isPhase5) { d.moveSpeed = map(a, 0, 1, 0.2, 2.5); d.expansionFactor = map(c, 0, 1, 2.0, 10.0); }
    d.update();
    d.show(isPhase5, b);
    if (d.terminado) destellos.delete(id);
  }
  pop();
}

// ... (El resto del código, clases, etc., no cambia) ...
function drawState4() { background(20); if (!kendrickPos) return; push(); for (let i = particulas.length - 1; i >= 0; i--) { let p = particulas[i]; p.update(); p.display(); if (p.isDead) { auraSize += 3; auraBaseAlpha += 5; particulas.splice(i, 1); } } blendMode(ADD); auraNoiseOffset += 0.005; for (let i = 0; i < 3; i++) { let layerRadius = auraSize - i * 20; let layerAlpha = auraBaseAlpha - i * 15; fill(controllerHue, controllerSaturation, controllerBrightness, layerAlpha); noStroke(); beginShape(); for (let angle = 0; angle < TWO_PI; angle += 0.1) { let xoff = map(cos(angle), -1, 1, 0, 3); let yoff = map(sin(angle), -1, 1, 0, 3); let r_noise = noise(xoff + auraNoiseOffset, yoff + auraNoiseOffset); let radius = layerRadius / 2 + r_noise * 50; let x = kendrickPos.x + radius * cos(angle); let y = kendrickPos.y + radius * sin(angle); vertex(x, y); } endShape(CLOSE); } blendMode(BLEND); pop(); }
function drawUIOverlay(msg) { uiG.push(); uiG.fill(255); uiG.noStroke(); uiG.textSize(14); uiG.textAlign(LEFT, TOP); uiG.text(msg, 16, 16); uiG.pop(); }
function snapshotDestellos() { const out = []; destellos.forEach((d, id) => { out.push({ id, pos: { x: d.pos.x, y: d.pos.y }, baseSize: d.baseSize, noiseOff: { x: d.noiseOff.x, y: d.noiseOff.y }, noiseSpeed: d.noiseSpeed, baseBrightness: d.baseBrightness }); }); return out; }
function restoreDestellos(state) { destellos.clear(); for (const item of state) { const d = new DestelloFase35(item.pos.x, item.pos.y); d.baseSize = item.baseSize; d.size = d.baseSize; d.noiseOff.set(item.noiseOff.x, item.noiseOff.y); d.noiseSpeed = item.noiseSpeed; d.baseBrightness = item.baseBrightness; d.life = 1; d.conn = 1; destellos.set(item.id, d); } }
class Shard { constructor(pos, vel, axis, spin, verts, uvs) { this.pos = pos.copy(); this.vel = vel.copy(); this.axis = axis.copy(); this.spin = spin; this.angle = 0; this.verts = verts.map(v => v.copy()); this.uvs = uvs.map(u => u.copy()); this.drag = 0.985; } update(dt) { this.pos.add(p5.Vector.mult(this.vel, dt)); this.vel.mult(pow(this.drag, max(1, dt * 60))); this.angle += this.spin * dt; } draw(img) { push(); translate(this.pos.x, this.pos.y, this.pos.z); const a = this.axis.copy().normalize(), up = createVector(0, 0, 1); const q = quatFromUnitVecs(up, a); applyQuaternion(q); rotateZ(this.angle); applyQuaternion(quatConjugate(q)); stroke(0, 50); strokeWeight(0.6); noFill(); texture(img); beginShape(); vertex(this.verts[0].x, this.verts[0].y, 0, this.uvs[0].x, this.uvs[0].y); vertex(this.verts[1].x, this.verts[1].y, 0, this.uvs[1].x, this.uvs[1].y); vertex(this.verts[2].x, this.verts[2].y, 0, this.uvs[2].x, this.uvs[2].y); endShape(CLOSE); pop(); } }
function quat(w,x,y,z){return {w,x,y,z};} function quatFromUnitVecs(a,b){const v=createVector(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);const d=a.x*b.x+a.y*b.y+a.z*b.z;const w=Math.sqrt((1+d)*0.5);const s=1/(2*w);if(!isFinite(s))return quat(1,0,0,0);return quat(w,v.x*s,v.y*s,v.z*s);} function quatConjugate(q){return quat(q.w,-q.x,-q.y,-q.z);} function applyQuaternion(q){const {w,x,y,z}=q;const m=[1-2*y*y-2*z*z,2*x*y-2*z*w,2*x*z+2*y*w,0,2*x*y+2*z*w,1-2*x*x-2*z*z,2*y*z-2*x*w,0,2*x*z-2*y*w,2*y*z+2*x*w,1-2*x*x-2*y*y,0,0,0,0,1];applyMatrix(...m);}
class DestelloFase35 { constructor(x, y) { this.pos = createVector(x, y); this.baseSize = random(6, 14) * 0.5; this.size = this.baseSize; this.noiseOff = createVector(random(10), random(10)); this.noiseSpeed = random(0.0007, 0.0025); this.baseBrightness = (180 + random(-10, 10)) * 0.7; this.life = 0; this.conn = 0; this.dying = false; this.dyingStart = 0; this.dyingDuration = 900; this.terminado = false; this.expandiendo = false; this.expStart = 0; this.expDur = 2000; this.faseExp = 0; this.flickerPhase = random(TWO_PI); this.dr = p5.Vector.random2D().mult(random(0.08, 0.4)); this.renderOpacity = 0; this.moveSpeed = 0.6; this.expansionFactor = 4.0; } wakeUp() { this.dying = false; this.terminado = false; this.expandiendo = false; this.life = min(1, this.life + 0.012); this.conn = min(1, this.conn + 0.015); } iniciarDestruccion() { if (!this.dying) { this.dying = true; this.dyingStart = millis(); this.dr.mult(0.3); } } iniciarExpansion() { if (!this.expandiendo) { this.expandiendo = true; this.expStart = millis(); } } update() { this.noiseOff.x += this.noiseSpeed; this.noiseOff.y += this.noiseSpeed * 0.8; let nx = noise(this.noiseOff.x) - 0.5, ny = noise(this.noiseOff.y) - 0.5; this.pos.x += nx * this.moveSpeed + this.dr.x; this.pos.y += ny * this.moveSpeed + this.dr.y; if (this.pos.x < -width/2-50) this.pos.x = width/2+50; if (this.pos.x > width/2+50) this.pos.x = -width/2-50; if (this.pos.y < -height/2-50) this.pos.y = height/2+50; if (this.pos.y > height/2+50) this.pos.y = -height/2-50; this.size = this.baseSize + sin(frameCount * 0.02 + this.flickerPhase) * 0.8; let baseOp = (this.baseBrightness + sin(frameCount * 0.05 + this.flickerPhase) * 25) * 0.7; if (this.dying) { let frac = constrain((millis() - this.dyingStart) / this.dyingDuration, 0, 1); this.life = 1 - frac; this.conn = max(0, 1 - frac * 1.6); if (frac >= 1) this.terminado = true; } else if (this.expandiendo) { let frac = constrain((millis() - this.expStart) / this.expDur, 0, 1); this.faseExp = frac; this.size = lerp(this.baseSize, this.baseSize * this.expansionFactor, frac); baseOp = lerp(this.baseBrightness, this.baseBrightness * 2.2, frac); if (frac < 1) { this.life = 1 - frac * 0.6; this.conn = 1 - frac * 0.6; } } else { this.life = min(1, this.life + 0.012); this.conn = min(1, this.conn + 0.015); } this.renderOpacity = baseOp * this.life; } show(isPhase5, brightness) { let intensityFactor = 1.0; if (isPhase5) { intensityFactor = map(brightness, 0, 1, 0.5, 2.5); } blendMode(ADD); for (let i = 4; i >= 1; i--) { noStroke(); let alp = (this.renderOpacity * intensityFactor) / (i * 1.8); fill(255, 223, 100, alp); ellipse(this.pos.x, this.pos.y, this.size * i * 1.1); } noStroke(); fill(255, 223, 100, this.renderOpacity * intensityFactor); ellipse(this.pos.x, this.pos.y, this.size * 0.45); blendMode(BLEND); } }
class DestelloFase1 { constructor(x,y){this.pos=createVector(x,y);this.baseSize=random(6,14)*0.5;this.size=this.baseSize;this.noiseOff=createVector(random(10),random(10));this.noiseSpeed=random(0.0007,0.0025);this.baseBrightness=(180+random(-10,10))*0.7;this.life=0;this.conn=0;this.dying=false;this.dyingStart=0;this.dyingDuration=900;this.terminado=false;this.expandiendo=false;this.expStart=0;this.expDur=2000;this.faseExp=0;this.flickerPhase=random(TWO_PI);this.dr=p5.Vector.random2D().mult(random(0.08,0.4));} iniciarExpansion(){if(!this.expandiendo&&!this.dying){this.expandiendo=true;this.expStart=millis();}} update(){this.noiseOff.x+=this.noiseSpeed;this.noiseOff.y+=this.noiseSpeed*0.8;let nx=noise(this.noiseOff.x)-0.5,ny=noise(this.noiseOff.y)-0.5;this.pos.x+=nx*0.6+this.dr.x;this.pos.y+=ny*0.6+this.dr.y;if(this.pos.x<-width/2-50)this.pos.x=width/2+50;if(this.pos.x>width/2+50)this.pos.x=-width/2-50;if(this.pos.y<-height/2-50)this.pos.y=height/2+50;if(this.pos.y>height/2+50)this.pos.y=-height/2-50;this.size=this.baseSize+sin(frameCount*0.02+this.flickerPhase)*0.8;let baseOp=(this.baseBrightness+sin(frameCount*0.05+this.flickerPhase)*25)*0.7;if(!this.dying&&!this.expandiendo){this.life=min(1,this.life+0.012);this.conn=min(1,this.conn+0.015);}else if(this.expandiendo){this.faseExp=constrain((millis()-this.expStart)/this.expDur,0,1);} this.renderOpacity=baseOp*this.life;} display(){let sizeFactor=this.expandiendo?lerp(1,150,this.faseExp):1;let intensityFactor=this.expandiendo?lerp(1,3,this.faseExp):1;blendMode(ADD);for(let i=4;i>=1;i--){noStroke();let alp=(this.renderOpacity*intensityFactor)/(i*1.8);fill(controllerHue,controllerSaturation,controllerBrightness,alp);ellipse(this.pos.x,this.pos.y,this.size*i*1.1*sizeFactor);} blendMode(BLEND);} }
class ParticulaTap { constructor(x,y){this.pos=createVector(x,y);this.vel=createVector(0,0);this.acc=createVector(0,0);this.maxSpeed=2;} applyForce(force){this.acc.add(force);} seek(target){let desired=p5.Vector.sub(target,this.pos);desired.setMag(this.maxSpeed);let steer=p5.Vector.sub(desired,this.vel);steer.limit(0.1);this.applyForce(steer);} update(){if(kendrickPos){this.seek(kendrickPos);if(this.pos.dist(kendrickPos)<auraSize/2)this.isDead=true;} this.vel.add(this.acc);this.vel.limit(this.maxSpeed);this.pos.add(this.vel);this.acc.mult(0);} display(){stroke(controllerHue,controllerSaturation,controllerBrightness);strokeWeight(random(1,10));point(this.pos.x,this.pos.y);} }
function hashTo01(str) { let h = 0; for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i); return ((h % 1000) + 1000) % 1000 / 1000; }