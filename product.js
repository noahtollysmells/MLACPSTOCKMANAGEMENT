const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";

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

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

async function renderProduct() {
  const id = getQueryParam("id");
  const products = await fetchProducts();
  const product = products.find(p => p.id === id);

  const detail = document.getElementById("productDetail");
  if (!product) {
    detail.innerHTML = "<p>Product not found.</p>";
    return;
  }

  detail.innerHTML = `
    <h2>${product.name}</h2>
    <p><strong>Specs:</strong> ${product.specs}</p>
    <p><strong>Price:</strong> £${product.price}</p>
    <div id="qrcode"></div>
    <button onclick="downloadQR('${id}')">Download QR</button>
  `;

  const url = `${window.location.origin}${window.location.pathname.replace("product.html", "product.html")}?id=${id}`;
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

window.addEventListener("load", renderProduct);
