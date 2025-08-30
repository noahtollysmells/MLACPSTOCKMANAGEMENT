const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";

async function fetchProductData() {
  try {
    console.log("Looking for product with ID:", productId);

    const response = await fetch(sheetUrl);
    const csvText = await response.text();

    const rows = csvText.trim().split("\n").map(r => r.split(","));
    const headers = rows[0];
    console.log("Headers found:", headers);

    // Convert CSV rows → objects
    const products = rows.slice(1).map(r => {
      let obj = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = r[i] ? r[i].trim() : "";
      });
      return obj;
    });

    console.log("Parsed data:", products);

    const product = products.find(p => p.id === productId);

    if (product) {
      renderProduct(product);
    } else {
      document.getElementById("productDetails").innerHTML =
        `<p style="color: red;">⚠ Product not found</p>`;
    }
  } catch (err) {
    console.error("Error loading product data:", err);
    document.getElementById("productDetails").innerHTML =
      `<p style="color: red;">⚠ Error loading product data</p>`;
  }
}

function renderProduct(product) {
  const container = document.getElementById("productDetails");
  container.innerHTML = `
    <h2>${product.name}</h2>
    <p><strong>Specs:</strong> ${product.specs || "N/A"}</p>
    <p><strong>Price:</strong> $${product.price || "N/A"}</p>
    <canvas id="qrcode"></canvas>
  `;

  // Generate QR Code for product link
  new QRious({
    element: document.getElementById("qrcode"),
    value: window.location.href,
    size: 200
  });
}

fetchProductData();
