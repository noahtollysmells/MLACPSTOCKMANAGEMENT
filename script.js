const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";

const productList = document.getElementById("productList");
const searchInput = document.getElementById("searchInput");
const noResults = document.getElementById("noResults");
let products = [];

async function fetchProducts() {
  const response = await fetch(CSV_URL);
  const text = await response.text();
  const rows = text.split("\n").map(r => r.split(","));
  const headers = rows[0].map(h => h.trim().toLowerCase());

  products = rows.slice(1).map(row => {
    return {
      id: row[0]?.trim(),
      name: row[1]?.trim(),
      specs: row[2]?.trim(),
      price: row[3]?.trim()
    };
  }).filter(p => p.id && p.name);

  displayProducts(products);
}

function displayProducts(items) {
  productList.innerHTML = "";
  if (!items.length) {
    noResults.classList.remove("hidden");
    return;
  }
  noResults.classList.add("hidden");

  items.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p class="price">£${p.price || "0"}</p>
      <button onclick="viewProduct('${p.id}')">View</button>
    `;
    productList.appendChild(card);
  });
}

function viewProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
  );
  displayProducts(filtered);
});

fetchProducts();
