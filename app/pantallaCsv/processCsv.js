
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