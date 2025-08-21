# Unidad 3


## 🛠 Fase: Apply

### Video
https://www.youtube.com/watch?v=IZbeOsBXb6g


### controller.js
```js
let socket;
let lastTouchX = null; 
let lastTouchY = null; 
const threshold = 5;

function setup() {
    createCanvas(300, 400);
    background(220);
    // Botón 1
    let btn1 = createButton("1");
    btn1.position(20, 20);
    btn1.mousePressed(() => socket.emit('message_controller', JSON.stringify("1")));

    // Botón 2
    let btn2 = createButton("2");
    btn2.position(120, 20);
    btn2.mousePressed(() => socket.emit('message_controller', JSON.stringify("2")));

    // Botón 3
    let btn3 = createButton("3");
    btn3.position(200, 20);
    btn3.mousePressed(() => socket.emit('message_controller', JSON.stringify("3")));
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
}

function draw() {
    background(220);
    fill(255, 128, 0);
    textAlign(CENTER, CENTER);
    textSize(24);
    text('Presiona para interactuar', width / 2, height / 2);
}
```

### visuals.js
```js
let socket;
let circleX_m = 200;
let circleY_m = 200;
let circleX_d = 200;
let circleY_d = 200;
let circleSize_d = 50;
let circleSize_m = 50;
let estado = "1";
let hue_m = 50;
let hue_d = 0;
const port = 3000;


function setup() {
    createCanvas(300, 400);
    background(220);

    //let socketUrl = 'http://localhost:3000';
    socket = io(); 

    // Evento de conexión exitosa
    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('messageClienteVisuales', 'Client connected to Visuales room');
        
    });











    // Recibir mensaje del servidor
    socket.on('message_mobile', (data) => {
        
        mobile_R(data);
    });    








     socket.on('message_desktop', (data) => {
        console.log(`Received message desktop: `,data);
        if (estado === "1") {
                try {
                let parsedData = JSON.parse(data);
                if (parsedData && parsedData.type === 'touch') {
                    circleX_d = parsedData.x;
                    circleY_d = parsedData.y;
                }
            } catch (e) {
                console.error("Error parsing received JSON:", e);
            }
        }else if (estado === "2") {
            console.log(estado,`Received desktop position: `,data);
            if(data === "a")
                circleSize_d +=10;
            else if(data === "b")
            circleSize_d -=10;
        }else if (estado === "3") {
            console.log(estado,`Received desktop position: `,data);

            try {
                hue_d = JSON.parse(data);
                
            } catch (e) {
                console.error("Error parsing received JSON:", e);
            }
        }
        
    }); 

    socket.on('message_controller', (data) => {
        console.log(`Received message: `,data);
        estado = JSON.parse(data);

    });    

    // Evento de desconexión
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket.IO error:', error);
    });
}
 function mobile_R(data) {
 if (estado == "1") {
        console.log(estado,`Received mobile position: `,data);

            try {
                let parsedData = JSON.parse(data);
                if (parsedData && parsedData.type === 'touch') {
                    circleX_m = parsedData.x;
                    circleY_m = parsedData.y;
                }
            } catch (e) {
                console.error("Error parsing received JSON:", e);
            }
        }else if (estado == "2") {
            console.log(estado,`Received mobile touch: `,data);
            if(data === "a")
                circleSize_m +=10;
            else if(data === "b")
            circleSize_m -=10;
        }else if (estado == "3") {
        console.log(estado,`Received mobile position: `,data);

            try {
                hue_m = JSON.parse(data);
                
            } catch (e) {
                console.error("Error parsing received JSON:", e);
            }
        }

}
function draw() {
    
    background(220);
    colorMode(HSB);
    
    fill(hue_m, 180, 100);
    ellipse(circleX_m, circleY_m, circleSize_m, circleSize_m);
    
    fill(hue_d, 180, 100);

    ellipse(circleX_d, circleY_d,circleSize_d, circleSize_d);
}

```

