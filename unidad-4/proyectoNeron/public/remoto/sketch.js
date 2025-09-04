let socket;
let sliders = [];
let phaseSliders = { "2": [], "3": [], "5": [] };
let currentEstado = "1";

// CAMBIO: Variable global para poder mostrar/ocultar el botón de Transición 1
let btnTransicion1;

const SLIDER_TITLE_Y = 300;
const SLIDER_START_Y = 350;

// Títulos de sliders, incluyendo los de la Fase 5 que pediste.
const phaseSliderLabels = {
  "2": ["Velocidad", "Escala", "Rotación"],
  "3": ["Rango Conexión", "Brillo", "Grosor Línea"],
  "5": ["Velocidad Mov.", "Brillo", "Tamaño Final"]
};

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(50);

    // ---- Creación de Botones ----
    createButton("1").position(70, 60).mousePressed(() => changeState("1"));
    createButton("2").position(160, 60).mousePressed(() => changeState("2"));
    createButton("3").position(250, 60).mousePressed(() => changeState("3"));
    createButton("4").position(340, 60).mousePressed(() => changeState("4"));
    createButton("5").position(430, 60).mousePressed(() => changeState("5"));
    
    // CAMBIO: Asignamos el botón a la variable global
    btnTransicion1 = createButton("Transición 1");
    btnTransicion1.position(25, 140).mousePressed(() => changeState("transicion1"));

    // CAMBIO: Los botones de Transición 2 y 3 han sido eliminados.
    
    selectAll('button').forEach(btn => styleButton(btn));
    
    function styleButton(btn) {
        // ... (la función de estilo no cambia) ...
        const isTransition = btn.html().includes('Transición');
        const colorBase = isTransition ? "#db96eaff" : "#81b3ffff";
        btn.style('padding', '15px 28px').style('border-radius', '12px').style('border', 'none');
        btn.style('background', colorBase).style('color', '#fff').style('font-family', 'Trechet MS, sans-serif');
        btn.style('font-size', '18px').style('font-weight', 'bold').style('box-shadow', '2px 4px 8px rgba(0,0,0,0.5)');
        btn.style('cursor', 'pointer').mouseOver(() => btn.style('filter', 'brightness(1.2)'));
        btn.mouseOut(() => btn.style('filter', 'brightness(1)'));
    }

    // ---- Creación de Sliders (sin cambios) ----
    let hueSlider = new MySlider("Hue", 0, 255, 200, 20, SLIDER_START_Y);
    hueSlider.slider.input(() => socket.emit('slider_changed', { label: "hue", value: hueSlider.getValue() }));
    sliders.push(hueSlider);
    let saturationSlider = new MySlider("Saturation", 0, 255, 100, 20, SLIDER_START_Y + 50);
    saturationSlider.slider.input(() => socket.emit('slider_changed', { label: "saturation", value: saturationSlider.getValue() }));
    sliders.push(saturationSlider);
    let brightnessSlider = new MySlider("Brightness", 0, 255, 150, 20, SLIDER_START_Y + 100);
    brightnessSlider.slider.input(() => socket.emit('slider_changed', { label: "brightness", value: brightnessSlider.getValue() }));
    sliders.push(brightnessSlider);
    createPhaseSliders("2", 20, SLIDER_START_Y);
    createPhaseSliders("3", 20, SLIDER_START_Y);
    createPhaseSliders("5", 20, SLIDER_START_Y);

    // ---- Conexión Socket.IO ----
    socket = io();
    socket.on('connect', () => console.log('Connected to server'));
    
    // Establece la visibilidad inicial de todos los elementos de UI
    updateUiVisibility();
}

function changeState(newState) {
    socket.emit('message_controller', JSON.stringify(newState));
    currentEstado = newState;
    updateUiVisibility(); // Llama a la función que actualiza la visibilidad de TODO
}

// CAMBIO: Renombrada para manejar toda la UI (sliders y botones)
function updateUiVisibility() {
    // Lógica para sliders (sin cambios)
    sliders.forEach(s => s.slider.hide());
    Object.values(phaseSliders).forEach(arr => arr.forEach(s => s.slider.hide()));
    switch (currentEstado) {
        case "1": case "4":
            sliders.forEach(s => s.slider.show());
            break;
        case "2": case "3": case "5":
            if (phaseSliders[currentEstado]) phaseSliders[currentEstado].forEach(s => s.slider.show());
            break;
    }

    // Lógica para el botón de Transición 1
    if (currentEstado === "1") {
        btnTransicion1.show();
    } else {
        btnTransicion1.hide();
    }
}

function draw() {
    background(100);
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(24);
    text('Controlador de Fases', 20, 30);
    let title = "", activeSliders = [];
    if (currentEstado === "1" || currentEstado === "4") {
        title = 'Parámetros Generales';
        activeSliders = sliders;
    } else if (phaseSliders[currentEstado]) {
        title = `Parámetros Fase ${currentEstado}`;
        activeSliders = phaseSliders[currentEstado];
    }
    if (title) {
        textSize(22);
        text(title, 20, SLIDER_TITLE_Y);
        activeSliders.forEach(s => s.showLabel());
    }
}

class MySlider {
  constructor(label, min, max, value, x, y) { this.label = label; this.slider = createSlider(min, max, value); this.slider.position(x, y); this.slider.size(275); this.slider.style('accent-color', '#fff'); }
  showLabel() { fill(255); noStroke(); textSize(16); textAlign(LEFT, CENTER); text(this.label + ": " + this.slider.value(), this.slider.x + this.slider.width + 20, this.slider.y + 10); }
  getValue() { return this.slider.value(); }
}

function createPhaseSliders(phase, x, startY) {
  const labels = phaseSliderLabels[phase];
  if (!labels) return;
  for (let i = 0; i < labels.length; i++) {
    let s = new MySlider(labels[i], 0, 100, 50, x, startY + i * 50); 
    s.slider.input(() => {
      let values = phaseSliders[phase].map(sl => sl.getValue() / 100.0);
      socket.emit('controller_vars', { phase, values });
    });
    phaseSliders[phase].push(s);
  }
}