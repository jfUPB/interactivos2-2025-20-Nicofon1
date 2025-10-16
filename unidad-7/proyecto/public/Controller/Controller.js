let socket;
let sliders = [];
let estadoActual = 1;

const startX = 50;
const startY = 100;
const sliderSpacing = 70;
const buttonWidth = 120;
const buttonHeight = 40;
const buttonSpacing = 10;

let estadoButtons = []; 

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(1, 4, 107);

    socket = io();
    socket.on('connect', () => console.log('🕹 Controlador conectado'));
    
    // --- CREACIÓN DE BOTONES DE ESTADO ---
    const buttonY = 70;
    for (let i = 1; i <= 4; i++) {
        let btnX = startX + (i - 1) * (buttonWidth + buttonSpacing);
        let button = createButton(`Estado ${i}`);
        button.position(btnX, buttonY);
        button.size(buttonWidth, buttonHeight);
        button.style('background-color', '#FCFADE');
        button.style('color', '#01046B');
        button.style('font-size', '16px');
        button.style('border', 'none');
        button.style('border-radius', '5px');
        button.mousePressed(() => cambiarEstado(i));
        estadoButtons.push(button);
    }
    
    actualizarEstiloBoton();

    // --- CREACIÓN DE SLIDERS ---
    let yPos = startY + buttonHeight + buttonSpacing + 30;
    let xPos = startX;

    function createAndPushSlider(label, min, max, initialValue, x, y, displayStates) {
        let slider = new MySlider(label, min, max, initialValue, x, y, displayStates);
        slider.slider.input(() => {
            socket.emit('slider_changed', { label: label, value: slider.getValue() });
        });
        sliders.push(slider);
        // Emitir el valor inicial
        socket.emit('slider_changed', { label: label, value: slider.getValue() });
    }

    // --- SLIDERS PARA ESTADO 1 (CASCADA) ---
    createAndPushSlider('columns', 5, 150, 50, xPos, yPos, 1);
    yPos += sliderSpacing;
    createAndPushSlider('rows', 5, 150, 60, xPos, yPos, 1);
    yPos += sliderSpacing;
    createAndPushSlider('noise_period', 0.1, 10, 3, xPos, yPos, 1);
    yPos += sliderSpacing;
    createAndPushSlider('bass_reactivity', 0, 500, 250, xPos, yPos, 1);
    yPos += sliderSpacing;
    createAndPushSlider('audio_index_low', 0, 255, 1, xPos, yPos, 1);
    yPos += sliderSpacing;
    createAndPushSlider('audio_index_high', 0, 255, 10, xPos, yPos, 1);
    
    // --- SLIDERS PARA ESTADOS CON BLOOM (1, 2, 4) ---
    let yPos2 = startY + buttonHeight + buttonSpacing + 30; 
    let xPos2 = startX + 350;
    
    createAndPushSlider('exposure', 0.1, 2, 1, xPos2, yPos2, [1, 2, 4]);
    yPos2 += sliderSpacing;
    createAndPushSlider('bloom_threshold', 0.0, 1.0, 0, xPos2, yPos2, [1, 2, 4]);
    yPos2 += sliderSpacing;
    createAndPushSlider('bloom_strength', 0.0, 3.0, 0.2, xPos2, yPos2, [1, 2, 4]);
    yPos2 += sliderSpacing;
    createAndPushSlider('bloom_radius', 0.0, 1.0, 0.2, xPos2, yPos2, [1, 2, 4]);

    // --- SLIDERS PARA ESTADO 2 (PARTÍCULAS) ---
    // (Estos pueden compartir espacio con otros, ya que solo se muestran en el estado 2)
    yPos = startY + buttonHeight + buttonSpacing + 30;
    createAndPushSlider('life', 1, 5, 1, xPos, yPos, 2);
    yPos += sliderSpacing;
    createAndPushSlider('x', -100, 100, 0, xPos, yPos, 2);
    yPos += sliderSpacing;
    createAndPushSlider('y', -100, 100, 0, xPos, yPos, 2);

    // --- SLIDERS PARA ESTADO 3 (PUNTOS DESDE IMAGEN) ---
    yPos = startY + buttonHeight + buttonSpacing + 30;
    createAndPushSlider('freqFactor', 0.01, 0.1, 0.03, xPos, yPos, 3);
    yPos += sliderSpacing;
    createAndPushSlider('amplitudeFactor', 0.0, 1.0, 0.2, xPos, yPos, 3);
    yPos += sliderSpacing;
    createAndPushSlider('pointSize', 1, 10, 3, xPos, yPos, 3);
    yPos += sliderSpacing;
    createAndPushSlider('rotationSpeed', 0.0, 2.0, 0.5, xPos, yPos, 3);
    
    // --- SLIDERS PARA ESTADO 4 (TÚNEL) ---
    yPos = startY + buttonHeight + buttonSpacing + 30;
    createAndPushSlider('tunnel_radius', 1, 10, 3, xPos, yPos, 4);
    yPos += sliderSpacing;
    createAndPushSlider('tunnel_noise_amp', 0.0, 2.0, 0.5, xPos, yPos, 4);
    yPos += sliderSpacing;
    createAndPushSlider('tunnel_speed', 0.1, 2.0, 0.8, xPos, yPos, 4);
    yPos += sliderSpacing;
    createAndPushSlider('tunnel_point_size', 0.01, 0.2, 0.03, xPos, yPos, 4);
}

