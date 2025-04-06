document.addEventListener('DOMContentLoaded', function() {
    
    // Menu tabs functionality
    const menuTabs = document.querySelectorAll('.menu-tab');
    const menuItemsContainer = document.querySelector('.menu-items');
    const menuCategories = {
        'SUSHI': [
            {title: 'EL BANO COMONO', price: 'LKR 4100', description: 'This sushi is made from premium ingredients and so on text'},
            {title: 'KIMGU ROLL', price: 'LKR 3100', description: 'This sushi is made from premium ingredients and so on text'},
            {title: 'OAR FISH SALAMI', price: 'LKR 5400', description: 'This sushi is made from premium ingredients and so on text'},
            {title: 'BENTO OLED', price: 'LKR 3200', description: 'This sushi is made from premium ingredients and so on text'}
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
    
    // Function to render menu items with simpler transition
    function renderMenuItems(category) {
        if (!menuItemsContainer) return;
        
        menuItemsContainer.classList.add('fade-out');
        
        setTimeout(() => {
            menuItemsContainer.innerHTML = menuCategories[category].map(item => `
                <div class="menu-item">
                    <div class="menu-item-header">
                        <h3 class="menu-item-title">${item.title}</h3>
                        <span class="menu-item-price">${item.price}</span>
                    </div>
                    <p class="menu-item-description">${item.description}</p>
                </div>
            `).join('');
            
            menuItemsContainer.classList.remove('fade-out');
            menuItemsContainer.classList.add('fade-in');
            
            setTimeout(() => menuItemsContainer.classList.remove('fade-in'), 500);
        }, 200);
    }
    
    // Add click event listeners to menu tabs
    menuTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            menuTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderMenuItems(this.textContent);
        });
    });
    
    // Initialize with the first tab (SUSHI)
    renderMenuItems('SUSHI');

    /* Back to top button */
    const backToTopButton = document.getElementById('back-to-top');
    
    // Show button when scrolled down
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            backToTopButton.style.display = 
                (document.documentElement.scrollTop > 300) ? "block" : "none";
        });
        
        // Smooth scroll to top
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
    }

    // Cart functionality
    const elements = {
        cartIcon: document.querySelector('.cart-icon'),
        cartCount: document.querySelector('.cart-count'),
        cartSidebar: document.querySelector('.cart-sidebar'),
        cartItems: document.querySelector('.cart-items'),
        subtotalAmount: document.querySelector('.subtotal-amount'),
        closeCartBtn: document.querySelector('.close-cart'),
        overlay: document.querySelector('.overlay')
    };
    
    // Cart state
    let cartItems_data = JSON.parse(localStorage.getItem('restaurantCartItems') || '[]');
    
    // Cart UI functions
    function toggleCart(show) {
        if (elements.cartSidebar) {
            elements.cartSidebar.style.right = show ? '0' : '-100%';
        }
        if (elements.overlay) {
            elements.overlay.style.display = show ? 'block' : 'none';
        }
    }
    
    function updateCartUI() {
        // Update cart count
        if (elements.cartCount) {
            const totalItems = cartItems_data.reduce((sum, item) => sum + item.quantity, 0);
            elements.cartCount.textContent = totalItems;
            elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        // Update cart sidebar content
        if (!elements.cartItems) return;
        
        let subtotal = 0;
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
        
        if (elements.subtotalAmount) {
            elements.subtotalAmount.textContent = `LKR ${subtotal.toFixed(2)}`;
        }
        
        initializeCartControls();
    }
    
    function saveCart() {
        localStorage.setItem('restaurantCartItems', JSON.stringify(cartItems_data));
    }
    
    function initializeCartControls() {
        // Handle quantity increase
        document.querySelectorAll('.cart-increase').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                cartItems_data[index].quantity++;
                
                saveCart();
                updateCartUI();
                
                document.dispatchEvent(new CustomEvent('cartUpdated', { 
                    detail: { action: 'increase', item: cartItems_data[index] }
                }));
            });
        });
        
        // Handle quantity decrease
        document.querySelectorAll('.cart-decrease').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                const item = cartItems_data[index];
                
                const removed = item.quantity <= 1;
                if (removed) {
                    cartItems_data.splice(index, 1);
                } else {
                    item.quantity--;
                }
                
                saveCart();
                updateCartUI();
                
                document.dispatchEvent(new CustomEvent('cartUpdated', { 
                    detail: { action: 'decrease', item: item, removed: removed }
                }));
            });
        });
    }
    
    // Cart event listeners
    if (elements.cartIcon) {
        elements.cartIcon.addEventListener('click', () => toggleCart(true));
    }
    
    if (elements.closeCartBtn) {
        elements.closeCartBtn.addEventListener('click', () => toggleCart(false));
    }
    
    if (elements.overlay) {
        elements.overlay.addEventListener('click', () => toggleCart(false));
    }
    
    // Initialize cart
    updateCartUI();
    
    // Expose cart API
    window.neptune = {
        cart: {
            getItems: () => cartItems_data,
            updateUI: updateCartUI,
            openCart: () => toggleCart(true),
            closeCart: () => toggleCart(false),
            addItem: (item, openCartAfterAdd = false) => {
                const existingItemIndex = cartItems_data.findIndex(i => i.name === item.name);
                
                if (existingItemIndex !== -1) {
                    cartItems_data[existingItemIndex].quantity++;
                } else {
                    cartItems_data.push(item);
                }
                
                saveCart();
                updateCartUI();
                
                if (openCartAfterAdd) toggleCart(true);
            },
            updateItemQuantity: (title, quantity) => {
                const item = cartItems_data.find(item => item.name === title);
                if (item) {
                    item.quantity = quantity;
                    saveCart();
                    updateCartUI();
                }
            },
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