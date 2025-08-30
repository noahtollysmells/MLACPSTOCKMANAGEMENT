const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";
const DELETE_URL = "https://script.google.com/macros/s/AKfycbxa5fJBCcLuDdZpu1YZ1212zANMLmVYTp4z69R1pZ9D4stGkjcskDGBj4HZ0se7kdzg/exec";

const detailsContainer = document.getElementById("productDetails");
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

async function fetchProduct() {
  const response = await fetch(CSV_URL);
  const text = await response.text();
  const rows = text.split("\n").map(r => r.split(","));
  const product = rows.slice(1).map(r => ({
    id: r[0]?.trim(),
    name: r[1]?.trim(),
    specs: r[2]?.trim(),
    price: r[3]?.trim()
  })).find(p => p.id === productId);

  if (!product) {
    detailsContainer.innerHTML = `<p>Product not found.</p>`;
    return;
  }

  detailsContainer.innerHTML = `
    <h2>${product.name}</h2>
    <p><strong>ID:</strong> ${product.id}</p>
    <p><strong>Specs:</strong><br>${(product.specs || "").replace(/;/g, "<br>")}</p>
    <p><strong>Price:</strong> £${product.price || "0"}</p>
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(product.name)}" alt="QR Code">
    <div class="buttons">
      <a href="index.html" class="btn">← Back to Stock List</a>
      <button class="btn delete" onclick="deleteProduct('${product.id}')">🗑 Delete Product</button>
    </div>
  `;
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  await fetch(`${DELETE_URL}?id=${id}`);
  alert("Product deleted.");
  window.location.href = "index.html";
}

fetchProduct();
