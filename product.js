// Google Apps Script endpoints
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";
const DELETE_URL = "https://script.google.com/macros/s/AKfycbxa5fJBCcLuDdZpu1YZ1212zANMLmVYTp4z69R1pZ9D4stGkjcskDGBj4HZ0se7kdzg/exec";

// Parse query parameter (?id=xxx)
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const productId = getQueryParam("id");

if (!productId) {
  document.getElementById("productName").innerText = "Product Not Found";
} else {
  loadProduct(productId);
}

function loadProduct(id) {
  fetch(SHEET_URL)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.split("\n").map(r => r.split(","));
      const headers = rows[0];
      const data = rows.slice(1);

      const product = data.find(row => row[0] === id);

      if (!product) {
        document.getElementById("productName").innerText = "Product Not Found";
        return;
      }

      // Assuming CSV structure: ID | Name | Specs | Price
      const name = product[1] || "Unknown";
      const specs = product[2] || "N/A";
      const price = product[3] || "N/A";

      document.getElementById("productName").innerText = name;
      document.getElementById("productSpecs").innerText = specs;
      document.getElementById("productPrice").innerText = price;

      // Generate QR Code
      new QRious({
        element: document.getElementById("qrcode"),
        value: window.location.href,
        size: 200
      });

      // Delete button
      document.getElementById("deleteBtn").addEventListener("click", () => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
          fetch(`${DELETE_URL}?id=${id}`, { method: "POST" })
            .then(res => res.text())
            .then(msg => {
              alert(msg);
              window.location.href = "index.html";
            })
            .catch(err => alert("Error deleting product: " + err));
        }
      });
    })
    .catch(err => {
      console.error("Error loading product:", err);
      document.getElementById("productName").innerText = "Error Loading Product";
    });
}
