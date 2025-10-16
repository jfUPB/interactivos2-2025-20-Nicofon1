const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app); 
const io = socketIO(server); 
const port = 3000;
let estado = "1";

const VISUALS_ROOM = "Visuales room"; 
let state1_press_count = 0;     

app.use(express.static('public'));

io.on('connection', (socket) => {

    socket.emit('whoami', { id: socket.id });
    socket.emit('message_controller', estado);

    console.log('New client connected');

    socket.on('messageClienteVisuales', () => {
        socket.join("Visuales room");
        console.log(`Client ${socket.id} joined 'Visuales room'`);
    });
 

    socket.on('slider_changed', (slider_changed) => {
        console.log(`Received slider_changed controller => ${slider_changed}`);
        socket.broadcast.emit("slider_changed",slider_changed);
        io.to("Visuales room").emit("slider_changed",slider_changed);  
    });

    socket.on('cambio_estado', (estadoActual) => {
        console.log(`cambio_estado => ${estadoActual}`);
        socket.broadcast.emit("cambio_estado",estadoActual);
        io.to("Visuales room").emit("cambio_estado",estadoActual);  
    });




    socket.on('state1_start_press', () => {
        socket.isPressingState1 = true;
        state1_press_count++;
        io.to(VISUALS_ROOM).emit('state1_update_count', state1_press_count);
    });

    socket.on('state1_end_press', () => {
        if (socket.isPressingState1) {
            socket.isPressingState1 = false;
            state1_press_count = Math.max(0, state1_press_count - 1);
            io.to(VISUALS_ROOM).emit('state1_update_count', state1_press_count);
        }
    });

    socket.on('disconnect', () => {
        if (socket.isPressingState1) {
            state1_press_count = Math.max(0, state1_press_count - 1);
            io.to(VISUALS_ROOM).emit('state1_update_count', state1_press_count);
        }
    });
});

server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
