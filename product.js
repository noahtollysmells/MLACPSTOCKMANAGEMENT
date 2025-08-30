const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Your published Google Sheet CSV link
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";

async function fetchProductData() {
  try {
    console.log("Looking for product with ID:", productId);

    const response = await fetch(sheetUrl);
    const csvText = await response.text();

    // Parse CSV properly with PapaParse
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    console.log("Parsed data:", parsed.data);

    // Match product by ID
    const product = parsed.data.find(p => p.id === productId);

    if (product) {
      renderProduct(product);
    } else {
      document.getElementById("productDetails").innerHTML =
        `<p class="text-danger">⚠ Product not found</p>`;
    }
  } catch (err) {
    console.error("Error loading product data:", err);
    document.getElementById("productDetails").innerHTML =
      `<p class="text-danger">⚠ Error loading product data</p>`;
  }
}

function renderProduct(product) {
  const container = document.getElementById("productDetails");

  container.innerHTML = `
    <h2 class="mb-3">${product.name}</h2>
    <p><strong>Specs:</strong> ${product.specs || "N/A"}</p>
    <p><strong>Price:</strong> £${product.price || "N/A"}</p>
    <hr>
    <h5>QR Code</h5>
    <canvas id="qrcode"></canvas>
  `;

  // Generate QR Code for product link
  new QRious({
    element: document.getElementById("qrcode"),
    value: window.location.href,
    size: 200,
    background: "white",
    foreground: "black"
  });
}

fetchProductData();
