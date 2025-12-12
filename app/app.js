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
const STOCK_MINIMO = 5; // Umbral para la alerta de stock bajo

/* 🔎 BUSCAR SKU EN VENTA RÁPIDA */
function buscarSKU() {
    const sku = document.getElementById("sku-input").value.trim();
    const infoCard = document.getElementById("venta-card-info");
    
    // Referencias a los nuevos elementos de feedback
    const skuNotFoundMessage = document.getElementById('sku-not-found-message'); // Mensaje de SKU no encontrado
    const stockAlert = document.getElementById('venta-stock-alert');           // Alerta de stock bajo (contenedor)
    
    // 1. Ocultar todos los mensajes de feedback por defecto
    infoCard.classList.add("hidden");
    if (skuNotFoundMessage) skuNotFoundMessage.classList.add('hidden');
    if (stockAlert) stockAlert.classList.add('hidden');
    skuSeleccionado = null;

    if (!sku) {
        return;
    }

    const item = inventory.find(p => String(p.sku) === sku);

    if (!item) {
        // 2. Si el producto NO se encuentra, mostramos el error de SKU no encontrado
        if (skuNotFoundMessage) skuNotFoundMessage.classList.remove('hidden');
        
        // Opcional: mostrarToast("SKU no encontrado en inventario.", 'error');
        return;
    }

    // --- PRODUCTO ENCONTRADO ---
    
    // 3. Ocultar el error de SKU no encontrado si se encuentra un producto
    if (skuNotFoundMessage) skuNotFoundMessage.classList.add('hidden'); 

    // Asignar y mostrar card
    skuSeleccionado = item;
    document.getElementById("venta-nombre").textContent = item.nombre;
    document.getElementById("venta-stock").textContent = item.stock;
    document.getElementById("venta-precio").textContent = item.precio;

    if (item.imagen) {
        const img = document.getElementById("venta-imagen");
        img.src = item.imagen;
        img.classList.remove("hidden");
    } else {
        document.getElementById("venta-imagen").classList.add("hidden");
    }

    infoCard.classList.remove("hidden");
    
    // 4. Comprobar y mostrar Alerta de Stock Bajo
    if (item.stock <= STOCK_MINIMO && item.stock > 0) {
        if (stockAlert) {
            document.getElementById('alert-stock-qty').textContent = item.stock;
            stockAlert.classList.remove('hidden');
        }
    }
}

/* 🚀 VENTA RÁPIDA (+1) */
function confirmarVentaRapida() {
    if (!skuSeleccionado) {
        // Usar showToast en lugar de alert
        showToast("Ingresa un SKU válido y consulta el producto primero.", 'error'); 
        return;
    }

    // ** Validar Stock Agotado **
    if (skuSeleccionado.stock <= 0) {
        showToast(`🛑 Producto AGOTADO (${skuSeleccionado.nombre}). Stock actual: 0.`, 'error');
        return;
    }

    // Venta
    skuSeleccionado.stock -= 1;
    skuSeleccionado.vendido += 1;

    // Actualizar card y alertas
    document.getElementById("venta-stock").textContent = skuSeleccionado.stock;
    
    // Si el stock llega al mínimo o menos, actualizar la alerta visual
    const stockAlert = document.getElementById('venta-stock-alert');
    if (skuSeleccionado.stock <= STOCK_MINIMO && skuSeleccionado.stock >= 0) {
        if (stockAlert) {
            document.getElementById('alert-stock-qty').textContent = skuSeleccionado.stock;
            stockAlert.classList.remove('hidden'); // Aseguramos que se muestre si baja
        }
        if (skuSeleccionado.stock === 0) {
            // Ocultar la alerta y mostrar mensaje de agotado si se vende la última unidad
            if (stockAlert) stockAlert.classList.add('hidden');
            showToast(`¡Última unidad vendida! ${skuSeleccionado.nombre} AGOTADO.`, 'warning');
        }
    }


    // Refrescar tablas y listas
    renderTable();
    renderSales();

    if (navigator.vibrate) navigator.vibrate(80);

    showToast(`✅ Venta confirmada de ${skuSeleccionado.nombre}. Stock restante: ${skuSeleccionado.stock}`, 'success');
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
