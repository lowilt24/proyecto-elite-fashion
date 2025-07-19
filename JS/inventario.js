// Datos de ejemplo
let products = [
    {
        id: 1,
        name: 'Laptop Dell XPS 13',
        category: 'Electrónicos',
        price: 1299.99,
        stock: 15,
        minStock: 5,
        sku: 'DELL-XPS-001',
        description: 'Laptop ultradelgada con procesador Intel i7'
    },
    {
        id: 2,
        name: 'Silla Ergonómica',
        category: 'Muebles',
        price: 299.99,
        stock: 8,
        minStock: 3,
        sku: 'CHAIR-ERG-001',
        description: 'Silla de oficina con soporte lumbar'
    },
    {
        id: 3,
        name: 'Smartphone Samsung Galaxy',
        category: 'Electrónicos',
        price: 799.99,
        stock: 2,
        minStock: 10,
        sku: 'SAMS-GAL-001',
        description: 'Smartphone con cámara de alta resolución'
    },
    {
        id: 4,
        name: 'Mesa de Trabajo',
        category: 'Muebles',
        price: 199.99,
        stock: 12,
        minStock: 5,
        sku: 'DESK-WRK-001',
        description: 'Mesa de trabajo ajustable en altura'
    }
];

let filteredProducts = [...products];
let editingProduct = null;

// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const addProductBtn = document.getElementById('addProductBtn');
const productModal = document.getElementById('productModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveProductBtn = document.getElementById('saveProductBtn');
const modalTitle = document.getElementById('modalTitle');
const productsTableBody = document.getElementById('productsTableBody');
const emptyState = document.getElementById('emptyState');

// Campos del formulario
const productName = document.getElementById('productName');
const productCategory = document.getElementById('productCategory');
const productPrice = document.getElementById('productPrice');
const productStock = document.getElementById('productStock');
const productMinStock = document.getElementById('productMinStock');
const productSku = document.getElementById('productSku');
const productDescription = document.getElementById('productDescription');



// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateCategoryFilter();
    renderProductsTable();
    
    // Event listeners
    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
    addProductBtn.addEventListener('click', openAddProductModal);
    closeModal.addEventListener('click', closeProductModal);
    cancelBtn.addEventListener('click', closeProductModal);
    saveProductBtn.addEventListener('click', saveProduct);
    
    // Cerrar modal al hacer clic fuera
    productModal.addEventListener('click', function(e) {
        if (e.target === productModal) {
            closeProductModal();
        }
    });
});

// Actualizar estadísticas
function updateStats() {
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.stock > 0).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('lowStockProducts').textContent = lowStockProducts;
    document.getElementById('outOfStockProducts').textContent = outOfStockProducts;
    document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
}

// Actualizar filtro de categorías
function updateCategoryFilter() {
    const categories = [...new Set(products.map(p => p.category))];
    const currentValue = categoryFilter.value;
    
    categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    if (currentValue && categories.includes(currentValue)) {
        categoryFilter.value = currentValue;
    }
}

// Filtrar productos
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                             product.sku.toLowerCase().includes(searchTerm);
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    renderProductsTable();
}

// Renderizar tabla de productos
function renderProductsTable() {
    if (filteredProducts.length === 0) {
        productsTableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    productsTableBody.innerHTML = filteredProducts.map(product => {
        const stockStatus = getStockStatus(product.stock, product.minStock);
        const statusClass = getStatusClass(stockStatus);
        const statusText = getStatusText(stockStatus);
        
        return `
            <tr>
                <td>
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-description">${product.description}</div>
                    </div>
                </td>
                <td>
                    <span class="category-badge">${product.category}</span>
                </td>
                <td>${product.sku}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="actions">
                        <button class="action-btn edit-btn" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Obtener estado del stock
function getStockStatus(stock, minStock) {
    if (stock === 0) return 'out';
    if (stock <= minStock) return 'low';
    return 'normal';
}

// Obtener clase CSS para el estado
function getStatusClass(status) {
    switch (status) {
        case 'out': return 'status-out';
        case 'low': return 'status-low';
        default: return 'status-normal';
    }
}

// Obtener texto para el estado
function getStatusText(status) {
    switch (status) {
        case 'out': return 'Sin Stock';
        case 'low': return 'Stock Bajo';
        default: return 'Normal';
    }
}

// Abrir modal para agregar producto
function openAddProductModal() {
    editingProduct = null;
    modalTitle.textContent = 'Agregar Producto';
    saveProductBtn.textContent = 'Agregar';
    clearForm();
    productModal.classList.add('active');
}

// Abrir modal para editar producto
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    editingProduct = product;
    modalTitle.textContent = 'Editar Producto';
    saveProductBtn.textContent = 'Actualizar';
    
    // Llenar formulario con datos del producto
    productName.value = product.name;
    productCategory.value = product.category;
    productPrice.value = product.price;
    productStock.value = product.stock;
    productMinStock.value = product.minStock;
    productSku.value = product.sku;
    productDescription.value = product.description;
    
    productModal.classList.add('active');
}

// Cerrar modal
function closeProductModal() {
    productModal.classList.remove('active');
    editingProduct = null;
    clearForm();
}

// Limpiar formulario
function clearForm() {
    productName.value = '';
    productCategory.value = '';
    productPrice.value = '';
    productStock.value = '';
    productMinStock.value = '';
    productSku.value = '';
    productDescription.value = '';
}

// Validar formulario

function validateForm() {
    const requiredFields = [productName, productCategory, productPrice, productStock, productMinStock, productSku];
    
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            alert('Por favor completa todos los campos requeridos');
            field.focus();
            return false;
        }
    }
    
    if (parseFloat(productPrice.value) <= 0) {
        alert('El precio debe ser mayor a 0');
        productPrice.focus();
        return false;
    }
    
    if (parseInt(productStock.value) < 0) {
        alert('El stock no puede ser negativo');
        productStock.focus();
        return false;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // ... tus otros eventListeners

    // NUEVO: Modal Pedidos
    const consultarPedidosBtn = document.getElementById('conpedido');
    const pedidoModal = document.getElementById('pedidoModal');
    const closePedidoBtn = document.getElementById('closePedido');

    consultarPedidosBtn.addEventListener('click', () => {
        pedidoModal.style.display = 'flex';
    });

    closePedidoBtn.addEventListener('click', () => {
        pedidoModal.style.display = 'none';
    });

    pedidoModal.addEventListener('click', (e) => {
        if (e.target === pedidoModal) {
            pedidoModal.style.display = 'none';
        }
    });
});