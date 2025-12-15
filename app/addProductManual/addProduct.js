/* ===================================================================
    FUNCIÓN addProduct() - Versión con LLAMADA AL BACKEND (FastAPI)
    ===================================================================
*/

// ⭐ IMPORTANTE: Define la URL de tu Backend aquí.
// Usa esta para prueba local:
const BACKEND_URL = "http://127.0.0.1:8000"; 
// Cambia a tu URL de Cloud Run (después del despliegue):
//const BACKEND_URL = "https://armaly-backend-xyz123-uc.a.run.app"; 

const API_ENDPOINT = BACKEND_URL + "/api/v1/productos";


// La función debe ser 'async' para poder usar 'await' con fetch.
async function addProduct() { 
    
    // 1. Obtener los elementos del DOM
    const skuInput = document.getElementById("add-sku");
    const nombreInput = document.getElementById("add-nombre");
    const descInput = document.getElementById("add-desc");
    const stockInput = document.getElementById("add-stock");
    const precioInput = document.getElementById("add-precio");
    const imagenInput = document.getElementById("add-imagen");
    
    // Elementos de feedback visual para el SKU
    const skuErrorMessage = document.getElementById('sku-error-message');

    // Muestra un indicador de carga (opcional: si tienes una función showLoading)
    // showLoading(true); 

    try {
        // A. Obtener y Validar Campos Esenciales
        const skuValue = skuInput.value.trim();
        const nombreValue = nombreInput.value.trim();
        const stockValue = stockInput.value;
        const precioValue = precioInput.value;

        if (!skuValue || !nombreValue || stockValue === "" || precioValue === "") {
            if (skuErrorMessage) skuErrorMessage.classList.add('hidden');
            return showToast("🚨 Error: Faltan datos esenciales (SKU, Nombre, Stock o Precio).", 'error');
        }

        // B. Validación de SKU Único (LOCAL)
        // Nota: La validación final y más segura siempre debe realizarse en el Backend.
        skuInput.classList.remove('border-red-500');
        if (skuErrorMessage) skuErrorMessage.classList.add('hidden');
        
        // Asumiendo que 'inventory' es un array global o accesible.
        if (inventory.some(item => item.sku === skuValue)) {
            skuInput.classList.add('border-red-500');
            if (skuErrorMessage) skuErrorMessage.classList.remove('hidden');
            return showToast('🚨 Error: El SKU ingresado ya existe. Por favor, usa un SKU único.', 'error');
        }

        const imgFile = imagenInput ? imagenInput.files[0] : null;
        
        // 2. CREAR EL OBJETO FormData para envío (Permite enviar archivo + texto)
        const formData = new FormData();
        
        // Agregar los campos de texto
        formData.append("sku", skuValue);
        formData.append("nombre", nombreValue);
        formData.append("desc", descInput.value);
        formData.append("stock", Number(stockValue));
        formData.append("precio", Number(precioValue));
        
        // Agregar el archivo de imagen (si existe)
        if (imgFile) {
            // El nombre 'file' debe coincidir con el parámetro de tu endpoint de FastAPI (ej: file: UploadFile = File(None))
            formData.append("imagen", imgFile); 
        }

        // 3. LLAMADA ASÍNCRONA AL BACKEND (POST)
        const response = await fetch(API_ENDPOINT, { 
            method: 'POST',
            // No se establece 'Content-Type' manualmente con FormData
            body: formData 
        });

        // 4. MANEJO DE LA RESPUESTA DEL BACKEND
        if (!response.ok) {
            // Si el backend devuelve un error (ej: SKU duplicado, error de base de datos)
            const errorData = await response.json();
            // Intenta extraer el detalle del error, si existe
            const errorMessage = errorData.detail || errorData.message || `Error del servidor (${response.status})`;
            throw new Error(errorMessage);
        }

        // ⭐ El producto fue guardado en Firestore y la imagen en Storage por el Backend.

        // 5. RECUPERAR DATOS Y RENDERIZAR
        // Asumimos que tienes una función global 'loadInventory' que trae los datos desde la API.
        if (typeof loadInventory === 'function') {
            await loadInventory(); 
            renderTable();
            renderSales();
        } else {
            console.warn("Función loadInventory() no encontrada. La tabla no se actualizó automáticamente.");
        }
        
        // 6. LIMPIEZA DE LOS CAMPOS
        skuInput.value = "";
        nombreInput.value = "";
        descInput.value = "";
        stockInput.value = "";
        precioInput.value = "";
        
        if (imagenInput) { 
            imagenInput.value = ""; 
        }
        
        // 7. Notificación de éxito
        showToast("✅ Producto cargado con éxito y guardado en el servidor.", 'success');
        
    } catch (e) {
        // Capturar errores de red, fallos del servidor, o errores de validación
        console.error("Error en addProduct:", e);
        showToast(`❌ Error al guardar producto: ${e.message}`, 'error');
        
    } finally {
        // Oculta el indicador de carga al finalizar (opcional)
        // showLoading(false); 
    }
}