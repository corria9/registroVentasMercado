// --- app/inventory/tablaInventory.js ---

// 1. Configuración y variable global
//let inventory = []; 
const API_BASE_URL = "http://127.0.0.1:8000/api/v1/productos"; // Asegúrate que esta URL es correcta

// --- Funciones de Lógica de Datos ---

/**
 * Obtiene la lista de productos desde la API de FastAPI.
 */
async function fetchInventory() {
    try {
        console.log("Cargando inventario desde la API...");
        
        const response = await fetch(API_BASE_URL);

        if (!response.ok) {
            throw new Error(`Error HTTP al cargar el inventario: ${response.status}`);
        }

        // 2. Rellenar el array global 'inventory'
        const data = await response.json();
        inventory = data; 
        
        // 3. Renderizar la tabla con los datos
        renderTable(); 

        console.log(`Inventario cargado exitosamente. Total de productos: ${inventory.length}`);
        showToast("✅ Inventario cargado con éxito.", 'success');
    } catch (error) {
        console.error("Fallo al obtener el inventario:", error);
        // Implementar aquí una notificación para el usuario (ej: un toast)
    }
}


// --- Funciones de Renderizado ---

/**
 * Dibuja el contenido del array 'inventory' en la tabla HTML.
 */
function renderTable() {
    const tbody = document.getElementById("inventory-table");
    tbody.innerHTML = "";

    inventory.forEach(item => {
        // ⭐ CORRECCIÓN: Usamos 'imagen_url' que es el campo que devuelve FastAPI
        const imageHtml = item.imagen_url 
            ? `<img src="${item.imagen_url}" alt="${item.nombre}" class="w-12 h-12 object-cover rounded-md">`
            : `<span class="text-gray-500 text-xs">No img</span>`;
        
        // Convertimos el objeto 'item' a JSON para pasarlo al modal
        // Usamos .replace(/"/g, "'") para evitar romper el atributo onclick en HTML
        const itemJsonString = JSON.stringify({
            sku: item.sku,
            nombre: item.nombre,
            desc: item.desc, 
            stockInicial: item.stock, 
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
                    <div class="flex space-x-2">
                        <button onclick="abrirModalEdicion(${itemJsonString})"
                                class="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                                title="Editar producto">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>

                        <button onclick="confirmarEliminar('${item.sku}', '${item.nombre}')"
                                class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                title="Eliminar producto">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}


// --- Lógica del Modal de Edición ---

// Referencias a los elementos del modal (Asegúrate que estos IDs existen en tu HTML)
const modalEditarInventario = document.getElementById('modal-editar-inventario');
const formEditarInventario = document.getElementById('form-editar-inventario');


/**
 * Abre el modal de edición y precarga los datos del producto.
 * @param {object} producto - El objeto del producto a editar.
 */
function abrirModalEdicion(producto) {
    // 1. Llenar los campos del modal
    document.getElementById('edit-sku-display').textContent = producto.sku;
    document.getElementById('edit-original-sku').value = producto.sku; 
    document.getElementById('edit-sku').value = producto.sku; 
    document.getElementById('edit-nombre').value = producto.nombre;
    document.getElementById('edit-desc').value = producto.desc; 
    document.getElementById('edit-stock').value = producto.stockInicial; 
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

    // 1. Buscar y actualizar el producto en tu array 'inventory' (Esto es solo local)
    const index = inventory.findIndex(p => p.sku === originalSku);
    
    if (index !== -1) {
        inventory[index].nombre = nuevoNombre;
        inventory[index].desc = nuevaDesc; 
        inventory[index].stock = nuevoStock; 
        inventory[index].precio = nuevoPrecio;

        // NOTA: FALTA la llamada PUT/PATCH a la API para actualizar en Firestore

        // 2. Volver a renderizar la tabla y cerrar el modal
        renderTable(); 
        cerrarModalEdicion();
        
    } else {
        console.error('Error: Producto no encontrado para edición');
    }
});


// --- Lógica de Inicialización ---

// Ejecuta la función de carga cuando el DOM esté completamente cargado.
document.addEventListener('DOMContentLoaded', () => {
    fetchInventory();
});

// --- Nuevas funciones para la API y Event Listener ---

/**
 * Envía los datos actualizados del producto a la API usando el método PATCH.
 * @param {string} sku - El SKU del producto a actualizar.
 * @param {object} data - Los campos a actualizar (nombre, desc, stock, precio).
 * @returns {Promise<object | null>} El producto actualizado devuelto por la API.
 */
 async function updateProductInApi(sku, data) {
    try {
        console.log(`Enviando actualización PATCH para SKU: ${sku}`, data);

        const response = await fetch(`${API_BASE_URL}/${sku}`, {
            method: 'PATCH', // Usamos PATCH para actualizar parcialmente
            headers: {
                'Content-Type': 'application/json',
            },
            // IMPORTANTE: Enviamos los datos usando el nombre de campo Python: 'desc'
            body: JSON.stringify(data), 
        });

        if (response.status === 404) {
            throw new Error(`Error 404: Producto con SKU ${sku} no encontrado en la API.`);
        }
        
        if (!response.ok) {
            // Intenta leer el detalle del error de FastAPI
            const errorData = await response.json();
            throw new Error(`Error al actualizar producto: ${response.status} - ${errorData.detail || 'Fallo desconocido'}`);
        }

        // Si la respuesta es 200 OK, devuelve el producto actualizado
        return await response.json();

    } catch (error) {
        console.error("Fallo crítico al actualizar el producto:", error);
        // Aquí podrías mostrar una notificación de error al usuario
        return null;
    }
}


// ** Lógica para guardar los cambios al enviar el formulario (Event Listener) **
// Reemplaza el event listener anterior con esta versión async.
formEditarInventario.addEventListener('submit', async (e) => { 
    e.preventDefault();
    
    // 1. Obtener valores del formulario
    const originalSku = document.getElementById('edit-original-sku').value;
    const nuevoNombre = document.getElementById('edit-nombre').value;
    const nuevaDesc = document.getElementById('edit-desc').value;
    const nuevoStock = parseInt(document.getElementById('edit-stock').value);
    const nuevoPrecio = parseFloat(document.getElementById('edit-precio').value);

    // 2. Preparar los datos que se enviarán al Backend
    const updateData = {
        nombre: nuevoNombre,
        desc: nuevaDesc,       // Usamos 'desc' para que coincida con el campo Python
        stock: nuevoStock,
        precio: nuevoPrecio
    };

    // 3. Llamar a la API para actualizar en Firestore
    const updatedProduct = await updateProductInApi(originalSku, updateData);

    if (updatedProduct) {
        // 4. Si la actualización en la API fue exitosa (200 OK):
        
        // Actualizamos el array local 'inventory' con el objeto devuelto por el backend
        const index = inventory.findIndex(p => p.sku === originalSku);
        
        if (index !== -1) {
            // Reemplazamos el producto antiguo con el objeto devuelto (que incluye stock_disponible, etc.)
            inventory[index] = updatedProduct; 
        }

        // 5. Volver a renderizar la tabla y cerrar el modal
        renderTable(); 
        cerrarModalEdicion();
        console.log('Producto actualizado con éxito!', updatedProduct);
        // mostrarToast('Producto actualizado!', 'success');
        
    } else {
        // El error ya fue manejado y mostrado en la consola por updateProductInApi
        // mostrarToast('Error al guardar los cambios.', 'error');
    }
});

/**
 * Pide confirmación al usuario antes de borrar.
 */
 let skuAEliminar = null;

 // Reemplaza tu función confirmarEliminar vieja por esta:
 function confirmarEliminar(sku, nombre) {
     skuAEliminar = sku;
     document.getElementById('borrar-nombre-prod').textContent = `"${nombre}" (SKU: ${sku})`;
     
     const modal = document.getElementById('modal-confirmar-borrar');
     modal.classList.remove('hidden');
     
     // Configurar el botón de eliminar del modal
     const btnEliminar = document.getElementById('btn-confirmar-borrado-final');
     btnEliminar.onclick = async () => {
         await eliminarProducto(skuAEliminar);
         cerrarModalBorrar();
     };
 }
 
 function cerrarModalBorrar() {
     document.getElementById('modal-confirmar-borrar').classList.add('hidden');
     skuAEliminar = null;
 }

/**
 * Llama a la API de FastAPI para borrar el producto.
 */
async function eliminarProducto(sku) {
    try {
        const response = await fetch(`${API_BASE_URL}/${sku}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Error al eliminar: ${response.status}`);
        }

        showToast("🗑️ Producto eliminado correctamente.", 'success');

        // Actualizar la tabla localmente quitando el elemento del array
        inventory = inventory.filter(p => p.sku !== sku);
        renderTable();
        
        // También refrescar la sección de ventas si es necesario
        if (typeof renderSales === 'function') renderSales();

    } catch (error) {
        console.error("Fallo al eliminar:", error);
        showToast("❌ No se pudo eliminar el producto.", 'error');
    }
}