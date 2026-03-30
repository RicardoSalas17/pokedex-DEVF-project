const TYPE_COLORS = {
  bug: "#8cb330",
  dark: "#5a5366",
  dragon: "#0b6dc3",
  electric: "#f2c94c",
  fairy: "#ec8fe6",
  fighting: "#d3425f",
  fire: "#ff6b6b",
  flying: "#7da6de",
  ghost: "#5f6dbc",
  grass: "#4caf7d",
  ground: "#d78555",
  ice: "#77d5f7",
  normal: "#a0a29f",
  poison: "#b763cf",
  psychic: "#ff6fa8",
  rock: "#c9b787",
  steel: "#5695a3",
  water: "#4d9de0"
};

const state = {
  search: "",
  type: "all",
  sort: "id-asc"
};

const pokemonGrid = document.getElementById("pokemon-grid");
const searchInput = document.getElementById("search-input");
const typeFilter = document.getElementById("type-filter");
const sortSelect = document.getElementById("sort-select");
const resetButton = document.getElementById("reset-button");
const totalCount = document.getElementById("total-count");
const visibleCount = document.getElementById("visible-count");
const typeCount = document.getElementById("type-count");
const resultsSummary = document.getElementById("results-summary");
const emptyState = document.getElementById("empty-state");
const dialogBackdrop = document.getElementById("dialog-backdrop");
const dialogClose = document.getElementById("dialog-close");
const dialogContent = document.getElementById("dialog-content");

const normalizedPokemon = pokemones.map((pokemon) => ({
  ...pokemon,
  art_url: buildOfficialArtUrl(pokemon.pkdx_id),
  image_url: normalizeUrl(pokemon.image_url),
  description: cleanDescription(pokemon.description)
}));

function buildOfficialArtUrl(pkdxId) {
  const paddedId = String(pkdxId).padStart(3, "0");
  return `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${paddedId}.png`;
}

function normalizeUrl(url) {
  return typeof url === "string" ? url.replace(/^http:\/\//, "https://") : "";
}

function cleanDescription(description) {
  const text = (description || "").trim();
  const midpoint = Math.floor(text.length / 2);
  const firstHalf = text.slice(0, midpoint).trim();
  const secondHalf = text.slice(midpoint).trim();

  if (firstHalf && firstHalf === secondHalf) {
    return firstHalf;
  }

  return text.replace(/\s+/g, " ");
}

function formatPokemonNumber(number) {
  return `#${String(number).padStart(3, "0")}`;
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

function getTypeColor(type) {
  return TYPE_COLORS[type] || "#6ea8fe";
}

function populateTypeFilter() {
  const types = [...new Set(normalizedPokemon.flatMap((pokemon) => pokemon.types))].sort();

  types.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    typeFilter.appendChild(option);
  });

  totalCount.textContent = String(normalizedPokemon.length);
  typeCount.textContent = String(types.length);
}

function getFilteredPokemon() {
  const term = state.search.trim().toLowerCase();

  const filtered = normalizedPokemon.filter((pokemon) => {
    const matchesSearch =
      term === "" ||
      pokemon.name.toLowerCase().includes(term) ||
      formatPokemonNumber(pokemon.pkdx_id).toLowerCase().includes(term) ||
      String(pokemon.pkdx_id).includes(term);
    const matchesType = state.type === "all" || pokemon.types.includes(state.type);

    return matchesSearch && matchesType;
  });

  return filtered.sort((first, second) => {
    switch (state.sort) {
      case "id-desc":
        return second.pkdx_id - first.pkdx_id;
      case "name-asc":
        return first.name.localeCompare(second.name);
      case "name-desc":
        return second.name.localeCompare(first.name);
      case "id-asc":
      default:
        return first.pkdx_id - second.pkdx_id;
    }
  });
}

function renderPokemonList() {
  const filteredPokemon = getFilteredPokemon();

  visibleCount.textContent = String(filteredPokemon.length);
  resultsSummary.textContent = `${filteredPokemon.length} result${filteredPokemon.length === 1 ? "" : "s"} shown from ${normalizedPokemon.length} Pokemon.`;
  emptyState.classList.toggle("hidden", filteredPokemon.length !== 0);
  pokemonGrid.innerHTML = "";

  filteredPokemon.forEach((pokemon) => {
    pokemonGrid.appendChild(createPokemonCard(pokemon));
  });
}

