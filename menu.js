document.addEventListener('DOMContentLoaded', function() {
    let menuData = null;
    let selectedItems = {}; // Format: { "CATEGORY_NAME-ITEM_TITLE": quantity }
    let cartItems = []; // For cart sidebar display

    // Load cart items from localStorage
    const savedCartItems = localStorage.getItem('restaurantCartItems');
    if (savedCartItems) {
        cartItems = JSON.parse(savedCartItems);
        
        // Rebuild selectedItems from cartItems
        cartItems.forEach(item => {
            const itemKey = `${item.category}-${item.name}`;
            selectedItems[itemKey] = item.quantity;
        });
        
        // Update cart count indicator immediately on page load
        updateCartCount();
        
        // Add this line to update the cart sidebar
        updateCart();
    }
    
    // Function to update cart count indicator separately
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    
    // Function to scroll to menu section
    function scrollToMenuSection() {
        // Target the menu-types section which contains the category heading
        const menuSection = document.querySelector('.menu-types');
        if (menuSection) {
            // Add a small delay to ensure the DOM is fully loaded
            setTimeout(() => {
                // Scroll to the element with offset for better visibility
                const yOffset = -130; // Adjust this value as needed for your header height
                const y = menuSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
            }, 100);
        }
    }
    
    // Modify updateCart function to call updateCartCount
    function updateCart() {
        const cartItemsContainer = document.querySelector('.cart-items');
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        
        cartItems.forEach((item, index) => {
            // Existing cart item rendering code
        });
        
        // Update subtotal display
        const subtotalElement = document.querySelector('.subtotal-amount');
        if (subtotalElement) {
            subtotalElement.textContent = `LKR ${subtotal.toFixed(2)}`;
        }
        
        // Update cart count using the separate function
        updateCartCount();
        
        // Save to localStorage
        localStorage.setItem('restaurantCartItems', JSON.stringify(cartItems));
        
        // Initialize cart item controls
        initializeCartControls();
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
                            
                            // Scroll to the menu section
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
        
        const menuGrid = document.querySelector('.menu-grid');
        menuGrid.innerHTML = '';
        
        const categories = menuData.getElementsByTagName('category');
        let category = null;
        
        for (let i = 0; i < categories.length; i++) {
            if (categories[i].getAttribute('name') === categoryName) {
                category = categories[i];
                break;
            }
        }

        if (!category) return;
        
        document.querySelector('.menu-types h2').textContent = categoryName;
        const description = category.getElementsByTagName('description')[0].textContent;
        document.querySelector('.menu-types p').innerHTML = description + '<br>These dishes are prepared with the freshest ingredients and are sure to tantalize your taste buds.';
        
        const items = category.getElementsByTagName('item');
        
        for (let i = 0; i < items.length; i++) {
            const title = items[i].getElementsByTagName('title')[0].textContent;
            const desc = items[i].getElementsByTagName('description')[0].textContent;
            const price = items[i].getElementsByTagName('price')[0].textContent;
            const image = items[i].getElementsByTagName('image')[0].textContent;
            
            // Format price with two decimal places if it's a numerical value
            const priceText = price.includes('LKR') ? 
                `LKR ${parseFloat(price.replace('LKR ', '')).toFixed(2)}` : 
                `LKR ${parseFloat(price).toFixed(2)}`;
            
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
            menuGrid.innerHTML += menuItemHTML;
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
                // Hide add button, show quantity controls
                this.style.display = 'none';
                quantityControls.style.display = 'flex';
                
                // Update selectedItems
                selectedItems[itemKey] = 1;
                
                // Update cart WITHOUT automatically opening it
                addToCart(title, price, image, category, false);
            });
            
            removeButton.addEventListener('click', function() {
                let quantity = parseInt(quantityElement.textContent);
                
                if (quantity > 1) {
                    // Decrease quantity by 1
                    quantity--;
                    quantityElement.textContent = quantity;
                    selectedItems[itemKey] = quantity;
                    
                    // Find and update the item in the cart
                    updateCartItemQuantity(title, quantity);
                } else {
                    // If quantity is 1, remove the item
                    addButton.style.display = 'block';
                    quantityControls.style.display = 'none';
                    quantityElement.textContent = '1'; // Reset for next time
                    delete selectedItems[itemKey];
                    
                    // Remove from cart
                    removeFromCart(title);
                }
                
                updateCart();
            });
            
            plusButton.addEventListener('click', function() {
                // Increase quantity
                let quantity = parseInt(quantityElement.textContent);
                quantity++;
                quantityElement.textContent = quantity;
                selectedItems[itemKey] = quantity;
                
                // Find and update the item in the cart
                updateCartItemQuantity(title, quantity);
                updateCart();
            });
        });
    }
    
    // Cart Functions
    function addToCart(title, price, image, category, openCartAfterAdd = false) {
        // Extract the numeric price value, handling both "LKR XXX" and direct numeric formats
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
        
        // Only open the cart if specifically requested
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
    
    function updateCart() {
        const cartItemsContainer = document.querySelector('.cart-items');
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        // Save cart to localStorage
        localStorage.setItem('restaurantCartItems', JSON.stringify(cartItems));
        
        cartItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            // Updated HTML structure with formatted price
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
            cartItemsContainer.innerHTML += cartItemHTML;
        });
        
        // Update subtotal display with formatted price
        const subtotalElement = document.querySelector('.subtotal-amount');
        if (subtotalElement) {
            subtotalElement.textContent = `LKR ${subtotal.toFixed(2)}`;
        }
        
        // Update cart count indicator
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        // Initialize cart item controls
        initializeCartControls();
    }
    
    function initializeCartControls() {
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
                
                if (item.quantity > 1) {
                    item.quantity--;
                    
                    // Update selectedItems
                    const itemKey = `${item.category}-${item.name}`;
                    selectedItems[itemKey] = item.quantity;
                    
                    // Update the display in the main menu if it's visible
                    const menuItem = document.querySelector(`.menu-item[data-item-key="${itemKey}"]`);
                    if (menuItem) {
                        menuItem.querySelector('.quantity').textContent = item.quantity;
                    }
                } else {
                    // Remove from selectedItems
                    const itemKey = `${item.category}-${item.name}`;
                    delete selectedItems[itemKey];
                    
                    // Update the display in the main menu if it's visible
                    const menuItem = document.querySelector(`.menu-item[data-item-key="${itemKey}"]`);
                    if (menuItem) {
                        menuItem.querySelector('.add-button').style.display = 'block';
                        menuItem.querySelector('.quantity-controls').style.display = 'none';
                        menuItem.querySelector('.quantity').textContent = '1';
                    }
                    
                    // Remove from cart
                    cartItems.splice(index, 1);
                }
                
                updateCart();
            });
        });
    }
    
    // Cart sidebar control functions
    function openCart() {
        const cartSidebar = document.querySelector('.cart-sidebar');
        const overlay = document.querySelector('.overlay');
        
        if (cartSidebar) cartSidebar.style.right = '0';
        if (overlay) overlay.style.display = 'block';
    }
    
    function closeCart() {
        const cartSidebar = document.querySelector('.cart-sidebar');
        const overlay = document.querySelector('.overlay');
        
        if (cartSidebar) cartSidebar.style.right = '-100%';
        if (overlay) overlay.style.display = 'none';
    }
    
    // Add event listeners for cart controls
    const cartIcon = document.querySelector('.cart-icon');
    const closeCartButton = document.querySelector('.close-cart');
    const overlay = document.querySelector('.overlay');
    
    if (cartIcon) cartIcon.addEventListener('click', openCart);
    if (closeCartButton) closeCartButton.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', closeCart);
    
    // Add event listeners to menu tabs
    const menuTabs = document.querySelectorAll('.menu-tab');
    menuTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            menuTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderMenuItems(this.textContent);
            
            // Update URL when tab is clicked without page reload
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('category', this.textContent.trim());
            window.history.pushState({}, '', newUrl);
            
            // Scroll to the menu section
            scrollToMenuSection();
        });
    });
    
    // Load menu data when the page loads
    loadMenuData();

    //----------------------------------------------------------------------------------------------------
    
});