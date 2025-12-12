// ==============================================================================
// 3. GENERACIÓN DE TICKET (PDF/IMPRESORA)
// ==============================================================================

/* ------ GENERAR TICKET IMPRIMIBLE (Función Sencilla para PDF/Impresora) ------ */
function generatePrintableTicket(ticket) {
    let itemsHTML = '';
    ticket.items.forEach(item => {
        itemsHTML += `
            <tr>
                <td style="text-align: left; padding: 2px 0;">${item.nombre}</td>
                <td style="text-align: right; padding: 2px 0;">x${item.cantidad}</td>
                <td style="text-align: right; padding: 2px 0;">$${(item.precio * item.cantidad).toFixed(2)}</td>
            </tr>
        `;
    });
    
    // Incluir datos del cliente si existen
    const clientInfo = ticket.cliente.nombre 
        ? `<p style="margin-top: 5px;">Cliente: ${ticket.cliente.nombre}</p>` 
        : '';

    const ticketContent = `
        <html>
        <head>
            <title>Ticket de Venta #${ticket.id}</title>
            <style>
                body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; }
                .ticket { width: 300px; max-width: 90%; margin: 0 auto; }
                .header, .footer { text-align: center; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; }
                .total { font-weight: bold; font-size: 16px; border-top: 1px dashed #000; padding-top: 5px; }
            </style>
        </head>
        <body onload="window.print()">
            <div class="ticket">
                <div class="header">
                    <h3>TU EMPRESA</h3>
                    <p>Ticket ID: #${ticket.id}</p>
                    <p>Fecha: ${ticket.timestamp}</p>
                    ${clientInfo}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="text-align: left;">Producto</th>
                            <th style="text-align: right;">Cant</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                <div class="footer total">
                    TOTAL: $${ticket.total.toFixed(2)}
                </div>
                <div class="footer">
                    <p>¡Gracias por tu compra!</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Abre una nueva ventana y genera el contenido para imprimir/PDF
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(ticketContent);
    printWindow.document.close();
}


// ==============================================================================
// 4. FUNCIONES DE MODAL Y CIERRE DE TICKET (GUARDADO)
// ==============================================================================

/* ------ MODAL CLIENTE FUNCIONES ------ */
function abrirModalCliente() {
    const modal = document.getElementById('modal-cliente');
    const totalDisplay = document.getElementById('modal-total-venta');
    
    if (currentTicket.items.length === 0) {
        return showToast("⚠️ El ticket está vacío.", 'warning');
    }
    
    // Muestra el total en la modal
    const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });
    totalDisplay.textContent = formatter.format(currentTicket.total);

    // Muestra la modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Enfoca el primer campo
    document.getElementById('cliente-nombre').focus();
}

function cerrarModalCliente() {
    const modal = document.getElementById('modal-cliente');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    // Limpiar los campos después de cerrar
    document.getElementById('form-cliente').reset();
}


/* ------ FINALIZAR TICKET (MODIFICADO para abrir la Modal) ------ */
function finalizarTicket() {
    // 1. En lugar de procesar la venta, abre la modal para capturar datos.
    abrirModalCliente();
}


/* ------ PROCESAR VENTA FINAL (Maneja el guardado después de la modal) ------ */
function procesarVentaConDatos(event) {
    event.preventDefault(); // Detiene el envío del formulario

    // 1. Capturar datos del cliente
    const clienteData = {
        nombre: document.getElementById('cliente-nombre').value.trim(),
        whatsapp: document.getElementById('cliente-whatsapp').value.trim(),
        correo: document.getElementById('cliente-correo').value.trim(),
    };
    
    // 2. CREAR EL OBJETO DEL TICKET COMPLETO
    const finalTicket = {
        id: Date.now(), 
        timestamp: new Date().toLocaleString(),
        total: currentTicket.total,
        items: [...currentTicket.items],
        cliente: clienteData // <--- Datos del cliente
    };

    // 3. GUARDAR EN EL HISTORIAL DE VENTAS
    salesHistory.push(finalTicket);

    // 4. GENERAR EL TICKET IMPRIMIBLE / PDF
    generatePrintableTicket(finalTicket);

    // 5. Notificación al usuario y limpieza
    const total = finalTicket.total.toFixed(2);
    showToast(`🎉 Venta finalizada con éxito. Total: $${total}.`, 'success');

    // 6. Limpiar el ticket, refrescar la vista y cerrar modal
    currentTicket = { items: [], total: 0 };
    renderCurrentTicket();
    cerrarModalCliente(); 
}


/* ------ CANCELAR TICKET ------ */
function cancelarTicket() {
    if (currentTicket.items.length === 0) {
        return; // Nada que cancelar
    }

    // 1. Devolver el stock y revertir vendido
    currentTicket.items.forEach(ticketItem => {
        const itemInInventory = inventory.find(i => i.sku === ticketItem.sku);
        if (itemInInventory) {
            itemInInventory.stock += ticketItem.cantidad;
            itemInInventory.vendido -= ticketItem.cantidad; 
        }
    });

    // 2. Limpiar el ticket y refrescar la vista
    currentTicket = { items: [], total: 0 };
    renderCurrentTicket();
    renderTable(); 
    renderSales(); 

    showToast("🗑️ Ticket cancelado. Stock devuelto al inventario.", 'error');
}


// ==============================================================================
// 5. EVENT LISTENERS
// ==============================================================================

/* ------ MANEJO DE VENTA RÁPIDA POR ENTER ------ */
function manejarInputVentaRapida(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevenir el envío de formularios si existe
        confirmarVentaRapida(); 
    }
}

// Escuchadores de eventos para la carga inicial
document.addEventListener('DOMContentLoaded', () => {
    const skuInput = document.getElementById('sku-input');
    if (skuInput) {
        skuInput.addEventListener('keydown', manejarInputVentaRapida);
    }
    
    // Listener para el formulario de datos del cliente
    const formCliente = document.getElementById('form-cliente');
    if (formCliente) {
        formCliente.addEventListener('submit', procesarVentaConDatos);
    }
});