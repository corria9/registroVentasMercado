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
   🚀 FUNCIÓN addProduct() - VERSIÓN FINAL PARA PRODUCCIÓN
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
        // Cambiamos el estado del botón para que el usuario sepa que algo sucede
        btnGuardar.disabled = true;
        const originalText = btnGuardar.innerText;
        
        if (imgFile) {
            btnGuardar.innerHTML = `<span>⏳ Subiendo Imagen...</span>`;
            showToast("📸 Procesando imagen, esto puede tardar unos segundos...", 'info');
        } else {
            btnGuardar.innerHTML = `<span>⏳ Guardando...</span>`;
        }

        // --- C. PREPARACIÓN DE DATOS ---
        const formData = new FormData();
        formData.append("sku", skuValue);
        formData.append("nombre", nombreValue);
        formData.append("desc", descInput.value);
        formData.append("stock", Number(stockValue));
        formData.append("precio", Number(precioValue));
        
        if (imgFile) {
            // El nombre 'imagen' debe coincidir con el parámetro en tu FastAPI
            formData.append("imagen", imgFile); 
        }

        // --- D. LLAMADA AL BACKEND ---
        // API_ENDPOINT debe estar definido globalmente como "http://127.0.0.1:8000/api/v1/productos"
        const response = await fetch(API_ENDPOINT, { 
            method: 'POST',
            body: formData 
        });

        // --- E. MANEJO DE ERRORES DEL SERVIDOR ---
        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.detail || errorData.message || `Error ${response.status}`;
            throw new Error(errorMessage);
        }

        // --- F. ÉXITO ---
        // 1. Mostramos el mensaje de éxito inmediatamente
        showToast("✅ Producto guardado exitosamente.", 'success');

        // 2. Limpiamos los campos del formulario
        skuInput.value = "";
        nombreInput.value = "";
        descInput.value = "";
        stockInput.value = "";
        precioInput.value = "";
        if (imagenInput) imagenInput.value = "";
        if (skuErrorMessage) skuErrorMessage.classList.add('hidden');
        skuInput.classList.remove('border-red-500');

        // 3. Actualizamos los datos del inventario sin cambiar de pantalla
        if (typeof loadInventory === 'function') {
            await loadInventory(); 
            if (typeof renderTable === 'function') renderTable();
            if (typeof renderSales === 'function') renderSales();
        }

    } catch (error) {
        console.error("Error en addProduct:", error);
        showToast(`❌ Error: ${error.message}`, 'error');
    } finally {
        // --- G. RESTAURAR BOTÓN ---
        btnGuardar.disabled = false;
        btnGuardar.innerText = "Guardar Producto";
    }
}