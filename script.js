// Google Sheet CSV link
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";

let allProducts = []; // store all products globally

// Fetch and render products
async function fetchProducts() {
  try {
    const response = await fetch(sheetUrl);
    const csvText = await response.text();

    // Parse CSV
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    allProducts = parsed.data; // save full list
    renderProducts(allProducts);
  } catch (err) {
    console.error("Error loading product list:", err);
    document.getElementById("productList").innerHTML =
      `<p class="text-danger">⚠ Failed to load stock list</p>`;
  }
}

// Render cards for each product
function renderProducts(products) {
  const container = document.getElementById("productList");
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = `<p class="text-warning">No products found.</p>`;
    return;
  }

  products.forEach(product => {
    const col = document.createElement("div");
    col.className = "col-md-4 col-sm-6"; // responsive on mobile

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

// Filter products by search
document.addEventListener("input", (e) => {
  if (e.target.id === "searchInput") {
    const searchText = e.target.value.toLowerCase();
    const filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(searchText)
    );
    renderProducts(filtered);
  }
});

// Start
fetchProducts();
