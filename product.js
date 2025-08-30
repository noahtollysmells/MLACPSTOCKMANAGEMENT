// 🔗 Your Google Sheets Web App URLs
const SHEET_API_URL =
  "https://script.google.com/macros/s/AKfycbyz1wB4d2S7eZYdROgZbEMbl_z10IuTPEN5KEdo7ufaPhUzCYSDNBhBQfqD5Z4kYLC-/exec";
const DELETE_API_URL =
  "https://script.google.com/macros/s/AKfycbxa5fJBCcLuDdZpu1YZ1212zANMLmVYTp4z69R1pZ9D4stGkjcskDGBj4HZ0se7kdzg/exec";

// Get product ID from URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Fetch all products from Google Sheets
async function fetchProducts() {
  try {
    const response = await fetch(SHEET_API_URL);
    return await response.json();
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return [];
  }
}

// Delete product by ID
async function deleteProduct(id) {
  try {
    const response = await fetch(DELETE_API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "delete", id }),
    });

    const result = await response.json();
    console.log("Delete result:", result);

    if (result.success) {
      alert("✅ Product deleted successfully!");
      window.location.href = "index.html";
    } else {
      alert("⚠️ Failed to delete: " + result.message);
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    alert("❌ Error deleting product.");
  }
}

// Render product details
function renderProduct(product) {
  const container = document.getElementById("product-details");

  if (!product) {
    container.innerHTML = `<p class="error">❌ Product not found.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="product-card">
      <h2>${product.name}</h2>
      <p><strong>Specs:</strong> ${product.specs || "N/A"}</p>
      <p><strong>Price:</strong> £${product.price || "0.00"}</p>

      <div class="actions">
        <button id="delete-btn" class="delete-btn">🗑️ Delete</button>
      </div>
    </div>
  `;

  // Hook delete button
  document.getElementById("delete-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(product.id);
    }
  });
}

// Init
(async function () {
  const productId = getQueryParam("id");
  const products = await fetchProducts();
  const product = products.find((p) => p.id === productId);
  renderProduct(product);
})();
