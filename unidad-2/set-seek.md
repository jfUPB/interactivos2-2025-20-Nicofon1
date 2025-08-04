# Unidad 2

## 🔎 Fase: Set + Seek


### Actividad 01
![195fe310-7afd-4a88-a5e2-4559af94141a_rw_600](https://github.com/user-attachments/assets/9ebd6c75-5fa8-4492-97b1-e32b1b5a3225)

+ ¿Cuáles son los Inputs que crees que utiliza el sistema?
  + El sistema probablemente recibe como inputs la forma y posición del cuerpo del artista capturada en tiempo real mediante sensores como Kinect, junto con el audio de su voz para extraer volumen, ritmo o tono. También podría considerar su ubicación en el escenario y la sincronización con la música o el tiempo del show.

 
+ ¿Cómo imaginas que es el Process? Describe las reglas o la lógica que podría estar detrás.
  + Supongo que el sistema primero genera una malla o un volumen del cuerpo del performer usando sensores de profundidad o alguna técnica de silhouette. Luego, se llenan esas formas con partículas que tienen una posición de reposo fija sobre esa estructura. Cuando hay un cambio fuerte en el sonido o en los movimientos del cuerpo, esas partículas se dispersan desde la malla con trayectorias controladas, como si algo las empujara, y después vuelven poco a poco a su lugar usando alguna interpolación o física simple. Eso hace que el cuerpo se vea como si estuviera explotando y reconstruyéndose con la música.


+ ¿Cuál es el Output final que se genera?
  + El resultado visual es una animación en tiempo real proyectada o mostrada en pantalla donde el cuerpo del artista parece desintegrarse en partículas flotantes y luego volver a formarse. Este efecto visual refuerza la conexión emocional entre el performance y el entorno digital, dando la impresión de que el artista se expande o se transforma con la música.

_____
### Actividad 02

#### Análisis conceptual de "Prometeo: El ritual"

| | Fase I: OPRESIÓN | Fase II: CONFLICTO | Fase III: REVELACIÓN |
| :--- | :--- | :--- | :--- |
| Input | La intensidad y el tono grave de la voz de Nerón, que se analizan en tiempo real para entender el estado emocional del artista. También se usa un Kinect para capturar la posición del artista en el escenario. | La aceleración y percusión del flow de rap, detectando los golpes de las sílabas y el ritmo. Los gestos enfáticos de Nerón, como manotazos o brazos alzados, también son capturados para interpretarlos como eventos de alta energía. | Palabras enviadas por el público a través de sus celulares, como "Miedo" o "Soledad". El movimiento de Nerón por el escenario, rastreado por el Kinect, determina la posición de su aura-llama. |
| Process | El software utiliza un sistema de partículas. La velocidad y densidad de estas partículas se manipulan a partir de la amplitud y la frecuencia de la voz de Nerón. Un tono más grave (menor frecuencia) y una mayor intensidad (mayor amplitud) resultan en partículas más lentas y densas. Adicionalmente, un shader en el motor gráfico crea un efecto de distorsión visual alrededor de la posición del artista, que se actualiza en tiempo real con los datos del Kinect. | Se realiza un análisis de la señal de audio para detectar picos de energía, que corresponden a los golpes del rap. Cada pico detectado activa un evento que genera un fragmento visual. El software monitorea continuamente las colisiones virtuales entre la posición del aura de Nerón y los fragmentos. Al detectarse una colisión, el vector de movimiento del fragmento se invierte para simular un rebote. Los gestos bruscos del artista, detectados por el Kinect, activan animaciones de "ondas de choque" que se expanden desde el cuerpo del artista. | Las palabras recibidas se procesan como un paquete de datos. Estos datos se convierten en texturas 3D que flotan en el espacio virtual. Se configura un "collider" invisible alrededor de la posición de Nerón (el aura-llama). Cuando una partícula de texto entra en contacto con este collider, se ejecuta una función condicional (if/else) que compara la palabra y activa una animación de transformación para esa palabra, como un florecimiento o el crecimiento de una energia o luz. |
| Output | El domo se sumerge en una penumbra azulada. Una lluvia de luz pesada y lenta reacciona directamente a la voz del artista, cayendo desde la cúpula. Se observa una distorsión visual alrededor del artista, simbolizando el peso emocional que carga. |  El artista, a través de su performance, se defiende del caos que su propia voz genera. Los fragmentos de luz se mueven erráticamente y rebotan al chocar con su aura. | La conclusión del conflicto se visualiza en el domo. La vulnerabilidad del público, representada por sus palabras, se transforma a través del ritual del artista. Las palabras se convierten en energia o luz o florecen, marcando el fin de la tensión narrativa. |


+ ¿Qué elemento del diseño te parece más innovador y por qué?

  + El elemento más innovador es la participación del público en la fase de Revelación. Esto convierte a la audiencia en co-creadora. Sus palabras, que representan sus emociones, se transforman en arte en tiempo real. Esta interacción crea una conexión más profunda, ya que los espectadores ven sus propios sentimientos formar parte del show.

+ ¿Cómo crees que la experiencia del público cambiaría si las palabras del público fueran eliminadas?

  + Sin este input, el show perdería su catarsis colectiva. La Revelación se sentiría como un final personal del artista, no compartido. La transformación visual se basaría en elementos predeterminados, no en la audiencia. El público pasaría de ser activo a pasivo, y se perdería la conexión única que se genera al compartir la vulnerabilidad.



____

 ### Actividad 03


+ ¿Cuál es la diferencia entre un “evento” en una película y un “nodo generativo” en "Prometeo"?

  + En una película, un **evento** es un punto fijo en la trama, como una escena que no cambia. Es algo que el público solo puede ver, no alterar.

  + Un **nodo generativo** en "Prometeo" es un punto de partida con múltiples posibilidades. El sistema no tiene un guion; reacciona en tiempo real a la voz y movimientos de Nerón. Cada vez que el artista actúa, se crea una historia visual única, haciendo que la experiencia sea diferente cada noche.


+ ¿Quién tiene más “agencia” o “poder” en "Prometeo"?

  + El poder está distribuido de forma equitativa entre todos. El control no reside en una sola persona, a pesar de q el neron tiene el mayor protagonismo, las tres son indispensables para el resultado final:

    + **El artista:** Su performance es el motor que inicia el sistema. Sin su voz y movimientos, no hay historia.
    + **El público:** Sus palabras influyen directamente en el resultado final, convirtiéndolos en co-autores de la narrativa.
    + **Los diseñadores:** Crean las reglas del sistema. y permite un puente entre las personas y la experiencia propia.


+ ¿Qué significa generar “epifanías” en lugar de “empatía”?

  + **Empatía** es sentir lo que otro siente. Por ejemplo, sentir la tristeza de Nerón.

  + **Epifanía** es tener una revelación o un momento de comprensión personal. La meta de "Prometeo" no es solo que el público sienta lo que el artista siente, sino que al ver sus propias palabras ("Miedo" o "Soledad") transformarse en algo interno, tengan una revelación sobre sus propias emociones. Es un momento de entendimiento personal creado a partir de una experiencia colectiva.
