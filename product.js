const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";

// Extract ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Fetch product data
async function fetchProduct() {
  try {
    const response = await fetch(sheetUrl);
    const csvText = await response.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    const products = parsed.data;
    const product = products.find(p => p.id === productId);

    if (product) {
      renderProduct(product);
    } else {
      document.getElementById("productDetails").innerHTML =
        `<div class="alert alert-warning">⚠ Product not found</div>`;
    }
  } catch (err) {
    console.error("Error loading product:", err);
    document.getElementById("productDetails").innerHTML =
      `<div class="alert alert-danger">⚠ Failed to load product details</div>`;
  }
}

// Render product details
function renderProduct(product) {
  const container = document.getElementById("productDetails");
  container.innerHTML = `
    <h2 class="card-title text-center">${product.name}</h2>
    <p class="text-center"><strong>Specs:</strong> ${product.specs || "N/A"}</p>
    <p class="text-center"><strong>Price:</strong> £${product.price || "N/A"}</p>

    <div class="text-center mt-4">
      <canvas id="qrCode"></canvas>
      <p class="mt-2 small">Scan to view this product</p>
    </div>
  `;

  // Generate QR code
  const qr = new QRious({
    element: document.getElementById("qrCode"),
    value: window.location.href,
    size: 180,
    background: "white",
    foreground: "black"
  });
}

// Start
fetchProduct();
