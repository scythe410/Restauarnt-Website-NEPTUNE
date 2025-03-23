document.addEventListener('DOMContentLoaded', function() {
    
    // Menu tabs functionality
    const menuTabs = document.querySelectorAll('.menu-tab');
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
    
    // Function to render menu items
    function renderMenuItems(category) {
        const menuItemsContainer = document.querySelector('.menu-items');
        menuItemsContainer.innerHTML = ''; // Clear current items
        
        // Add fade-out class first for smooth transition
        menuItemsContainer.classList.add('fade-out');
        
        // Set a small timeout to allow the fade-out to happen before changing content
        setTimeout(() => {
            // Create and append new menu items
            menuCategories[category].forEach(item => {
                const menuItemHTML = `
                    <div class="menu-item">
                        <div class="menu-item-header">
                            <h3 class="menu-item-title">${item.title}</h3>
                            <span class="menu-item-price">${item.price}</span>
                        </div>
                        <p class="menu-item-description">${item.description}</p>
                    </div>
                `;
                menuItemsContainer.innerHTML += menuItemHTML;
            });
            
            // Remove fade-out and add fade-in class
            menuItemsContainer.classList.remove('fade-out');
            menuItemsContainer.classList.add('fade-in');
            
            // Remove fade-in class after animation completes
            setTimeout(() => {
                menuItemsContainer.classList.remove('fade-in');
            }, 500);
        }, 200);
    }
    
    // Add click event listeners to menu tabs
    menuTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            menuTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Render menu items for selected category
            renderMenuItems(this.textContent);
        });
    });
    
    // Initialize with the first tab (SUSHI)
    renderMenuItems('SUSHI');

    /* Back to top button */
    // Get the button element
    const backToTopButton = document.getElementById('back-to-top');
    
    // Show the button when user scrolls down 300px
    window.onscroll = function() {
        if (document.body.scrollTop > 1300 || document.documentElement.scrollTop > 1300) {
            backToTopButton.style.display = "block";
        } else {
            backToTopButton.style.display = "none";
        }
    };
    
    // Scroll to top when button is clicked
    backToTopButton.addEventListener('click', function() {
        // For smooth scrolling
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    
     // Get cart elements that exist on both pages
     const cartIcon = document.querySelector('.cart-icon');
     const cartCount = document.querySelector('.cart-count');
     const cartSidebar = document.querySelector('.cart-sidebar');
     const cartItems = document.querySelector('.cart-items');
     const subtotalAmount = document.querySelector('.subtotal-amount');
     const closeCartBtn = document.querySelector('.close-cart');
     const overlay = document.querySelector('.overlay');
     
     // Load cart items from localStorage
     let cartItems_data = [];
     const savedCartItems = localStorage.getItem('restaurantCartItems');
     if (savedCartItems) {
         cartItems_data = JSON.parse(savedCartItems);
         // Update cart count immediately on page load
         updateCartUI();
     }
     
     // Functions to handle cart sidebar
     function openCart() {
         if (cartSidebar) cartSidebar.style.right = '0';
         if (overlay) overlay.style.display = 'block';
     }
     
     function closeCart() {
         if (cartSidebar) cartSidebar.style.right = '-100%';
         if (overlay) overlay.style.display = 'none';
     }
     
     // Add event listeners for cart controls (on both pages)
     if (cartIcon) cartIcon.addEventListener('click', openCart);
     if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
     if (overlay) overlay.addEventListener('click', closeCart);
     
     // Update cart UI (count and sidebar)
     function updateCartUI() {
         // Update cart count indicator
         if (cartCount) {
             const totalItems = cartItems_data.reduce((sum, item) => sum + item.quantity, 0);
             cartCount.textContent = totalItems;
             cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
         }
         
         // Only update cart sidebar if it exists on the current page
         if (!cartItems) return;
         
         // Clear cart items container
         cartItems.innerHTML = '';
         
         // Calculate subtotal
         let subtotal = 0;
         
         // Add each item to cart sidebar
         cartItems_data.forEach((item, index) => {
             const itemTotal = item.price * item.quantity;
             subtotal += itemTotal;
             
             const cartItemHTML = `
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
             cartItems.innerHTML += cartItemHTML;
         });
         
         // Update subtotal display
         if (subtotalAmount) {
             subtotalAmount.textContent = `LKR ${subtotal.toFixed(2)}`;
         }
         
         // Initialize cart item controls
         initializeCartControls();
     }
     
     // Initialize cart item controls
     function initializeCartControls() {
         document.querySelectorAll('.cart-increase').forEach(button => {
             button.addEventListener('click', function() {
                 const index = parseInt(this.dataset.index);
                 cartItems_data[index].quantity++;
                 
                 // Save to localStorage and update UI
                 saveCart();
                 updateCartUI();
                 
                 // Emit a custom event to notify menu.js
                 document.dispatchEvent(new CustomEvent('cartUpdated', { 
                     detail: { 
                         action: 'increase', 
                         item: cartItems_data[index] 
                     } 
                 }));
             });
         });
         
         document.querySelectorAll('.cart-decrease').forEach(button => {
             button.addEventListener('click', function() {
                 const index = parseInt(this.dataset.index);
                 const item = cartItems_data[index];
                 
                 if (item.quantity > 1) {
                     item.quantity--;
                 } else {
                     // Remove from cart
                     cartItems_data.splice(index, 1);
                 }
                 
                 // Save to localStorage and update UI
                 saveCart();
                 updateCartUI();
                 
                 // Emit a custom event to notify menu.js
                 document.dispatchEvent(new CustomEvent('cartUpdated', { 
                     detail: { 
                         action: 'decrease', 
                         item: item,
                         removed: item.quantity <= 1
                     } 
                 }));
             });
         });
     }
     
     // Save cart to localStorage
     function saveCart() {
         localStorage.setItem('restaurantCartItems', JSON.stringify(cartItems_data));
     }
     
     // Expose these functions globally so menu.js can use them
     window.neptune = window.neptune || {};
     window.neptune.cart = {
         getItems: function() {
             return cartItems_data;
         },
         updateUI: updateCartUI,
         openCart: openCart,
         closeCart: closeCart,
         addItem: function(item, openCartAfterAdd = false) {
             const existingItemIndex = cartItems_data.findIndex(i => i.name === item.name);
             
             if (existingItemIndex !== -1) {
                 cartItems_data[existingItemIndex].quantity++;
             } else {
                 cartItems_data.push(item);
             }
             
             saveCart();
             updateCartUI();
             
             if (openCartAfterAdd) {
                 openCart();
             }
         },
         updateItemQuantity: function(title, quantity) {
             const item = cartItems_data.find(item => item.name === title);
             if (item) {
                 item.quantity = quantity;
                 saveCart();
                 updateCartUI();
             }
         },
         removeItem: function(title) {
             const index = cartItems_data.findIndex(item => item.name === title);
             if (index !== -1) {
                 cartItems_data.splice(index, 1);
                 saveCart();
                 updateCartUI();
             }
         }
     };
     
     // Initial UI update
     updateCartUI();

});

