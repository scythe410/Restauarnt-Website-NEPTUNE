document.addEventListener('DOMContentLoaded', function() {
    // ===== STATE VARIABLES =====
    let menuData = null; // Will store XML data once loaded
    let selectedItems = {}; // Format: { "CATEGORY_NAME-ITEM_TITLE": quantity }
    let cartItems = []; // Array of items in cart
    
    // Cache DOM elements for better performance
    const elements = {
        menuGrid: document.querySelector('.menu-grid'),
        cartItemsContainer: document.querySelector('.cart-items'),
        subtotalElement: document.querySelector('.subtotal-amount'),
        cartCount: document.querySelector('.cart-count'),
        categoryHeading: document.querySelector('.menu-types h2'),
        categoryDescription: document.querySelector('.menu-types p'),
        cartSidebar: document.querySelector('.cart-sidebar'),
        overlay: document.querySelector('.overlay'),
        menuSection: document.querySelector('.menu-types'),
        checkoutButton: document.querySelector('.cart-buttons')
    };

    // Load cart from localStorage on page load
    initializeCart();
    
    /**
     * Initialize cart from localStorage
     */
    function initializeCart() {
        const savedCartItems = localStorage.getItem('restaurantCartItems');
        if (savedCartItems) {
            cartItems = JSON.parse(savedCartItems);
            
            // Rebuild selectedItems tracking object from cartItems
            cartItems.forEach(item => {
                const itemKey = `${item.category}-${item.name}`;
                selectedItems[itemKey] = item.quantity;
            });
            
            updateCart();
        }
    }
    
    /**
     * Format price string consistently
     * @param {string} price - Price with or without currency prefix
     * @return {string} - Formatted price with currency
     */
    function formatPrice(price) {
        const numericPrice = price.includes('LKR') ? 
            parseFloat(price.replace('LKR ', '')) : 
            parseFloat(price);
        return `LKR ${numericPrice.toFixed(2)}`;
    }
    
    /**
     * Scroll to menu section with offset
     */
    function scrollToMenuSection() {
        if (elements.menuSection) {
            setTimeout(() => {
                const yOffset = -130; // Adjust for header height
                const y = elements.menuSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
            }, 100);
        }
    }
    
    /**
     * Update cart display and localStorage
     */
    function updateCart() {
        if (!elements.cartItemsContainer) return;
        
        elements.cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        
        // Calculate total quantity for cart counter
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        
        // Show/hide checkout button based on cart items
        if (elements.checkoutButton) {
            elements.checkoutButton.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        // Show empty cart message if applicable
        if (totalItems === 0) {
            elements.cartItemsContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #666; font-family: 'Quicksand';">
                    Your cart is empty
                </div>`;
        }
        
        // Update cart count badge
        if (elements.cartCount) {
            elements.cartCount.textContent = totalItems;
            elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        // Generate HTML for each cart item
        cartItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const cartItemHTML = `
                <div class="cart-item" data-title="${item.name}">
                    <div class="cart-item-left">
                        <img src="${item.image}" alt="${item.name}">
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
            elements.cartItemsContainer.innerHTML += cartItemHTML;
        });
        
        // Update subtotal amount
        if (elements.subtotalElement) {
            elements.subtotalElement.textContent = `LKR ${subtotal.toFixed(2)}`;
        }
        
        // Save to localStorage
        localStorage.setItem('restaurantCartItems', JSON.stringify(cartItems));
        
        // Set up event handlers for cart controls
        initializeCartControls();
    }
    
    /**
     * Add item to cart
     * @param {string} title - Item title
     * @param {string} price - Item price (with or without currency)
     * @param {string} image - Item image URL
     * @param {string} category - Item category
     * @param {boolean} openCartAfterAdd - Whether to open cart after adding
     */
    function addToCart(title, price, image, category, openCartAfterAdd = false) {
        // Convert price string to number
        const priceValue = price.includes('LKR') ? 
            parseFloat(price.replace('LKR ', '')) : 
            parseFloat(price);
        
        // Check if item already exists in cart
        const existingItem = cartItems.find(item => item.name === title);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cartItems.push({
                name: title,
                price: priceValue,
                image: image,
                quantity: 1,
                category: category
            });
        }
        
        updateCart();
        
        if (openCartAfterAdd) {
            openCart();
        }
    }
    
    /**
     * Update quantity of a specific cart item
     * @param {string} title - Item title to update
     * @param {number} quantity - New quantity
     */
    function updateCartItemQuantity(title, quantity) {
        const item = cartItems.find(item => item.name === title);
        if (item) {
            item.quantity = quantity;
        }
    }
    
    /**
     * Remove an item from cart
     * @param {string} title - Item title to remove
     */
    function removeFromCart(title) {
        const index = cartItems.findIndex(item => item.name === title);
        if (index !== -1) {
            cartItems.splice(index, 1);
        }
    }
    
    /**
     * Open cart sidebar
     */
    function openCart() {
        if (elements.cartSidebar) elements.cartSidebar.style.right = '0';
        if (elements.overlay) elements.overlay.style.display = 'block';
    }
    
    /**
     * Close cart sidebar
     */
    function closeCart() {
        if (elements.cartSidebar) elements.cartSidebar.style.right = '-100%';
        if (elements.overlay) elements.overlay.style.display = 'none';
    }
    
    /**
     * Load menu data from XML file
     */
    function loadMenuData() {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                menuData = this.responseXML;
                
                // Check for category parameter in URL (for direct linking)
                const urlParams = new URLSearchParams(window.location.search);
                const categoryParam = urlParams.get('category');
                
                if (categoryParam) {
                    // Find the tab with the matching category name
                    const menuTabs = document.querySelectorAll('.menu-tab');
                    menuTabs.forEach(tab => {
                        if (tab.textContent.trim() === categoryParam) {
                            // Activate this tab
                            menuTabs.forEach(t => t.classList.remove('active'));
                            tab.classList.add('active');
                            renderMenuItems(tab.textContent);
                            
                            scrollToMenuSection();
                        }
                    });
                } else {
                    // Initialize with the default active tab
                    const activeTab = document.querySelector('.menu-tab.active');
                    if (activeTab) {
                        renderMenuItems(activeTab.textContent);
                    }
                }
            }
        };
        xhr.open("GET", "menu.xml", true);
        xhr.send();
    }
    
    /**
     * Render menu items for a specific category
     * @param {string} categoryName - Category to display
     */
    function renderMenuItems(categoryName) {
        if (!menuData || !elements.menuGrid) return;
        
        elements.menuGrid.innerHTML = '';
        
        // Find the selected category in XML data
        const categories = menuData.getElementsByTagName('category');
        let category = null;
        
        for (let i = 0; i < categories.length; i++) {
            if (categories[i].getAttribute('name') === categoryName) {
                category = categories[i];
                break;
            }
        }

        if (!category) return;
        
        // Update category heading and description
        if (elements.categoryHeading) elements.categoryHeading.textContent = categoryName;
        const description = category.getElementsByTagName('description')[0].textContent;
        if (elements.categoryDescription) {
            elements.categoryDescription.innerHTML = description + '<br>These dishes are prepared with the freshest ingredients and are sure to tantalize your taste buds.';
        }
        
        // Get menu items for this category
        const items = category.getElementsByTagName('item');
        
        // Generate HTML for each menu item
        for (let i = 0; i < items.length; i++) {
            const title = items[i].getElementsByTagName('title')[0].textContent;
            const desc = items[i].getElementsByTagName('description')[0].textContent;
            const price = items[i].getElementsByTagName('price')[0].textContent;
            const image = items[i].getElementsByTagName('image')[0].textContent;
            
            const priceText = formatPrice(price);
            const formattedDesc = desc.replace(/\. /g, '.<br>'); // Line break after each sentence
            const itemKey = `${categoryName}-${title}`;
            const quantity = selectedItems[itemKey] || 0;
            
            // Create menu item HTML
            const menuItemHTML = `
                <div class="menu-item" data-item-key="${itemKey}" data-category="${categoryName}" data-title="${title}" data-price="${priceText}" data-image="${image}">
                    <div class="menu-item-image">
                        <img src="${image}" alt="${title}" width="100%" height="100%">
                    </div>
                    <div class="menu-item-content">
                        <div class="menu-item-left">
                            <h3>${title}</h3>
                            <p>${formattedDesc}</p>
                        </div>
                        <div class="menu-item-price">${priceText}</div>
                        <div class="add-to-cart">
                            <button class="add-button" style="${quantity > 0 ? 'display:none;' : ''}">+</button>
                            <div class="quantity-controls" style="${quantity > 0 ? 'display:flex;' : 'display:none;'}">
                                <div class="remove-button">
                                    <i class='bx bxs-trash-alt bx-flip-horizontal'></i>
                                </div>
                                <div class="quantity">${quantity || 1}</div>
                                <div class="plus-button">+</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            elements.menuGrid.innerHTML += menuItemHTML;
        }
        
        // Set up event handlers for cart buttons
        initializeCartButtons();
    }
    
    /**
     * Initialize add-to-cart buttons for menu items
     */
    function initializeCartButtons() {
        document.querySelectorAll('.menu-item').forEach(item => {
            // Get item data from data attributes
            const itemKey = item.dataset.itemKey;
            const category = item.dataset.category;
            const title = item.dataset.title;
            const price = item.dataset.price;
            const image = item.dataset.image;
            
            // Get UI elements
            const addButton = item.querySelector('.add-button');
            const quantityControls = item.querySelector('.quantity-controls');
            const quantityElement = item.querySelector('.quantity');
            const removeButton = item.querySelector('.remove-button');
            const plusButton = item.querySelector('.plus-button');
            
            // Initial add button click
            addButton.addEventListener('click', function() {
                this.style.display = 'none';
                quantityControls.style.display = 'flex';
                selectedItems[itemKey] = 1;
                addToCart(title, price, image, category, false);
            });
            
            // Remove/decrease button
            removeButton.addEventListener('click', function() {
                let quantity = parseInt(quantityElement.textContent);
                
                if (quantity > 1) {
                    // Decrease quantity
                    quantity--;
                    quantityElement.textContent = quantity;
                    selectedItems[itemKey] = quantity;
                    updateCartItemQuantity(title, quantity);
                } else {
                    // Remove item completely
                    addButton.style.display = 'block';
                    quantityControls.style.display = 'none';
                    quantityElement.textContent = '1';
                    delete selectedItems[itemKey];
                    removeFromCart(title);
                }
                
                updateCart();
            });
            
            // Increase quantity button
            plusButton.addEventListener('click', function() {
                let quantity = parseInt(quantityElement.textContent);
                quantity++;
                quantityElement.textContent = quantity;
                selectedItems[itemKey] = quantity;
                updateCartItemQuantity(title, quantity);
                updateCart();
            });
        });
    }
    
    /**
     * Initialize quantity control buttons in cart sidebar
     */
    function initializeCartControls() {
        // Increase quantity button in cart
        document.querySelectorAll('.cart-increase').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                const item = cartItems[index];
                item.quantity++;
                
                // Update tracking object
                const itemKey = `${item.category}-${item.name}`;
                selectedItems[itemKey] = item.quantity;
                
                // Update quantity in menu display if visible
                const menuItem = document.querySelector(`.menu-item[data-item-key="${itemKey}"]`);
                if (menuItem) {
                    menuItem.querySelector('.quantity').textContent = item.quantity;
                }
                
                updateCart();
            });
        });
        
        // Decrease quantity or remove item button in cart
        document.querySelectorAll('.cart-decrease').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                const item = cartItems[index];
                const itemKey = `${item.category}-${item.name}`;
                
                if (item.quantity > 1) {
                    // Decrease quantity
                    item.quantity--;
                    selectedItems[itemKey] = item.quantity;
                    
                    // Update menu display if visible
                    const menuItem = document.querySelector(`.menu-item[data-item-key="${itemKey}"]`);
                    if (menuItem) {
                        menuItem.querySelector('.quantity').textContent = item.quantity;
                    }
                } else {
                    // Remove item completely
                    delete selectedItems[itemKey];
                    
                    // Update menu display if visible
                    const menuItem = document.querySelector(`.menu-item[data-item-key="${itemKey}"]`);
                    if (menuItem) {
                        menuItem.querySelector('.add-button').style.display = 'block';
                        menuItem.querySelector('.quantity-controls').style.display = 'none';
                        menuItem.querySelector('.quantity').textContent = '1';
                    }
                    
                    cartItems.splice(index, 1);
                }
                
                updateCart();
            });
        });
    }
    
    /**
     * Set up global event listeners
     */
    function setupEventListeners() {
        // Cart sidebar controls
        const cartIcon = document.querySelector('.cart-icon');
        const closeCartButton = document.querySelector('.close-cart');
        
        if (cartIcon) cartIcon.addEventListener('click', openCart);
        if (closeCartButton) closeCartButton.addEventListener('click', closeCart);
        if (elements.overlay) elements.overlay.addEventListener('click', closeCart);
        
        // Menu tab navigation
        const menuTabs = document.querySelectorAll('.menu-tab');
        menuTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Update active tab styling
                menuTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Render the selected category
                renderMenuItems(this.textContent);
                
                // Update URL for direct linking
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('category', this.textContent.trim());
                window.history.pushState({}, '', newUrl);
                
                // Scroll to menu section
                scrollToMenuSection();
            });
        });
    }
    
    // Initialize the menu system
    setupEventListeners();
    loadMenuData();
});