### server.js
```js
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
    socket.emit('message_controller', estado);
    
    console.log('New client connected');
    socket.on('message_mobile', (message_mobile) => {
        console.log(`Received message mobile => ${message_mobile}`);
        io.to("Visuales room").emit("message_mobile",message_mobile);

    });
    
    socket.on('message_desktop', (message_desktop) => {
        console.log(`Received message desktop => ${message_desktop}`);
        io.to("Visuales room").emit("message_desktop",message_desktop);
        
    });


    socket.on('messageClienteVisuales', (messageClienteVisuales) => {
        socket.join("Visuales room");
        console.log("matriculado en la sala Visuales");
    });
 
    socket.on('message_controller', (message_controller) => {
        console.log(`Received message controller => ${message_controller}`);
        socket.broadcast.emit("message_controller",message_controller);
        io.to("Visuales room").emit("message_controller",message_controller);
        estado = message_controller;

        
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
```

### desktop.js
```js
let socket;
let lastTouchX = null; 
let lastTouchY = null; 
let estado = "1";
let fill3;

const threshold = 5;

function setup() {
    createCanvas(300, 400);
    background(220);

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
        estado=JSON.parse(data);
    }); 
}

function draw() {
    background(220);
    fill(255, 128, 0);
    textAlign(CENTER, CENTER);
    textSize(24);
    text('Touch to move the circle', width / 2, height / 2);
}

function touchMoved() {
    if(estado === "1") {

    
        if (socket && socket.connected) { 
            let dx = abs(mouseX - lastTouchX);
            let dy = abs(mouseY - lastTouchY);

            if (dx > threshold || dy > threshold || lastTouchX === null) {
                let touchData = {
                    type: 'touch',
                    x: mouseX,
                    y: mouseY
                };
                socket.emit('message_desktop', JSON.stringify(touchData));

                lastTouchX = mouseX;
                lastTouchY = mouseY;
            }
        }
    }
    else if(estado === "3") {
        if (socket && socket.connected) { 
            let dx = abs(mouseX - lastTouchX);


            if (dx > threshold|| lastTouchX === null) {
                let hue = map(mouseX, 0, width, 0, 255);
                socket.emit('message_desktop', JSON.stringify(hue));

                lastTouchX = mouseX;
            }
        }

    }
    return false;
}
function touchEnded(){
    if(estado === "2") {
        if(mouseX > width / 2) 
            socket.emit('message_desktop', "a");        
        else 
        socket.emit('message_desktop',"b");
    }
    return false;

}

```

### mobile.js
```js
let socket;
let lastTouchX = null; 
let lastTouchY = null; 
const threshold = 5;
let estado = "1";

function setup() {
    createCanvas(300, 400);
    background(220);

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
    background(220);
    fill(255, 128, 0);
    textAlign(CENTER, CENTER);
    textSize(24);
    text('Touch to move the circle', width / 2, height / 2);
}

function touchMoved() {
        console.log(`Estado: ${estado}`);

    if(estado === "1") {

    
        if (socket && socket.connected) { 
            let dx = abs(mouseX - lastTouchX);
            let dy = abs(mouseY - lastTouchY);

            if (dx > threshold || dy > threshold || lastTouchX === null) {
                let touchData = {
                    type: 'touch',
                    x: mouseX,
                    y: mouseY
                };
                socket.emit('message_mobile', JSON.stringify(touchData));

                lastTouchX = mouseX;
                lastTouchY = mouseY;
            }
        }
    }
    else if(estado === "3") {
        if (socket && socket.connected) { 
            let dx = abs(mouseX - lastTouchX);


            if (dx > threshold|| lastTouchX === null) {
                let hue = map(mouseX, 0, width, 0, 255);
                socket.emit('message_mobile', JSON.stringify(hue));

                lastTouchX = mouseX;
            }
        }

    }
}

function touchEnded(){
    if(estado === "2") {
        if(mouseX > width / 2) 
            socket.emit('message_mobile', "a");        
        else 
        socket.emit('message_mobile',"b");
        
    }
    return false;

}


```
