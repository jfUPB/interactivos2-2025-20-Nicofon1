let socket;
let lastTouchX = null; 
let lastTouchY = null; 
const threshold = 5;
let estado = "1";

function setup() {
    createCanvas(windowWidth, windowHeight)
    background(100);

    // Conectar al servidor de Socket.IO
    //let socketUrl = 'http://localhost:3000';
    socket = io();

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('message', (data) => {
        console.log(`Received message: ${data}`);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket.IO error:', error);
    });

    socket.on('message_controller', (data) => {
        console.log(`Received message: `,data);
        estado = JSON.parse(data);
    }); 
}

function draw() {
    background(100);
    fill(0, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(24);
}
