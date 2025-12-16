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

/* ===================================================================
   🚀 FUNCIÓN addProduct() - VERSIÓN FINAL INTEGRADA
   =================================================================== */

   async function addProduct() {
    // 1. Referencias a elementos del DOM
    const skuInput = document.getElementById("add-sku");
    const nombreInput = document.getElementById("add-nombre");
    const descInput = document.getElementById("add-desc");
    const stockInput = document.getElementById("add-stock");
    const precioInput = document.getElementById("add-precio");
    const imagenInput = document.getElementById("add-imagen");
    const btnGuardar = document.querySelector("button[onclick='addProduct()']");
    
    // Feedback visual de SKU
    const skuErrorMessage = document.getElementById('sku-error-message');

    // Definición de la URL (Asegúrate de que coincida con tu API_BASE_URL)
    const API_ENDPOINT = "http://127.0.0.1:8000/api/v1/productos/";

    try {
        // --- A. VALIDACIONES INICIALES ---
        const skuValue = skuInput.value.trim();
        const nombreValue = nombreInput.value.trim();
        const stockValue = stockInput.value;
        const precioValue = precioInput.value;
        const imgFile = imagenInput ? imagenInput.files[0] : null;

        if (!skuValue || !nombreValue || stockValue === "" || precioValue === "") {
            return showToast("🚨 Datos incompletos: SKU, Nombre, Stock y Precio son obligatorios.", 'error');
        }

        // --- B. ESTADO DE CARGA (UX) ---
        btnGuardar.disabled = true;
        const originalText = btnGuardar.innerText;
        
        if (imgFile) {
            btnGuardar.innerHTML = `<span>⏳ Subiendo Imagen...</span>`;
            if (typeof showToast === 'function') showToast("📸 Procesando imagen...", 'info');
        } else {
            btnGuardar.innerHTML = `<span>⏳ Guardando...</span>`;
        }

        // --- C. PREPARACIÓN DE DATOS (FormData para enviar archivos) ---
        const formData = new FormData();
        formData.append("sku", skuValue);
        formData.append("nombre", nombreValue);
        formData.append("desc", descInput.value.trim() || ""); // Enviamos 'desc' para tu backend
        formData.append("stock", Number(stockValue));
        formData.append("precio", Number(precioValue));
        
        if (imgFile) {
            formData.append("imagen", imgFile); 
        }

        // --- D. LLAMADA AL BACKEND ---
        const response = await fetch(API_ENDPOINT, { 
            method: 'POST',
            body: formData 
        });

        // --- E. MANEJO DE ERRORES DEL SERVIDOR ---
        if (!response.ok) {
            const errorData = await response.json();
            // Si el error es un detalle de validación de FastAPI
            const errorMessage = errorData.detail || "Error al guardar el producto";
            throw new Error(errorMessage);
        }

        // --- F. ÉXITO ---
        if (typeof showToast === 'function') showToast("✅ Producto guardado exitosamente.", 'success');

        // 1. Limpiamos los campos del formulario
        skuInput.value = "";
        nombreInput.value = "";
        descInput.value = "";
        stockInput.value = "";
        precioInput.value = "";
        if (imagenInput) imagenInput.value = "";
        
        // Limpiar estilos de error si existían
        if (skuErrorMessage) skuErrorMessage.classList.add('hidden');
        skuInput.classList.remove('border-red-500');

        // 2. ACTUALIZACIÓN AUTOMÁTICA DE LA TABLA
        // Llamamos a la función de tablaInventory.js para refrescar los datos sin recargar
        if (typeof fetchInventory === 'function') {
            await fetchInventory(); 
        } else {
            console.warn("La función fetchInventory no está disponible en el alcance global.");
        }

    } catch (error) {
        console.error("Error en addProduct:", error);
        if (typeof showToast === 'function') showToast(`❌ Error: ${error.message}`, 'error');
        
        // Si el error indica que el SKU ya existe, resaltamos el campo
        if (error.message.toLowerCase().includes("sku")) {
            skuInput.classList.add('border-red-500');
            if (skuErrorMessage) skuErrorMessage.classList.remove('hidden');
        }
    } finally {
        // --- G. RESTAURAR BOTÓN ---
        btnGuardar.disabled = false;
        btnGuardar.innerText = "Guardar Producto";
    }
}