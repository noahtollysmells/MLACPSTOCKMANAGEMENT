// ==========================
// CONFIG: GitHub Pages Base URL
// ==========================
// Replace "inventory-app" with your repo name if you called it differently
const BASE_URL = "https://noahtollysmells.github.io/inventory-app";

// ==========================
// PRODUCT STORAGE
// ==========================
function loadProducts() {
  return JSON.parse(localStorage.getItem("products") || "[]");
}

function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

// ==========================
// RENDER LIST
// ==========================
function renderList() {
  const products = loadProducts();
  const list = document.getElementById("productList");
  list.innerHTML = "";

  products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p><strong>Price:</strong> £${p.price}</p>
      <button onclick="showDetail('${p.id}')">View</button>
      <button onclick="deleteProduct('${p.id}')">Delete</button>
    `;
    list.appendChild(card);
  });
}

// ==========================
// ADD PRODUCT
// ==========================
function addProduct() {
  const name = prompt("Product name?");
  if (!name) return;

  const specs = prompt("Specs?");
  const price = prompt("Price?");
  const id = Date.now().toString();

  const products = loadProducts();
  products.push({ id, name, specs, price });
  saveProducts(products);

  renderList();
}

// ==========================
// DELETE PRODUCT
// ==========================
function deleteProduct(id) {
  let products = loadProducts();
  products = products.filter((p) => p.id !== id);
  saveProducts(products);
  renderList();
}

// ==========================
// SHOW PRODUCT DETAIL
// ==========================
function showDetail(id) {
  const products = loadProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return;

  const detail = document.getElementById("productDetail");
  detail.innerHTML = `
    <h2>${product.name}</h2>
    <p><strong>Specs:</strong> ${product.specs}</p>
    <p><strong>Price:</strong> £${product.price}</p>
    <div id="qrcode"></div>
    <button onclick="downloadQR('${id}')">Download QR</button>
    <button onclick="window.print()">Print Label</button>
  `;

  // Generate QR Code that points to GitHub Pages URL
  const url = `${BASE_URL}#/product/${id}`;
  new QRCode(document.getElementById("qrcode"), {
    text: url,
    width: 200,
    height: 200,
  });

  window.location.hash = "/product/" + id;
}

// ==========================
// DOWNLOAD QR
// ==========================
function downloadQR(id) {
  const canvas = document.querySelector("#qrcode canvas");
  if (!canvas) return;

  const link = document.createElement("a");
  link.download = `product_${id}_qr.png`;
  link.href = canvas.toDataURL();
  link.click();
}

// ==========================
// ROUTER
// ==========================
window.addEventListener("load", () => {
  renderList();

  // If URL has a product hash, open detail
  const hash = window.location.hash;
  if (hash.startsWith("#/product/")) {
    const id = hash.split("/")[2];
    showDetail(id);
  }
});
