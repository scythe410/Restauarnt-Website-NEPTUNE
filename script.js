document.addEventListener('DOMContentLoaded', function() {
    // ===== MENU TABS FUNCTIONALITY =====
    const menuTabs = document.querySelectorAll('.menu-tab');
    const menuItemsContainer = document.querySelector('.menu-items');
    
    // Menu data organized by categories
    const menuCategories = {
        'SUSHI': [
            {title: 'EL BANO COMONO', price: 'LKR 4100', description: 'A unique fusion sushi roll featuring tempura shrimp and spicy mayo'},
            {title: 'KIMGU ROLL', price: 'LKR 3100', description: 'Korean-inspired roll with kimchi, grilled beef and cucumber'},
            {title: 'OAR FISH SALAMI', price: 'LKR 5400', description: 'Rare oarfish sashimi served with Italian-style cured fish roe'},
            {title: 'BENTO OLED', price: 'LKR 3200', description: 'Modern take on classic bento box with assorted premium sushi rolls'}
        ],
        'FRESH WATER': [
            {title: 'RAINBOW TROUT', price: 'LKR 4500', description: 'Freshly caught rainbow trout with herbs and lemon'},
            {title: 'CATFISH STEW', price: 'LKR 3700', description: 'Slow-cooked catfish in aromatic broth with vegetables'},
            {title: 'TILAPIA FILET', price: 'LKR 3200', description: 'Pan-seared tilapia filet with garlic butter sauce'}
        ],
        'SALT WATER': [
            {title: 'TUNA STEAK', price: 'LKR 5900', description: 'Seared tuna steak with sesame crust and ginger sauce'},
            {title: 'LOBSTER THERMIDOR', price: 'LKR 7200', description: 'Classic lobster dish with creamy sauce and cheese'},
            {title: 'SEA BASS', price: 'LKR 4800', description: 'Grilled sea bass with Mediterranean herbs and olive oil'}
        ],
        'SIDES': [
            {title: 'MISO SOUP', price: 'LKR 1200', description: 'Traditional Japanese soup with tofu and seaweed'},
            {title: 'SEAWEED SALAD', price: 'LKR 1500', description: 'Fresh seaweed with sesame dressing'},
            {title: 'STEAMED RICE', price: 'LKR 800', description: 'Premium Japanese short-grain rice'}
        ]
    };
    
    /**
     * Renders menu items with a fade transition effect
     * @param {string} category - The menu category to display
     */
    function renderMenuItems(category) {
        if (!menuItemsContainer) return;
        
        // Add fade-out class for smooth transition
        menuItemsContainer.classList.add('fade-out');
        
        // Wait for fade-out animation to complete before updating content
        setTimeout(() => {
            // Create HTML for all menu items in the selected category
            menuItemsContainer.innerHTML = menuCategories[category].map(item => `
                <div class="menu-item">
                    <div class="menu-item-header">
                        <h3 class="menu-item-title">${item.title}</h3>
                        <span class="menu-item-price">${item.price}</span>
                    </div>
                    <p class="menu-item-description">${item.description}</p>
                </div>
            `).join('');
            
            // Remove fade-out and add fade-in for appearance animation
            menuItemsContainer.classList.remove('fade-out');
            menuItemsContainer.classList.add('fade-in');
            
            // Remove fade-in class after animation completes
            setTimeout(() => menuItemsContainer.classList.remove('fade-in'), 500);
        }, 200);
    }
    
    // Click event listeners to menu tabs
    menuTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and add to clicked tab
            menuTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Render the menu items for selected category
            renderMenuItems(this.textContent);
        });
    });
    
    // Initialize with the first tab (SUSHI)
    renderMenuItems('SUSHI');


    // ===== BACK TO TOP BUTTON =====
    const backToTopButton = document.getElementById('back-to-top');
    
    if (backToTopButton) {
        // Show button when scrolled down more than 1000px
        window.addEventListener('scroll', function() {
            backToTopButton.style.display = 
                (document.documentElement.scrollTop > 1000) ? "block" : "none";
        });
        
        // Smooth scroll to top when button is clicked
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
    }

    // ===== CART FUNCTIONALITY =====
    // Cache DOM elements for better performance
    const elements = {
        cartIcon: document.querySelector('.cart-icon'),
        cartCount: document.querySelector('.cart-count'),
        cartSidebar: document.querySelector('.cart-sidebar'),
        cartItems: document.querySelector('.cart-items'),
        subtotalAmount: document.querySelector('.subtotal-amount'),
        closeCartBtn: document.querySelector('.close-cart'),
        overlay: document.querySelector('.overlay'),
        checkoutButton: document.querySelector('.cart-buttons')
    };
    
    // Initialize cart state from localStorage
    let cartItems_data = JSON.parse(localStorage.getItem('restaurantCartItems') || '[]');
    
    /**
     * Toggle cart sidebar visibility
     * @param {boolean} show - Whether to show or hide the cart
     */
    function toggleCart(show) {
        if (elements.cartSidebar) {
            elements.cartSidebar.style.right = show ? '0' : '-100%';
        }
        if (elements.overlay) {
            elements.overlay.style.display = show ? 'block' : 'none';
        }
    }
    
    /**
     * Update cart UI elements based on current cart data
     */
    function updateCartUI() {
        // Update cart count badge
        if (elements.cartCount) {
            const totalItems = cartItems_data.reduce((sum, item) => sum + item.quantity, 0);
            elements.cartCount.textContent = totalItems;
            elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        // Update cart sidebar content
        if (!elements.cartItems) return;
        
        let subtotal = 0;

        // Show/hide checkout button based on whether cart has items
        if (elements.checkoutButton) {
            elements.checkoutButton.style.display = cartItems_data.length > 0 ? 'flex' : 'none';
        }
        
        // Show/hide subtotal section
        const subtotalSection = document.querySelector('.cart-footer');
        if (subtotalSection) {
            subtotalSection.style.display = cartItems_data.length > 0 ? 'block' : 'none';
        }
        
        // Show empty cart message or list of cart items
        if (cartItems_data.length === 0) {
            elements.cartItems.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #666; font-family: 'Quicksand';">
                    Your cart is empty
                </div>`;
        } else {
            // Generate HTML for each cart item
            elements.cartItems.innerHTML = cartItems_data.map((item, index) => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                
                return `
                    <div class="cart-item" data-title="${item.name}">
                        <div class="cart-item-left">
                            ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
                            <div class="cart-item-info">
                                <h4>${item.name}</h4>
                                <p class="cart-price">LKR ${itemTotal.toFixed(2)}</p>
                            </div>
                        </div>
                        <div class="cart-item-controls">
                            <button class="cart-decrease" data-index="${index}">-</button>
                            <span class="cart-quantity">${item.quantity}</span>
                            <button class="cart-increase" data-index="${index}">+</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Update subtotal amount if items exist
        if (elements.subtotalAmount && cartItems_data.length > 0) {
            elements.subtotalAmount.textContent = `LKR ${subtotal.toFixed(2)}`;
        }
        
        // Initialize quantity control buttons
        initializeCartControls();
    }
    
    /**
     * Save cart data to localStorage
     */
    function saveCart() {
        localStorage.setItem('restaurantCartItems', JSON.stringify(cartItems_data));
    }
    
    /**
     * Initialize event listeners for cart quantity controls
     */
    function initializeCartControls() {
        // Handle quantity increase
        document.querySelectorAll('.cart-increase').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                cartItems_data[index].quantity++;
                
                saveCart();
                updateCartUI();
                
                // Dispatch event for any external components that need to know about cart updates
                document.dispatchEvent(new CustomEvent('cartUpdated', { 
                    detail: { action: 'increase', item: cartItems_data[index] }
                }));
            });
        });
        
        // Handle quantity decrease or item removal
        document.querySelectorAll('.cart-decrease').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                const item = cartItems_data[index];
                
                // Check if we should remove the item or just decrease quantity
                const removed = item.quantity <= 1;
                if (removed) {
                    cartItems_data.splice(index, 1);
                } else {
                    item.quantity--;
                }
                
                saveCart();
                updateCartUI();
                
                // Dispatch event for any external components
                document.dispatchEvent(new CustomEvent('cartUpdated', { 
                    detail: { action: 'decrease', item: item, removed: removed }
                }));
            });
        });
    }
    
    // Set up cart event listeners
    if (elements.cartIcon) {
        elements.cartIcon.addEventListener('click', () => toggleCart(true));
    }
    
    if (elements.closeCartBtn) {
        elements.closeCartBtn.addEventListener('click', () => toggleCart(false));
    }
    
    if (elements.overlay) {
        elements.overlay.addEventListener('click', () => toggleCart(false));
    }
    
    // Initialize cart UI
    updateCartUI();
    
    // Create public API for cart interactions
    window.neptune = {
        cart: {
            // Get all cart items
            getItems: () => cartItems_data,
            
            // Update the cart UI
            updateUI: updateCartUI,
            
            // Open the cart sidebar
            openCart: () => toggleCart(true),
            
            // Close the cart sidebar
            closeCart: () => toggleCart(false),
            
            /**
             * Add an item to the cart
             * @param {Object} item - Item to add (must have name, price, etc.)
             * @param {boolean} openCartAfterAdd - Whether to open cart after adding
             */
            addItem: (item, openCartAfterAdd = false) => {
                // Check if item already exists in cart
                const existingItemIndex = cartItems_data.findIndex(i => i.name === item.name);
                
                if (existingItemIndex !== -1) {
                    // If item exists, increase quantity
                    cartItems_data[existingItemIndex].quantity++;
                } else {
                    // Otherwise add as new item
                    cartItems_data.push(item);
                }
                
                saveCart();
                updateCartUI();
                
                if (openCartAfterAdd) toggleCart(true);
            },
            
            /**
             * Update quantity of a specific cart item
             * @param {string} title - Item title to update
             * @param {number} quantity - New quantity value
             */
            updateItemQuantity: (title, quantity) => {
                const item = cartItems_data.find(item => item.name === title);
                if (item) {
                    item.quantity = quantity;
                    saveCart();
                    updateCartUI();
                }
            },
            
            /**
             * Remove an item from the cart
             * @param {string} title - Title of item to remove
             */
            removeItem: (title) => {
                const index = cartItems_data.findIndex(item => item.name === title);
                if (index !== -1) {
                    cartItems_data.splice(index, 1);
                    saveCart();
                    updateCartUI();
                }
            }
        }
    };
});