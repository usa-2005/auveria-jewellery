let cart = JSON.parse(localStorage.getItem("cart")) || [];
let selectedProduct = {};

// --- NEW NAVIGATION ELEMENTS ---
// These grab the mobile menu elements we created in your HTML
const mobileMenu = document.getElementById('mobile-menu');
const navLinksList = document.getElementById('nav-links-list');

// Open or close the main mobile menu dropdown when clicking the hamburger lines
if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        navLinksList.classList.toggle('active');
    });
}

// Handles clicking the 'Shop' item on mobile devices
function toggleDropdown(event) {
    if (window.innerWidth <= 768) {
        event.preventDefault(); // Stop the screen from jumping up to '#'
        const dropdownMenu = document.getElementById('shop-dropdown');
        if (dropdownMenu) {
            dropdownMenu.classList.toggle('show');
        }
    }
}

// Clean helper function to hide all menus after an item is selected
function closeMenu() {
    if (navLinksList && navLinksList.classList.contains('active')) {
        navLinksList.classList.remove('active');
    }
    const dropdownMenu = document.getElementById('shop-dropdown');
    if (dropdownMenu && dropdownMenu.classList.contains('show')) {
        dropdownMenu.classList.remove('show');
    }
}
// --------------------------------

// When the page loads, make sure the navbar badge reflects saved items
document.addEventListener("DOMContentLoaded", () => {
    updateCart();
});

// Open Product Popup Modal
function openProduct(name, desc, price, img){
    selectedProduct = {name, desc, price, img};

    document.getElementById("pimg").src = img;
    document.getElementById("pname").innerText = name;
    document.getElementById("pdesc").innerText = desc;
    document.getElementById("pprice").innerText = "AED " + price;

    document.getElementById("popup").style.display = "block";
}

function closePopup(){
    document.getElementById("popup").style.display = "none";
}

// Add Item & Show Confirmation Message
function addToCartFromPopup(){
    cart.push(selectedProduct);
    
    // Save to localStorage immediately
    localStorage.setItem("cart", JSON.stringify(cart));
    
    updateCart();
    closePopup();
    
    // Short, elegant confirmation message
    alert(`✨ ${selectedProduct.name} has been added to your cart!`);
}

// Toggle showing the cart view page over the main store content
function toggleCart() {
    const cartPage = document.getElementById("cartPageSection");
    const mainSections = document.querySelectorAll("section:not(#feedback)");
    
    cartPage.classList.toggle("active");
    
    // Hide or show the rest of the store to make it feel like a completely new page
    if (cartPage.classList.contains("active")) {
        mainSections.forEach(sec => sec.style.display = "none");
        window.scrollTo(0, 0);
    } else {
        mainSections.forEach(sec => sec.style.display = "block");
    }
}

// Update Everything Dynamically
function updateCart(){
    let html = "";
    let total = 0;
    let itemCount = cart.length;

    if(cart.length === 0) {
        html = "<p class='empty-cart'>Your bag is currently empty.</p>";
    } else {
        cart.forEach((item, index) => {
            html += `
                <div class="cart-row">
                    <div class="cart-img-col">
                        <img src="${item.img}" alt="${item.name}">
                    </div>
                    <div class="cart-details-col">
                        <h3>${item.name}</h3>
                        <p>${item.desc}</p>
                        <span class="remove-item-btn" onclick="removeItem(${index})">Remove Item</span>
                    </div>
                    <div class="cart-price-col">
                        <p class="item-price">AED ${item.price}</p>
                    </div>
                </div>
            `;
            total += Number(item.price);
        });
    }

    // Update Cart HTML structures
    document.getElementById("cartItems").innerHTML = html;
    document.getElementById("total").innerText = "Total: AED " + total;

    // Update Navbar Badge
    const badge = document.getElementById("cartBadge");
    if (badge) {
        if (itemCount > 0) {
            badge.innerText = `(${itemCount})`; // Clean style: just displays (1), (2), etc.
            badge.style.display = "inline";
        } else {
            badge.innerText = "";
            badge.style.display = "none";
        }
    }
}

// Remove particular item and re-calculate total
function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
}

// Clear the entire cart instantly
function clearCart() {
    if (confirm("Are you sure you want to clear your entire cart?")) {
        cart = [];
        localStorage.removeItem("cart");
        updateCart();
    }
}