function createPokemonCard(pokemon) {
  const article = document.createElement("article");
  article.className = "pokemon-card";
  article.style.setProperty("--type-accent", `${getTypeColor(pokemon.types[0])}55`);

  const evolutionCount = pokemon.evolutions.length;
  const typeMarkup = pokemon.types
    .map(
      (type) =>
        `<span class="type-chip" style="--chip-color: ${getTypeColor(type)}">${type}</span>`
    )
    .join("");

  article.innerHTML = `
    <div class="card-top">
      <div>
        <p class="pokemon-number">${formatPokemonNumber(pokemon.pkdx_id)}</p>
        <h2 class="pokemon-name">${pokemon.name}</h2>
      </div>
      <p class="meta-kicker">Gen 1</p>
    </div>
    <img class="pokemon-image" src="${pokemon.art_url}" alt="${pokemon.name}" loading="lazy" />
    <div class="type-row">${typeMarkup}</div>
    <p class="pokemon-description">${truncateText(pokemon.description, 135)}</p>
    <div class="card-footer">
      <span class="meta-kicker">${evolutionCount} evolution${evolutionCount === 1 ? "" : "s"}</span>
      <button class="detail-button" type="button">View details</button>
    </div>
  `;

  article.querySelector(".detail-button").addEventListener("click", () => {
    openDialog(pokemon);
  });

  return article;
}

function buildEvolutionText(evolution) {
  if (evolution.method === "level_up" && evolution.level) {
    return `${evolution.to} at level ${evolution.level}`;
  }

  if (evolution.method === "other") {
    return `${evolution.to} via special evolution method`;
  }

  return evolution.to;
}

function openDialog(pokemon) {
  const paddedId = String(pokemon.pkdx_id).padStart(3, "0");
  const typeMarkup = pokemon.types
    .map(
      (type) =>
        `<span class="type-chip" style="--chip-color: ${getTypeColor(type)}">${type}</span>`
    )
    .join("");
  const detailRows = [
    ["Pokedex No.", formatPokemonNumber(pokemon.pkdx_id)],
    ["National ID", String(pokemon.national_id)],
    ["Primary Type", pokemon.types[0]],
    ["Secondary Type", pokemon.types[1] || "None"],
    ["Evolution Count", String(pokemon.evolutions.length)]
  ]
    .map(
      ([label, value]) => `
        <div class="pokedex-data-row">
          <span class="pokedex-data-label">${label}</span>
          <strong class="pokedex-data-value">${value}</strong>
        </div>
      `
    )
    .join("");

  const evolutionMarkup = pokemon.evolutions.length
    ? pokemon.evolutions
        .map((evolution) => `<li>${buildEvolutionText(evolution)}</li>`)
        .join("")
    : "<li>This Pokemon does not have registered evolutions in the dataset.</li>";

  dialogContent.innerHTML = `
    <section class="pokedex-shell">
      <div class="pokedex-top-lights" aria-hidden="true">
        <span class="pokedex-light pokedex-light-main"></span>
        <span class="pokedex-light pokedex-light-red"></span>
        <span class="pokedex-light pokedex-light-yellow"></span>
        <span class="pokedex-light pokedex-light-green"></span>
      </div>
      <div class="dialog-header pokedex-header">
        <div>
          <p class="pokemon-number">${formatPokemonNumber(pokemon.pkdx_id)}</p>
          <h2 id="dialog-title">${pokemon.name}</h2>
        </div>
        <p class="meta-kicker">Entry ${paddedId}</p>
      </div>
      <div class="pokedex-screen-frame">
        <div class="pokedex-screen">
          <img class="dialog-image" src="${pokemon.art_url}" alt="${pokemon.name}" />
        </div>
      </div>
      <div class="type-row pokedex-type-row">${typeMarkup}</div>
      <div class="dialog-grid pokedex-grid">
        <section class="info-panel pokedex-panel">
          <h3>Data</h3>
          <div class="pokedex-data-grid">${detailRows}</div>
        </section>
        <section class="info-panel pokedex-panel">
          <h3>Evolutions</h3>
          <ul class="evolution-list">${evolutionMarkup}</ul>
        </section>
      </div>
      <section class="info-panel pokedex-panel pokedex-description-panel">
        <h3>Description</h3>
        <p class="dialog-description">${pokemon.description}</p>
      </section>
    </section>
  `;

  dialogBackdrop.classList.remove("hidden");
  dialogBackdrop.setAttribute("aria-hidden", "false");
  dialogClose.focus();
  document.body.style.overflow = "hidden";
}

function closeDialog() {
  dialogBackdrop.classList.add("hidden");
  dialogBackdrop.setAttribute("aria-hidden", "true");
  dialogContent.innerHTML = "";
  document.body.style.overflow = "";
}

function resetFilters() {
  state.search = "";
  state.type = "all";
  state.sort = "id-asc";
  searchInput.value = "";
  typeFilter.value = "all";
  sortSelect.value = "id-asc";
  renderPokemonList();
}

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderPokemonList();
});

typeFilter.addEventListener("change", (event) => {
  state.type = event.target.value;
  renderPokemonList();
});

sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderPokemonList();
});

resetButton.addEventListener("click", resetFilters);
dialogClose.addEventListener("click", closeDialog);

dialogBackdrop.addEventListener("click", (event) => {
  if (event.target === dialogBackdrop) {
    closeDialog();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !dialogBackdrop.classList.contains("hidden")) {
    closeDialog();
  }
});

populateTypeFilter();
renderPokemonList();
