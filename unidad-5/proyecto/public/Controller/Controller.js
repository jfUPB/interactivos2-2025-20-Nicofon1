let socket;
let sliders = [];
const startX = 50;
const startY = 100;
const sliderSpacing = 70;

function setup() {
    createCanvas(windowWidth, windowHeight)
    background(1, 4, 107);

    socket = io();

    // Conectar al servidor de Socket.IO
    //let socketUrl = 'http://localhost:3000';

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

    let yPos = startY; 

    let sliderColumns = new MySlider('columns', 1, 50, 0, startX, yPos);
    sliderColumns.slider.input(() => {
        socket.emit('slider_changed', { label: "columns", value: sliderColumns.getValue() });
        console.log('Columns changed to:', sliderColumns.getValue());
     });

    yPos += sliderSpacing; 

    let sliderRow = new MySlider('rows', 1, 50, 0, startX, yPos);
    sliderRow.slider.input(() => {
        socket.emit('slider_changed', { label: "rows", value: sliderRow.getValue() });
        console.log('Rows changed to:', sliderRow.getValue());
     });

    yPos += sliderSpacing; 

    let sliderDistanceNear = new MySlider('distance near', 0, 100, 0, startX, yPos);
    sliderDistanceNear.slider.input(() => {
        socket.emit('slider_changed', { label: "distance_near", value: sliderDistanceNear.getValue() });
        console.log('Distance near changed to:', sliderDistanceNear.getValue());
     });

    yPos += sliderSpacing; 

    let sliderDistanceFar = new MySlider('distance far', 0, 100, 0, startX, yPos);
    sliderDistanceFar.slider.input(() => {
        socket.emit('slider_changed', { label: "distance_far", value: sliderDistanceFar.getValue() });
        console.log('Distance far changed to:', sliderDistanceFar.getValue());
     });

    yPos += sliderSpacing; 

    let sliderWidthNear = new MySlider('width near', 0, 20, 0, startX, yPos);
    sliderWidthNear.slider.input(() => {
        socket.emit('slider_changed', { label: "width_near", value: sliderWidthNear.getValue() });
        console.log('Width near changed to:', sliderWidthNear.getValue());
     });

    yPos += sliderSpacing; 

    let sliderWidthFar = new MySlider('width far', 0, 20, 0, startX, yPos);
    sliderWidthFar.slider.input(() => {
        socket.emit('slider_changed', { label: "width_far", value: sliderWidthFar.getValue() });
        console.log('Width far changed to:', sliderWidthFar.getValue());
     });

    sliders.push(sliderRow);
    sliders.push(sliderColumns);
    sliders.push(sliderDistanceNear);
    sliders.push(sliderDistanceFar);
    sliders.push(sliderWidthNear);
    sliders.push(sliderWidthFar);
}

function draw() {
    background(1, 4, 107);
    textAlign(CENTER, CENTER);
    textSize(24);
    text('CONTROLLER: CHIHIRO', width/2, 40);
    fill(252, 250, 222);

    for (let slider of sliders) {
        slider.show();
    }
}

class MySlider {
  constructor(label, min, max, value, x, y) 
  {
    this.label = label;
    this.x = x;  
    this.y = y;
    this.slider = createSlider(min, max, value);
    this.slider.position(this.x, this.y);
    this.slider.size(275);
    this.slider.style('accent-color','#FCFADE');
  }

  show() {
    text(this.label + ": " + this.slider.value(), 
         this.slider.x * 2 + this.slider.width, 
         this.slider.y - 25);
  }

  getValue() {
    return this.slider.value();
  }
}