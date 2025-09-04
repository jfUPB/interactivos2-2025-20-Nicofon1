// kendrick.js
// Este cliente controla la posición del "personaje" y el BPM global.

let socket;
let kendrickPos; 
const kendrickSize = 30;
const moveSpeed = 5;

function setup() {
    createCanvas(windowWidth, windowHeight);
    kendrickPos = createVector(width / 2, height / 2); 

    socket = io();
    socket.on('connect', () => console.log('Kendrick connected to server'));

    let bpmSlider = new MySlider("BPMS", 80, 160, 134, 20, 350); // Rango más musical
    bpmSlider.slider.input(() => {
        let newBPM = bpmSlider.getValue(); 
        // CAMBIO: El evento se llamará 'bpm_changed' para ser claro.
        socket.emit('bpm_changed', newBPM);
        console.log('BPM changed to:', newBPM);
    });
    
    // Emitir el valor inicial al conectarse
    socket.emit('bpm_changed', bpmSlider.getValue());
}

function draw() {
    background(50); 
    
    // Movimiento del personaje (sin cambios)
    if (keyIsDown(LEFT_ARROW)) kendrickPos.x -= moveSpeed;
    if (keyIsDown(RIGHT_ARROW)) kendrickPos.x += moveSpeed;
    if (keyIsDown(UP_ARROW)) kendrickPos.y -= moveSpeed;
    if (keyIsDown(DOWN_ARROW)) kendrickPos.y += moveSpeed;
    
    fill(255, 0, 0);
    noStroke();
    ellipse(kendrickPos.x, kendrickPos.y, kendrickSize);

    // Emitir posición (sin cambios)
    socket.emit('kendrick_position', { x: kendrickPos.x, y: kendrickPos.y });
}

// Clase MySlider (simplificada, ya que no necesita mostrarse en este sketch)
class MySlider {
  constructor(label, min, max, value, x, y) {
    this.slider = createSlider(min, max, value);
    this.slider.position(x, y);
    this.slider.size(275);
    let labelP = createP(label); // Muestra el label como un párrafo
    labelP.position(x, y - 40);
  }
  getValue() { return this.slider.value(); }
}