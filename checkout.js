/**
 * Main initialization function that runs when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load cart items from localStorage and render them
    const cartItems = loadCartItems();
    renderCheckoutCart(cartItems);
    updateOrderTotals(cartItems);

    // Setup all form-related functionality
    setupFormValidation();
    setupSpecialInputs();
    setupPaymentToggle();
    setupOrderPlacement(cartItems);
});

/**
 * Loads cart items from localStorage
 * @returns {Array} Array of cart items or empty array if none found
 */
function loadCartItems() {
    const savedCartItems = localStorage.getItem('restaurantCartItems');
    return savedCartItems ? JSON.parse(savedCartItems) : [];
}

/**
 * Sets up event listeners for form validation
 */
function setupFormValidation() {
    // Add validation to all required inputs when they change
    document.querySelectorAll('input[required]').forEach(input => {
        input.addEventListener('input', function() {
            validateInput(this);
        });
    });
}

/**
 * Sets up formatting for special input fields (card number, expiry date)
 */
function setupSpecialInputs() {
    // Format expiry date input (MM/YY)
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            if (value.length >= 2) {
                value = value.slice(0,2) + '/' + value.slice(2);
            }
            e.target.value = value.slice(0,5); // Limit to MM/YY format
        });
    }

    // Format card number input (xxxx-xxxx-xxxx-xxxx)
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            value = value.slice(0, 16); // Limit to 16 digits
            
            // Add dashes after every 4 digits
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
    }
}

/**
 * Handles toggling between card and cash payment methods
 */
function setupPaymentToggle() {
    const cardPayment = document.getElementById('card');
    const cashPayment = document.getElementById('cash');
    const cardDetails = document.querySelector('.card-details');
    
    if (!cardPayment || !cashPayment || !cardDetails) return;
    
    const cardInputs = cardDetails.querySelectorAll('input');

    // Toggle function to show/hide card details based on payment selection
    function toggleCardDetails() {
        if (cardPayment.checked) {
            cardDetails.style.display = 'block';
            cardInputs.forEach(input => {
                input.required = true;
            });
        } else {
            cardDetails.style.display = 'none';
            cardInputs.forEach(input => {
                input.required = false;
                // Clear any validation errors when switching to cash
                input.classList.remove('invalid');
                clearErrorMessage(input.parentNode);
            });
        }
    }

    // Initial state setup
    toggleCardDetails();

    // Add event listeners for payment method changes
    cardPayment.addEventListener('change', toggleCardDetails);
    cashPayment.addEventListener('change', toggleCardDetails);
}

/**
 * Sets up the order placement button functionality
 * @param {Array} cartItems - The array of cart items
 */
function setupOrderPlacement(cartItems) {
    const orderButton = document.querySelector('.place-order-btn');
    if (!orderButton) return;
    
    orderButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Validate all required fields
        let valid = validateAllInputs();
        
        if (valid) {
            // Show success popup
            const popup = document.querySelector('.popup-overlay');
            if (popup) {
                popup.style.display = 'block';
                
                // Clear cart from localStorage
                localStorage.removeItem('restaurantCartItems');
                
                // Add event listener for the OK button to redirect to home
                const closeButton = document.querySelector('.popup-close');
                if (closeButton) {
                    closeButton.addEventListener('click', function() {
                        window.location.href = 'index.html';
                    });
                }
            }
        }
    });
}

/**
 * Validates all required input fields
 * @returns {boolean} True if all fields are valid, false otherwise
 */
function validateAllInputs() {
    let valid = true;
    const requiredInputs = document.querySelectorAll('input[required]');
    
    requiredInputs.forEach(input => {
        if (!validateInput(input)) {
            valid = false;
        }
    });
    
    return valid;
}

/**
 * Removes error message element from the parent
 * @param {Element} parentElement - The parent element containing the error message
 */
function clearErrorMessage(parentElement) {
    const errorMessage = parentElement.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

/**
 * Validates an input field based on its type and ID
 * @param {Element} input - The input element to validate
 * @returns {boolean} True if the input is valid, false otherwise
 */
function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorText = '';

    // Check if field is empty
    if (value === '') {
        isValid = false;
        errorText = 'This field is required';
    } else {
        // Type-based validation
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

        // Field-specific validation based on input ID
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

    const parentElement = input.parentNode;
    
    // Update UI based on validation result
    if (!isValid) {
        input.classList.add('invalid');
        clearErrorMessage(parentElement); // Remove any existing error message
        
        // Add new error message
        const errorSpan = document.createElement('span');
        errorSpan.classList.add('error-message');
        errorSpan.textContent = errorText;
        parentElement.appendChild(errorSpan);
    } else {
        input.classList.remove('invalid');
        clearErrorMessage(parentElement);
    }

    return isValid;
}

/**
 * Renders the cart items in the checkout page
 * @param {Array} items - The array of cart items
 */
function renderCheckoutCart(items) {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer) return;
    
    // Show empty cart message if no items
    if (!items || items.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        return;
    }
    
    // Clear container and add items
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

/**
 * Updates the order totals display
 * @param {Array} items - The array of cart items
 */
function updateOrderTotals(items) {
    // Calculate subtotal from items
    let subtotal = 0;
    if (items && items.length > 0) {
        subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    const deliveryFee = 350; // Fixed delivery fee in LKR
    const total = subtotal + deliveryFee;
    
    // Update display elements
    const subtotalElement = document.querySelector('.subtotal-amount');
    const totalElement = document.querySelector('.total-amount');
    
    if (subtotalElement) subtotalElement.textContent = `LKR ${subtotal.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `LKR ${total.toFixed(2)}`;
}