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

// --- Lógica de Carga y Envío de CSV ---

const formCsvUpload = document.getElementById('form-csv-upload');
const csvFileInput = document.getElementById('csv-file-input');
const csvUploadResult = document.getElementById('csv-upload-result');
// API_BASE_URL (debe ser la misma que en tablaInventory.js: http://127.0.0.1:8000/api/v1/productos)

formCsvUpload.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    csvUploadResult.classList.add('hidden');
    csvUploadResult.innerHTML = '<p class="text-gray-600">Procesando archivo... por favor espere.</p>';
    csvUploadResult.classList.remove('hidden');

    const file = csvFileInput.files[0];
    if (!file) {
        csvUploadResult.innerHTML = '<p class="text-red-500">Por favor, selecciona un archivo CSV.</p>';
        return;
    }

    const formData = new FormData();
    formData.append('file', file); // 'file' debe coincidir con el parámetro de FastAPI (file: UploadFile = File(...))

    try {
        const response = await fetch(`${API_BASE_URL}/csv-upload`, {
            method: 'POST',
            body: formData // No necesitas Headers (Content-Type) para FormData
        });

        const data = await response.json();

        if (response.ok) {
            // Carga exitosa, actualizar la tabla
            renderSummary(data.summary);
            fetchInventory(); // Recargar la tabla principal

            // ⭐ VALIDACIÓN DE USABILIDAD: LIMPIAR EL INPUT DE ARCHIVO
            formCsvUpload.reset();
            
        } else {
            // El backend devolvió un error (400, 500, etc.)
            renderSummary([{ status: 'error', error: data.detail || 'Fallo desconocido en la carga.' }]);
        }

    } catch (error) {
        console.error('Error de red o procesamiento:', error);
        csvUploadResult.innerHTML = `<p class="text-red-500">Error de conexión: ${error.message}</p>`;
    }
});


/**
 * Muestra el resumen de la carga en el div de resultados.
 * @param {Array} summary - Lista de objetos de resumen (ej: [{sku: 'A100', status: 'ok'}])
 */
function renderSummary(summary) {
    let successCount = 0;
    let errorCount = 0;
    let html = '<h4 class="font-bold mb-2">Resultado de la Carga:</h4>';
    html += '<ul class="text-sm space-y-1 max-h-40 overflow-y-auto">';
    
    summary.forEach(item => {
        if (item.status === 'ok') {
            successCount++;
            html += `<li class="text-green-600">✅ SKU ${item.sku}: Creado/Actualizado.</li>`;
        } else if (item.status === 'error') {
            errorCount++;
            const skuDisplay = item.sku && item.sku !== 'N/A' ? item.sku : 'Fila sin SKU';
            html += `<li class="text-red-600">❌ ${skuDisplay}: Error: ${item.error}</li>`;
        }
    });
    
    html += '</ul>';
    html += `<p class="mt-3 font-semibold">Resumen: ${successCount} éxito(s), ${errorCount} error(es).</p>`;

    csvUploadResult.innerHTML = html;
    csvUploadResult.classList.remove('hidden');
}

// Nota: Asegúrate de que 'fetchInventory()' (de tablaInventory.js) esté disponible globalmente.