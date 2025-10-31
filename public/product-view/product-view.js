// Função para pegar ID da URL
function getProductIdFromUrl() {
  const path = window.location.pathname; // "/produtos/view/0001"
  const parts = path.split("/");
  return parts[parts.length - 1]; // "0001"
}

// Função para buscar produto via API
async function fetchProduct(id) {
  try {
    const res = await fetch(`/api/produtos`);
    const produtos = await res.json();

    // Ajuste aqui dependendo de como vem o ID do produto na API
    // Se a API retorna: { id: '0001', name: ... }
    return produtos.find(p => String(p.id) === String(id));

  } catch (err) {
    console.error("Erro ao buscar produto:", err);
    return null;
  }
}


// Função para renderizar os dados
function renderProduct(produto) {
  if (!produto) {
    document.querySelector(".product-card").innerHTML = "<p>Produto não encontrado.</p>";
    return;
  }

  // Dados do produto
  document.getElementById("product-id").textContent = produto.id;
  document.getElementById("product-name").textContent = produto.name;
  document.getElementById("product-description").textContent = produto.description || "-";
  document.getElementById("product-category").textContent = produto.category || "-";
  document.getElementById("product-subcategory").textContent = produto.subcategory || "-";
  document.getElementById("product-weight").textContent = produto.weight || "0";
  document.getElementById("product-price").textContent = produto.price || "-";

  // Quantidade
  const quantityDiv = document.createElement('div');
  quantityDiv.classList.add('attr');
  quantityDiv.innerHTML = `
    <span class="label">Quantidade</span>
    <span id="product-quantity">${produto.quantity || 0}</span>
  `;
  document.querySelector('.product-info').appendChild(quantityDiv);

  // Controles simples
  const controlsDiv = document.createElement('div');
  controlsDiv.innerHTML = `
    <input id="stockDelta" type="number" value="1" style="width:60px"/>
    <button id="btnReceive">Receber</button>
    <button id="btnDispatch">Retirar</button>
  `;
  document.querySelector('.product-info').appendChild(controlsDiv);

  // Funções de clique mínimas
  document.getElementById('btnReceive').addEventListener('click', async () => {
    const delta = parseInt(document.getElementById('stockDelta').value) || 0;
    const res = await fetch(`/api/produtos/${produto.id}/stock`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ delta })
    });
    const data = await res.json();
    if(res.ok) document.getElementById('product-quantity').textContent = data.product.quantity;
    else alert(data.message || 'Erro');
  });

  document.getElementById('btnDispatch').addEventListener('click', async () => {
    const delta = -Math.abs(parseInt(document.getElementById('stockDelta').value) || 0);
    const res = await fetch(`/api/produtos/${produto.id}/stock`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ delta })
    });
    const data = await res.json();
    if(res.ok) document.getElementById('product-quantity').textContent = data.product.quantity;
    else alert(data.message || 'Erro');
  });
}

// Botão voltar
document.getElementById("btnBack").addEventListener("click", () => {
  window.history.back();
});

// Botão copiar ID
document.getElementById("btnCopyId").addEventListener("click", () => {
  const id = document.getElementById("product-id").textContent;
  if (!id) return alert("ID não disponível!");
  
  navigator.clipboard.writeText(id)
    .then(() => console.log(`ID "${id}" copiado!`))
    .catch(() => alert("Erro ao copiar ID."));
});




// Inicialização
(async () => {
  const id = getProductIdFromUrl();
  const produto = await fetchProduct(id);
  renderProduct(produto);
})();
