document.getElementById("btnVoltar").addEventListener("click", () => {
  window.location.href = "/";
});

document.getElementById("btnEnviar").addEventListener("click", sendProduct);


async function sendProduct() {
  const name        = document.getElementById("name").value;
  const description = document.getElementById("description").value;
  const weight      = document.getElementById("weight").value;
  const price       = document.getElementById("price").value;
  const category    = document.getElementById("category").value;
  const subcategory = document.getElementById("subcategory").value;

  const produto = {
    name,
    description,
    weight,
    price,
    category,
    subcategory
  };

  console.log(JSON.stringify(produto));

  try {
    const response = await fetch("http://localhost:3333/api/produtos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(produto)
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    // ⚠️ Removido o console.log(response.json()) duplicado
    const text = await response.text(); // <- lê o corpo em texto cru
    const data = text ? JSON.parse(text) : {}; // <- converte só se existir JSON

    console.log("Produto criado com sucesso:", data);
    return data;

  } catch (error) {
    console.error("Erro:", error);
  }
}
