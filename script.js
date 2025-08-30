// Google Sheet CSV link
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";

let allProducts = [];

// Fetch and render products
async function fetchProducts() {
  try {
    const response = await fetch(sheetUrl);
    const csvText = await response.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    allProducts = parsed.data; // store full list
    renderProducts(allProducts);
  } catch (err) {
    console.error("Error loading product list:", err);
    document.getElementById("productList").innerHTML =
      `<p class="text-danger">⚠ Failed to load stock list</p>`;
  }
}

// Render product cards
function renderProducts(products) {
  const container = document.getElementById("productList");
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = `<p class="text-muted">No matching products found.</p>`;
    return;
  }

  products.forEach(product => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    col.innerHTML = `
      <div class="card bg-secondary text-light p-3 h-100 shadow-sm">
        <h5 class="card-title">${product.name}</h5>
        <p class="mb-1"><strong>Specs:</strong> ${product.specs || "N/A"}</p>
        <p class="mb-2"><strong>Price:</strong> £${product.price || "N/A"}</p>
        <a href="product.html?id=${product.id}" class="btn btn-outline-light">View</a>
      </div>
    `;

    container.appendChild(col);
  });
}

// Search function
document.getElementById("searchBar").addEventListener("input", function (e) {
  const searchText = e.target.value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.name && p.name.toLowerCase().includes(searchText)
  );
  renderProducts(filtered);
});

// Start
fetchProducts();
