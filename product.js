const apiUrl = "https://script.google.com/macros/s/AKfycbyz1wB4d2S7eZYdROgZbEMbl_z10IuTPEN5KEdo7ufaPhUzCYSDNBhBQfqD5Z4kYLC-/exec";

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function fetchProductData() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching product data:", error);
        return [];
    }
}

function renderProduct(product) {
    const container = document.getElementById("product-details");
    if (!product) {
        container.innerHTML = `
            <div class="error-box">
                <p>⚠️ Product not found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="card">
            <h2>${product.name}</h2>
            <p><strong>Specs:</strong> ${product.specs || "N/A"}</p>
            <p><strong>Price:</strong> £${product.price || "N/A"}</p>
            <div class="button-group">
                <button class="delete-btn" onclick="deleteProduct(${product.id})">🗑 Delete Product</button>
                <a href="index.html" class="back-btn">⬅ Back to Stock List</a>
            </div>
        </div>
    `;
}

async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify({ action: "delete", id: id }),
        });

        const result = await response.text();
        alert(result);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product.");
    }
}

(async function () {
    const productId = getQueryParam("id");
    if (!productId) {
        document.getElementById("product-details").innerHTML = "<p>No product ID provided</p>";
        return;
    }

    const products = await fetchProductData();
    const product = products.find(p => p.id == productId);
    renderProduct(product);
})();