function cambiarEstado(nuevoEstado) {
    if (estadoActual !== nuevoEstado) {
        estadoActual = nuevoEstado;
        console.log(`Cambiado a Estado ${estadoActual}`);
        socket.emit('cambio_estado', estadoActual);
        sliders.forEach(slider => slider.updateVisibility(estadoActual));
        actualizarEstiloBoton();
    }
}

function actualizarEstiloBoton() {
    estadoButtons.forEach((btn, index) => {
        const estado = index + 1;
        if (estado === estadoActual) {
            btn.style('background-color', '#dc6bffff');
            btn.style('color', '#FCFADE');
        } else {
            btn.style('background-color', '#FCFADE'); 
            btn.style('color', '#01046B');
        }
    });
}

function draw() {
    background(1, 4, 107);
    fill(252, 250, 222);
    textAlign(CENTER, CENTER);
    textSize(24);
    text('CONTROLLER: CHIHIRO', width / 2, 40);
    
    sliders.forEach(slider => {
        if (slider.isVisible()) {
            slider.show();
        }
    });
}

class MySlider {
    constructor(label, min, max, value, x, y, displayStates) {
        this.label = label;
        this.displayStates = Array.isArray(displayStates) ? displayStates : [displayStates];
        
        const floatSliders = [
            'noise_period', 'amp_smoothing', 'exposure', 
            'bloom_threshold', 'bloom_strength', 'bloom_radius',
            'freqFactor', 'amplitudeFactor', 'rotationSpeed',
            'tunnel_noise_amp', 'tunnel_speed', 'tunnel_point_size'
        ];
        
        let step = floatSliders.includes(label) ? 0.01 : 1;
        this.slider = createSlider(min, max, value, step);
        this.slider.position(x, y);
        this.slider.size(275);
        this.slider.style('accent-color','#FCFADE');
        this.updateVisibility(estadoActual);
    }
    
    updateVisibility(currentGlobalState) {
        if (this.displayStates.includes(currentGlobalState)) {
            this.slider.show();
        } else {
            this.slider.hide();
        }
    }
    
    isVisible() {
        return this.displayStates.includes(estadoActual);
    }
    
    show() {
        fill(252, 250, 222);
        noStroke();
        textSize(16);
        textAlign(CENTER, CENTER);
        text(this.label + ": " + this.slider.value(), this.slider.x + this.slider.width / 2, this.slider.y - 15);
    }

    getValue() {
        return Number(this.slider.value());
    }
}