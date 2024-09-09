const productList = document.getElementById('product-list');
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Obtener productos de la API y renderizarlos
fetch('https://fakestoreapi.com/products')
    .then(res => res.json())
    .then(products => {
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('col-md-4');
            productCard.innerHTML = `
                <div class="card mb-4">
                    <img src="${product.image}" class="card-img-top" alt="${product.title}">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text">$${product.price}</p>
                        <button class="btn btn-primary" data-id="${product.id}">Ver detalles</button>
                    </div>
                </div>
            `;
            productList.appendChild(productCard);

            // Evento para abrir el modal con los detalles
            productCard.querySelector('button').addEventListener('click', () => {
                showProductDetails(product);
            });
        });
    });

// Función para mostrar detalles del producto en un modal
function showProductDetails(product) {
    document.getElementById('product-title').textContent = product.title;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-price').textContent = product.price;
    
    const addToCartBtn = document.getElementById('add-to-cart');
    addToCartBtn.onclick = () => {
        addToCart(product);
        closeModal();
    };
    
    const modal = new bootstrap.Modal(document.getElementById('product-modal'));
    modal.show();
}

// Función para agregar productos al carrito
function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
        existingProduct.quantity += 1; // Aumentar la cantidad si ya existe
    } else {
        cart.push({ ...product, quantity: 1 }); // Añadir nuevo producto con cantidad 1
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems(); // Renderizar el carrito inmediatamente si está abierto
    Swal.fire('Producto agregado al carrito', '', 'success');
}

// Actualizar el contador de productos en el carrito
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = `(${totalQuantity})`;
}

// Inicializar el contador cuando se carga la página
updateCartCount();

const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsList = document.getElementById('cart-items');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout');
const closeCartBtn = document.getElementById('close-cart');

// Función para abrir y cerrar el sidebar
cartBtn.addEventListener('click', () => {
    cartSidebar.classList.toggle('active');
    renderCartItems(); // Renderiza los productos cada vez que se abre el carrito
});

// Función para cerrar el carrito sin perder productos
closeCartBtn.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
});

// Función para renderizar los productos en el carrito
function renderCartItems() {
    cartItemsList.innerHTML = ''; // Limpiar el contenido anterior
    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            <span>${item.title} - $${item.price} x ${item.quantity}</span>
            <button class="btn btn-secondary btn-sm" onclick="updateQuantity(${index}, -1)">-</button>
            <button class="btn btn-secondary btn-sm" onclick="updateQuantity(${index}, 1)">+</button>
            <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Eliminar</button>
        `;
        cartItemsList.appendChild(li);
    });

    // Mostrar el total al final de la lista
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalLi = document.createElement('li');
    totalLi.classList.add('list-group-item', 'active');
    totalLi.textContent = `Total: $${total.toFixed(2)}`;
    cartItemsList.appendChild(totalLi);
}

// Función para actualizar la cantidad de un producto en el carrito
function updateQuantity(index, change) {
    const item = cart[index];
    item.quantity += change;
    if (item.quantity <= 0) {
        cart.splice(index, 1); // Eliminar el producto si la cantidad es 0 o menor
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

// Función para eliminar un producto del carrito
function removeFromCart(index) {
    cart.splice(index, 1); // Elimina el producto del array del carrito
    localStorage.setItem('cart', JSON.stringify(cart)); // Actualiza el localStorage
    updateCartCount(); // Actualiza el contador del carrito
    renderCartItems(); // Vuelve a renderizar los productos
}

// Función para vaciar todo el carrito
clearCartBtn.addEventListener('click', () => {
    cart = [];
    localStorage.removeItem('cart');
    updateCartCount();
    renderCartItems();
    Swal.fire('Carrito vaciado', '', 'info');
});

// Función para finalizar la compra
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        Swal.fire('El carrito está vacío', '', 'warning');
    } else {
        cart = [];
        localStorage.removeItem('cart');
        updateCartCount();
        renderCartItems();
        Swal.fire('Compra finalizada con éxito', '', 'success');
    }
});