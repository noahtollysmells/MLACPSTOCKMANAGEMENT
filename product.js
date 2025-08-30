// URL to your published Google Sheets CSV
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";

// Your Google Apps Script Web App endpoint
const apiUrl = "https://script.google.com/macros/s/AKfycbyz1wB4d2S7eZYdROgZbEMbl_z10IuTPEN5KEdo7ufaPhUzCYSDNBhBQfqD5Z4kYLC-/exec";

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

if (!productId) {
  document.body.innerHTML = "<h2 style='text-align:center;color:red'>❌ No product ID provided.</h2>";
} else {
  fetch(sheetUrl)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.split("\n").map(r => r.split(","));
      const headers = rows[0]; // [id, name, specs, price]
      const products = rows.slice(1);

      // Find product by ID
      const product = products.find(p => p[0] === productId);

      if (product) {
        document.getElementById("productName").textContent = product[1]; // Name
        document.getElementById("productSpecs").textContent = product[2]; // Specs
        document.getElementById("productPrice").textContent = product[3]; // Price

        // Generate QR code that links directly to this product
        const qrContainer = document.getElementById("qrcode");
        qrContainer.innerHTML = "";
        QRCode.toCanvas(qrContainer, window.location.href, { width: 200 }, function (error) {
          if (error) console.error(error);
        });

        // Hook up delete button
        document.getElementById("deleteBtn").addEventListener("click", () => {
          if (confirm("Are you sure you want to delete this product?")) {
            fetch(apiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "delete", id: productId })
            })
              .then(res => res.text())
              .then(msg => {
                alert("✅ Product deleted!");
                window.location.href = "index.html"; // Redirect back to stock list
              })
              .catch(err => alert("Error deleting product: " + err));
          }
        });

      } else {
        document.body.innerHTML = "<h2 style='text-align:center;color:red'>❌ Product not found.</h2>";
      }
    })
    .catch(err => {
      console.error("Error loading sheet:", err);
      document.body.innerHTML = "<h2 style='text-align:center;color:red'>⚠ Error loading product details.</h2>";
    });
}
