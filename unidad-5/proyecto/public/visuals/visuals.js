let socket;
let answer = true;
let estado = "1";
const port = 3000;


function setup() {
    createCanvas(windowWidth, windowHeight)
    background(220);
    colorMode(HSB, 255);

    //let socketUrl = 'http://localhost:3000';
    socket = io(); 

    // Evento de conexión exitosa
    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('messageClienteVisuales', 'Client connected to Visuales room');
    });

    // Recibir mensaje del servidor  
    socket.on('answer_mobile', (data) => {
    console.log("Respuesta mobile recibida:", data);
    mobile_R(data);
    });

    // Evento de desconexión
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket.IO error:', error);
    });
}

function draw() {    
    background(20);
}
