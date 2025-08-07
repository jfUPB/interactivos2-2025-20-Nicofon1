# Unidad 2


## 🛠 Fase: Apply

### Alas pa volar y motivos pa quedarse  
### Canción seleccionada: *Ambrosía*

---

### Concepto Raíz:  
El público no es espectador: es materia prima. A través de sus decisiones, su energía y su presencia, cada persona proyecta una manifestación emocional única en un espacio compartido. El artista es catalizador, pero la narrativa emerge desde el enjambre.

---

### Fase 1: Reflejo Fragmentado  
**Emoción Buscada:** Extrañamiento / Reconocimiento  
**Input:**  
- Cada celular del público activa su cámara trasera (previa autorización).  
- El sistema obtiene en tiempo real un feed comprimido del punto de vista de cada persona.  
- Los datos de posición de los celulares (ángulo, orientación y ubicación relativa en el domo) se obtienen vía sensores del teléfono (giroscopio, brújula) y conexión con una app base vía WebRTC + WebSockets.  

**Process:**  
- Se genera una superficie semitransparente tipo “domo de cristal” en la proyección, cubierta por gotas dinámicas.  
- Cada gota es asignada a una persona del público. En su interior se refleja en tiempo real lo que esa persona ve (su feed de cámara).  
- Las gotas tiemblan o se distorsionan ligeramente según el volumen de la música (usando FFT para extraer amplitud).  

**Output:**  
- El domo completo parece estar cubierto de agua y cada gota muestra una perspectiva distinta del mismo momento.  
- Si muchos enfocan al artista, su figura aparece multiplicada desde cientos de ángulos.  
- Las gotas se sincronizan con la atmósfera: lluvia lenta, luces bajas, predominio de tonos fríos.  

---

### Fase 2: Irrupción de Emoción  
**Emoción Buscada:** Caos interpretativo / Participación activa  
**Input:**  
- El público accede desde su celular a una interfaz web interactiva (no app instalada).  
- Allí, elige una emoción entre varias propuestas visualmente representadas (íconos, colores, audio, etc.).  
- Adicionalmente, cada persona puede personalizar variables como: intensidad, patrón de movimiento, brillo o forma.  
- El sistema registra estas elecciones como identificadores únicos de usuario.  

**Process:**  
- Cada elección se convierte en un flujo de partículas o energía proyectada desde el suelo al techo, con color y comportamiento únicos.  
- Cada persona tiene un “canal” visual distinto y reconocible (como si fuera su pincel).  
- Cada 20 segundos se recalculan los niveles colectivos: si hay concentración alta de una emoción, se desencadena un evento:  
  - **Rabia** → explosiones verticales de luz tipo fuego.  
  - **Miedo** → niebla densa que desdibuja el domo.  
  - **Vacío** → partículas se disuelven y el sonido se apaga brevemente.  
  - **Esperanza** → brotes de luz en los costados, como crecimiento.  
- El sistema hace un análisis del beat en tiempo real (mediante onset detection) y sincroniza los comportamientos de los flujos con cada golpe percusivo: más velocidad, cambio de dirección o expansión.  

**Output:**  
- El domo se convierte en una sinfonía caótica de emociones en movimiento.  
- Cada persona puede distinguir su “rastro” en el espacio, pero también ve cómo se transforma según las elecciones colectivas.  
- La música intensifica las respuestas visuales: todo vibra y crece con el beat.

---

### Fase 3: Germinación  
**Emoción Buscada:** Resolución / Nacimiento compartido  
**Input:**  
- El sistema compila las elecciones y patrones dominantes de la fase anterior.  
- Usa la data de mayor presencia emocional y de mayor personalización como “semillas” para generar elementos visuales nuevos.  
- Cada celular ahora se convierte en un controlador simple de insectos generativos (tipo luciérnagas, mariposas, etc.).  

**Process:**  
- Toda la información emocional acumulada asciende y se condensa en el vértice superior del domo.  
- Visualmente, se representa como un vórtice o cúmulo que empieza a generar raíces virtuales.  
- El domo se transforma en una esfera de cristal en medio de un entorno natural. Pasto comienza a crecer en la base proyectada del domo.  
- Con cada golpe del beat, insectos virtuales emergen desde el pasto.  
- Los asistentes, desde sus celulares, pueden mover estas criaturas mediante gestos simples (deslizamientos, toques), provocando trayectorias únicas.  
- Los insectos se ven influenciados por las emociones elegidas anteriormente: velocidad, color, tipo de vuelo.  

**Output:**  
- El domo se llena de vida controlada parcialmente por el público.  
- Hay un amanecer progresivo: la oscuridad se disuelve, y la luz cálida se apodera del entorno.  
- El público ve cómo algo crece a partir de lo que ellos mismos sembraron.

---

### Conexión con la Teoría de Future Narratives:

#### Nodos:  
Cada una de las fases actúa como nodo de bifurcación.  
- Fase 1: ¿A quién decides mirar? ¿Desde qué ángulo?  
- Fase 2: ¿Qué emoción eliges? ¿Cómo la configuras?  
- Fase 3: ¿Cómo mueves a tu criatura? ¿Cómo interactúas con las de otros?

Estas decisiones alteran no solo la estética visual sino también el tipo de eventos emergentes que pueden ocurrir.

---

#### Multi-linealidad y emergencia:  
No hay dos funciones iguales.  
Las combinaciones únicas de emociones, personalizaciones, tiempos de respuesta e interacciones crean patrones visuales, sonoros y narrativos irrepetibles.  
El sistema responde tanto a datos individuales como a correlaciones grupales. Esto genera una narrativa emergente, siempre cambiante.

---

#### Staging la apertura:  
No se le cuenta al público lo que va a pasar. Se le pone en una situación de ambigüedad interactiva.  
El escenario no se explica, se vive.  
La interfaz es mínima, pero significativa: elegir, tocar, deslizar. Cada acción tiene una respuesta inmediata en el entorno visual y emocional.

---

#### Agencia Distribuida:  
- **Artista:** dispara la experiencia con su música, presencia y ritmo.  
- **Público:** moldea el contenido emocional del espacio, elige cómo participar, genera sus propios trazos e interacciones.  
- **Sistema:** media entre ambos. Traduce música, elecciones y datos en visuales. A veces reacciona, a veces propone.  
