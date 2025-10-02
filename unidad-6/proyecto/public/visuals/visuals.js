let mic, fft;
let audioStarted = false;
let statusMessage = "Haz click para iniciar el audio";
let graphics_debug;

let display_amp = 0;

let params = {
    // --- CAMBIOS CLAVE ---
    columns: 50, // De 23 a 100 (más líneas)
    rows: 60,   // De 41 a 80 (más segmentos por línea)
    // --- FIN DE CAMBIOS ---
    noise_period: 3,
    base_amp: 5,
    bass_reactivity: 250.0,
    amp_smoothing: 0.1,
    // NUEVO: Parámetros para control manual de frecuencia
    bass_freq_low: 70,   // Frecuencia de inicio en Hz
    bass_freq_high: 180,  // Frecuencia de corte en Hz
    glow_fade: 250

};




function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    graphics_debug = createGraphics(windowWidth, windowHeight);
    mic = new p5.AudioIn();
    fft = new p5.FFT(0.8, 128);
    fft.setInput(mic);
    display_amp = params.base_amp;
    socket = io();
    socket.on('connect', () => {
        console.log('🖼️  Visuals client conectado');
        socket.emit('join-visuals-room');
    });

    // --- ESCUCHA DE SLIDERS ---
    socket.on('slider_changed', (data) => {
        console.log('Slider data recibida:', data);
        if (params.hasOwnProperty(data.label)) {
            params[data.label] = data.value;
        }
    });
}


function draw() {
    background(0);
    orbitControl();
    
    // ... (El análisis de audio es idéntico al código que pegaste) ...
    let normalizedBass = 0;
    if (audioStarted) {
        fft.analyze();
        let bassLevel = fft.getEnergy(params.bass_freq_low, params.bass_freq_high);
        normalizedBass = map(bassLevel, 0, 255, 0, 1);
    }
    let target_amp = params.base_amp + (params.bass_reactivity * normalizedBass);
    display_amp = lerp(display_amp, target_amp, params.amp_smoothing);

        // --- DIBUJO CON ESQUINA DE 90 GRADOS ---
        // --- El resto de tu código de dibujo es perfecto ---
    translate(0, 0, -300);
    rotateX(PI / 2);
    rotateZ(PI / 2);

    // Hacemos las líneas un poco más brillantes para que dejen una buena estela
    stroke(150, 200, 255); 
    strokeWeight(1.5); // Un poco más de grosor para que se vea bien
    noFill();
    
    let time = millis() / 1000; 

    for (let i = 0; i < params.columns; i++) {
        beginShape(LINE_STRIP);
        for (let j = 0; j < params.rows; j++) {
            // ... (Toda tu lógica de la esquina es perfecta, no cambia nada) ...
            let x = map(i, 0, params.columns - 1, -width / 2, width / 2);
            let y = map(j, 0, params.rows - 1, -height / 2, height / 2);
            let cornerY = 200;
            let finalY, finalZ;
            if (y < cornerY) {
                finalY = y; finalZ = 0;
            } else {
                finalY = cornerY; finalZ = (y - cornerY)*2;
            }
            let noiseScale = 1 / params.noise_period;
            let noiseValue = noise(i * noiseScale, j * noiseScale + time);
            let offsetX = map(noiseValue, 0, 1, -1, 1) * (display_amp/5);
            vertex(x + offsetX, finalY, finalZ);
        }
        endShape();
    }
    

    push();
    translate(-width / 2, -height / 2);
    image(graphics_debug, 0, 0);
    pop();
}

// ... (mousePressed y windowResized son idénticas) ...
async function mousePressed() {
    if (audioStarted) return;
    try {
        statusMessage = "Audio activo";
        await getAudioContext().resume();
        mic.start();
        audioStarted = true;
    } catch (e) {
        console.error("Error al iniciar el audio:", e);
        statusMessage = "Error al iniciar el audio.";
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    graphics_debug.resize(windowWidth, windowHeight);
}