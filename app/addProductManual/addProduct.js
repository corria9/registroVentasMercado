/* ------ AGREGAR MANUAL (VERSIÓN DEPURADA) ------ */
function addProduct() {
    try {
        // 1. Obtener los elementos por ID (para obtener valores y limpiarlos después)
        const skuInput = document.getElementById("add-sku");
        const nombreInput = document.getElementById("add-nombre");
        const descInput = document.getElementById("add-desc");
        const stockInput = document.getElementById("add-stock");
        const precioInput = document.getElementById("add-precio");
        const imagenInput = document.getElementById("add-imagen");

        // **A. Validación de Campos Esenciales**
        if (!skuInput || !nombreInput || !stockInput || !precioInput || !skuInput.value || !nombreInput.value || stockInput.value === "" || precioInput.value === "") {
            // Muestra un error si faltan datos
            return showToast("🚨 Error: Faltan datos esenciales (SKU, Nombre, Stock o Precio).", 'error');
        }

        const imgFile = imagenInput ? imagenInput.files[0] : null;
        let imgURL = null;

        // **B. Manejo de la Imagen**
        if (imgFile) {
             // Asegurarse de que el objeto URL se crea correctamente
             imgURL = URL.createObjectURL(imgFile);
        }

        // 2. Crear el objeto del nuevo producto
        const item = {
            sku: skuInput.value,
            nombre: nombreInput.value,
            desc: descInput.value,
            stock: Number(stockInput.value),
            vendido: 0,
            precio: Number(precioInput.value),
            imagen: imgURL
        };

        // 3. Agregar al inventario
        inventory.push(item);

        // 4. Renderizar (Estas funciones deben estar bien, sino el toast tampoco aparecerá)
        renderTable();
        renderSales();
        
        // 5. LIMPIEZA DE LOS CAMPOS
        skuInput.value = "";
        nombreInput.value = "";
        descInput.value = "";
        stockInput.value = "";
        precioInput.value = "";
        
        // El input de imagen es el más probable de fallar si no existe
        if (imagenInput) { 
            imagenInput.value = ""; 
        }
        
        // 6. Notificación de éxito
        showToast("✅ Producto cargado con éxito.", 'success');
        
    } catch (e) {
        // Si hay un error, lo atrapamos y mostramos un toast de error con el detalle
        console.error("Error en addProduct:", e);
        // Usamos alert como respaldo, por si el toast falla
        alert("Ocurrió un error inesperado. Revisa la consola (F12) para más detalles."); 
        
        // Intenta mostrar el toast de error con el mensaje de la excepción (si showToast está accesible)
        if (typeof showToast === 'function') {
             showToast("❌ Error crítico: Consulta la consola para el detalle.", 'error');
        }
    }
}