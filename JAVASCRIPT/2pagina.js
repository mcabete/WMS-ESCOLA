// Pega o botão e a div
let botao = document.getElementById("btnMostrar");
let novaDiv = document.getElementById("novaDiv");

// Ao clicar no botão, mostra ou esconde a div
botao.addEventListener("click", () => {
  novaDiv.classList.toggle("oculta");
  novaDiv.innerHTML = "eu não"
  novaDiv.style.position = 'absolute'
  novaDiv.style.left = '230px'
  novaDiv.style.top = '2px'
  novaDiv.style.backgroundColor = 'red'
  novaDiv.style.padding = '20px'
  novaDiv.style.marginTop = '20px'
  novaDiv.style.borderRadius = '10px'
  novaDiv.style.boxShadow = '2px 2px 8px yellow'
  novaDiv.style.width = '300px'
  
});
