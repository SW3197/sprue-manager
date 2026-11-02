import { setupAddMiniatureForm } from "./forms.js";
import { state } from "../state.js";
import { saveState } from "../storage.js";
import { renderWishlist } from "../views/wishlistView.js";
import { gameLabels, wishTypeLabels } from "../utils/games.js";

const drawerContainer = document.getElementById("drawer-container");

export function openDrawer(content, extraClass = "") {
  drawerContainer.innerHTML = `
        <div class="drawer-overlay">
            <div class="drawer ${extraClass}">
                <button id="close-drawer-btn">
                    X
                </button>
            
                ${content}
            </div>
        </div>
    `;

  setupDrawerCloseButton();
  setupDrawerOverlay();
}

export function openAddMiniatureDrawer() {
  openDrawer(`
        <div class = "drawer">

            <h2>Ajouter une figurine</h2>

            <form id="add-miniature-form">

                <input
                    type="text"
                    id="miniature-name"
                    placeholder="Nom"
                >
    
                <select id="miniature-game">
                    <option value="MCP">Marvel Crisis Protocol</option>
                    <option value="AoS">Age of Sigmar</option>
                    <option value="WC">Warcry</option>
                    <option value="KT">Kill Team</option>
                    <option value="SWL">Star Wars Legion</option>
                </select>

                <input
                    type="number"
                    id="miniature-price"
                    placeholder="Prix d'achat"
                    min="0"
                    step="0.01"
                >

                <button type="submit">
                    Ajouter
                </button>

            </form>

        </div>
    
    `);

  setupAddMiniatureForm();
}

export function openAddWishlistDrawer(wishToEdit = null) {
  const isEditing = wishToEdit !== null;

  openDrawer(`
        <h2>${isEditing ? "Modifier un souhait" : "Ajouter un souhait"}</h2>

        <form id="add-wishlist-form">
            <label for="wishlist-type">Type de souhait</label>

            <select id="wishlist-type" name="type" required>
                <option value="" selected disabled>
                    Sélectionner un type
                </option>
                <option value="unit">Unité</option>
                <option value="box">Coffret</option>
                <option value="material">Matériel hobby</option>
            </select>
            <label for="wishlist-name">Nom du produit</label>
            <input
                type="text"
                id="wishlist-name"
                name="name"
                required
            >

            <label for="wishlist-quantity">Quantité souhaitée</label>
            <input
                type="number"
                id="wishlist-quantity"
                name="quantity"
                min="1"
                step="1"
                value="1"
                required
            >

            <label for="wishlist-price">Prix estimé (€)</label>
            <input
                type="number"
                id="wishlist-price"
                name="estimatedPrice"
                min="0"
                step="0.01"
            >

            <div id="wishlist-miniature-fields" class="hidden">
                <label for="wishlist-game">Jeu</label>
                <select id="wishlist-game" name="game">
                    <option value="">Sélectionner un jeu</option>
                    <option value="MCP">Marvel Crisis Protocol</option>
                    <option value="AoS">Age of Sigmar</option>
                    <option value="WC">Warcry</option>
                    <option value="KT">Kill Team</option>
                    <option value="SWL">Star Wars Legion</option>
                </select>

                <label for="wishlist-faction">Faction</label>
                <input
                    type="text"
                    id="wishlist-faction"
                    name="faction"
                    placeholder="Ex. : Stormcast Eternals"
                >
            </div>

            <button type="submit" id="submit-wishlist-btn">
                ${isEditing ? "Enregistrer les modifications" : "Ajouter à la wishlist"}
            </button>
        </form>
    `);

  if (wishToEdit) {
    document.querySelector("#add-wishlist-form h2");

    document.getElementById("wishlist-type").value = wishToEdit.type;
    document.getElementById("wishlist-name").value = wishToEdit.name;
    document.getElementById("wishlist-quantity").value = wishToEdit.quantity;
    document.getElementById("wishlist-price").value =
      wishToEdit.estimatedPrice ?? "";
    document.getElementById("wishlist-game").value = wishToEdit.game ?? "";
    document.getElementById("wishlist-faction").value =
      wishToEdit.faction ?? "";

    document.getElementById("wishlist-type").dispatchEvent(new Event("change"));
  }

  const typeSelect = document.getElementById("wishlist-type");
  const miniatureFields = document.getElementById("wishlist-miniature-fields");
  const gameSelect = document.getElementById("wishlist-game");

  typeSelect.addEventListener("change", () => {
    const isMiniature =
      typeSelect.value === "unit" || typeSelect.value === "box";

    miniatureFields.classList.toggle("hidden", !isMiniature);
    gameSelect.required = isMiniature;
  });
  const wishlistForm = document.getElementById("add-wishlist-form");

  wishlistForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(wishlistForm);

    const wish = {
      id: crypto.randomUUID(),
      type: formData.get("type"),
      name: formData.get("name").trim(),
      quantity: Number(formData.get("quantity")),
      estimatedPrice:
        formData.get("estimatedPrice") === ""
          ? null
          : Number(formData.get("estimatedPrice")),
      game: formData.get("game") || null,
      faction: formData.get("faction").trim() || null,
    };

    if (wishToEdit) {
      const index = state.wishlist.findIndex(
        (item) => item.id === wishToEdit.id,
      );

      if (index === -1) {
        console.error("Souhait introuvable dans la wishlist.");
        return;
      }

      state.wishlist[index] = {
        ...wish,
        id: wishToEdit.id,
      };
    } else {
      state.wishlist.push(wish);
    }

    saveState();
    renderWishlist();
    closeDrawer();
  });
}

