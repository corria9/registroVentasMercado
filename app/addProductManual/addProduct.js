/* ------ AGREGAR MANUAL (VERSIÓN CON VALIDACIÓN DE SKU ÚNICO) ------ */
function addProduct() {
    // 1. Obtener los elementos por ID (para obtener valores y limpiarlos después)
    const skuInput = document.getElementById("add-sku");
    const nombreInput = document.getElementById("add-nombre");
    const descInput = document.getElementById("add-desc");
    const stockInput = document.getElementById("add-stock");
    const precioInput = document.getElementById("add-precio");
    const imagenInput = document.getElementById("add-imagen");
    
    // Elementos de feedback visual para el SKU
    const skuErrorMessage = document.getElementById('sku-error-message');

    try {
        // **A. Validación de Campos Esenciales**
        const skuValue = skuInput.value.trim();
        const nombreValue = nombreInput.value.trim();
        const stockValue = stockInput.value;
        const precioValue = precioInput.value;


        if (!skuValue || !nombreValue || stockValue === "" || precioValue === "") {
            // Muestra un error si faltan datos
            // Asegúrate de limpiar el mensaje de error de SKU si no hay un error específico de unicidad
            if (skuErrorMessage) skuErrorMessage.classList.add('hidden');
            return showToast("🚨 Error: Faltan datos esenciales (SKU, Nombre, Stock o Precio).", 'error');
        }

        // ********** NUEVA VALIDACIÓN DE SKU ÚNICO **********
        
        // 1. Limpiar el estilo de error previo y el mensaje
        skuInput.classList.remove('border-red-500');
        if (skuErrorMessage) skuErrorMessage.classList.add('hidden');

        // 2. Verificar si el SKU ya existe en el array 'inventory'
        // Asumiendo que 'inventory' es un array global o accesible que contiene todos los productos.
        const skuExistente = inventory.some(item => item.sku === skuValue);

        if (skuExistente) {
            // SKU DUPLICADO: Detener el proceso y mostrar error visual
            skuInput.classList.add('border-red-500');
            if (skuErrorMessage) skuErrorMessage.classList.remove('hidden');

            return showToast('🚨 Error: El SKU ingresado ya existe. Por favor, usa un SKU único.', 'error');
        }
        
        // ********************************************

        const imgFile = imagenInput ? imagenInput.files[0] : null;
        let imgURL = null;

        // **B. Manejo de la Imagen**
        if (imgFile) {
             // Asegurarse de que el objeto URL se crea correctamente
             imgURL = URL.createObjectURL(imgFile);
        }

        // 2. Crear el objeto del nuevo producto
        const item = {
            sku: skuValue,
            nombre: nombreValue,
            desc: descInput.value,
            stock: Number(stockValue),
            vendido: 0,
            precio: Number(precioValue),
            imagen: imgURL
        };

        // 3. Agregar al inventario
        inventory.push(item);

        // 4. Renderizar 
        renderTable();
        renderSales();
        
        // 5. LIMPIEZA DE LOS CAMPOS
        skuInput.value = "";
        nombreInput.value = "";
        descInput.value = "";
        stockInput.value = "";
        precioInput.value = "";
        
        if (imagenInput) { 
            imagenInput.value = ""; 
        }
        
        // 6. Notificación de éxito
        showToast("✅ Producto cargado con éxito.", 'success');
        
    } catch (e) {
        // Si hay un error, lo atrapamos y mostramos un toast de error con el detalle
        console.error("Error en addProduct:", e);
        
        // Intenta mostrar el toast de error
        if (typeof showToast === 'function') {
             showToast("❌ Error crítico: Consulta la consola para el detalle.", 'error');
        } else {
             alert("Ocurrió un error inesperado. Revisa la consola (F12) para más detalles.");
        }
    }
}