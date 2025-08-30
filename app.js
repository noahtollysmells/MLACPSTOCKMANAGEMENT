// ==========================
// FIREBASE INIT
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

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ==========================
// FETCH PRODUCTS
// ==========================
async function fetchProducts() {
  const snapshot = await db.collection("products").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ==========================
// RENDER LIST
// ==========================
async function renderList() {
  const list = document.getElementById("productList");
  const detail = document.getElementById("productDetail");
  list.innerHTML = "";
  detail.classList.add("hidden");

  const products = await fetchProducts();

  products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p><strong>£${p.price}</strong></p>
      <button onclick="showDetail('${p.id}')">View</button>
    `;
    list.appendChild(card);
  });
}

// ==========================
// SHOW PRODUCT DETAIL
// ==========================
async function showDetail(id) {
  const products = await fetchProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;

  const detail = document.getElementById("productDetail");
  detail.classList.remove("hidden");

  detail.innerHTML = `
    <h2>${product.name}</h2>
    <p><strong>Specs:</strong> ${product.specs}</p>
    <p><strong>Price:</strong> £${product.price}</p>
    <div id="qrcode"></div>
    <button onclick="downloadQR('${id}')">Download QR</button>
    <button onclick="window.print()">Print Label</button>
    <button onclick="deleteProduct('${id}')">Delete</button>
    <button onclick="backToList()">Back</button>
  `;

  const url = `${window.location.origin}${window.location.pathname}#/product/${id}`;
  new QRCode(document.getElementById("qrcode"), {
    text: url,
    width: 200,
    height: 200,
  });

  window.location.hash = "/product/" + id;
}

// ==========================
// ADD PRODUCT
// ==========================
async function addProduct() {
  const name = prompt("Enter product name:");
  const specs = prompt("Enter product specs:");
  const price = prompt("Enter product price:");

  if (!name || !specs || !price) return;

  await db.collection("products").add({ name, specs, price });
  renderList();
}

// ==========================
// DELETE PRODUCT
// ==========================
async function deleteProduct(id) {
  if (confirm("Delete this product?")) {
    await db.collection("products").doc(id).delete();
    backToList();
    renderList();
  }
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
  document.getElementById("productDetail").classList.add("hidden");
}

// ==========================
// ROUTER
// ==========================
window.addEventListener("load", async () => {
  renderList();

  document.getElementById("addBtn").addEventListener("click", addProduct);

  // If URL has a product hash, open detail
  const hash = window.location.hash;
  if (hash.startsWith("#/product/")) {
    const id = hash.split("/")[2];
    showDetail(id);
  }
});
