// product.js

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";

// Parse query string
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

console.log("Looking for product with ID:", productId);

fetch(SHEET_URL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.split("\n").map(r => r.trim()).filter(r => r.length > 0);
    const headers = rows[0].split(",").map(h => h.trim().toLowerCase());

    console.log("Headers found:", headers);

    const data = rows.slice(1).map(r => {
      const values = r.split(",");
      let obj = {};
      headers.forEach((h, i) => obj[h] = values[i] ? values[i].trim() : "");
      return obj;
    });

    console.log("Parsed data:", data);

    const product = data.find(p => p.id === productId);

    if (!product) {
      document.getElementById("productDetails").innerHTML =
        `<p style="color: red;">❌ Product not found (id=${productId})</p>`;
      return;
    }

    document.getElementById("productDetails").innerHTML = `
      <h2>${product.name}</h2>
      <p><strong>Specs:</strong> ${product.specs}</p>
      <p><strong>Price:</strong> $${product.price}</p>
      <canvas id="qrcode"></canvas>
    `;

    // Generate QR code
    new QRious({
      element: document.getElementById("qrcode"),
      value: window.location.href,
      size: 200
    });
  })
  .catch(err => {
    console.error("Error loading product data:", err);
    document.getElementById("productDetails").innerHTML =
      `<p style="color: red;">⚠️ Error loading product data</p>`;
  });
