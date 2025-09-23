# Pasos para realizar los experimentos

## Crear un codespaces:

![codespaces](https://github.com/user-attachments/assets/97d7b532-42c4-4a97-a0d3-b8ff335b0ebe)

## Servidor

Este proyecto implementa un servidor web al que añade funcionalidades de Websocket usando socket.io. 
El servir gestionará las solicitudes de páginas web y además la conexión socket.io (websocket) con los 
clientes. La tarea del servidor web es servir dos 
posibles sitios: un sitio móvil y un sitio de escritorio. El sitio 
móvil leerá la posición x,y del sensor touch del celular y la enviará al socket.io. 
Si hay un cliente de escritorio corriendo el sitio web de escritorio, este podría recibir la información 
del touch del cliente móvil. Con esta información, pintará un círculo en la posición x,y recibida. 
De nuevo, la comunicación entre los dos sitios se realizará mediante socket.io.

* El archivo server.js contiene el código del servidor.
* En la carpeta public están los dos sitios web: mobile y desktop.

Los pasos para ejecutar la aplicación son:

* Clonar el repositorio en el codespaces.
* Instalar las dependencias con el comando

``` bash
npm install
```

* Ejecutar el servidor con:

``` bash
npm start
```

* Leer la url que expondrá Github para contar remotamente los clientes. En mi caso es la siguiente, pero en tu caso será una completamante
diferente:

![image](https://github.com/user-attachments/assets/a3ed9256-015b-497e-98e6-b33f62dad611)

En la columna Visibility, presiona click derecho en Private y cámbialo a Public. Ten presente 
que si lo dejas Private tendrás que autenticarte con tus credenciales de github tanto 
en tu computador (sitio web de escritorio) como en tu celular (sitio web móvil)

En este caso sería (para este ejemplo, en tu caso serán distintas):

``` js
https://supreme-space-eureka-x9wpv75jjpf6gpv-3000.app.github.dev/
```

Ahora que conoces todas las URL que necesitarás sigue esto pasos:

* Detener los servidor (con la combinación CTRL+C en la terminal)
* Modificar la URL del socketUrl en cada aplicación: mobile, desktop.
* Inicia de nuevo el servidor:

``` bash
npm start
```

* En los clientes las aplicaciones web estarían corriendo en (para este ejemplo, en tu caso serán distintas):

``` js
https://supreme-space-eureka-x9wpv75jjpf6gpv-3000.app.github.dev/desktop/index.html
https://supreme-space-eureka-x9wpv75jjpf6gpv-3000.app.github.dev/mobile/index.html
```

## Sitios web

No olvides modificar el archivo sketch.js para el sitio desktop y mobile en esta parte 
del código:

Desktop

``` js
    //let socketUrl = 'http://localhost:3000';
    let socketUrl = 'https://supreme-space-eureka-x9wpv75jjpf6gpv-3000.app.github.dev/';
    socket = io(socketUrl); 
```

Mobile:

``` js
    // Conectar al servidor de Socket.IO
    //let socketUrl = 'http://192.168.1.17:3000';
    let socketUrl = 'https://supreme-space-eureka-x9wpv75jjpf6gpv-3000.app.github.dev/';
    socket = io(socketUrl);

```

> [!WARNING]  
> Una vez termines de hacer las pruebas NO OLVIDES apagar el CODESPACES. Esto es fundamental,
> si no lo haces no podrás hacer más pruebas desde CodeSpaces y tendrás que hacer las pruebas
> locales.

![image](https://github.com/user-attachments/assets/2dee0177-c306-48d6-8400-0b5f76bcd99a)


## PRUEBAS LOCALES

Puedes hacer esta experiencia sin necesidad de usar codespaces, es decir, puedes correr el servidor 
de manera local en tu computador, pero hay unas condiciones. Nota que la línea localhost está comentada. Esta línea 
permite hacer pruebas locales, pero tendrás que tener un computador con WiFi y permisos (firewall configurado) para 
que el celular pueda acceder al servidor que están corriendo en tu computador. Como la aplicación en tu 
móvil se conectará a tu computador, necesitarás conocer la dirección IP del computador. Eso lo haces abriendo el 
símbolo del sistema de windows y escribiendo el comando:

``` bash
ipconfig
```

En mi caso busco:

Wireless LAN adapter Wi-Fi:
IPv4 Address. . . . . . . . . . . : 192.168.1.17

Y en el archivo sketch.js de la aplicación móvil haría la siguiente modificación

``` js
    let socketUrl = 'http://192.168.1.17:3000';
    //let socketUrl = 'https://probable-fiesta-q9q4pjvqq73949w-8080.app.github.dev';
    socket = io(socketUrl);
```


