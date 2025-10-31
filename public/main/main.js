/* main.js - versão corrigida e resiliente
   Substitua todo o conteúdo do main.js por este bloco.
*/

function showToast(message, type = "info", duration = 3000) {
  const container = document.getElementById("toast-container");
  if (!container) return console.warn("toast container não encontrado");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}


document.addEventListener("DOMContentLoaded", () => {
  // Referências seguras (pode faltar algo em páginas diferentes)
  const btnCriar = document.getElementById("btnCriarProdutos");
  const btnProdutos = document.getElementById("btnProdutos");
  const listSection = document.getElementById("list-produtos");
  const addSection = document.getElementById("adicionar-produtos");
  const viewSection = document.getElementById("view-product");
  const btnBack = document.getElementById("btnBack");
  const searchInput = document.getElementById("pesquisa");

  // Form refs
  const formProduto = document.getElementById("form-produto");
  const inputName = document.getElementById("name");
  const inputDescription = document.getElementById("description");
  const inputWeight = document.getElementById("weight");
  const inputPrice = document.getElementById("price");
  const inputCategory = document.getElementById("category");
  const inputSubcategory = document.getElementById("subcategory");
  const btnEnviar = document.getElementById("btnEnviar");

  // Load-by-id controls above the form
  const editIdInput = document.getElementById("editProductId");
  const btnLoadEdit = document.getElementById("btnLoadEdit");
  const btnClearId = document.getElementById("btnClearId");
  const formTitle = document.getElementById("form-title");

  // Estado
  let currentCategory = null;
  let currentSubcategory = null;
  let editingProductId = null;

  /* --------- helpers fetch JSON com tratamento --------- */
  async function fetchJSON(url, options = {}) {
    try {
      const res = await fetch(url, options);
      // tenta parse quando houver body
      let json = null;
      try { json = await res.json(); } catch (e) { /* vazio */ }
      return { ok: res.ok, status: res.status, json };
    } catch (err) {
      console.error("fetchJSON erro:", err);
      return { ok: false, status: 0, json: null };
    }
  }

  /* --------- UI simples de navegação --------- */
  function showAddForm() {
    if (listSection) listSection.classList.add("hidden");
    if (addSection) addSection.classList.remove("hidden");
    if (viewSection) viewSection.classList.add("hidden");
    if (btnBack) btnBack.classList.add("hidden");
  }
  function showList() {
    if (addSection) addSection.classList.add("hidden");
    if (listSection) listSection.classList.remove("hidden");
    if (viewSection) viewSection.classList.add("hidden");
  }

  if (btnCriar) {
    btnCriar.addEventListener("click", () => {
      exitEditMode();
      showAddForm();
    });
  }

  if (btnProdutos) {
    btnProdutos.addEventListener("click", () => {
      exitEditMode();
      showList();
      listCategories();
    });
  }

  if (btnBack) {
    btnBack.addEventListener("click", () => {
      if (currentSubcategory) {
        currentSubcategory = null;
        listSubcategories();
      } else if (currentCategory) {
        currentCategory = null;
        listCategories();
      } else {
        listCategories();
      }
    });
  }

  /* --------- construir cards (categorias/subs/produtos) --------- */
  function buildCard({ title = "", subtitle = "", image = null, isProduct = false, productObj = null }) {
    const el = document.createElement("div");
    el.className = "card";

    if (image) {
      const img = document.createElement("img");
      img.src = image;
      img.alt = title;
      el.appendChild(img);
    }

    const t = document.createElement("strong");
    t.className = "title";
    t.textContent = title;
    el.appendChild(t);

    if (subtitle) {
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = subtitle;
      el.appendChild(meta);
    }

    if (isProduct && productObj) {
      const row = document.createElement("div");
      row.className = "card-actions";

      const btnEditar = document.createElement("button");
      btnEditar.className = "btn-primary";
      btnEditar.textContent = "Editar";
      btnEditar.addEventListener("click", (ev) => {
        ev.stopPropagation();
        enterEditMode(productObj);
      });
      row.appendChild(btnEditar);

      const btnDetalhes = document.createElement("button");
      btnDetalhes.className = "btn-secondary";
      btnDetalhes.textContent = "Detalhes";
      btnDetalhes.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (productObj && productObj.id) window.location.href = `/produtos/view/${productObj.id}`;
      });
      row.appendChild(btnDetalhes);

      el.appendChild(row);
    }

    return el;
  }

  /* --------- listagens (categorias / subcategorias / produtos) --------- */
  async function listCategories() {
    if (!listSection) return;
    currentCategory = null;
    currentSubcategory = null;
    btnBack && btnBack.classList.add("hidden");
    listSection.innerHTML = "";
    if (searchInput) searchInput.placeholder = "Pesquisar categorias...";

    const { ok, json } = await fetchJSON("/api/categorias");
    if (!ok || !json) {
      listSection.innerHTML = "<p>Erro ao carregar categorias.</p>";
      return;
    }

    const keys = Object.keys(json || {});
    if (keys.length === 0) {
      listSection.innerHTML = "<p>Nenhuma categoria encontrada.</p>";
      return;
    }

    keys.forEach(cat => {
      const card = buildCard({ title: cat, subtitle: `${(json[cat] || []).length} subcategorias` });
      card.addEventListener("click", () => {
        currentCategory = cat;
        listSubcategories();
      });
      listSection.appendChild(card);
    });
  }

  async function listSubcategories() {
    if (!listSection || !currentCategory) return listCategories();
    listSection.innerHTML = "";
    btnBack && btnBack.classList.remove("hidden");
    if (searchInput) searchInput.placeholder = "Pesquisar subcategorias...";

    const { ok, json } = await fetchJSON("/api/categorias");
    if (!ok || !json) {
      listSection.innerHTML = "<p>Erro ao carregar subcategorias.</p>";
      return;
    }

    const subs = json[currentCategory] || [];
    if (subs.length === 0) {
      listSection.innerHTML = "<p>Sem subcategorias.</p>";
      return;
    }

    subs.forEach(sub => {
      const card = buildCard({ title: sub, subtitle: `Categoria: ${currentCategory}` });
      card.addEventListener("click", () => {
        currentSubcategory = sub;
        listProducts();
      });
      listSection.appendChild(card);
    });
  }

  async function listProducts(search = null) {
    if (!listSection || !currentCategory || !currentSubcategory) return listCategories();
    listSection.innerHTML = "";
    btnBack && btnBack.classList.remove("hidden");
    if (searchInput) searchInput.placeholder = "Pesquisar produtos...";

    const url = search ? `/api/produtos?search=${encodeURIComponent(search)}` : "/api/produtos";
    const { ok, json } = await fetchJSON(url);
    if (!ok || !Array.isArray(json)) {
      listSection.innerHTML = "<p>Erro ao carregar produtos.</p>";
      return;
    }

    const filtered = json.filter(p => p.category === currentCategory && p.subcategory === currentSubcategory);
    if (filtered.length === 0) {
      listSection.innerHTML = "<p>Nenhum produto nesta subcategoria.</p>";
      return;
    }

    filtered.forEach(prod => {
      const card = buildCard({
        title: prod.name,
        subtitle: prod.description || "",
        image: prod.image || "/Imagens/product-symbol.jpg",
        isProduct: true,
        productObj: prod
      });
      listSection.appendChild(card);
    });
  }

  /* --------- busca por Enter (no campo principal de pesquisa) --------- */
  if (searchInput) {
    searchInput.addEventListener("keydown", (ev) => {
      if (ev.key !== "Enter") return;
      ev.preventDefault();
      const term = (searchInput.value || "").trim().toLowerCase();
      if (!term) return;
      if (currentCategory && currentSubcategory) {
        listProducts(term);
        return;
      }
      if (currentCategory && !currentSubcategory) {
        fetch("/api/categorias").then(r => r.json()).then(data => {
          const subs = data[currentCategory] || [];
          const filtered = subs.filter(s => s.toLowerCase().includes(term));
          listSection.innerHTML = "";
          btnBack && btnBack.classList.remove("hidden");
          if (filtered.length === 0) {
            listSection.innerHTML = "<p>Nenhuma subcategoria correspondente.</p>";
            return;
          }
          filtered.forEach(sub => {
            const card = buildCard({ title: sub, subtitle: `Categoria: ${currentCategory}` });
            card.addEventListener("click", () => {
              currentSubcategory = sub;
              listProducts();
            });
            listSection.appendChild(card);
          });
        }).catch(() => showToast("Erro ao buscar subcategorias", "error"));
        return;
      }
      // pesquisa categorias
      fetch("/api/categorias").then(r => r.json()).then(data => {
        const keys = Object.keys(data || {});
        const filtered = keys.filter(k => k.toLowerCase().includes(term));
        listSection.innerHTML = "";
        btnBack && btnBack.classList.add("hidden");
        if (filtered.length === 0) {
          listSection.innerHTML = "<p>Nenhuma categoria correspondente.</p>";
          return;
        }
        filtered.forEach(cat => {
          const card = buildCard({ title: cat, subtitle: `${(data[cat] || []).length} subcategorias` });
          card.addEventListener("click", () => {
            currentCategory = cat;
            listSubcategories();
          });
          listSection.appendChild(card);
        });
      }).catch(() => showToast("Erro ao buscar categorias", "error"));
    });
  }

  /* --------- Validação de formulário (frontend) --------- */
  function validateProductForm(produto) {
    const errors = [];
    // limpa marcações
    document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));

    function mark(fieldId, message) {
      const el = document.getElementById(fieldId);
      if (el) el.classList.add("input-error");
      errors.push(message);
    }

    if (!produto.name) mark("name", "O nome é obrigatório!");
    if (!produto.category) mark("category", "Informe a categoria!");
    if (!produto.subcategory) mark("subcategory", "Informe a subcategoria!");
    if (produto.weight !== "" && isNaN(produto.weight)) mark("weight", "Peso inválido!");
    if (produto.price !== "" && (isNaN(produto.price) || Number(produto.price) < 0)) mark("price", "Preço inválido!");

    return errors;
  }

  /* --------- carregar produto por ID (utilitário) --------- */
  async function loadProductById(id) {
    if (!id) return null;
    const { ok, json } = await fetchJSON("/api/produtos");
    if (!ok || !Array.isArray(json)) return null;
    return json.find(p => String(p.id) === String(id)) || null;
  }

  /* --------- modo edição / saída do modo edição --------- */
  function enterEditMode(prod) {
    if (!prod) return;
    editingProductId = prod.id;
    // preenche o form
    if (inputName) inputName.value = prod.name || "";
    if (inputDescription) inputDescription.value = prod.description || "";
    if (inputWeight) inputWeight.value = prod.weight ?? "";
    if (inputPrice) inputPrice.value = prod.price ?? "";
    if (inputCategory) inputCategory.value = prod.category || "";
    if (inputSubcategory) inputSubcategory.value = prod.subcategory || "";

    // bloqueia category/subcategory para evitar o bug
    if (inputCategory) { inputCategory.readOnly = true; inputCategory.classList.add("locked"); }
    if (inputSubcategory) { inputSubcategory.readOnly = true; inputSubcategory.classList.add("locked"); }

    // mostra estado edição
    if (formTitle) {
      formTitle.textContent = `Editando Produto #${prod.id}`;
      formTitle.classList.add("editing");
    }
    if (btnEnviar) {
      if (btnEnviar.tagName.toLowerCase() === "input") btnEnviar.value = "Salvar alterações";
      else btnEnviar.textContent = "Salvar alterações";
    }

    // insere botão apagar (uma vez)
    ensureDeleteButton();
    showAddForm();
  }

  function exitEditMode() {
    editingProductId = null;
    // reset visual e campos
    formProduto && formProduto.reset();
    // desbloqueia category/subcategory
    if (inputCategory) { inputCategory.readOnly = false; inputCategory.classList.remove("locked"); }
    if (inputSubcategory) { inputSubcategory.readOnly = false; inputSubcategory.classList.remove("locked"); }

    if (formTitle) {
      formTitle.textContent = "Criar Produto";
      formTitle.classList.remove("editing");
    }
    if (btnEnviar) {
      if (btnEnviar.tagName.toLowerCase() === "input") btnEnviar.value = "Enviar Produto";
      else btnEnviar.textContent = "Enviar Produto";
    }
    const del = document.getElementById("btnApagar");
    if (del) del.remove();
    // limpa id input se existir
    if (editIdInput) editIdInput.value = "";
    // remove erros visuais
    document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
  }

  function ensureDeleteButton() {
    if (document.getElementById("btnApagar")) return;
    const actions = document.querySelector(".form-actions");
    if (!actions) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "btnApagar";
    btn.className = "btn-secondary";
    btn.textContent = "Apagar Produto";
    btn.style.marginLeft = "8px";
    btn.addEventListener("click", async () => {
      if (!editingProductId) { showToast("Nenhum produto selecionado", "error"); return; }
      if (!confirm("Tem certeza que deseja apagar este produto?")) return;
      const { ok } = await fetchJSON(`/api/produtos/${editingProductId}`, { method: "DELETE" });
      if (!ok) { showToast("Erro ao apagar produto", "error"); return; }
      showToast("Produto apagado", "success");
      exitEditMode();
      listCategories();
    });
    actions.appendChild(btn);
  }

  /* --------- evento carregar por ID (no topo do formulário) --------- */
  if (btnLoadEdit && editIdInput) {
    btnLoadEdit.addEventListener("click", async () => {
      editIdInput.classList.remove("input-error");
      const id = (editIdInput.value || "").trim();
      if (!id) {
        showToast("Informe um ID para carregar.", "error");
        editIdInput.classList.add("input-error");
        editIdInput.focus();
        return;
      }
      const produto = await loadProductById(id);
      if (!produto) {
        showToast("Produto não encontrado.", "error");
        editIdInput.classList.add("input-error");
        editIdInput.focus();
        return;
      }
      enterEditMode(produto);
    });
  }

  if (btnClearId && editIdInput) {
    btnClearId.addEventListener("click", () => exitEditMode());
  }

  /* --------- evento enviar (criar / editar) --------- */
  if (btnEnviar) {
    btnEnviar.addEventListener("click", async () => {
      // coleta segura dos valores (evitar colisoes com window.name)
      const produto = {
        name: (inputName?.value || "").trim(),
        description: (inputDescription?.value || "").trim(),
        weight: (inputWeight?.value ?? "").toString().trim(),
        price: (inputPrice?.value ?? "").toString().trim(),
        category: (inputCategory?.value || "").trim(),
        subcategory: (inputSubcategory?.value || "").trim()
      };

      const errors = validateProductForm(produto);
      if (errors.length > 0) {
        showToast(errors[0], "error");
        const first = document.querySelector(".input-error");
        if (first) first.focus();
        return;
      }

      // converte numéricos
      produto.weight = produto.weight !== "" ? Number(produto.weight) : null;
      produto.price = produto.price !== "" ? Number(produto.price) : null;

      // se estiver em edição: PUT
      if (editingProductId) {
        const { ok, json } = await fetchJSON(`/api/produtos/${editingProductId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(produto)
        });
        if (!ok) {
          showToast((json && json.message) || "Erro ao atualizar produto", "error");
          return;
        }
        showToast("Produto atualizado com sucesso", "success");
        exitEditMode();
        listCategories();
        return;
      }

      // criar produto (POST)
      const { ok, json } = await fetchJSON("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produto)
      });
      if (!ok) {
        showToast((json && json.message) || "Erro ao criar produto", "error");
        return;
      }
      showToast((json && json.message) || "Produto criado com sucesso", "success");
      formProduto && formProduto.reset();
    });
  }

const btnEstoque = document.getElementById("btnMostrar1");
if (btnEstoque) {
  btnEstoque.addEventListener("click", () => {
    exitEditMode();
    showEstoque();
  });
}

async function showEstoque(page = 1, limit = 20, currentSearch = "") {
  if (!listSection) return;
  listSection.className = "list-estoque";
  listSection.innerHTML = `
    <h2>Controle de Estoque</h2>

    <div class="estoque-filtros">
      <input id="estoqueSearch" placeholder="🔍 Buscar produto..." />
      <select id="filterCategory">
        <option value="">Todas as categorias</option>
      </select>
      <select id="filterSubcategory">
        <option value="">Todas as subcategorias</option>
      </select>
    </div>

    <div id="estoqueTableArea"><p>Carregando produtos...</p></div>
  `;

  const inputSearch = document.getElementById("estoqueSearch");
  const catSelect = document.getElementById("filterCategory");
  const subSelect = document.getElementById("filterSubcategory");
  const tableArea = document.getElementById("estoqueTableArea");

  async function fetchPage(p, s) {
    const url = `/api/estoque?page=${p}&limit=${limit}&search=${encodeURIComponent(s || "")}`;
    const res = await fetchJSON(url);
    return res;
  }

  async function render(p, s) {
    const { ok, json } = await fetchPage(p, s);
    if (!ok || !json) {
      tableArea.innerHTML = "<p>Erro ao carregar estoque.</p>";
      return;
    }

    const data = Array.isArray(json.items) ? json.items : json;

    // 🧩 Salva seleção atual antes de recriar
    const prevCat = catSelect.value;
    const prevSub = subSelect.value;

    // 🔽 Extrai categorias únicas
    const categorias = [...new Set(data.map(p => p.category).filter(Boolean))];

    // 🔽 Se há categoria selecionada, mostra apenas as subcategorias dela
    const subsFiltradas = data
      .filter(p => !prevCat || p.category === prevCat)
      .map(p => p.subcategory)
      .filter(Boolean);

    const subcategorias = [...new Set(subsFiltradas)];

    // 🔽 Renderiza categorias mantendo seleção
    catSelect.innerHTML = `<option value="">Todas as categorias</option>`;
    categorias.forEach(c => {
      catSelect.innerHTML += `<option value="${c}" ${c === prevCat ? "selected" : ""}>${c}</option>`;
    });

    // 🔽 Renderiza subcategorias dependentes da categoria
    subSelect.innerHTML = `<option value="">Todas as subcategorias</option>`;
    subcategorias.forEach(su => {
      subSelect.innerHTML += `<option value="${su}" ${su === prevSub ? "selected" : ""}>${su}</option>`;
    });

    // 🔍 Filtros ativos
    const term = (inputSearch.value || "").toLowerCase();
    const selectedCat = catSelect.value;
    const selectedSub = subSelect.value;

    const filtered = data.filter(p => {
      const nameOk = p.name.toLowerCase().includes(term);
      const catOk = !selectedCat || p.category === selectedCat;
      const subOk = !selectedSub || p.subcategory === selectedSub;
      return nameOk && catOk && subOk;
    });

    // 🧱 Criação da tabela
    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th><input id="selectAll" type="checkbox" /></th>
          <th>ID</th>
          <th>Nome</th>
          <th>Categoria</th>
          <th>Subcategoria</th>
          <th>Quantidade</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    filtered.forEach(prod => {
      const low = prod.quantity < (prod.min_quantity ?? 0);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input class="row-select" data-id="${prod.id}" type="checkbox" /></td>
        <td>${prod.id}</td>
        <td>${prod.name}</td>
        <td>${prod.category}</td>
        <td>${prod.subcategory}</td>
        <td id="qtd-${prod.id}" class="${low ? "low-stock" : ""}">
          ${prod.quantity ?? 0}
        </td>
        <td>
          <button class="btn-primary" data-id="${prod.id}" data-type="entrada">➕</button>
          <button class="btn-secondary" data-id="${prod.id}" data-type="saida">➖</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // 🔄 Paginação e ações em lote
    const pager = document.createElement("div");
    pager.style.marginTop = "12px";
    pager.innerHTML = `
      <button id="prevPage" ${page <= 1 ? "disabled" : ""}>Anterior</button>
      <span style="margin:0 8px">Página ${page}</span>
      <button id="nextPage" ${filtered.length < limit ? "disabled" : ""}>Próxima</button>
      <button id="bulkEntrada" style="margin-left:16px">Entrada em lote</button>
      <button id="bulkSaida">Saída em lote</button>
    `;

    tableArea.innerHTML = "";
    tableArea.appendChild(table);
    tableArea.appendChild(pager);

    // ✅ Selecionar todos
    document.getElementById("selectAll").addEventListener("change", (ev) => {
      const checked = ev.target.checked;
      table.querySelectorAll(".row-select").forEach(r => (r.checked = checked));
    });

    // 🎯 Ações individuais (+ e -)
    tbody.querySelectorAll("button[data-id]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const tipo = btn.dataset.type;
        const qtd = parseInt(prompt(`Quantidade para ${tipo} (produto ${id}):`));
        if (isNaN(qtd) || qtd <= 0) return showToast("Quantidade inválida", "error");

        const delta = tipo === "entrada" ? qtd : -qtd;
        const { ok, json: res } = await fetchJSON(`/api/produtos/${id}/stock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delta }),
        });

        if (!ok) return showToast(res?.message || "Erro", "error");

        const cel = document.getElementById(`qtd-${id}`);
        cel.textContent = res.product.quantity;
        cel.classList.toggle("low-stock", res.product.quantity < (res.product.min_quantity ?? 0));
        cel.style.animation = tipo === "entrada" ? "pulse-green 0.8s" : "pulse-red 0.8s";

        showToast("Movimentação efetuada", "success");
      });
    });

    // 📃 Paginação
    document.getElementById("prevPage").addEventListener("click", () =>
      showEstoque(Math.max(1, page - 1), limit, inputSearch.value)
    );
    document.getElementById("nextPage").addEventListener("click", () =>
      showEstoque(page + 1, limit, inputSearch.value)
    );

    // 📦 Entrada em lote
    document.getElementById("bulkEntrada").addEventListener("click", async () => {
      const ids = Array.from(table.querySelectorAll(".row-select:checked")).map(i => i.dataset.id);
      if (!ids.length) return showToast("Selecione produtos para entrada", "error");
      const qtd = parseInt(prompt("Quantidade para entrada em todos selecionados:"));
      if (isNaN(qtd) || qtd <= 0) return showToast("Quantidade inválida", "error");
      const { ok } = await fetchJSON("/api/estoque/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, delta: qtd, type: "entrada" }),
      });
      if (!ok) return showToast("Erro no bulk", "error");
      showToast("Entrada em lote registrada", "success");
      render(page, inputSearch.value);
    });

    // 📦 Saída em lote
    document.getElementById("bulkSaida").addEventListener("click", async () => {
      const ids = Array.from(table.querySelectorAll(".row-select:checked")).map(i => i.dataset.id);
      if (!ids.length) return showToast("Selecione produtos para saída", "error");
      const qtd = parseInt(prompt("Quantidade para saída em todos selecionados:"));
      if (isNaN(qtd) || qtd <= 0) return showToast("Quantidade inválida", "error");
      const { ok } = await fetchJSON("/api/estoque/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, delta: -Math.abs(qtd), type: "saida" }),
      });
      if (!ok) return showToast("Erro no bulk", "error");
      showToast("Saída em lote registrada", "success");
      render(page, inputSearch.value);
    });
  }

  await render(page, currentSearch);

  // 🔄 Busca e filtros
  const applyFilters = debounce(() => render(1, inputSearch.value.trim()), 300);
  inputSearch.addEventListener("input", applyFilters);
  catSelect.addEventListener("change", applyFilters);
  subSelect.addEventListener("change", applyFilters);
}



  // inicializa lista de categorias
  listCategories();
}); // fim DOMContentLoaded
