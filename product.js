// Google Sheets CSV URL
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";

// Parse URL param (?id=...)
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

const productDetailsContainer = document.getElementById("product-details");

async function fetchProductDetails() {
  try {
    const response = await fetch(SHEET_URL);
    const data = await response.text();

    const rows = data.split("\n").map(r => r.split(","));
    const headers = rows[0].map(h => h.trim().toLowerCase());

    // Find index positions
    const idIndex = headers.indexOf("id");
    const nameIndex = headers.indexOf("name");
    const specsIndex = headers.indexOf("specs");
    const priceIndex = headers.indexOf("price");

    // Find product by ID
    const product = rows.find((row, i) => i > 0 && row[idIndex] === productId);

    if (!product) {
      productDetailsContainer.innerHTML = `<p class="error">Product not found.</p>`;
      return;
    }

    // Render details
    productDetailsContainer.innerHTML = `
      <h2>${product[nameIndex]}</h2>
      <p><strong>Specifications:</strong> ${product[specsIndex] || "N/A"}</p>
      <p><strong>Price:</strong> £${product[priceIndex] || "N/A"}</p>
      <div class="qr-container">
        <p><strong>Scan QR:</strong></p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.href}" alt="QR Code">
      </div>
      <button class="delete-button" onclick="deleteProduct('${productId}')">Delete Product</button>
    `;
  } catch (error) {
    console.error(error);
    productDetailsContainer.innerHTML = `<p class="error">Error loading product details.</p>`;
  }
}

// Example delete handler (calls your Apps Script delete endpoint)
async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const deleteUrl = "https://script.google.com/macros/s/AKfycbxa5fJBCcLuDdZpu1YZ1212zANMLmVYTp4z69R1pZ9D4stGkjcskDGBj4HZ0se7kdzg/exec";
    const res = await fetch(deleteUrl + "?id=" + id, { method: "POST" });
    const result = await res.text();
    alert(result);
    window.location.href = "index.html";
  } catch (err) {
    alert("Failed to delete product.");
  }
}

fetchProductDetails();
