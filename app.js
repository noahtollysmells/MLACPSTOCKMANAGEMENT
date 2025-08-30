const BASE_URL = "https://noahtollysmells.github.io/MLACPSTOCKMANAGEMENT";

// ==========================
// PRODUCT STORAGE
// ==========================
function loadProducts() {
  return JSON.parse(localStorage.getItem("products") || "[]");
}
function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

// ==========================
// RENDER LIST
// ==========================
function renderList() {
  const products = loadProducts();
  const list = document.getElementById("productList");
  list.innerHTML = "";

  products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p><strong>£${p.price}</strong></p>
      <button onclick="showDetail('${p.id}')">View</button>
      <button onclick="deleteProduct('${p.id}')">Delete</button>
    `;
    list.appendChild(card);
  });
}

// ==========================
// ADD PRODUCT
// ==========================
function openModal() {
  document.getElementById("modal").classList.remove("hidden");
}
function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}
function addProduct() {
  const name = document.getElementById("prodName").value;
  const specs = document.getElementById("prodSpecs").value;
  const price = document.getElementById("prodPrice").value;
  if (!name || !price) return alert("Name and Price required");

  const id = Date.now().toString();
  const products = loadProducts();
  products.push({ id, name, specs, price });
  saveProducts(products);

  closeModal();
  renderList();

  // reset form
  document.getElementById("prodName").value = "";
  document.getElementById("prodSpecs").value = "";
  document.getElementById("prodPrice").value = "";
}

// ==========================
// DELETE PRODUCT
// ==========================
function deleteProduct(id) {
  let products = loadProducts();
  products = products.filter((p) => p.id !== id);
  saveProducts(products);
  renderList();
}

// ==========================
// SHOW PRODUCT DETAIL
// ==========================
function showDetail(id) {
  const products = loadProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return;

  const detail = document.getElementById("productDetail");
  detail.innerHTML = `
    <h2>${product.name}</h2>
    <p><strong>Specs:</strong> ${product.specs || "N/A"}</p>
    <p><strong>Price:</strong> £${product.price}</p>
    <div id="qrcode"></div>
    <div style="margin-top:1rem;">
      <button onclick="downloadQR('${id}')">⬇️ Download QR</button>
      <button onclick="window.print()">🖨️ Print Label</button>
      <button onclick="backToList()">⬅️ Back</button>
    </div>
  `;

  // Generate QR
  const url = `${BASE_URL}#/product/${id}`;
  new QRCode(document.getElementById("qrcode"), {
    text: url,
    width: 150,
    height: 150,
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
// ROUTER INIT
// ==========================
window.addEventListener("load", () => {
  renderList();

  document.getElementById("addBtn").addEventListener("click", openModal);
  document.getElementById("cancelBtn").addEventListener("click", closeModal);
  document.getElementById("saveBtn").addEventListener("click", addProduct);

  const hash = window.location.hash;
  if (hash.startsWith("#/product/")) {
    const id = hash.split("/")[2];
    showDetail(id);
  }
});
