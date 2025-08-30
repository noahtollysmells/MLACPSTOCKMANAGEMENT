// ====== CONFIG ======
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";
const DELETE_URL = "https://script.google.com/macros/s/AKfycbxa5fJBCcLuDdZpu1YZ1212zANMLmVYTp4z69R1pZ9D4stGkjcskDGBj4HZ0se7kdzg/exec";

// ====== HELPERS ======
function parseCSV(text) {
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

function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function nl2br(s = "") {
  return escapeHTML(s).replace(/\n/g, "<br>");
}

function escapeHTML(s = "") {
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}

// ====== MAIN ======
(async function initProduct() {
  const container = document.getElementById("product-details");
  const id = getQueryParam("id");

  if (!id) {
    container.innerHTML = `<p class="error">No product ID provided.</p>`;
    return;
  }

  try {
    const res = await fetch(SHEET_CSV_URL, { cache: "no-cache" });
    const text = await res.text();
    const { data } = parseCSV(text);
    const product = data.find(p => (p.id || "").trim() === id.trim());

    if (!product) {
      container.innerHTML = `<p class="error">Product with ID <strong>${escapeHTML(id)}</strong> not found.</p>`;
      return;
    }

    const detailsURL = `${location.origin}${location.pathname.replace(/product\.html.*$/, "product.html")}?id=${encodeURIComponent(product.id)}`;

    container.innerHTML = `
      <div class="product-detail-head">
        <h2>${escapeHTML(product.name)}</h2>
        <div class="pill">ID: ${escapeHTML(product.id)}</div>
      </div>

      <div class="detail-grid">
        <div class="detail-item">
          <div class="label">Specifications</div>
          <div class="value">${nl2br(product.specs || "—")}</div>
        </div>
        <div class="detail-item">
          <div class="label">Price</div>
          <div class="value price">£${escapeHTML(product.price || "0")}</div>
        </div>
      </div>

      <div class="qr-wrap">
        <img class="qr"
             alt="QR Code"
             src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(detailsURL)}" />
        <div class="muted">Scan to open this product</div>
      </div>

      <div class="actions">
        <a href="index.html" class="btn">← Back to List</a>
        <button id="deleteBtn" class="btn danger">🗑 Delete</button>
      </div>
    `;

    // Delete
    document.getElementById("deleteBtn").addEventListener("click", async () => {
      if (!confirm("Delete this product? This cannot be undone.")) return;
      try {
        // Apps Script often accepts POST with query param id
        const resp = await fetch(`${DELETE_URL}?id=${encodeURIComponent(product.id)}`, { method: "POST" });
        const msg = await resp.text();
        alert(msg || "Deleted.");
        window.location.href = "index.html";
      } catch (e) {
        console.error(e);
        alert("Failed to delete product.");
      }
    });
  } catch (e) {
    console.error(e);
    container.innerHTML = `<p class="error">Failed to load product.</p>`;
  }
})();
