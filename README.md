# The Neptune

[Go checkout the site here ☺️](https://scythe410.github.io/Restauarnt-Website-NEPTUNE/)

![Website demo image](https://github.com/user-attachments/assets/8c1c957c-fc57-434c-873c-152a3bcdcd02)

## Overview
**The Neptune** is a modern, visually rich web application for a seafood restaurant, offering an immersive digital menu, online ordering, and a seamless checkout experience. The site is designed to reflect the elegance and freshness of the restaurant's cuisine, with a focus on user experience and aesthetic appeal.

## Features
- **Landing Page:**
  - Hero section with a seafood platter and welcome message.
  - About section describing the restaurant's philosophy and culinary approach.
  - Highlights of authentic taste, premium ingredients, and a diverse menu.
  - Chef's recommendations and featured dishes.
  - Experience section showcasing 24+ years of culinary expertise.
  - Contact and reservation section with map and booking details.
  - Social media and contact info in the footer.

- **Menu System:**
  - Interactive menu with categories: Sushi, Fresh Water, Salt Water, Sides.
  - Menu data loaded from `menu.xml` and rendered dynamically.
  - Add-to-cart functionality with a sidebar cart and live subtotal.
  - Menu and cart state persist via `localStorage`.

- **Checkout:**
  - Checkout form for contact, delivery, and payment details.
  - Supports credit card and cash on delivery.
  - Form validation and order confirmation popup.

- **Responsive Design:**
  - Modern, mobile-friendly layout using custom CSS and Google Fonts.
  - Visually appealing images and icons throughout.

## File Structure
- `index.html` – Landing page
- `menu.html` – Menu and ordering interface
- `checkout.html` – Checkout and payment
- `menu.xml` – Menu data (dishes, descriptions, prices, images)
- `script.js`, `menu.js`, `checkout.js` – JavaScript for interactivity and cart logic
- `styles.css`, `menu.css`, `checkout.css` – CSS for layout and design
- `images/` – All images used in the site (dishes, icons, backgrounds, logos)

## Getting Started
1. **Clone or Download** this repository.
2. **Open `index.html`** in your browser to view the landing page.
3. **Navigate** to the menu and checkout via the site navigation.

> No server setup is required; all functionality is client-side.

## Usage
- Browse the menu, add items to your cart, and proceed to checkout.
- Fill in your contact, address, and payment details to place an order.
- Orders are simulated and confirmed with a popup; no backend is connected.

## Customization
- **Menu:** Edit `menu.xml` to update dishes, prices, and images.
- **Images:** Replace or add images in the `images/` folder for new dishes or branding.
- **Styles:** Modify CSS files for custom branding or layout changes.

## Credits
- Design and development by Ramiru De Silva.
- Images and icons are for demonstration purposes.
- Fonts from [Google Fonts](https://fonts.google.com/).
- Icons from [Boxicons](https://boxicons.com/).

## License
This project is for educational and demonstration purposes only. 
