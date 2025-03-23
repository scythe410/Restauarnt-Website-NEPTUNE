document.addEventListener('DOMContentLoaded', function() {
    // Load cart items from localStorage
    const savedCartItems = localStorage.getItem('restaurantCartItems');
    let cartItems = [];
    
    if (savedCartItems) {
        cartItems = JSON.parse(savedCartItems);
        renderCheckoutCart(cartItems);
    }
    
    // Calculate totals
    updateOrderTotals(cartItems);
    
});

function renderCheckoutCart(items) {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer || !items || items.length === 0) {
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        }
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    
    items.forEach(item => {
        const itemPrice = (item.price * item.quantity).toFixed(2);
        const itemHTML = `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-quantity">Quantity: ${item.quantity}</div>
                </div>
                <div class="cart-item-price">LKR ${itemPrice}</div>
            </div>
        `;
        cartItemsContainer.innerHTML += itemHTML;
    });
}

function updateOrderTotals(items) {
    // Calculate subtotal from items
    let subtotal = 0;
    if (items && items.length > 0) {
        subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    const deliveryFee = 350; // Fixed delivery fee
    const total = subtotal + deliveryFee;
    
    // Update display
    const subtotalElement = document.querySelector('.subtotal-amount');
    const totalElement = document.querySelector('.total-amount');
    
    if (subtotalElement) subtotalElement.textContent = `LKR ${subtotal.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `LKR ${total.toFixed(2)}`;
}

