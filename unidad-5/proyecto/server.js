const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app); 
const io = socketIO(server); 
const port = 3000;
let estado = "1";

app.use(express.static('public'));

io.on('connection', (socket) => {

    socket.emit('whoami', { id: socket.id });
    socket.emit('message_controller', estado);

    console.log('New client connected');
    
    socket.on('messageClienteVisuales', () => {
        socket.join("Visuales room");
        console.log(`Client ${socket.id} joined 'Visuales room'`);
    });

    socket.on('slider_changed', (data) => {
        console.log(`Received slider_changed =>`, data);
        io.to("Visuales room").emit("slider_changed", data);
    });
});

server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});