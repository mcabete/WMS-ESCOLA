document.getElementById("btnBack").addEventListener("click", goBack);

let currentCategory = null;
let currentSubcategory = null;

async function listCategories() {
  const res = await fetch("/api/categorias");
  const data = await res.json();

  const tbody = document.querySelector("#produtos tbody");
  tbody.innerHTML = "";

  Object.keys(data).forEach(category => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${category}</td>`;
    tr.addEventListener("click", () => {
      currentCategory = category;
      listSubcategories();
    });
    tbody.appendChild(tr);
  });

  document.querySelector("thead tr").innerHTML = "<th>Category</th>";
}

async function listSubcategories() {
  const res = await fetch("/api/categorias");
  const data = await res.json();
  const subs = data[currentCategory] || [];

  const tbody = document.querySelector("#produtos tbody");
  tbody.innerHTML = "";

  subs.forEach(sub => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${sub}</td>`;
    tr.addEventListener("click", () => {
      currentSubcategory = sub;
      listProducts();
    });
    tbody.appendChild(tr);
  });

  document.querySelector("thead tr").innerHTML = `<th>Subcategories of ${currentCategory}</th>`;
}

async function listProducts() {
  const res = await fetch("/api/produtos");
  const data = await res.json();

  const filtered = data.filter(
    p => p.category === currentCategory && p.subcategory === currentSubcategory
  );

  const tbody = document.querySelector("#produtos tbody");
  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td>No products found.</td></tr>`;
    return;
  }

  filtered.forEach(prod => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${prod.name}</td>
      <td>${prod.price ? `R$ ${prod.price}` : "-"}</td>
      <td>${prod.description || ""}</td>
    `;


    tr.addEventListener("click", () => {

      alert(JSON.stringify(prod, null, 2)); // o "2" adiciona indentação para ficar legível
      
      // navegar para uma página de detalhe
      window.location.href = `/produtos/view/${prod.id}`;
    });

    tbody.appendChild(tr);
  });

  document.querySelector("thead tr").innerHTML = `<th colspan="3">${currentSubcategory} Products</th>`;
}

function goBack() {
  if (currentSubcategory) {
    // go from products -> subcategories
    currentSubcategory = null;
    listSubcategories();
  } else if (currentCategory) {
    // go from subcategories -> categories
    currentCategory = null;
    listCategories();
  } else {
    // already at top level, maybe go home
    window.location.href = "/";
  }
}

// Initial load
listCategories();
