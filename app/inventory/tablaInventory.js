// --- app/inventory/tablaInventory.js ---


//const API_BASE_URL = "http://127.0.0.1:8000/api/v1/productos"; // LOCAL
const API_BASE_URL = "https://armaly-backend-224984538456.us-central1.run.app/api/v1/productos".trim(); // PRODUCCION
// --- Funciones de Lógica de Datos ---

/**
 * Obtiene la lista de productos desde la API de FastAPI.
 */
 // Constante para el nombre del caché
const CACHE_KEY = 'inventory_cache';

async function fetchInventory() {
    try {
        console.log("Intentando cargar inventario desde la API...");
        // Usamos la global del HTML, si no existe, usamos una por defecto
        const urlParaFetch = window.GLOBAL_API_BASE_URL || API_BASE_URL;
        
        console.log("Conectando a:", urlParaFetch);
        
        const response = await fetch(urlParaFetch);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        // Si tiene éxito, actualizamos el caché de LocalStorage
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        inventory = data; 
        
        //console.log("✅ Inventario cargado desde API.");
        // No ponemos toast aquí para que no moleste en cada carga inicial
        showToast("✅ Inventario cargado con éxito", 'success');

    } catch (error) {
        console.warn("⚠️ La API falló o fue bloqueada. Buscando alternativas...");
        
        // 2. Intentar cargar desde el LocalStorage (Caché del navegador)
        const cachedData = localStorage.getItem(CACHE_KEY);
        
        if (cachedData) {
            inventory = JSON.parse(cachedData);
            console.log("📦 Datos cargados desde Caché Local.");
            showToast("⚠️ Modo offline: Usando datos guardados.", 'warning');
        } 
        else {
            // 3. Si no hay caché (primera vez), intentar cargar el archivo JSON local
            console.log("📁 Sin caché disponible. Intentando cargar backup.json...");
            try {
                // Asegúrate de que la ruta coincida con donde pongas tu archivo
                const backupResponse = await fetch('app/inventory/backup.json');
                if (backupResponse.ok) {
                    inventory = await backupResponse.json();
                    console.log("📂 Datos cargados desde archivo de respaldo JSON.");
                    showToast("ℹ️ Cargados datos de respaldo.", 'info');
                } else {
                    throw new Error("No se encontró el archivo backup.json");
                }
            } catch (backupError) {
                console.error("❌ Fallo total: API, Caché y Archivo local fallaron.");
                showToast("❌ No se pudo cargar el inventario.", 'error');
                inventory = []; 
            }
        }
    } finally {
        renderTable(); 
    }
}

/**
 * Borra el caché local y fuerza una nueva petición a la API.
 * Vinculada al botón "Actualizar Datos" en el HTML.
 */
 async function forceRefreshInventory() {
    // Feedback visual inmediato
    showToast("🔄 Sincronizando con el servidor...", 'info');
    
    // Limpiamos el caché de LocalStorage
    localStorage.removeItem(CACHE_KEY);
    
    // Volvemos a llamar a la función principal
    await fetchInventory();
}
// --- Funciones de Renderizado ---

/**
 * Dibuja el contenido del array 'inventory' en la tabla HTML.
 */
