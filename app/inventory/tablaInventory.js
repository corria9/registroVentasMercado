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