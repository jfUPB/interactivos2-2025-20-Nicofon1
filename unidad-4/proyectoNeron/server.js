const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);

// Se utiliza la configuración del primer archivo, que incluye CORS.
const io = socketIO(server, {
    cors: {
        origin: '*'
    }
}); 

const port = 3000;
let estado = "1";

// Variable para guardar el estado de los destellos entre las fases 3 y 5 (del primer archivo).
let savedDestellosState = null;

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New client connected');
    
    // ---- INICIO: EVENTOS COMUNES Y DEL PRIMER ARCHIVO ----

    // Identidad básica del cliente (del primer archivo).
    socket.emit('whoami', { id: socket.id });

    // Mensaje inicial del estado del controlador al conectarse.
    socket.emit('message_controller', estado);
    
    // El cliente con rol de "Visuales" se une a la sala (lógica idéntica en ambos).
    socket.on('messageClienteVisuales', () => {
        socket.join("Visuales room");
        console.log(`Client ${socket.id} joined 'Visuales room'`);
    });

    // Reenvío de mensajes desde el móvil a la sala de Visuales (lógica idéntica en ambos).
    socket.on('message_mobile', (message_mobile) => {
        console.log(`Received message mobile => ${message_mobile}`);
        io.to("Visuales room").emit("message_mobile", message_mobile);
    });
    
    // Reenvío de mensajes desde el desktop a la sala de Visuales (lógica idéntica en ambos).
    socket.on('message_desktop', (message_desktop) => {
        console.log(`Received message desktop => ${message_desktop}`);
        io.to("Visuales room").emit("message_desktop", message_desktop);
    });

    // Actualiza y reenvía el estado del controlador a todos los clientes (lógica idéntica en ambos).
    socket.on('message_controller', (message_controller) => {
        console.log(`Received message controller => ${message_controller}`);
        socket.broadcast.emit("message_controller", message_controller);
        io.to("Visuales room").emit("message_controller", message_controller);
        estado = message_controller;
    });

    // Manejador para la rotura de cámara (fase 2) (del primer archivo).
    socket.on('phase_shatter', (payload) => {
        io.to("Visuales room").emit('phase_shatter', payload);
    });

    // Manejador para los destellos (fases 3/5) (del primer archivo).
    socket.on('destello_press', (payload) => {
        io.to("Visuales room").emit('destello_press', payload);
    });

    // Visuals reporta BPM (del primer archivo).
    socket.on('bpm_update', (bpm) => {
        io.emit('bpm_update', bpm);
    });

    // Guardar estado de destellos al salir de la fase 3 (del primer archivo).
    socket.on('destellos_state_save', (state) => { 
        savedDestellosState = state; 
        console.log('Destellos state saved');
    });

    // Cliente solicita el estado de destellos guardado al entrar a la fase 5 (del primer archivo).
    socket.on('destellos_state_request', () => {
        if (savedDestellosState) {
            socket.emit('destellos_state_restore', savedDestellosState);
            console.log('Destellos state restored');
        }
    });

    // Manejador para cambios en los sliders (lógica idéntica en ambos).
    socket.on('slider_changed', (data) => {
        console.log(`Slider changed => ${data.label}: ${data.value}`);
        io.to("Visuales room").emit("slider_changed", data);
    });
    
    // Manejador para variables del controlador (del primer archivo).
    socket.on('controller_vars', (payload) => {
        console.log(`Controller vars for phase ${payload.phase}:`, payload.values);
        io.to("Visuales room").emit("controller_vars", payload);
    });

    // ---- FIN: EVENTOS COMUNES Y DEL PRIMER ARCHIVO ----


    // ---- INICIO: EVENTOS ÚNICOS DEL SEGUNDO ARCHIVO ----

    // Reenvío de la respuesta del móvil.
    socket.on('answer_mobile', (answer) => {
        console.log(`Received answer mobile => ${answer}`);
        io.to("Visuales room").emit("answer_mobile", answer);
    });

    // Reenvío de los "taps" del móvil.
    socket.on('tap_mobile', (taps) => {
        console.log(`tap_mobile => ${taps}`);
        io.to("Visuales room").emit("tap_mobile", taps);
    });

    socket.on('bpm_changed', (newBPM) => {
        console.log(`BPM changed via controller to => ${newBPM}`);
        // Retransmitimos a TODOS los clientes (incluido visuals) con el evento 'bpm_update'.
        io.emit("bpm_update", newBPM); 
    });

    // Reenvío de la posición de Kendrick.
    socket.on('kendrick_position', (pos) => {
        io.to("Visuales room").emit("kendrick_position", pos);
    });

    // ---- FIN: EVENTOS ÚNICOS DEL SEGUNDO ARCHIVO ----

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});