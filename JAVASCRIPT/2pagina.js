let botao = document.getElementById("btnMostrar");
let novaDiv = document.getElementById("novaDiv");

botao.addEventListener("click", () => {
  novaDiv.classList.toggle("oculta");

  // Cria a lista
  let ul = document.createElement('ul');

  let itens = ["Arroz", "Feijão", "Macarrão", "Manteiga", "Maionese", "Millho", "Azeitona", "Leite",
    "Água", "Leite em pó", "Achocolatado", "Café", "Fermento", "Salgadinho", "Iogurte", "Ovo", "Fruta",
    "Refrigerante", "Pote de sorvete", "Filtro de café", "Produtos de limpeza", "Higiene pessoal"];

  itens.forEach(item => {
     li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });

  // Adiciona a lista na div
  novaDiv.appendChild(ul);

  novaDiv.style.position = 'absolute';
  novaDiv.style.left = '230px';
  novaDiv.style.top = '2px';
  novaDiv.style.backgroundColor = '#FED328';
  novaDiv.style.padding = '20px';
  novaDiv.style.marginTop = '20px';
  novaDiv.style.borderRadius = '10px';
  novaDiv.style.boxShadow = '2px 2px 8px #B7963B';
  novaDiv.style.width = '300px';
  novaDiv.style.maxHeight = '400px';
  novaDiv.style.overflowY = 'auto';
  novaDiv.style.zIndex = '9999'; // ⬅️ adiciona esta linha

  
  

});

function funçao(){

  let lista = document.getElementById('lista')

  lista.innerHTML = `<div class="lista">
                        <ul>
                          <li><a href="/WMS-ESCOLA/Imagens/Bee.png">abelha</a></li>
                          <li><a href="/WMS-ESCOLA/Imagens/file-removebg-preview.png">leite</a></li>
                          <li><a href="/WMS-ESCOLA/Imagens/opcoes.webp">opções</a></li>
                        </ul>
                     </div>`

  

  
  // let caixa = document.createElement("div")

  // caixa.style.backgroundColor = "red"

  // caixa.innerHTML = `<img src="/WMS-ESCOLA/Imagens/file-removebg-preview.png">`

  // document.body.appendChild(caixa)
}
 
input();

const btn = document.getElementById('config-btn');
const menu = document.getElementById('config-menu');
const darkModeCheckbox = document.getElementById('darkModeToggle');


btn.addEventListener('click', (e) => {
  e.stopPropagation(); 
  menu.classList.toggle('show');
});

darkModeCheckbox.addEventListener('change', () => {
  if (darkModeCheckbox.checked) {
    document.body.style.backgroundColor = '#121212';
    document.body.style.color = '#eee';
  } else {
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
  }
});

window.addEventListener('click', () => {
  menu.classList.remove('show');
});

menu.addEventListener('click', (e) => {
  e.stopPropagation();
});

