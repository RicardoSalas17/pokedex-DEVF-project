var cardContainer;
var card;
function constructor(pokemon) {
  // Elemento tarjeta
  card = document.createElement("div");
  card.id = pokemon._id;
  var background;
  var cardBody = document.createElement("div");
  if (pokemon.types.length == 1) {
    background = pokemon.types[0];
  } else {
    var middle = document.createElement("div");
    card.appendChild(middle);
    middle.className = `prueba ${pokemon.types[1]}`;
    background = pokemon.types[0];
  }
  card.className = `card col-6 col-sm-4 col-md-3 ${background}`;
  // Elemento Contenedor
  cardContainer = document.getElementById("card-container");
  cardContainer.appendChild(card);
  // Elemento img
  var img = document.createElement("img");
  img.className = "img-trans card-img-top";
  img.src = pokemon.art_url;
  img.alt = pokemon.name;
  card.appendChild(img);
  // var cardBody = document.createElement('div');
  cardBody.className = "card-body";
  card.appendChild(cardBody);
  //Boton con nombre del pokemon
  cardBody.insertAdjacentHTML(
    "beforeend",
    `<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal${pokemon._id}">
 <span>${pokemon.name}
 </span>
  </button>`
  );
  //Modal
  var typePoke;
  if (pokemon.types.length == 1) {
    typePoke = `<div class="flex-Dis"> 
    <button class="${pokemon.types[0]} spanType">
    <p>${pokemon.types[0]}</p>
    </button>
    </div>`;
  } else {
    typePoke = `<div class="flex-Dis"> 
    <button class="${pokemon.types[0]} spanType">
    <p>${pokemon.types[0]}</p>
    </button>
    <button class="${pokemon.types[1]} spanType">
    <p>${pokemon.types[1]}</p>
    </button>
    </div>`;
  }
  cardBody.insertAdjacentHTML(
    "beforebegin",
    `<div class="modal fade" id="exampleModal${pokemon._id}" tabindex="-1" aria-labelledby="exampleModalLabel${pokemon._id}" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
        </button>
        </div>
        <div class="modal-body">
        <h1 class="modal-title" id="exampleModalLabel${pokemon._id}">${pokemon.name}</h1>
        <img src="${pokemon.art_url}" alt="${pokemon.name}">
        <div class="description">
        <h3>Description</h3>
        <p>${pokemon.description}</p>
        </div>
        <div class=>
        <h3 class="typeh">Type</h3>
        <div class="types">
        ${typePoke}
        </div>
        </div>
        </div>
      </div>
    </div>
  </div>`
  );
}
//Busqueda
var butSearch = document.getElementById("search");
var inputSearch = document.getElementById("input-search");
var main = document.getElementById("main");
var prueba = document.createElement("div");
var butRet = document.createElement("button");
butRet.innerHTML = "< Return";
butRet.className = "butRet";
var pokeSearch = [];
function search() {
  butSearch.replaceWith(butRet);
  inputSearch.replaceWith(prueba);
  for (var i = 0; i < pokemones.length; i++) {
    var element = document.getElementById(`${pokemones[i]._id}`);
    element.parentNode.removeChild(element);
  }
  var inSearch = inputSearch.value.toLowerCase();
  if ((inSearch == "") == false) {
    for (var i = 0; i < pokemones.length; i++) {
      var inPokemon = pokemones[i].name.toLowerCase();
      if (inPokemon.includes(inSearch) == true) {
        constructor(pokemones[i]);
        pokeSearch.push(pokemones[i]);
      }
    }
  }
}
butSearch.addEventListener("click", search);
var type = [];
function inicio() {
  for (var i = 0; i < pokemones.length; i++) {
    constructor(pokemones[i]);
  }
}
inicio();
//Regresar
function ret() {
  inputSearch.value = "";
  for (var i = 0; i < pokeSearch.length; i++) {
    var element = document.getElementById(`${pokeSearch[i]._id}`);
    element.parentNode.removeChild(element);
  }
  pokeSearch = [];
  for (var i = 0; i < pokemones.length; i++) {
    constructor(pokemones[i]);
  }
  butRet.replaceWith(butSearch);
  prueba.replaceWith(inputSearch);
}
butRet.addEventListener("click", ret);
