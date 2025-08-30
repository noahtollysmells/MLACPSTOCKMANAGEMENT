const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRy4oNHqb6IGGRq87BVHs5GD69suWg9nX89R8W6rfMV8IfgZrZ8PImes-MX2_JkgYtcGJmH45M8V-M/pub?output=csv";

// Extract ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Fetch product data
async function fetchProduct() {
  try {
    const response = await fetch(sheetUrl);
    const csvText = await response.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    const products = parsed.data;
    const product = products.find(p => p.id === productId);

    if (product) {
      renderProduct(product);
    } else {
      document.getElementById("productDetails").
