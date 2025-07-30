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
