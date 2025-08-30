// ====== CONFIG ======
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";

// If you already have an ADD Apps Script deployment URL, put it here:
const ADD_URL = ""; // e.g. "https://script.google.com/macros/s/AKfycbyz.../exec"

// ====== CSV HELPERS ======
function parseCSV(text) {
  // Simple CSV parse (no quoted commas in your data). Trim each cell.
  const lines = text.replace(/\r/g, "").split("\n").filter(l => l.trim().length);
  const rows = lines.map(l => l.split(",").map(c => c.trim()));
  const headers = rows[0].map(h => h.toLowerCase());
  const data = rows.slice(1).map(r => {
    const o = {};
    headers.forEach((h, i) => (o[h] = r[i] || ""));
    return o;
  });
  return { headers, data };
}

async function fetchProducts() {
  const res = await fetch(CSV_URL, { cache: "no-cache" });
  const text = await res.text();
  const { data } = parseCSV(text);
  // Remove empty rows and ensure id exists
  return data.filter(p => p.id && p.name);
}

// ====== LIST PAGE ======
async function initList() {
  const grid = document.getElementById("productsGrid");
  const info = document.getElementById("listInfo");
  const empty = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");
  if (!grid) return; // not on index.html

  let all = [];
  try {
    all = await fetchProducts();
  } catch (e) {
    console.error(e);
    grid.innerHTML = `<p class="error">Failed to load stock list.</p>`;
    return;
  }

  info.textContent = `${all.length} item${all.length === 1 ? "" : "s"}`;
  renderList(all);

  function renderList(items) {
    grid.innerHTML = items
      .map(
        (p) => `
      <div class="product-card">
        <h2>${escapeHTML(p.name)}</h2>
        <p class="muted">ID: ${escapeHTML(p.id)}</p>
        <p>${formatFirstSpecLine(p.specs)}</p>
        <p><strong>£${escapeHTML(p.price || "0")}</strong></p>
        <a href="product.html?id=${encodeURIComponent(p.id)}" class="btn">View</a>
      </div>`
      )
      .join("");

    empty.classList.toggle("hidden", items.length > 0);
  }

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase().trim();
    const filtered = all.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q))
    );
    info.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"} found`;
    renderList(filtered);
  });
}

function escapeHTML(s = "") {
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}
function formatFirstSpecLine(specs = "") {
  const first = specs.split("\n")[0] || "—";
  return escapeHTML(first);
}

// ====== ADD PAGE ======
function initAdd() {
  const form = document.getElementById("addForm");
  if (!form) return; // not on add.html

  const statusEl = document.getElementById("addStatus");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("id").value.trim();
    const name = document.getElementById("name").value.trim();
    const specs = document.getElementById("specs").value.replace(/\r/g, "").trim();
    const price = document.getElementById("price").value.trim();

    if (!ADD_URL) {
      statusEl.textContent = "Add endpoint is not configured yet. Please set ADD_URL in script.js.";
      statusEl.className = "muted error";
      return;
    }

    const payload = { id, name, specs, price };

    try {
      const res = await fetch(ADD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      statusEl.className = "muted";
      statusEl.textContent = text.includes("Success") ? "✅ Product added." : `ℹ️ ${text}`;
      // Optionally redirect:
      // window.location.href = `product.html?id=${encodeURIComponent(id)}`;
    } catch (err) {
      console.error(err);
      statusEl.className = "muted error";
      statusEl.textContent = "❌ Failed to add product.";
    }
  });
}

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  initList();
  initAdd();
});
