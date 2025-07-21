# Unidad 1

## 🔎 Fase: Set + Seek

### Actividad #1

+ ¿Qué es el diseño generativo?
  
  + El diseño generativo es un metodo para generar un producto a travez de un algorithmo y parametros, y el producto cambia con el tiempo y/o reacciona a los inputs ingresados, ademas al ser un diseño al producto cumple unos cualidades preconsebidas
+ ¿Qué es el arte generativo?
  + El arte generativo es un tipo de arte en el que la obra se genera a travez de algoritmos y parametros, su resultado varia de acuerdo al tiempo o paramentros ingresados
+ ¿Cuál es la diferencia entre el diseño/arte generativo vs el diseño/arte tradicional?
  + que el diseñador/artista genera su obra con algoritmos y parametros como intermediarios, mientras que el tradicional suele ser el productor directo de su obra
+ ¿Qué posibilidades crees que esto puede ofrecer a tu perfil profesional?
  + la capacidad de genrear obras genereativas me permite hacer creaciones poco comunes y llamativas, sobretodo al ser productos que fluctuan y reaccionan al instante actual, estas cualidades permiten tener una gran conexion con el usuario y poderles brindar una experiencia memorable, lo cual es algo indispensable y muy potente a nivel comercial-




____
### Actividad #2

+ Antes de lo que hemos discutido, ¿Qué pensabas que hacía un Ingeniero en diseño de entretenimiento digital con énfasis en experiencias interactivas?
  
  + la concepsion que usualmente he tenido de un Ingeniero en diseño de entretenimiento digital con énfasis en experiencias interactivas es alguin que se dedica a ui/ux y ps tmbn la salida de realizar cosas de vr/ar, pero ya, no mucho más.
+ ¿Qué potencial le ves al diseño e implementación de experiencias inmersivas colectivas?
  + siento que es un factor diferenciador que tiene mucho impacto, ademas pensandolo en el contexto de medellin, al ser una ciudad tan festiva con alta frecuencia de eventos y discotecas muy activas, la implementación de experiencias inmersivas colectivas es un sector con muy poca competencia y mucha salida.
+ Nosotros estamos definiendo en TIEMPO REAL una nueva forma de expresión, una nueva forma de interactuar de manera colectiva. Estamos diseñando nuevas maneras de contar historias e interactuar con ellas. ¿Cómo te ves profesionalmente en este escenario?
  + han sido pocas las veces que he considerado esto como salida laboral, a pesar de que me agrada la idea, no me agrada el tenerme que rebuscar los 2 o 3 trabajos del mes, me gusta mas un puesto con salario fijo, pero exceptuando eso, si llego a escogerlo como profecion, me veria haciendo contratos a largo plazo con discotecas de la ciudad,  haciendo experiencias para eventos no muy grandes, algo un poco mas estable.
 
____
### Actividad #3

Original: [M_1_5_02](http://www.generative-gestaltung.de/2/sketches/?02_M/M_1_5_02) 

<img width="668" height="599" alt="image" src="https://github.com/user-attachments/assets/d0804869-eff4-4e57-8179-fa0164186f76" />


Editado: [Acuarela](https://editor.p5js.org/Nicofon1/sketches/n2TuJXrZo)


<img width="658" height="481" alt="image" src="https://github.com/user-attachments/assets/9dcf3d20-e8f4-4ecf-81c6-fc52cb45cc40" />


le baje la opacidad `  var agentAlpha = 5;` y le aumente el grosor `var strokeWidth = 4;` para que tuviera efecto como de acuarela, y por ultimo le agregue logica pa que cambie de color segun la posicion del mouse
```js
p.stroke(
    p.mouseX * 255 / p.width,
    p.mouseY * 255 / p.height,
    (p.mouseX + p.mouseY) * 255 / (p.width + p.height),
    agentAlpha
    );
```



____
### Actividad #4


[Figuras](https://editor.p5js.org/Nicofon1/sketches/03T7fuwpm)

```js
function setup() {
  createCanvas(600, 600);
  background(255);
  noStroke();
}

function draw() {
  shapeType = int(random(3));
  x = random(width);
  y = random(height);
  size = random(5, (mouseX /2.5)+5); 
    fill(random(255), random(255), random(255),  random(mouseY))

  if (shapeType == 0) {
    ellipse(x, y, size, size);
  } else if (shapeType == 1) {
    rect(x, y, size, size);
  } else {
    half = size / 2;
    triangle(x, y - half, x - half, y + half, x + half, y + half);
  }
}

function keyPressed() {
  background(255);
}

```

inicialmente se crea un random entre 0 y 2 para definir el tipo de figura, despues se crean los randoms x,y contenidos dentro de las dimenciones de la pantalla, se crea un size random con un max conrtolado por la posicion x del mouse, despues se crea un color random con una opacidad controlada por el y del mouse, y por ultimo se crea la figura acorde al tipo tamaño color y opacidad definidos.



<img width="582" height="486" alt="image" src="https://github.com/user-attachments/assets/0d7d58d8-5a69-4e12-9785-63ee301031c5" />
