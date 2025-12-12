let inventory = [];

/* ------ NAVEGACIÓN ------ */
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active-screen"));
    document.getElementById(id).classList.add("active-screen");
}


// Función de utilidad para mostrar toasts
function showToast(message, type = 'success') {
    let backgroundColor = "linear-gradient(to right, #00b09b, #96c93d)"; // Default success

    if (type === 'error') {
        backgroundColor = "linear-gradient(to right, #ff5f6d, #ffc371)";
    } else if (type === 'warning') {
        backgroundColor = "linear-gradient(to right, #f7971e, #ffd200)";
    } else if (type === 'info') {
        backgroundColor = "linear-gradient(to right, #4facfe, #00f2fe)";
    }

    Toastify({
        text: message,
        duration: 3000, // Mostrar por 3 segundos
        close: true,
        gravity: "top", // `top` o `bottom`
        position: "right", // `left`, `center` o `right`
        stopOnFocus: true, 
        style: {
            background: backgroundColor,
            "z-index": 9999
        },
        onClick: function(){} // Callback al hacer clic en el toast
    }).showToast();
}

/* ------ PROCESAR CSV (VERSIÓN FINAL) ------ */
function processCSV() {
    // Referencia al input del archivo
    const fileInput = document.getElementById("csv-file-input"); 
    const file = fileInput.files[0];

    if (!file) {
        return showToast("🚨 Selecciona un archivo CSV para continuar.", 'error');
    }

    const reader = new FileReader();
    reader.onload = e => {
        const rows = e.target.result.split("\n").map(r => r.split(","));
        rows.forEach(r => {
            if (r.length < 6) return;

            inventory.push({
                sku: r[0],
                nombre: r[1],
                desc: r[2],
                stock: Number(r[3]),
                vendido: Number(r[4]),
                precio: Number(r[5]),
                imagen: null
            });
        });

        renderTable();
        renderSales();
        
        // **ACCIÓN CLAVE: Deshabilitar el input después de la carga exitosa**
        fileInput.disabled = true;
    };

    reader.readAsText(file);
    showToast("✅ Inventario cargado con éxito.", 'success');
}

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

/* ------ TABLA INVENTARIO ------ */
function renderTable() {
    const tbody = document.getElementById("inventory-table");
    tbody.innerHTML = "";

    inventory.forEach(item => {
        const imageHtml = item.imagen 
            ? `<img src="${item.imagen}" alt="${item.nombre}" class="w-12 h-12 object-cover rounded-md">`
            : `<span class="text-gray-500 text-xs">No img</span>`;
        tbody.innerHTML += `
            <tr class="border-b color-border">
                <td class="p-2">${item.sku}</td>
                <td class="p-2">${item.nombre}</td>
                <td class="p-2">${item.desc}</td>
                <td class="p-2">${item.stock}</td>
                <td class="p-2">${item.vendido}</td>
                <td class="p-2">$${item.precio}</td>
                <td class="p-2">${imageHtml}</td>
            </tr>
        `;
    });
}


/* ------ CAJA DEL DÍA ------ */
function renderSales() {
    // 1. Obtener el contenedor HTML
    // **IMPORTANTE**: Revisa que este ID exista en tu HTML (ej. <div id="sales-container"></div>)
    const cont = document.getElementById("sales-container"); 
    
    // 2. CORRECCIÓN DEL ERROR: Si el contenedor no existe, salimos
    if (!cont) {
        console.error("Error FATAL en renderSales: No se encontró el elemento con ID 'sales-container'. Asegúrate de que exista en tu HTML.");
        // Devolvemos la ejecución para que el flujo de addProduct no se rompa
        return; 
    }

    // 3. Lógica de cálculo de ventas
    let totalStock = 0;
    let totalVendido = 0;
    let valorTotal = 0; // Valor total del inventario (precio * stock)
    let ventasNetas = 0; // Ventas en valor (precio * vendido)

    inventory.forEach(item => {
        totalStock += item.stock;
        totalVendido += item.vendido;
        valorTotal += item.precio * item.stock;
        ventasNetas += item.precio * item.vendido;
    });

    // 4. Formato de números (Asumiendo pesos mexicanos MXN o Dólares USD)
    const formatter = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN', // O 'USD' si todo tu inventario es en dólares
      minimumFractionDigits: 2,
    });

    // 5. Crear el contenido HTML a inyectar
    const contentHTML = `
        <div class="p-4 bg-white rounded-lg shadow-md mb-4">
            <h3 class="text-xl font-semibold mb-2">Resumen de Inventario</h3>
            <div class="grid grid-cols-2 gap-4">
                <p class="text-sm text-gray-600">Total de Unidades en Stock:</p>
                <p class="text-sm font-bold text-right">${totalStock}</p>
                
                <p class="text-sm text-gray-600">Total de Unidades Vendidas:</p>
                <p class="text-sm font-bold text-right text-green-600">${totalVendido}</p>
                
                <p class="text-sm text-gray-600">Valor Total del Inventario (Stock * Precio):</p>
                <p class="text-sm font-bold text-right">${formatter.format(valorTotal)}</p>
                
                <p class="text-sm text-gray-600">Ventas Netas (Vendido * Precio):</p>
                <p class="text-sm font-bold text-right text-green-700">${formatter.format(ventasNetas)}</p>
            </div>
        </div>
    `;

    // 6. Inyectar el HTML en el contenedor
    cont.innerHTML = contentHTML;
}

function sell(index) {
    if (inventory[index].stock <= 0) {
        alert("Sin stock!");
        return;
    }

    inventory[index].stock -= 1;
    inventory[index].vendido += 1;

    renderTable();
    renderSales();
}

let skuSeleccionado = null;

/* 🔎 BUSCAR SKU EN VENTA RÁPIDA */
function buscarSKU() {
    const sku = document.getElementById("sku-input").value.trim();
    const card = document.getElementById("venta-card-info");

    if (!sku) {
        card.classList.add("hidden");
        skuSeleccionado = null;
        return;
    }

    const item = inventory.find(p => String(p.sku) === sku);

    if (!item) {
        card.classList.add("hidden");
        skuSeleccionado = null;
        return;
    }

    // Mostrar card
    skuSeleccionado = item;
    document.getElementById("venta-nombre").textContent = item.nombre;
    document.getElementById("venta-stock").textContent = item.stock;
    document.getElementById("venta-precio").textContent = item.precio;

    if (item.imagen) {
        const img = document.getElementById("venta-imagen");
        img.src = item.imagen;
        img.classList.remove("hidden");
    }

    card.classList.remove("hidden");
}

/* 🚀 VENTA RÁPIDA (+1) */
function confirmarVentaRapida() {
    if (!skuSeleccionado) {
        alert("Ingresa un SKU válido");
        return;
    }

    if (skuSeleccionado.stock <= 0) {
        alert("Sin stock disponible");
        return;
    }

    skuSeleccionado.stock -= 1;
    skuSeleccionado.vendido += 1;

    // Actualizar card
    document.getElementById("venta-stock").textContent = skuSeleccionado.stock;

    // Refrescar tablas y listas
    renderTable();
    renderSales();

    // Vibración ligera en móvil (super útil en mercado)
    if (navigator.vibrate) navigator.vibrate(80);

    // Mensaje rápido
    console.log("Venta registrada");
}
