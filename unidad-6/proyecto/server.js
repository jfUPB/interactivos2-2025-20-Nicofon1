const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log(`✅ Cliente conectado: ${socket.id}`);

    // Cuando el cliente de visuales se conecta, se une a una sala
    socket.on('join-visuals-room', () => {
        socket.join("visuals-room");
        console.log(`🖼️  Cliente ${socket.id} se unió a 'visuals-room'`);
    });

    // Cuando el controlador cambia un slider, retransmitimos a la sala de visuales
    socket.on('slider_changed', (data) => {
        console.log(`🕹️  Slider movido:`, data);
        io.to("visuals-room").emit("slider_changed", data);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});