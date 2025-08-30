/************************************
 * Product Details (GitHub Pages)
 * - Reads ID from ?id= or #/product/<id>
 * - Fetches from your Apps Script
 * - Handles array-of-objects OR array-of-arrays
 * - Renders clean UI + QR + Delete
 ************************************/

const API_URL = "https://script.google.com/macros/s/AKfycbyz1wB4d2S7eZYdROgZbEMbl_z10IuTPEN5KEdo7ufaPhUzCYSDNBhBQfqD5Z4kYLC-/exec";

/* ---------- Utilities ---------- */
function getProductId() {
  // 1) querystring ?id=123
  const qs = new URLSearchParams(location.search);
  const fromQuery = qs.get("id");
  if (fromQuery) return String(fromQuery).trim();

  // 2) hash style #/product/123 (legacy support)
  const hash = location.hash || "";
  const m = hash.match(/\/product\/([^/]+)/i);
  if (m && m[1]) return String(m[1]).trim();

  return null;
}

function formatPrice(v) {
  if (v === undefined || v === null) return "N/A";
  const s = String(v).trim();
  if (s === "") return "N/A";
  // If it already starts with a currency symbol, use as-is
  if (/^[£$€]/.test(s)) return s;
  // If it's numeric, prefix £
  const numeric = s.replace(/[^\d.]/g, "");
  return numeric ? `£${numeric}` : s;
}

// Normalize any data shape into [{id,name,specs,price}, ...]
function normalizeProducts(data) {
  if (!Array.isArray(data)) return [];

  // Case A: already array of objects
  if (data.length && typeof data[0] === "object" && !Array.isArray(data[0])) {
    return data.map(p => ({
      id: String(p.id ?? "").trim(),
      name: String(p.name ?? ""),
      specs: String(p.specs ?? ""),
      price: String(p.price ?? "")
    }));
  }

  // Case B: array of arrays (maybe with headers)
  if (Array.isArray(data[0])) {
    let headers = [];
    let rows = [];

    // If first row looks like headers (strings that include 'id'/'name' etc.)
    const first = data[0].map(v => (v ?? "").toString().toLowerCase());
    const looksLikeHeaders = first.includes("id") && first.includes("name");

    if (looksLikeHeaders) {
      headers = data[0].map(h => String(h).trim().toLowerCase());
      rows = data.slice(1);
    } else {
      headers = ["id", "name", "specs", "price"]; // fixed order
      rows = data;
    }

    return rows
      .filter(r => Array.isArray(r) && r.length)
      .map(r => {
        const obj = {};
        headers.forEach((h, i) => (obj[h] = r[i]));
        return {
          id: String(obj.id ?? "").trim(),
          name: String(obj.name ?? ""),
          specs: String(obj.specs ?? ""),
          price: String(obj.price ?? "")
        };
      });
  }

  return [];
}

/* ---------- Data ---------- */
async function fetchProducts() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const data = await res.json();
  return normalizeProducts(data);
}

/* ---------- Render ---------- */
function render(product) {
  const root = document.getElementById("product-details");
  if (!root) return;

  if (!product) {
    root.innerHTML = `<div class="error">⚠️ Product not found.</div>`;
    return;
  }

  root.innerHTML = `
    <h1 class="h1">${escapeHtml(product.name || "Unnamed product")}</h1>

    <div class="kv">
      <div class="k">Specs</div>
      <div class="v">${escapeHtml(product.specs || "N/A")}</div>

      <div class="k">Price</div>
      <div class="v">${escapeHtml(formatPrice(product.price))}</div>
    </div>

    <div class="actions">
      <a href="index.html" class="btn btn-ghost">⬅ Back to Stock List</a>
      <button id="deleteBtn" class="btn btn-danger">🗑 Delete Product</button>
      <button id="downloadQR" class="btn btn-primary">Download QR</button>
    </div>

    <div class="qr-wrap">
      <div class="qr-title">Scan to open this product</div>
      <div id="qrcode"></div>
    </div>
  `;

  // QR code
  try {
    const url = location.href;
    const canvas = document.createElement("canvas");
    document.getElementById("qrcode").appendChild(canvas);
    QRCode.toCanvas(canvas, url, { width: 140 });
    document.getElementById("downloadQR").onclick = () => {
      const link = document.createElement("a");
      link.download = `product-${product.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  } catch (e) {
    console.warn("QR generation failed:", e);
  }

  // Delete
  document.getElementById("deleteBtn").onclick = async () => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: product.id })
      });
      const txt = await resp.text();
      alert(txt || "Deleted.");
      location.href = "index.html";
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };
}

/* ---------- Helpers ---------- */
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------- Boot ---------- */
(async () => {
  const root = document.getElementById("product-details");
  const id = getProductId();

  if (!id) {
    root.innerHTML = `<div class="error">⚠️ No product ID provided.</div>`;
    return;
  }

  try {
    root.innerHTML = `<div class="loading">Loading product…</div>`;
    const products = await fetchProducts();
    const product = products.find(p => String(p.id) === String(id));
    render(product);
  } catch (err) {
    console.error(err);
    root.innerHTML = `<div class="error">⚠️ Error loading product.</div>`;
  }
})();
