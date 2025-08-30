const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";

// Fetch and parse CSV
async function fetchProducts() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const rows = text.split("\n").map(r => r.split(","));
  const headers = rows.shift();
  return rows.map(r => {
    let obj = {};
    headers.forEach((h, i) => obj[h.trim()] = r[i]?.trim());
    return obj;
  });
}

async function renderList() {
  const list = document.getElementById("productList");
  const detail = document.getElementById("productDetail");
  list.innerHTML = "";
  detail.classList.add("hidden");

  const products = await fetchProducts();
  products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p><strong>£${p.price}</strong></p>
      <button onclick="window.location.hash='/product/${p.id}'">View</button>
    `;
    list.appendChild(card);
  });
}

async function renderProductPage(id) {
  const products = await fetchProducts();
  const product = products.find(p => p.id === id);

  const list = document.getElementById("productList");
  const detail = document.getElementById("productDetail");

  list.innerHTML = "";
  if (!product) {
    detail.innerHTML = "<p>Product not found.</p>";
    detail.classList.remove("hidden");
    return;
  }

  detail.classList.remove("hidden");
  detail.innerHTML = `
    <h2>${product.name}</h2>
    <p><strong>Specs:</strong> ${product.specs}</p>
    <p><strong>Price:</strong> £${product.price}</p>
    <div id="qrcode"></div>
    <button onclick="downloadQR('${id}')">Download QR</button>
    <button onclick="window.location.hash=''">Back to List</button>
  `;

  const url = `${window.location.origin}${window.location.pathname}#/product/${id}`;
  new QRCode(document.getElementById("qrcode"), {
    text: url,
    width: 200,
    height: 200,
  });
}

function downloadQR(id) {
  const canvas = document.querySelector("#qrcode canvas");
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = `product_${id}_qr.png`;
  link.href = canvas.toDataURL();
  link.click();
}

// Handle routing
async function handleRouting() {
  const hash = window.location.hash;
  if (hash.startsWith("#/product/")) {
    const id = hash.split("/")[2];
    renderProductPage(id);
  } else {
    renderList();
  }
}

window.addEventListener("load", handleRouting);
window.addEventListener("hashchange", handleRouting);
