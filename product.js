const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";
const apiUrl = "https://script.google.com/macros/s/AKfycbyz1wB4d2S7eZYdROgZbEMbl_z10IuTPEN5KEdo7ufaPhUzCYSDNBhBQfqD5Z4kYLC-/exec";

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

if (!productId) {
  document.body.innerHTML = "<h2 style='text-align:center;color:red'>❌ No product ID provided.</h2>";
} else {
  fetch(sheetUrl)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.split("\n").map(r => r.split(","));
      const headers = rows[0]; 
      const products = rows.slice(1);

      const product = products.find(p => p[0] === productId);

      if (product) {
        const id = product[0];
        const name = product[1] || "Unnamed";
        const specs = product[2] || "N/A";
        const price = product[3] || "N/A";

        document.getElementById("productName").textContent = name;
        document.getElementById("productSpecs").textContent = specs;
        document.getElementById("productPrice").textContent = `£${price}`;

        // QR Code
        const qrContainer = document.getElementById("qrcode");
        qrContainer.innerHTML = "";
        QRCode.toCanvas(qrContainer, window.location.href, { width: 200 }, function (error) {
          if (error) console.error(error);
        });

        // Delete button
        document.getElementById("deleteBtn").addEventListener("click", () => {
          if (confirm("Are you sure you want to delete this product?")) {
            fetch(apiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "delete", id: productId })
            })
              .then(res => res.text())
              .then(() => {
                alert("✅ Product deleted!");
                window.location.href = "index.html";
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