export function closeDrawer() {
  drawerContainer.innerHTML = "";
}

function setupDrawerCloseButton() {
  const closeDrawerBtn = document.getElementById("close-drawer-btn");

  closeDrawerBtn.addEventListener("click", () => {
    closeDrawer();
  });
}

function setupDrawerOverlay() {
  const drawerOverlay = document.querySelector(".drawer-overlay");
  const drawer = document.querySelector(".drawer");

  drawerOverlay.addEventListener("click", () => {
    closeDrawer();
  });

  drawer.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

export function openPurchaseDrawer(wish = null) {
  const today = new Date().toLocaleDateString("en-CA");

  /*=======================================
APPEL DE OPEN DRAWER
  =======================================*/

  openDrawer(`
    <h2>Enregistrer un achat</h2>

    <form id="purchase-form">
      <label for="purchase-date">Date d'achat</label>
      <input
        type="date"
        id="purchase-date"
        name="date"
        value="${today}"
        required
      >
      <div id="purchase-items-container">
        <h3>Articles achetés</h3>
      </div>

      <button type="button" id="add-purchase-item-btn">
        + Ajouter un article
      </button>

      <div class="purchase-additional-costs">
        <h3>Frais annexes</h3>

        <label for="purchase-additional-costs">
          Montant des frais annexes (€)
        </label>

        <input
          type="number"
          id="purchase-additional-costs"
          name="additionalCosts"
          min="0"
          step="0.01"
          value="0"
          required
        >
      </div>

      <div class="purchase-summary">
        <h3>Récapitulatif financier</h3>

        <p>
          Sous-total des articles :
          <strong id="purchase-subtotal">0,00 €</strong>
        </p>

        <p>
          Frais annexes :
          <strong id="purchase-fees-total">0,00 €</strong>
        </p>

        <p>
          Total de l'achat :
          <strong id="purchase-grand-total">0,00 €</strong>
        </p>
      </div>

      <button type="submit" id="validate-purchase-btn">
        Valider l'achat
      </button>

    </form>
  `, "drawer-wide");

  let purchaseItemIndex = 0;

  /*=======================================
FONCTION ADD PURCHASE ITEM
  =======================================*/

  function addPurchaseItem(wish = null) {
    wish = wish ?? {
        id: null,
        type: "unit",
        name: "",
        quantity: 1,
        estimatedPrice: null,
        game: null,
        faction: null
    };
    const itemIndex = purchaseItemIndex++;
    const itemsContainer = document.getElementById(
        "purchase-items-container"
    );

    const article = document.createElement("div");
    article.classList.add("purchase-item");
    article.dataset.itemIndex = itemIndex;

    const removeArticleButton = document.createElement("button");
    removeArticleButton.type = "button";
    removeArticleButton.classList.add("purchase-remove-item-btn");
    removeArticleButton.textContent = "Retirer cet article";

    removeArticleButton.addEventListener("click", () => {
      article.remove();
      updatePurchaseSummary();
    });

    const nameLabel = document.createElement("label");
    nameLabel.htmlFor = `purchase-item-name-${itemIndex}`;
    nameLabel.textContent = "Nom du produit";

    const name = document.createElement("input");
    name.type = "text";
    name.id = `purchase-item-name-${itemIndex}`;
    name.name = "name";
    name.value = wish.name;
    name.required = true;

    /*-- Bloc pour le type de produit --*/

    const typeLabel = document.createElement("label");
    typeLabel.htmlFor = `purchase-item-type-${itemIndex}`;
    typeLabel.textContent = "Type de produit";

    const type = document.createElement("select");
    type.id = `purchase-item-type-${itemIndex}`;
    type.name = "type";
    type.required = true;

    Object.entries(wishTypeLabels).forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      type.appendChild(option);
    });

    type.value = wish.type;

    /*-- Bloc pour le jeu --*/

    const gameLabel = document.createElement("label");
    gameLabel.htmlFor = `purchase-item-game-${itemIndex}`;
    gameLabel.textContent = "Jeu";

    const game = document.createElement("select");
    game.id = `purchase-item-game-${itemIndex}`;
    game.name = "game";

    const emptyGameOption = document.createElement("option");
    emptyGameOption.value = "";
    emptyGameOption.textContent = "Sélectionner un jeu";
    game.appendChild(emptyGameOption);

    Object.entries(gameLabels).forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      game.appendChild(option);
    });

    game.value = wish.game ?? "";

    /*-- Bloc pour les factions --*/

    const factionLabel = document.createElement("label");
    factionLabel.htmlFor = `purchase-item-faction-${itemIndex}`;
    factionLabel.textContent = "Faction";

    const faction = document.createElement("input");
    faction.type = "text";
    faction.id = `purchase-item-faction-${itemIndex}`;
    faction.name = "faction";
    faction.value = wish.faction ?? "";
    faction.placeholder = "Ex. : Stormcast Eternals";

    /*-- Bloc pour les quantités --*/

    const quantityLabel = document.createElement("label");
    quantityLabel.htmlFor = "purchase-item-quantity";
    quantityLabel.textContent = "Quantité achetée";

    const quantity = document.createElement("input");
    quantity.type = "number";
    quantity.id = "purchase-item-quantity";
    quantity.name = "quantity";
    quantity.min = "1";
    if (wish.id !== null) {
      quantity.max = String(wish.quantity);
    }
    quantity.step = "1";
    quantity.value = "1";
    quantity.required = true;

    /*-- Bloc pour le prix unitaire --*/

    const priceLabel = document.createElement("label");
    priceLabel.htmlFor = "purchase-item-price";
    priceLabel.textContent = "Prix unitaire payé (€)";

    const price = document.createElement("input");
    price.type = "number";
    price.id = "purchase-item-price";
    price.name = "unitPrice";
    price.min = "0";
    price.step = "0.01";
    price.value = wish.estimatedPrice ?? "";
    price.required = true;

    const giftLabel = document.createElement("label");

    const giftCheckbox = document.createElement("input");
    giftCheckbox.type = "checkbox";
    giftCheckbox.name = "isGift";

    giftLabel.append(giftCheckbox, " Article offert");

    article.append(
      nameLabel, 
      name, 
      typeLabel, 
      type, 
      gameLabel, 
      game,
      factionLabel, 
      faction,
      quantityLabel, 
      quantity, 
      priceLabel, 
      price, 
      giftLabel
    );

    let previousPrice = price.value;

    giftCheckbox.addEventListener("change", () => {
      if (giftCheckbox.checked) {
        previousPrice = price.value;
        price.value = "0";
        price.disabled = true;
      } else {
        price.value = previousPrice;
        price.disabled = false;
      }

      price.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const specificFields = document.createElement("div");
    specificFields.classList.add("purchase-item-specific-fields");

    article.appendChild(specificFields);

    function updateSpecificFields() {
      specificFields.replaceChildren();

    /*-- Bloc si le type est "box" --*/

    if (type.value === "box") {
      const composition = document.createElement("div");
      composition.classList.add("purchase-box-composition");

      const title = document.createElement("h4");
      title.textContent = "Composition du coffret";

      const description = document.createElement("p");
      description.textContent = "Renseigne les unités contenues dans ce coffret.";

      const unitsContainer = document.createElement("div");
      unitsContainer.id = "purchase-box-units";

      let unitIndex = 0;

/*=======================================
FONCTION ADD UNIT ROW
=======================================*/

      function addUnitRow() {
        const index = unitIndex++;

        const unitRow = document.createElement("div");
        unitRow.classList.add("purchase-unit-row");

        unitRow.innerHTML = `
          <label for="purchase-unit-name-${index}">
            Nom de l'unité
          </label>
          <input
            type="text"
            id="purchase-unit-name-${index}"
            name="unitName"
            required
          >

          <label for="purchase-miniature-count-${index}">
            Nombre de figurines
          </label>
          <input
            type="number"
            id="purchase-miniature-count-${index}"
            name="miniatureCount"
            min="1"
            step="1"
            value="1"
            required
          >
        `;

        if (index > 0) {
          const removeButton = document.createElement("button");
          removeButton.type = "button";
          removeButton.textContent = "Retirer cette unité";

          removeButton.addEventListener("click", () => {
            unitRow.remove();
          });

          unitRow.appendChild(removeButton);
        }

        unitsContainer.appendChild(unitRow);
      }

      addUnitRow();

      const addUnitButton = document.createElement("button");
      addUnitButton.type = "button";
      addUnitButton.textContent = "+ Ajouter une unité";

      addUnitButton.addEventListener("click", addUnitRow);

      composition.append(title, description, unitsContainer, addUnitButton);
      specificFields.appendChild(composition);
    }

    /*-- Bloc pour le nombre de figurines si le type est "unit" --*/

    if (type.value === "unit") {
      const miniatureCountLabel = document.createElement("label");
      miniatureCountLabel.htmlFor = "purchase-single-miniature-count";
      miniatureCountLabel.textContent = "Nombre de figurines dans l'unité";

      const miniatureCount = document.createElement("input");
      miniatureCount.type = "number";
      miniatureCount.id = "purchase-single-miniature-count";
      miniatureCount.name = "miniatureCount";
      miniatureCount.min = "1";
      miniatureCount.step = "1";
      miniatureCount.value = "1";
      miniatureCount.required = true;

      specificFields.append(miniatureCountLabel, miniatureCount);
    }
    }

    type.addEventListener("change", updateSpecificFields);
    updateSpecificFields();

    itemsContainer.appendChild(article);

    article.appendChild(removeArticleButton);
  }

  if (wish) {
    addPurchaseItem(wish);
  }

  const addPurchaseItemBtn = document.getElementById(
    "add-purchase-item-btn"
  );

  addPurchaseItemBtn.addEventListener("click", () => {
    addPurchaseItem();
    updatePurchaseSummary();
  });

  const purchaseForm = document.getElementById("purchase-form");

  purchaseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const articles = purchaseForm.querySelectorAll(".purchase-item");

    if (articles.length === 0) {
        alert("Ajoute au moins un article avant de valider l'achat.");
        return;
    }

    const purchaseItems = Array.from(articles).map((article) => {
      return {
        id: crypto.randomUUID(),
        type: article.querySelector('[name="type"]').value,
        name: article.querySelector('[name="name"]').value.trim(),
        game: article.querySelector('[name="game"]').value || null,
        faction: article.querySelector('[name="faction"]').value.trim() || null,
        quantity: Number(article.querySelector('[name="quantity"]').value),
        unitPrice: Number(article.querySelector('[name="unitPrice"]').value),
        isGift: article.querySelector('[name="isGift"]').checked
      };
    });

    console.log("Articles de l'achat :", purchaseItems);
  });

/*=======================================
FONCTION UPDATE PURCHASE SUMMARY
=======================================*/

  function updatePurchaseSummary() {
    const articles = document.querySelectorAll(
      "#purchase-items-container .purchase-item"
    );

    let subtotal = 0;

    articles.forEach((article) => {
      const quantity = Number(
        article.querySelector('[name="quantity"]')?.value ?? 0
      );

      const isGift = article.querySelector(
        '[name="isGift"]'
      )?.checked ?? false;

      const unitPrice = isGift
        ? 0
        : Number(
            article.querySelector('[name="unitPrice"]')?.value ?? 0
          );

      subtotal += quantity * unitPrice;
    });

    const additionalCosts = Number(
        document.getElementById("purchase-additional-costs").value
    );

    const total = subtotal + additionalCosts;

    const formatPrice = (amount) =>
        amount.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR"
        });

    document.getElementById("purchase-subtotal").textContent =
        formatPrice(subtotal);

    document.getElementById("purchase-fees-total").textContent =
        formatPrice(additionalCosts);

    document.getElementById("purchase-grand-total").textContent =
        formatPrice(total);
  }

  purchaseForm.addEventListener("input", updatePurchaseSummary);

  updatePurchaseSummary();

}