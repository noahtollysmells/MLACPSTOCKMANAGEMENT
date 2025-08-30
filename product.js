const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";
const apiURL = "https://script.google.com/macros/s/AKfycbyz1wB4d2S7eZYdROgZbEMbl_z10IuTPEN5KEdo7ufaPhUzCYSDNBhBQfqD5Z4kYLC-/exec";

async function loadProduct() {
  const response = await fetch(sheetURL);
  const data = await response.text();
  const rows = data.split("\n").map(r => r.split(","));

  const product = rows.find(r => r[0] === productId);

  if (product) {
    document.getElementById("productName").textContent = product[1];
    document.getElementById("productSpecs").textContent = product[2];
    document.getElementById("productPrice").textContent = product[3];

    // Generate QR Code for this product
    QRCode.toCanvas(
      document.getElementById("qrcode"),
      window.location.href,
      { width: 200 },
      function (error) {
        if (error) console.error(error);
      }
    );
  } else {
    document.getElementById("productName").textContent = "Product not found";
  }
}

// Handle Delete
document.getElementById("deleteBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to delete this product?")) {
    fetch(apiURL, {
      method: "POST",
      body: JSON.stringify({
        action: "delete",
        id: productId
      }),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.text())
      .then(msg => {
        alert(msg);
        window.location.href = "index.html";
      })
      .catch(err => console.error(err));
  }
});

loadProduct();
