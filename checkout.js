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

    // Form validation
    const form = document.querySelector('.checkout-form');
    const inputs = document.querySelectorAll('.form-field input');
    
    form.addEventListener('submit', function(event) {
        let valid = true;
        
        inputs.forEach(input => {
            if (!validateInput(input)) {
                valid = false;
            }
        });
        
        if (!valid) {
            event.preventDefault();
        }
    });

    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateInput(input);
        });
    });

    // Add input formatting for expiry date and card number
    const expiryInput = document.getElementById('expiry');
    const cardNumberInput = document.getElementById('card-number');

    // Format expiry date input (MM/YY)
    expiryInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0,2) + '/' + value.slice(2);
        }
        e.target.value = value.slice(0,5);
    });

    // Format card number input (xxxx-xxxx-xxxx-xxxx)
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
        
        // Limit to 16 digits
        value = value.slice(0, 16);
        
        // Add dashes
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += '-';
            }
            formattedValue += value[i];
        }
        
        e.target.value = formattedValue;
        validateInput(this); // Revalidate after formatting
    });
    
});

function validateInput(input) {
    
    // Skipping validation for apartment field since it's optional
    if (input.id === 'apartment') {
        return true;
    }

    const value = input.value.trim();
    const errorMessage = input.nextElementSibling;
    let isValid = true;
    let errorText = '';

    // Define validation rules and messages
    if (value === '') {
        isValid = false;
        errorText = 'This field is required';
    } else {
        switch (input.type) {
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                errorText = 'Please enter a valid email address';
                break;
            case 'tel':
                isValid = /^\d{10}$/.test(value);
                errorText = 'Please enter a 10-digit phone number';
                break;
        }

        // Additional field-specific validation
        switch (input.id) {
            case 'postal-code':
                isValid = /^\d{5,6}$/.test(value);
                errorText = 'Postal code must be 5-6 digits';
                break;
            case 'card-number':
                // Remove dashes before validation
                const cleanCardNumber = value.replace(/-/g, '');
                isValid = cleanCardNumber.length === 16 && /^\d+$/.test(cleanCardNumber);
                errorText = 'Card number must be 16 digits';
                break;
            case 'expiry':
                isValid = /^(0[1-9]|1[0-2])\/([2-9]\d)$/.test(value);
                errorText = 'Use MM/YY format (e.g., 05/25)';
                break;
            case 'cvv':
                isValid = /^\d{3}$/.test(value);
                errorText = 'CVV must be 3 digits';
                break;
            case 'first-name':
            case 'last-name':
                isValid = /^[A-Za-z\s]{2,}$/.test(value);
                errorText = 'Please enter a valid name';
                break;
            case 'address':
                isValid = value.length >= 5;
                errorText = 'Please enter a valid address';
                break;
            case 'city':
                isValid = /^[A-Za-z\s]{2,}$/.test(value);
                errorText = 'Please enter a valid city name';
                break;
        }
    }

    // Update UI based on validation
    if (!isValid) {
        input.classList.add('invalid');
        
        // Remove existing error message if present
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorSpan = document.createElement('span');
        errorSpan.classList.add('error-message');
        errorSpan.textContent = errorText;
        input.parentNode.appendChild(errorSpan);
    } else {
        input.classList.remove('invalid');
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    return isValid;
}

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

