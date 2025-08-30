const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";
const deleteUrl = "https://script.google.com/macros/s/AKfycbxa5fJBCcLuDdZpu1YZ1212zANMLmVYTp4z69R1pZ9D4stGkjcskDGBj4HZ0se7kdzg/exec";

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

async function loadProduct() {
  try {
    const response = await fetch(sheetUrl);
    const csvText = await response.text();

    // Parse CSV
    const rows = csvText.trim().split("\n").map(r => r.split(","));
    const headers = rows[0].map(h => h.trim().toLowerCase());
    const products = rows.slice(1).map(row => {
      let obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });

    // Find product
    const product = products.find(p => p.id === productId);

    if (!product) {
      document.querySelector(".card").innerHTML = "<p>Product not found.</p>";
      return;
    }

    // Populate details
    document.getElementById("product-id").textContent = product.id;
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-specs").textContent = product.specs;
    document.getElementById("product-price").textContent = product.price;

    // Generate QR code
    new QRCode(document.getElementById("qrcode"), {
      text: window.location.href,
      width: 128,
      height: 128
    });

    // Attach delete button handler
    document.getElementById("delete-btn").addEventListener("click", async () => {
      if (!confirm("Are you sure you want to delete this product?")) return;

      try {
        const res = await fetch(`${deleteUrl}?id=${product.id}`, { method: "POST" });
        const text = await res.text();
        alert(text);
        window.location.href = "index.html"; // go back after delete
      } catch (err) {
        alert("Error deleting product.");
        console.error(err);
      }
    });

  } catch (err) {
    console.error("Error loading product:", err);
    document.querySelector(".card").innerHTML = "<p>Error loading product.</p>";
  }
}

loadProduct();
