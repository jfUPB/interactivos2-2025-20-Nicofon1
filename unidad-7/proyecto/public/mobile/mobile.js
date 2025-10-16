let estadoActual = 1;
const socket = io();

const appContainer = document.getElementById('app-container');

function renderUIForState(estado) {
    appContainer.innerHTML = '';

    if (estado === 1) {
        const instruction = document.createElement('div');
        instruction.className = 'instruction-text';
        instruction.textContent = 'Mantén presionado para ser parte de la cascada';
        
        const ellipse = document.createElement('div');
        ellipse.className = 'touch-ellipse';

        const onPressStart = () => {
            ellipse.classList.add('active');
            socket.emit('state1_start_press');
            console.log('Enviado: state1_start_press');
        };

        const onPressEnd = () => {
            ellipse.classList.remove('active');
            socket.emit('state1_end_press');
            console.log('Enviado: state1_end_press');
        };

        ellipse.addEventListener('mousedown', onPressStart);
        ellipse.addEventListener('mouseup', onPressEnd);
        ellipse.addEventListener('mouseleave', onPressEnd);
        
        ellipse.addEventListener('touchstart', onPressStart);
        ellipse.addEventListener('touchend', onPressEnd);
        
        appContainer.appendChild(instruction);
        appContainer.appendChild(ellipse);
    }

    // ==========================================================
    //                        ESTADO 2
    // ==========================================================
    else if (estado === 2) {
        // Aquí irá la UI para el Estado 2 cuando la construyamos.
    }

    // ==========================================================
    //                        ESTADO 3
    // ==========================================================
    else if (estado === 3) {
        // Aquí irá la UI para el Estado 3.
    }

    // ==========================================================
    //                        ESTADO 4
    // ==========================================================
    else if (estado === 4) {
        // Aquí irá la UI para el Estado 4.
    }
}


// --- INICIALIZACIÓN ---

// Llamamos a la función por primera vez para que dibuje la UI del estado inicial.
renderUIForState(estadoActual);

// Más adelante, escucharemos al servidor para cambiar de estado dinámicamente:
/*
socket.on('cambio_estado', (nuevoEstado) => {
    estadoActual = nuevoEstado;
    renderUIForState(estadoActual);
});
*/