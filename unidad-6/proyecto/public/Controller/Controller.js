let socket;
let sliders = [];
const startX = 50;
const startY = 100;
const sliderSpacing = 70;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(1, 4, 107);

    socket = io();
    socket.on('connect', () => console.log('🕹️  Controlador conectado'));
    
    // --- CREACIÓN DE TODOS LOS SLIDERS CON VALORES INICIALES LOCALES ---
    let yPos = startY;

    // Helper para no repetir código
    function createAndPushSlider(label, min, max, initialValue, x, y) {
        let slider = new MySlider(label, min, max, initialValue, x, y);
        slider.slider.input(() => {
            // Emitimos el valor actual al moverlo
            socket.emit('slider_changed', { label: label, value: slider.getValue() });
        });
        sliders.push(slider);
        // Emitimos el valor inicial al crearlo, para sincronizar
        socket.emit('slider_changed', { label: label, value: slider.getValue() });
    }

    // Usamos valores iniciales directamente aquí, en lugar de `params`.
    createAndPushSlider('columns', 5, 150, 50, startX, yPos);
    yPos += sliderSpacing;
    createAndPushSlider('rows', 5, 150, 60, startX, yPos);
    yPos += sliderSpacing;
    createAndPushSlider('noise_period', 0.1, 10, 3, startX, yPos);
    yPos += sliderSpacing;
    createAndPushSlider('bass_reactivity', 0, 500, 250, startX, yPos);
    yPos += sliderSpacing;
    createAndPushSlider('amp_smoothing', 0.01, 0.5, 0.1, startX, yPos);
}

function draw() {
    background(1, 4, 107);
    fill(252, 250, 222);
    textAlign(CENTER, CENTER);
    textSize(24);
    text('CONTROLLER: CHIHIRO', width / 2, 40);
    for (let slider of sliders) {
        slider.show();
    }
}

class MySlider {
  constructor(label, min, max, value, x, y) {
    this.label = label;
    // p5.js puede manejar valores decimales en createSlider si se le da un paso.
    let step = (label === 'noise_period' || label === 'amp_smoothing') ? 0.01 : 1;
    this.slider = createSlider(min, max, value, step);
    
    this.slider.position(x, y);
    this.slider.size(275);
    this.slider.style('accent-color','#FCFADE');
  }
  show() {
    fill(252, 250, 222);
    noStroke();
    text(this.label + ": " + this.slider.value(), this.slider.x + this.slider.width / 2, this.slider.y - 25);
  }
  getValue() {
      // Los sliders de p5.js devuelven strings, nos aseguramos de enviar números
      return Number(this.slider.value());
  }
}