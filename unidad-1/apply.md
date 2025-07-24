# Unidad 1

## 🛠 Fase: Apply

### deconstrucción/reconstrucción.

#### Select

[M_2_5_01](http://www.generative-gestaltung.de/2/sketches/?02_M/M_2_5_01)

<img width="807" height="797" alt="image" src="https://github.com/user-attachments/assets/3ae69463-af27-450c-abcc-0dbe0abc6b45" />

____
#### Describe
+ lo que se nota a primera vista son figuras "armonicas" que se le con puntos inteconectados con rectas, todos los "strokes" sienen un grosor muy delgado, el programa permite modificar variables que algunas de ellas da la ilucion de rotar la figura

+ interacciones

  + 1/2               : frequency x -/+

  + 3/4               : frequency y -/+

  + arrow left/right  : phi -/+

  + 7/8               : modulation frequency x -/+

  + 9/0               : modulation frequency y -/+

  + s                 : save png


#### Analyze
+ se puede asumir que el programa genera un recorrido de diferentes puntos que hacen parte de [Figuras de Lissajous](http://www.sc.ehu.es/sbweb/fisica3/oscilaciones/mas/lissajous.html) y cada punto genera una recta con sus proximos 10 puntos, o algo por el estilo, lo que genera la sensacion de red/telaraña, y los botones modifica los parametros de la Figura de Lissajou

____
#### Convert
[Enlace recontruido](https://editor.p5js.org/Nicofon1/sketches/nhvdb9qJz)

<img width="600" height="600" alt="lissajous" src="https://github.com/user-attachments/assets/bd93ea30-3330-478e-b1ae-c740f20a685b" />

```js
puntos = [];
totalPuntos = 500;
freqX = 4;
freqY = 7;
fase = 15;
modFreqX = 3;
modFreqY = 2;

function setup() {
  createCanvas(600, 600);
  background(255);
  stroke(0, 50);
  noFill();
  angleMode(DEGREES);

  generarPuntos();
  generarRectas();
}

function generarPuntos() {
  puntos = [];
  for (let i = 0; i < totalPuntos; i++) {
    let angle = map(i, 0, totalPuntos, 0, 360);
    let x = sin(angle * freqX + fase) * cos(angle * modFreqX);
    let y = sin(angle * freqY) * cos(angle * modFreqY);
    x *= width / 2 - 40;
    y *= height / 2 - 40;
    x += width / 2;
    y += height / 2;
    puntos.push(createVector(x, y));
  }
}

function generarRectas() {
  strokeWeight(0.5);
  for (i = 0; i < puntos.length; i++) {
    for (j = i + 1; j <= i + 20 && j < puntos.length; j++) {
      line(puntos[i].x, puntos[i].y, puntos[j].x, puntos[j].y);
    }
  }
}

function keyPressed() {
  if (key == 's') {
    saveCanvas('lissajous', 'png');
  }

  if (key == '1') freqX--;
  if (key == '2') freqX++;
  freqX = max(freqX, 1);

  if (key == '3') freqY--;
  if (key == '4') freqY++;
  freqY = max(freqY, 1);

  if (keyCode == LEFT_ARROW) fase -= 15;
  if (keyCode == RIGHT_ARROW) fase += 15;

  if (key === '7') modFreqX--;
  if (key == '8') modFreqX++;
  modFreqX = max(modFreqX, 1);

  if (key == '9') modFreqY--;
  if (key == '0') modFreqY++;
  modFreqY = max(modFreqY, 1);

  background(255);
  generarPuntos();
  generarRectas();
  
}
```
inicialmente se generan todas las variables, despues dentro de  la funcion generar puntos la cual por la cantidad  de puntos previamente asignada, genera una posicion en base a las funciones vistas en Lissajous y guarda la posicion en la lista puntos, con esto se consigue la forma "armonica" aunq aun no se haya graficado, despues en generar rectas recorre la lista y por cada opsicion genera una recta con las 20 posiciones posteriores lo que le da el efecto de red, y ya por ultimo  al presionar cada tecla se edita el parametro correspondinete y se vuelven a generar los puntos y rectas

____
#### Explore
```js
function generarRectas() {
  strokeWeight(0.5);
  for ( i = 0; i < puntos.length; i++) {
    for ( j = i + 1; j <= i + 20 && j < puntos.length; j++) {

      if (arcoiris) {
       
        let hue = map(i, 0, puntos.length, 0, 360);
        colorMode(HSB, 360, 100, 100, 100); 
        stroke(hue, 80, 100, 40); 
      } else {
        colorMode(RGB); 
        stroke(0, 50);
      }

      line(puntos[i].x, puntos[i].y, puntos[j].x, puntos[j].y);
    }
  }
}
```

<img width="600" height="600" alt="lissajous (1)" src="https://github.com/user-attachments/assets/cbc7b1fc-3981-4b4a-9a8e-9eb7d1abc163" />


ahora mapeo el hue a lo largo de la cantidad de puntos y se lo voy aplicando a cada recta, con eso consigo un efecto tipo arcoiris o algo por el estilo, y permito cambiarlo con la tecla c

____
#### Tinker

[RESULTADO FINAL](https://editor.p5js.org/Nicofon1/sketches/aJX8smbNC)

``` js 
faseX = 15;
faseY = 15;
iX = 1;
iY =1;
move = false;



  if (keyCode == LEFT_ARROW) {
    if (move)iX--;
    else faseX -= 15;
  }
  
  if (keyCode == RIGHT_ARROW) {
    if (move)iX++;
    else faseX += 15;
  }
  if (keyCode == UP_ARROW) {
    if (move)iY++;
    else faseY += 15;
  }
    if (keyCode == DOWN_ARROW) {
    if (move)iY--;
    else faseY -= 15;
  }
  if (key === 'm')move = !move;



function draw(){
  if (move){
    faseX+=iX;
    faseY+=iY;
  background(255);
  generarPuntos();
  generarRectas();
    print(iX,iY);
  }
}
```

por ultimo  para intentar dar efecto rotacion en cada direccion activamos una variable move para cambiar entre estatico y movimiento, dsps una fase para x y otra para y, a su vez una intencidad para cada eje y las manejamos con las flechas y por ultimo en la funcion draw actualisamos cada fase acorde a cada intencidad 



