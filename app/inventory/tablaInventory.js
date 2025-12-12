// --- app/inventory/tablaInventory.js ---

// Asumo que 'inventory' es un array global o accesible que contiene tus productos.
// Asegúrate de que las propiedades del objeto son: sku, nombre, desc, stock, vendido, precio, imagen.

function renderTable() {
    const tbody = document.getElementById("inventory-table");
    tbody.innerHTML = "";

    inventory.forEach(item => {
        const imageHtml = item.imagen 
            ? `<img src="${item.imagen}" alt="${item.nombre}" class="w-12 h-12 object-cover rounded-md">`
            : `<span class="text-gray-500 text-xs">No img</span>`;
        
        // Convertimos el objeto 'item' a una cadena JSON que podemos pasar a la función
        // Reemplazamos las comillas dobles por comillas simples para que no rompa el atributo onclick
        const itemJsonString = JSON.stringify({
            sku: item.sku,
            nombre: item.nombre,
            descripcion: item.desc, // Usar 'descripcion' para coincidir con el modal
            stockInicial: item.stock, // Usar 'stockInicial' para coincidir con el modal
            precio: item.precio
        }).replace(/"/g, "'");

        tbody.innerHTML += `
            <tr class="border-b color-border hover:bg-gray-50 transition duration-150">
                <td class="p-2">${item.sku}</td>
                <td class="p-2">${item.nombre}</td>
                <td class="p-2">${item.desc}</td>
                <td class="p-2">${item.stock}</td>
                <td class="p-2">${item.vendido}</td>
                <td class="p-2">$${item.precio}</td>
                <td class="p-2">${imageHtml}</td>
                
                <td class="p-2">
                    <button onclick="abrirModalEdicion(${itemJsonString})"
                            class="text-gray-500 hover:text-blue-600 transition duration-150 p-1 rounded-full"
                            title="Editar producto">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-7l10-10 4 4-10 10-4 10-4-10z" />
                        </svg>
                    </button>
                </td>
                </tr>
        `;
    });
}

// Estas funciones pueden ir en tu archivo tablaInventory.js o en app.js
// para que sean globales.

const modalEditarInventario = document.getElementById('modal-editar-inventario');
const formEditarInventario = document.getElementById('form-editar-inventario');

/**
 * Abre el modal de edición y precarga los datos del producto.
 * @param {object} producto - El objeto del producto a editar.
 */
function abrirModalEdicion(producto) {
    // 1. Llenar los campos del modal
    document.getElementById('edit-sku-display').textContent = producto.sku;
    document.getElementById('edit-original-sku').value = producto.sku; // SKU original para buscar al guardar
    document.getElementById('edit-sku').value = producto.sku; 
    document.getElementById('edit-nombre').value = producto.nombre;
    document.getElementById('edit-desc').value = producto.descripcion; // Propiedad 'descripcion' del modal
    document.getElementById('edit-stock').value = producto.stockInicial; // Propiedad 'stockInicial' del modal
    document.getElementById('edit-precio').value = producto.precio;

    // 2. Mostrar el modal
    modalEditarInventario.classList.remove('hidden');
    modalEditarInventario.classList.add('flex'); 
}

/**
 * Cierra el modal de edición.
 */
function cerrarModalEdicion() {
    modalEditarInventario.classList.add('hidden');
    modalEditarInventario.classList.remove('flex');
}


// ** Lógica para guardar los cambios al enviar el formulario **
formEditarInventario.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Obtener valores del formulario
    const originalSku = document.getElementById('edit-original-sku').value;
    const nuevoNombre = document.getElementById('edit-nombre').value;
    const nuevaDesc = document.getElementById('edit-desc').value;
    const nuevoStock = parseInt(document.getElementById('edit-stock').value);
    const nuevoPrecio = parseFloat(document.getElementById('edit-precio').value);

    // 1. Buscar y actualizar el producto en tu array 'inventory'
    const index = inventory.findIndex(p => p.sku === originalSku);
    
    if (index !== -1) {
        inventory[index].nombre = nuevoNombre;
        inventory[index].desc = nuevaDesc; // Actualizar con el nombre de propiedad real: 'desc'
        inventory[index].stock = nuevoStock; // Actualizar con el nombre de propiedad real: 'stock'
        inventory[index].precio = nuevoPrecio;

        // 2. Volver a renderizar la tabla y cerrar el modal
        renderTable(); // Llama a tu función para refrescar la tabla
        cerrarModalEdicion();
        // Asumiendo que tienes una función para notificaciones:
        // mostrarToast('Producto actualizado!', 'success');
        
    } else {
        // mostrarToast('Error: Producto no encontrado', 'error');
    }
});