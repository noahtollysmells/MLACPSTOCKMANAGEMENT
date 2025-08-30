// ==========================
// Firebase Config
// ==========================
const firebaseConfig = {
  apiKey: "AIzaSyDlZMxDROLU7zZ0q1CVGEo1G0oEVgPoaxI",
  authDomain: "mlacpstock.firebaseapp.com",
  projectId: "mlacpstock",
  storageBucket: "mlacpstock.firebasestorage.app",
  messagingSenderId: "61596447406",
  appId: "1:61596447406:web:cc73799a3a650adcf5333f",
  measurementId: "G-P7KFVSBDXC"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Your GitHub Pages base URL
const BASE_URL = "https://noahtollysmells.github.io/MLACPSTOCKMANAGEMENT";

// ==========================
// RENDER LIST
// ==========================
async function renderList() {
  const list = document.getElementById("productList");
  list.innerHTML = "";

  const snapshot = await db.collection("products").get();
  snapshot.forEach((doc) => {
    const p = doc.data();
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p><strong>Price:</strong> £${p.price}</p>
      <button onclick="showDetail('${doc.id}')">View</button>
      <button onclick="deleteProduct('${doc.id}')">Delete</button>
    `;
    list.appendChild(card);
  });
}

// ==========================
// ADD PRODUCT
// ==========================
async function addProduct() {
  const name = prompt("Product name?");
  if (!name) return;

  const specs = prompt("Specs?");
  const price = prompt("Price?");

  await db.collection("products").add({
    name,
    specs,
    price
  });

  renderList();
}

// ==========================
// DELETE PRODUCT
// ==========================
async function deleteProduct(id) {
  await db.collection("products").doc(id).delete();
  renderList();
}

// ==========================
// SHOW PRODUCT DETAIL
// ==========================
async function showDetail(id) {
  const doc = await db.collection("products").doc(id).get();
  if (!doc.exists) return;

  const product = doc.data();
  const detail = document.getElementById("productDetail");

  detail.innerHTML = `
    <h2>${product.name}</h2>
    <p><strong>Specs:</strong> ${product.specs}</p>
    <p><strong>Price:</strong> £${product.price}</p>
    <div id="qrcode"></div>
    <button onclick="downloadQR('${id}')">Download QR</button>
    <button onclick="window.print()">Print Label</button>
    <button onclick="backToList()">Back to List</button>
  `;

  // Generate QR code pointing to GitHub Pages product link
  const url = `${BASE_URL}#/product/${id}`;
  new QRCode(document.getElementById("qrcode"), {
    text: url,
    width: 200,
    height: 200,
  });

  window.location.hash = "/product/" + id;
}

// ==========================
// DOWNLOAD QR
// ==========================
function downloadQR(id) {
  const canvas = document.querySelector("#qrcode canvas");
  if (!canvas) return;

  const link = document.createElement("a");
  link.download = `product_${id}_qr.png`;
  link.href = canvas.toDataURL();
  link.click();
}

// ==========================
// BACK TO LIST
// ==========================
function backToList() {
  window.location.hash = "";
  document.getElementById("productDetail").innerHTML = "";
  renderList();
}

// ==========================
// ROUTER
// ==========================
window.addEventListener("load", async () => {
  renderList();

  // If URL has a product hash, open detail
  const hash = window.location.hash;
  if (hash.startsWith("#/product/")) {
    const id = hash.split("/")[2];
    showDetail(id);
  }
});
