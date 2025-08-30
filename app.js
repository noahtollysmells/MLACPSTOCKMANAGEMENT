const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";

async function fetchProducts() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const rows = text.split("\n").map(r => r.split(","));
  const headers = rows.shift();
  return rows.map(r => {
    let obj = {};
    headers.forEach((h, i) => obj[h.trim()] = r[i]?.trim());
    return obj;
  });
}

async function renderList() {
  const list = document.getElementById("productList");
  list.innerHTML = "";

  const products = await fetchProducts();
  products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p><strong>£${p.price}</strong></p>
      <a class="btn" href="product.html?id=${p.id}">View</a>
    `;
    list.appendChild(card);
  });
}

window.addEventListener("load", renderList);
