const apiUrl = "https://script.google.com/macros/s/AKfycbyz1wB4d2S7eZYdROgZbEMbl_z10IuTPEN5KEdo7ufaPhUzCYSDNBhBQfqD5Z4kYLC-/exec";

// Helper to read ?id= from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Fetch products from Google Sheets
async function fetchProductData() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Network error fetching data");
        return await response.json();
    } catch (err) {
        console.error("Fetch error:", err);
        return [];
    }
}

// Render the product details
function renderProduct(product) {
    const container = document.getElementById("product-details");

    if (!product) {
        container.innerHTML = `
            <div class="error-box">
                <p>⚠️ Product not found.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="card">
            <h2>${product.name}</h2>
            <p><strong>Specs:</strong> ${product.specs && product.specs.trim() !== "" ? product.specs : "N/A"}</p>
            <p><strong>Price:</strong> £${product.price && product.price.toString().trim() !== "" ? product.price : "N/A"}</p>
            <div class="button-group">
                <button class="delete-btn" onclick="deleteProduct(${product.id})">🗑 Delete Product</button>
                <a href="index.html" class="back-btn">⬅ Back to Stock List</a>
            </div>
        </div>
    `;
}

// Delete product
async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify({ action: "delete", id: id }),
        });

        const result = await response.text();
        alert(result);
        window.location.href = "index.html"; // redirect after delete
    } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete product.");
    }
}

// Main
(async function () {
    const productId = getQueryParam("id");
    const container = document.getElementById("product-details");

    if (!productId) {
        container.innerHTML = "<p>⚠️ No product ID provided.</p>";
        return;
    }

    container.innerHTML = "<p>⏳ Loading product...</p>";

    const products = await fetchProductData();
    console.log("Fetched products:", products);

    const product = products.find(p => String(p.id) === String(productId));
    renderProduct(product);
})();
