// ==============================================================================
// 1. VARIABLES GLOBALES (Asegúrate de tener también 'let inventory = [];' y 'let skuSeleccionado = null;')
// ==============================================================================
let currentTicket = {
    items: [], // Array de {sku, nombre, precio, cantidad}
    total: 0
};
let salesHistory = []; // Guarda los tickets finalizados

// ==============================================================================
// 2. FUNCIONES DE MANEJO DE VENTA RÁPIDA Y RENDERIZADO DEL TICKET
// ==============================================================================

/* ------ Función de Renderizado del Ticket en Preparación ------ */
function renderCurrentTicket() {
    const container = document.getElementById('ticket-items-container');
    const totalAmount = document.getElementById('ticket-total-amount');

    if (!container || !totalAmount) return;

    let itemsHTML = '';
    let calculatedTotal = 0;

    currentTicket.items.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        calculatedTotal += subtotal;

        itemsHTML += `
            <div class="flex justify-between text-sm py-1 border-b border-gray-100">
                <span class="text-gray-800 font-medium">${item.nombre} (x${item.cantidad})</span>
                <span class="font-semibold">$${subtotal.toFixed(2)}</span>
            </div>
        `;
    });

    if (currentTicket.items.length === 0) {
        itemsHTML = `<p class="text-gray-500 italic">No hay productos en el ticket.</p>`;
    }

    // Actualizar el HTML y el total
    container.innerHTML = itemsHTML;
    currentTicket.total = calculatedTotal;
    
    // Formato de moneda para el total
    const formatter = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN', 
      minimumFractionDigits: 2,
    });
    totalAmount.textContent = formatter.format(calculatedTotal);
}


/* 🚀 CONFIRMAR VENTA RÁPIDA (+1) */
function confirmarVentaRapida() {
    if (!skuSeleccionado) {
        return showToast("🚨 Ingresa un SKU válido para vender.", 'warning');
    }

    if (skuSeleccionado.stock <= 0) {
        return showToast("⛔ Sin stock disponible para este producto.", 'error');
    }

    // 1. Registrar la venta en el inventario
    skuSeleccionado.stock -= 1;
    skuSeleccionado.vendido += 1;
    
    // 2. Lógica para AÑADIR/INCREMENTAR en el ticket actual
    const existingItemIndex = currentTicket.items.findIndex(item => item.sku === skuSeleccionado.sku);

    if (existingItemIndex !== -1) {
        // Incrementar cantidad si el producto ya está
        currentTicket.items[existingItemIndex].cantidad += 1;
    } else {
        // Agregar nuevo item al ticket
        currentTicket.items.push({
            sku: skuSeleccionado.sku,
            nombre: skuSeleccionado.nombre,
            precio: skuSeleccionado.precio,
            cantidad: 1
        });
    }

    // 3. Actualizar la UI
    document.getElementById("venta-stock").textContent = skuSeleccionado.stock; // Actualiza el stock en la tarjeta de consulta

    renderTable();        // Actualiza la tabla principal
    renderSales();        // Actualiza el resumen de ventas (caja del día)
    renderCurrentTicket(); // Actualiza el ticket en preparación

    if (navigator.vibrate) navigator.vibrate(80);
    showToast(`✅ +1 ${skuSeleccionado.nombre} agregado al ticket.`, 'info');
}