function renderTable() {
    const tbody = document.getElementById("inventory-table");
    tbody.innerHTML = "";

    inventory.forEach(item => {
        const secureImageUrl = item.imagen_url ? item.imagen_url.replace("http://", "https://") : null;
        // ⭐ CORRECCIÓN: Usamos 'imagen_url' que es el campo que devuelve FastAPI
        const imageHtml = secureImageUrl // <--- Usa la variable sanitizada aquí
            ? `<img src="${secureImageUrl}" alt="${item.nombre}" class="w-12 h-12 object-cover rounded-md">`
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
    // ... (tus campos actuales de SKU, nombre, etc.)
    document.getElementById('edit-sku-display').textContent = producto.sku;
    document.getElementById('edit-original-sku').value = producto.sku; 
    document.getElementById('edit-sku').value = producto.sku; 
    document.getElementById('edit-nombre').value = producto.nombre;
    document.getElementById('edit-desc').value = producto.desc; 
    document.getElementById('edit-stock').value = producto.stockInicial; 
    document.getElementById('edit-precio').value = producto.precio;

    // --- NUEVA LÓGICA DE IMAGEN ---
    const previewContainer = document.getElementById('edit-image-preview');
    // Buscamos la URL real en el array 'inventory'
    const prodData = inventory.find(p => p.sku === producto.sku);
    
    if (prodData && prodData.imagen_url) {
        previewContainer.innerHTML = `<img src="${prodData.imagen_url}" class="w-full h-full object-cover">`;
    } else {
        previewContainer.innerHTML = `<span class="text-gray-400 text-xs text-center">Sin imagen</span>`;
    }
    
    // Limpiar el input de archivo por si se usó antes
    document.getElementById('edit-imagen').value = "";

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
formEditarInventario.addEventListener('submit', async (e) => { 
    e.preventDefault();
    
    // 1. Obtener el SKU desde el campo oculto
    const sku = document.getElementById('edit-original-sku').value;
    const imgInput = document.getElementById('edit-imagen');

    // 2. Construir FormData (Obligatorio para enviar archivos + texto)
    const formData = new FormData();
    formData.append("nombre", document.getElementById('edit-nombre').value);
    formData.append("desc", document.getElementById('edit-desc').value || "");
    formData.append("stock", parseInt(document.getElementById('edit-stock').value));
    formData.append("precio", parseFloat(document.getElementById('edit-precio').value));

    if (imgInput.files && imgInput.files[0]) {
        formData.append("imagen", imgInput.files[0]);
    }

    try {
        // Feedback visual
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = "Guardando...";

        // 3. Petición al Backend
        // IMPORTANTE: Asegúrate de que API_BASE_URL no termine en "/"
        const url = `${API_BASE_URL}/${sku}`;
        console.log("Enviando a:", url);

        const response = await fetch(url, {
            method: 'PATCH',
            body: formData,
            // 💡 NOTA: No incluyas 'Content-Type', el navegador lo pone solo al ver el FormData
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.detail || "Fallo en el servidor");
        }

        const updatedProduct = await response.json();

        // 4. Actualización exitosa: Refrescar inventario local
        const index = inventory.findIndex(p => p.sku === sku);
        if (index !== -1) {
            inventory[index] = { ...inventory[index], ...updatedProduct };
        }

        renderTable(); 
        cerrarModalEdicion();
        showToast("✅ Producto actualizado correctamente", "success");

    } catch (error) {
        console.error("Error en PATCH:", error);
        showToast(`❌ Error: ${error.message}`, "error");
    } finally {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerText = "Guardar Cambios";
    }
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

// --- Función para Previsualización en Tiempo Real ---
function setupImagePreview() {
    const inputImagen = document.getElementById('edit-imagen');
    const previewContainer = document.getElementById('edit-image-preview');

    inputImagen.addEventListener('change', function() {
        const file = this.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            // Cuando el archivo termina de leerse...
            reader.onload = function(e) {
                previewContainer.innerHTML = `
                    <img src="${e.target.result}" 
                         class="w-full h-full object-cover transition-opacity duration-300 opacity-100">
                `;
            };
            
            reader.readAsDataURL(file);
        }
    });
}

// --- SECCIÓN DE INICIALIZACIÓN ÚNICA (AL FINAL DEL ARCHIVO) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar los datos de la API apenas abra la página
    fetchInventory();

    // 2. Activar la previsualización de imágenes en el modal
    setupImagePreview();
    
    // 3. (Opcional) Aquí puedes inicializar otros componentes visuales
    console.log("Sistema de Inventario Inicializado");
});