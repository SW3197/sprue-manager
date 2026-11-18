import { state } from "../state.js";
import { saveState } from "../storage.js";
import { openAddWishlistDrawer } from "./wishlistDrawer.js";
import { openPurchaseDrawer } from "./purchaseDrawer.js";
import { gameLabels, wishTypeLabels } from "../utils/games.js";

const selectedWishIds = new Set();

function updateClearSelectionButton() {
    const button = document.getElementById("wishlist-clear-selection-btn");

    if (!button) return;

    button.hidden = selectedWishIds.size === 0;
}

export function renderWishlist(resetSelection = false) {
    if (resetSelection) {
        selectedWishIds.clear();
    }
  const wishlistGrid = document.getElementById("wishlist-grid");

  wishlistGrid.innerHTML = "";

  let clearSelectionButton = document.getElementById("wishlist-clear-selection-btn");

  if (!clearSelectionButton) {
      clearSelectionButton = document.createElement("button");
      clearSelectionButton.id = "wishlist-clear-selection-btn";
      clearSelectionButton.type = "button";
      clearSelectionButton.textContent = "Annuler la sélection";

      clearSelectionButton.addEventListener("click", () => {
          selectedWishIds.clear();
          renderWishlist();
      });

      document.querySelector(".wishlist-toolbar").appendChild(clearSelectionButton);
  }

  updateClearSelectionButton();

  selectedWishIds.forEach((id) => {
    if (!state.wishlist.some((wish) => wish.id === id)) {
        selectedWishIds.delete(id);
    }
  });

  const selectedFilter = document.getElementById("wishlist-filter").value;

  const filteredWishlist = state.wishlist.filter((wish) => {
    if (selectedFilter === "miniatures") {
        return wish.type === "unit" || wish.type === "box";
    }

    if (selectedFilter === "hobby") {
        return wish.type === "material";
    }

    return true;
  });

  if (filteredWishlist.length === 0) {
      wishlistGrid.innerHTML = "<p>Aucun souhait à afficher.</p>";
      return;
  }

  filteredWishlist.forEach((wish) => {
    const item = document.createElement("article");
    item.classList.add("wishlist-item");

    const header = document.createElement("div");
    header.classList.add("wishlist-item-header");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("wishlist-select-checkbox");
    checkbox.checked = selectedWishIds.has(wish.id);
    item.classList.toggle("selected", checkbox.checked);

    checkbox.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            selectedWishIds.add(wish.id);
        } else {
            selectedWishIds.delete(wish.id);
        }

        updateClearSelectionButton();

        item.classList.toggle("selected", checkbox.checked);
    });

    item.addEventListener("click", (event) => {
    // Les boutons et la checkbox conservent leur comportement
          if (event.target.closest("button, input")) {
              return;
          }

          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change"));
    });

    const nameContainer = document.createElement("div");
    nameContainer.classList.add("wishlist-item-name");

    const name = document.createElement("strong");
    name.textContent = wish.name;

    const subtitle = document.createElement("div");
    subtitle.classList.add("wishlist-item-subtitle");

    const category = document.createElement("span");
    category.textContent = wishTypeLabels[wish.type] ?? wish.type;

    const quantityLabel = document.createElement("span");
    quantityLabel.textContent = `× ${wish.quantity}`;

    subtitle.append(category);

    if (wish.game) {
        const gameLabel = document.createElement("span");
        gameLabel.textContent = gameLabels[wish.game] ?? wish.game;
        subtitle.prepend(gameLabel);
    }

    subtitle.append(quantityLabel);

    if (wish.faction) {
        const factionLabel = document.createElement("span");
        factionLabel.textContent = wish.faction;
        subtitle.append(factionLabel);
    }

    nameContainer.append(name, subtitle);

    const end = document.createElement("span");
    end.classList.add("wishlist-item-end");

    if (wish.estimatedPrice != null) {
      const priceContainer = document.createElement("div");
      priceContainer.classList.add("wishlist-item-price");

      const price = document.createElement("strong");
      price.textContent = `${wish.estimatedPrice.toFixed(2)} €`;

      const priceLabel = document.createElement("small");
      priceLabel.textContent = " Prix estimé / unité";

      priceContainer.append(price, priceLabel);
      end.appendChild(priceContainer);
    }

    header.append(checkbox, nameContainer, end);
    
    const actions = document.createElement("div");
    actions.classList.add("wishlist-item-actions");

    item.append(header, actions);

    const purchaseButton = document.createElement("button");
    purchaseButton.type = "button";
    purchaseButton.classList.add("wishlist-purchase-btn");
    purchaseButton.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    `;

    purchaseButton.setAttribute("aria-label", "Produit acquis");
    purchaseButton.title = "Produit acquis";

    purchaseButton.addEventListener("click", () => {
      const selectedWishes = state.wishlist.filter((item) =>
          selectedWishIds.has(item.id) || item.id === wish.id
      );

      openPurchaseDrawer(
          selectedWishes.length === 1 ? selectedWishes[0] : selectedWishes
      );
    });

    actions.appendChild(purchaseButton);

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.classList.add("wishlist-edit-btn");
    editButton.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
      </svg>
    `;

    editButton.setAttribute("aria-label", "Modifier le souhait");
    editButton.title = "Modifier";

    editButton.addEventListener("click", () => {
      openAddWishlistDrawer(wish);
    });

    actions.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("wishlist-delete-btn");
    deleteButton.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M3 6h18"/>
        <path d="M8 6V4h8v2"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v5"/>
        <path d="M14 11v5"/>
      </svg>
    `;
    deleteButton.setAttribute("aria-label", "Supprimer le souhait");
    deleteButton.title = "Supprimer";

    actions.appendChild(deleteButton);

    deleteButton.addEventListener("click", () => {
      const confirmed = confirm(`Supprimer "${wish.name}" de la wishlist ?`);

      if (!confirmed) return;

      state.wishlist = state.wishlist.filter((item) => item.id !== wish.id);

      saveState();
      renderWishlist();
    });

    wishlistGrid.appendChild(item);
  });
}

document.getElementById("wishlist-filter").addEventListener("change", () => {
    renderWishlist();
});
