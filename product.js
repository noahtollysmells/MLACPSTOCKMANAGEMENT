// Google Sheet CSV URL
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Function to fetch CSV and parse it
async function fetchCSV() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  return text.split("\n").map(row => row.split(","));
}

// Display product details
async function loadProduct() {
  const data = await fetchCSV();
  const headers = data[0];
  const rows = data.slice(1);

  const idIndex = headers.indexOf("id");
  const nameIndex = headers.indexOf("name");
  const specsIndex = headers.indexOf("specs");
  const priceIndex = headers.indexOf("price");

  const product = rows.find(row => row[idIndex] === productId);

  const container = document.getElementById("productDetails");

  if (!product) {
    container.innerHTML = `<p>❌ Product not found.</p>`;
    return;
  }

  // Build HTML for product
  container.innerHTML = `
    <h1>${product[nameIndex]}</h1>
    <p><strong>Specs:</strong> ${product[specsIndex]}</p>
    <p><strong>Price:</strong> £${product[priceIndex]}</p>
    <div class="qr">
      <canvas id="qrcode"></canvas>
      <p>📱 Scan this QR to open this product</p>
    </div>
  `;

  // Generate QR Code
  new QRCode(document.getElementById("qrcode"), {
    text: window.location.href,
    width: 200,
    height: 200
  });
}

loadProduct();
