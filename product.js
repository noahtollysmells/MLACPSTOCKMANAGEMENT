// Replace with your published CSV link and delete script link
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";
const DELETE_URL = "https://script.google.com/macros/s/AKfycbxa5fJBCcLuDdZpu1YZ1212zANMLmVYTp4z69R1pZ9D4stGkjcskDGBj4HZ0se7kdzg/exec";

// Utility: Parse CSV into objects
async function fetchProducts() {
  const response = await fetch(SHEET_CSV_URL);
  const text = await response.text();
  const rows = text.split("\n").map(r => r.split(","));
  const headers = rows[0].map(h => h.trim().toLowerCase());

  return rows.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i] ? row[i].trim() : "");
    return obj;
  }).filter(p => p.id); // remove empty rows
}

// Get product id from URL
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Display product details
async function showProductDetails() {
  const products = await fetchProducts();
  const productId = getProductId();
  const product = products.find(p => p.id === productId);

  const container = document.getElementById("product-details");

  if (!product) {
    container.innerHTML = `<p class="error">⚠️ Product not found.</p>`;
    return;
  }

  // Handle multiline specs properly
  const specsFormatted = product.specs.replace(/\n/g, "<br>");

  container.innerHTML = `
    <div class="product-card">
      <h2>${product.name}</h2>
      <p><strong>ID:</strong> ${product.id}</p>
      <p><strong>Specs:</strong><br>${specsFormatted}</p>
      <p><strong>Price:</strong> £${product.price}</p>

      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(product.name)}" alt="QR Code">

      <div class="buttons">
        <a href="index.html" class="btn">⬅ Back to Stock List</a>
        <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">🗑 Delete Product</button>
      </div>
    </div>
  `;
}

// Delete product
async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`${DELETE_URL}?id=${id}`, { method: "POST" });
    if (res.ok) {
      alert("Product deleted!");
      window.location.href = "index.html";
    } else {
      alert("Failed to delete product.");
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting product.");
  }
}

// Run on page load
document.addEventListener("DOMContentLoaded", showProductDetails);
