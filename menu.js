document.addEventListener('DOMContentLoaded', function() {
    let menuData = null;
    let selectedItems = {}; // Format: { "CATEGORY_NAME-ITEM_TITLE": quantity }
    let cartItems = []; // For cart sidebar display
    
    // DOM elements cached for better performance
    const elements = {
        menuGrid: document.querySelector('.menu-grid'),
        cartItemsContainer: document.querySelector('.cart-items'),
        subtotalElement: document.querySelector('.subtotal-amount'),
        cartCount: document.querySelector('.cart-count'),
        categoryHeading: document.querySelector('.menu-types h2'),
        categoryDescription: document.querySelector('.menu-types p'),
        cartSidebar: document.querySelector('.cart-sidebar'),
        overlay: document.querySelector('.overlay'),
        menuSection: document.querySelector('.menu-types')
    };

    // Load cart items from localStorage
    initializeCart();
    
    // Function to initialize cart from localStorage
    function initializeCart() {
        const savedCartItems = localStorage.getItem('restaurantCartItems');
        if (savedCartItems) {
            cartItems = JSON.parse(savedCartItems);
            
            // Rebuild selectedItems from cartItems
            cartItems.forEach(item => {
                const itemKey = `${item.category}-${item.name}`;
                selectedItems[itemKey] = item.quantity;
            });
            
            updateCart();
        }
    }
    
    // Helper function for price formatting
    function formatPrice(price) {
        const numericPrice = price.includes('LKR') ? 
            parseFloat(price.replace('LKR ', '')) : 
            parseFloat(price);
        return `LKR ${numericPrice.toFixed(2)}`;
    }
    
    // Function to scroll to menu section
    function scrollToMenuSection() {
        if (elements.menuSection) {
            setTimeout(() => {
                const yOffset = -130;
                const y = elements.menuSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
            }, 100);
        }
    }
    
    // Cart Functions
    function updateCart() {
        if (!elements.cartItemsContainer) return;
        
        elements.cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        
        // Calculate total quantity for cart counter
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update cart count indicator
        if (elements.cartCount) {
            elements.cartCount.textContent = totalItems;
            elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        // Populate cart items
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
        
        // Update subtotal
        if (elements.subtotalElement) {
            elements.subtotalElement.textContent = `LKR ${subtotal.toFixed(2)}`;
        }
        
        // Save to localStorage
        localStorage.setItem('restaurantCartItems', JSON.stringify(cartItems));
        
        // Initialize cart item controls
        initializeCartControls();
    }
    
    function addToCart(title, price, image, category, openCartAfterAdd = false) {
        const priceValue = price.includes('LKR') ? 
            parseFloat(price.replace('LKR ', '')) : 
            parseFloat(price);
        
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
    
    function updateCartItemQuantity(title, quantity) {
        const item = cartItems.find(item => item.name === title);
        if (item) {
            item.quantity = quantity;
        }
    }
    
    function removeFromCart(title) {
        const index = cartItems.findIndex(item => item.name === title);
        if (index !== -1) {
            cartItems.splice(index, 1);
        }
    }
    
    // Cart control functions
    function openCart() {
        if (elements.cartSidebar) elements.cartSidebar.style.right = '0';
        if (elements.overlay) elements.overlay.style.display = 'block';
    }
    
    function closeCart() {
        if (elements.cartSidebar) elements.cartSidebar.style.right = '-100%';
        if (elements.overlay) elements.overlay.style.display = 'none';
    }
    
    // Function to load XML file
    function loadMenuData() {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                menuData = this.responseXML;
                
                // Check for category parameter in URL
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
    
    // Render menu items function
    function renderMenuItems(categoryName) {
        if (!menuData) return;
        
        if (!elements.menuGrid) return;
        elements.menuGrid.innerHTML = '';
        
        const categories = menuData.getElementsByTagName('category');
        let category = null;
        
        for (let i = 0; i < categories.length; i++) {
            if (categories[i].getAttribute('name') === categoryName) {
                category = categories[i];
                break;
            }
        }

        if (!category) return;
        
        if (elements.categoryHeading) elements.categoryHeading.textContent = categoryName;
        const description = category.getElementsByTagName('description')[0].textContent;
        if (elements.categoryDescription) {
            elements.categoryDescription.innerHTML = description + '<br>These dishes are prepared with the freshest ingredients and are sure to tantalize your taste buds.';
        }
        
        const items = category.getElementsByTagName('item');
        
        for (let i = 0; i < items.length; i++) {
            const title = items[i].getElementsByTagName('title')[0].textContent;
            const desc = items[i].getElementsByTagName('description')[0].textContent;
            const price = items[i].getElementsByTagName('price')[0].textContent;
            const image = items[i].getElementsByTagName('image')[0].textContent;
            
            const priceText = formatPrice(price);
            const formattedDesc = desc.replace(/\. /g, '.<br>');
            const itemKey = `${categoryName}-${title}`;
            const quantity = selectedItems[itemKey] || 0;
            
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
        
        initializeCartButtons();
    }
    
    // Initialize cart buttons
    function initializeCartButtons() {
        document.querySelectorAll('.menu-item').forEach(item => {
            const itemKey = item.dataset.itemKey;
            const category = item.dataset.category;
            const title = item.dataset.title;
            const price = item.dataset.price;
            const image = item.dataset.image;
            
            const addButton = item.querySelector('.add-button');
            const quantityControls = item.querySelector('.quantity-controls');
            const quantityElement = item.querySelector('.quantity');
            const removeButton = item.querySelector('.remove-button');
            const plusButton = item.querySelector('.plus-button');
            
            addButton.addEventListener('click', function() {
                this.style.display = 'none';
                quantityControls.style.display = 'flex';
                selectedItems[itemKey] = 1;
                addToCart(title, price, image, category, false);
            });
            
            removeButton.addEventListener('click', function() {
                let quantity = parseInt(quantityElement.textContent);
                
                if (quantity > 1) {
                    quantity--;
                    quantityElement.textContent = quantity;
                    selectedItems[itemKey] = quantity;
                    updateCartItemQuantity(title, quantity);
                } else {
                    addButton.style.display = 'block';
                    quantityControls.style.display = 'none';
                    quantityElement.textContent = '1';
                    delete selectedItems[itemKey];
                    removeFromCart(title);
                }
                
                updateCart();
            });
            
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
    
    function initializeCartControls() {
        // Event handlers for increase/decrease buttons in cart
        document.querySelectorAll('.cart-increase').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                const item = cartItems[index];
                item.quantity++;
                
                // Update selectedItems as well
                const itemKey = `${item.category}-${item.name}`;
                selectedItems[itemKey] = item.quantity;
                
                // Update the display in the main menu if it's visible
                const menuItem = document.querySelector(`.menu-item[data-item-key="${itemKey}"]`);
                if (menuItem) {
                    menuItem.querySelector('.quantity').textContent = item.quantity;
                }
                
                updateCart();
            });
        });
        
        document.querySelectorAll('.cart-decrease').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                const item = cartItems[index];
                const itemKey = `${item.category}-${item.name}`;
                
                if (item.quantity > 1) {
                    item.quantity--;
                    selectedItems[itemKey] = item.quantity;
                    
                    // Update menu display if visible
                    const menuItem = document.querySelector(`.menu-item[data-item-key="${itemKey}"]`);
                    if (menuItem) {
                        menuItem.querySelector('.quantity').textContent = item.quantity;
                    }
                } else {
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
    
    // Set up event listeners
    function setupEventListeners() {
        // Cart sidebar controls
        const cartIcon = document.querySelector('.cart-icon');
        const closeCartButton = document.querySelector('.close-cart');
        
        if (cartIcon) cartIcon.addEventListener('click', openCart);
        if (closeCartButton) closeCartButton.addEventListener('click', closeCart);
        if (elements.overlay) elements.overlay.addEventListener('click', closeCart);
        
        // Menu tab event listeners
        const menuTabs = document.querySelectorAll('.menu-tab');
        menuTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                menuTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                renderMenuItems(this.textContent);
                
                // Update URL
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('category', this.textContent.trim());
                window.history.pushState({}, '', newUrl);
                
                scrollToMenuSection();
            });
        });
    }
    
    // Initialize everything
    setupEventListeners();
    loadMenuData();
});