// Go directly to your payment page
function goToPayment(){
    if (cart.length === 0) {
        alert("Your bag is empty! Add items before checking out.");
        return;
    }
    window.location.href = "payment.html";
}

// PAYMENT AND SECURE CHECKOUT PAGE PROCESSING ENGINE
let currentTotal = 0;
let chosenMethod = '';

// Check if we are safely loaded inside the payment layout screen environment
document.addEventListener("DOMContentLoaded", () => {
    const displayTotalElement = document.getElementById("displayTotal");
    
    // Only run this initialization block if the display total space actually exists on current viewport
    if (displayTotalElement) {
        const cartData = JSON.parse(localStorage.getItem("cart")) || [];
        
        // Calculate aggregate checkout balances
        cartData.forEach(item => {
            currentTotal += Number(item.price);
        });
        
        displayTotalElement.innerText = "AED " + currentTotal;
    }
});

// Step 1: Lock client details structures and display active method components
function handleProceed(event) {
    event.preventDefault(); // Guard against default full-page refresh loops
    
    // Conceal current initialization buttons safely
    document.querySelector("#detailsSection button").style.display = "none";
    
    // Expand payment grid tiers seamlessly
    document.getElementById("paymentSection").style.display = "block";
    selectMethod('credit'); // Highlight Credit Card choice setup automatically
}

// Step 2: Handle switching structural components dynamically based on chosen transaction method
function selectMethod(method) {
    chosenMethod = method;
    
    // Purge previous focus parameters cleanly across all selection panels
    document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('paymentFieldsWrapper').style.display = "block";
    
    // Append tracking states safely
    document.getElementById(`btn-${method}`).classList.add('selected');

    const cardFields = document.getElementById("cardFields");
    const codFields = document.getElementById("codFields");

    if (method === 'credit' || method === 'debit') {
        cardFields.style.display = "block";
        codFields.style.display = "none";
        
        // Optimize text placeholder content cleanly on the fly
        document.getElementById("cardNumber").placeholder = method === 'credit' ? "Credit Card Number" : "Debit Card Number";
        setCardFieldsRequired(true);
    } else if (method === 'cod') {
        cardFields.style.display = "none";
        codFields.style.display = "block";
        setCardFieldsRequired(false);
    }
}

function setCardFieldsRequired(isRequired) {
    const num = document.getElementById("cardNumber");
    const holder = document.getElementById("cardHolder");
    const exp = document.getElementById("cardExpiry");
    const cvv = document.getElementById("cardCvv");

    if (num && holder && exp && cvv) {
        num.required = isRequired;
        holder.required = isRequired;
        exp.required = isRequired;
        cvv.required = isRequired;
    }
}

// Step 3: Conclude active transactions, send to Excel, and wipe checkout arrays cleanly 
function submitFinalPayment() {
    // Your verified Google Apps Script Web App URL
    const EXCEL_BRIDGE_URL = "https://script.google.com/macros/s/AKfycbx5P5yaYsvzUCKGFFEGgnMnPGaYspFudDAeav0Kx64ltulTd3HQ_ykwLhQzEr-lkouD/exec";

    // Validate card fields if card method is selected
    if (chosenMethod === 'credit' || chosenMethod === 'debit') {
        const num = document.getElementById("cardNumber").value;
        const holder = document.getElementById("cardHolder").value;
        const exp = document.getElementById("cardExpiry").value;
        const cvv = document.getElementById("cardCvv").value;

        if(!num || !holder || !exp || !cvv) {
            alert("Please fill in your valid card credentials to secure transaction authorization.");
            return;
        }
    }

    // Gather Customer and Product info for Excel
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    const productNamesList = cartData.map(item => item.name).join(", ");
    
    const orderPayload = {
        name: document.getElementById("custName").value,
        address: document.getElementById("custAddress").value,
        total: "AED " + currentTotal,
        products: productNamesList
    };

    // Send data to your Excel sheet first, THEN show alert and redirect
    fetch(EXCEL_BRIDGE_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
    })
    .then(() => {
        // This runs only AFTER the data is successfully sent to your sheet
        alert("✨ Payment Done! Your order has been placed successfully. Thank you for shopping with Aurévia Jewellery.");
        
        // Reset global vectors completely
        localStorage.removeItem("cart");
        
        // Redirect client browser straight home safely
        window.location.href = "index.html";
    })
    .catch(err => {
        console.error("Sheet Logging Error: ", err);
        alert("Something went wrong saving your order. Please try again.");
    });
}