import { openDrawer, closeDrawer } from "../ui/drawers.js";
import { state } from "../state.js";
import { saveState } from "../storage.js";
import { renderWishlist } from "./wishlistView.js";
import { gameLabels, wishTypeLabels } from "../utils/games.js";
import { createUnitsFromPurchase } from "../modules/units.js";
import { renderTransactions } from "./transactionsView.js";

export function openPurchaseDrawer(wishes = []) {
  const selectedWishes = Array.isArray(wishes)
        ? wishes
        : wishes ? [wishes] : [];

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

      <label class="purchase-unknown-date">
        <input
          type="checkbox"
          id="purchase-date-unknown"
          name="dateUnknown"
        >
        Date d'achat inconnue
      </label>

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
    article.dataset.wishId = wish.id ?? "";

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

    function createFieldGroup(label, input) {
      const group = document.createElement("div");
      group.classList.add("purchase-field-group");

      group.append(label, input);

      return group;
    }

    article.append(
      createFieldGroup(nameLabel, name),
      createFieldGroup(typeLabel, type),
      createFieldGroup(quantityLabel, quantity),
      createFieldGroup(priceLabel, price),
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

      if (type.value === "unit" || type.value === "box") {
        specificFields.append(
        createFieldGroup(gameLabel, game)
        );
      }

      if (type.value === "unit") {
        specificFields.append(
        createFieldGroup(factionLabel, faction)
        );
      }

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

          <label for="purchase-unit-faction-${index}">
            Faction
          </label>
          <input
            type="text"
            id="purchase-unit-faction-${index}"
            name="unitFaction"
            placeholder="Ex. : Stormcast Eternals"
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

      const miniatureCountGroup = createFieldGroup(
        miniatureCountLabel,
        miniatureCount
      );

      miniatureCountGroup.classList.add("purchase-miniature-count-group");

      specificFields.append(miniatureCountGroup);
    }
    }

    type.addEventListener("change", updateSpecificFields);
    updateSpecificFields();

    itemsContainer.appendChild(article);

    article.appendChild(removeArticleButton);
  }

  selectedWishes.forEach((wish) => {
    addPurchaseItem(wish);
  });

  const addPurchaseItemBtn = document.getElementById(
    "add-purchase-item-btn"
  );

  addPurchaseItemBtn.addEventListener("click", () => {
    addPurchaseItem();
    updatePurchaseSummary();
  });

  const purchaseForm = document.getElementById("purchase-form");

  const purchaseDate = document.getElementById("purchase-date");
  const dateUnknownCheckbox = document.getElementById("purchase-date-unknown");

  dateUnknownCheckbox.addEventListener("change", () => {
    if (dateUnknownCheckbox.checked) {
        purchaseDate.value = "";
        purchaseDate.disabled = true;
        purchaseDate.required = false;
    } else {
        purchaseDate.disabled = false;
        purchaseDate.required = true;
        purchaseDate.value = today;
    }
  });

  purchaseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const purchaseDateValue = dateUnknownCheckbox.checked
      ? null
      : purchaseDate.value;

    const articles = purchaseForm.querySelectorAll(".purchase-item");

    if (articles.length === 0) {
        alert("Ajoute au moins un article avant de valider l'achat.");
        return;
    }

    const purchaseItems = Array.from(articles).map((article) => {
      return {
        id: crypto.randomUUID(),
        wishId: article.dataset.wishId || null,
        type: article.querySelector('[name="type"]').value,
        name: article.querySelector('[name="name"]').value.trim(),
        game: article.querySelector('[name="game"]')?.value || null,
        faction: article.querySelector('[name="faction"]')?.value.trim() || null,
        miniatureCount: article.querySelector('[name="type"]').value === "unit"
          ? article.querySelector(
            '.purchase-miniature-count-group [name="miniatureCount"]'
          )?.valueAsNumber ?? null
          : null,
        composition: Array.from(
          article.querySelectorAll(".purchase-unit-row")
        ).map((unitRow) => ({
          name: unitRow.querySelector('[name="unitName"]').value.trim(),
          faction: unitRow.querySelector('[name="unitFaction"]').value.trim() || null,
          miniatureCount: unitRow.querySelector('[name="miniatureCount"]').valueAsNumber
        })),
        quantity: Number(article.querySelector('[name="quantity"]').value),
        unitPrice: Number(article.querySelector('[name="unitPrice"]').value),
        isGift: article.querySelector('[name="isGift"]').checked
      };
    });

    const summary = updatePurchaseSummary();

    const purchase = {
      id: crypto.randomUUID(),
      type: "purchase",
      date: purchaseDateValue,
      createdAt: new Date().toISOString(),
      items: purchaseItems,
      subtotal: summary.subtotal,
      additionalCosts: summary.additionalCosts,
      total: summary.total
    };

    const newUnits = createUnitsFromPurchase(purchase, state.units);

    state.units.push(...newUnits);

    state.transactions.push(purchase);

    purchaseItems.forEach((item) => {
      if (!item.wishId) {
        return;
      }

      const wishIndex = state.wishlist.findIndex(
          (wish) => wish.id === item.wishId
      );

      if (wishIndex === -1) {
          return;
      }

      const wish = state.wishlist[wishIndex];

      if (item.quantity >= wish.quantity) {
          state.wishlist.splice(wishIndex, 1);
      } else {
          wish.quantity -= item.quantity;
      }
    });

    saveState();

    renderWishlist(true);
    renderTransactions();
    
    closeDrawer();
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

    return {
      subtotal,
      additionalCosts,
      total
    };
  }

  purchaseForm.addEventListener("input", updatePurchaseSummary);

  updatePurchaseSummary();

}