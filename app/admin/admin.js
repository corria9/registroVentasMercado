// --- Lógica para el Modal de Administrador CSV ---

// 1. Definir la contraseña de administrador (deberías mover esto a una variable de entorno en producción, pero para este ejercicio, la definimos aquí)
const ADMIN_PASSWORD = "1234"; // ¡Cambia esta contraseña!

const modalAdmin = document.getElementById('modal-admin-csv');
const formAdmin = document.getElementById('form-admin-csv');
const adminPasswordInput = document.getElementById('admin-password');
const adminErrorMessage = document.getElementById('admin-error-message');

function abrirModalAdmin() {
    modalAdmin.classList.remove('hidden');
    modalAdmin.classList.add('flex');
    adminPasswordInput.value = ''; // Limpiar el campo
    adminErrorMessage.classList.add('hidden'); // Ocultar errores previos
}

function cerrarModalAdmin() {
    modalAdmin.classList.add('hidden');
    modalAdmin.classList.remove('flex');
}

// Escuchar el envío del formulario de contraseña
formAdmin.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const password = adminPasswordInput.value;
    
    if (password === ADMIN_PASSWORD) {
        // Autenticación exitosa
        cerrarModalAdmin();
        // Redirigir a la pantalla de Carga CSV
        showScreen('screen-csv'); 
        // Opcional: mostrarToast('Acceso de administrador concedido', 'success');
        
    } else {
        // Contraseña incorrecta
        adminErrorMessage.classList.remove('hidden');
        adminPasswordInput.value = ''; // Limpiar el campo para otro intento
        // Opcional: mostrarToast('Contraseña incorrecta', 'error');
    }
});


// Asumiendo que esta es tu función para cambiar de pantalla (que ya existe en tu código)
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
        screen.classList.remove('active-screen');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.classList.add('active-screen');
    }
}