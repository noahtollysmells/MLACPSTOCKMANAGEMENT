// Get query parameter by name
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Fetch product data from your Google Apps Script endpoint
async function fetchProductData() {
  const response = await fetch("https://script.google.com/macros/s/AKfycbyz1wB4d2S7eZYdROgZbEMbl_z10IuTPEN5KEdo7ufaPhUzCYSDNBhBQfqD5Z4kYLC-/exec");
  const data = await response.json();
  return data;
}

// Render product details
function renderProduct(product) {
  const container = document.getElementById("product-details");

  container.innerHTML = `
    <div class="card bg-secondary text-light shadow-lg p-4">
      <h2 class="mb-3">${product.name}</h2>
      <p><strong>Specs:</strong> ${product.specs || "Not provided"}</p>
      <p><strong>Price:</strong> £${product.price || "N/A"}</p>
      <div class="d-flex justify-content-center gap-3 mt-4">
        <a href="index.html" class="btn btn-primary">⬅ Back to Stock List</a>
        <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">🗑 Delete Product</button>
      </div>
    </div>
  `;
}

// Delete product
async function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  await fetch("https://script.google.com/macros/s/AKfycbyz1wB4d2S7eZYdROgZbEMbl_z10IuTPEN5KEdo7ufaPhUzCYSDNBhBQfqD5Z4kYLC-/exec", {
    method: "POST",
    body: JSON.stringify({ action: "delete", id: productId })
  });

  alert("Product deleted successfully!");
  window.location.href = "index.html";
}

// Main execution
(async function () {
  const productId = getQueryParam("id");
  const container = document.getElementById("product-details");

  if (!productId) {
    container.innerHTML = `<p class="text-warning">⚠️ No product ID provided.</p>`;
    return;
  }

  container.innerHTML = `<p>⏳ Loading product...</p>`;

  const products = await fetchProductData();

  // Force string comparison
  const product = products.find(p => String(p.id).trim() === String(productId).trim());

  if (!product) {
    container.innerHTML = `<p class="text-warning">⚠️ Product not found.</p>`;
    return;
  }

  renderProduct(product);
})();
