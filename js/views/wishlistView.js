import { state } from "../state.js";
import { saveState } from "../storage.js";
import { openAddWishlistDrawer, openPurchaseDrawer } from "../ui/drawers.js";
import { gameLabels, wishTypeLabels } from "../utils/games.js";

const selectedWishIds = new Set();

function updateBulkPurchaseButton() {
    const button = document.getElementById("wishlist-bulk-purchase-btn");

    if (!button) return;

    button.style.visibility = selectedWishIds.size >= 2 ? "visible" : "hidden";
}

export function renderWishlist(resetSelection = false) {
    if (resetSelection) {
        selectedWishIds.clear();
    }
  const wishlistGrid = document.getElementById("wishlist-grid");

  wishlistGrid.innerHTML = "";

  selectedWishIds.forEach((id) => {
    if (!state.wishlist.some((wish) => wish.id === id)) {
        selectedWishIds.delete(id);
    }
  });

  const bulkPurchaseButton = document.createElement("button");
  bulkPurchaseButton.id = "wishlist-bulk-purchase-btn";
  bulkPurchaseButton.type = "button";
  bulkPurchaseButton.textContent = "Sélection achetée";

  bulkPurchaseButton.addEventListener("click", () => {
    const selectedWishes = state.wishlist.filter((wish) =>
        selectedWishIds.has(wish.id)
    );

    openPurchaseDrawer(selectedWishes);
  });

  document.getElementById("wishlist-bulk-purchase-btn")?.remove();

  const wishlistToolbar = document.querySelector(".wishlist-toolbar");
  wishlistToolbar.appendChild(bulkPurchaseButton);

  updateBulkPurchaseButton();

  if (state.wishlist.length === 0) {
    wishlistGrid.innerHTML = "<p>Votre wishlist est vide.</p>";
    return;
  }

  state.wishlist.forEach((wish) => {
    const item = document.createElement("details");
    item.classList.add("wishlist-item");

    const header = document.createElement("summary");
    header.classList.add("wishlist-item-header");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("wishlist-select-checkbox");
    checkbox.checked = selectedWishIds.has(wish.id);

    checkbox.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            selectedWishIds.add(wish.id);
        } else {
            selectedWishIds.delete(wish.id);
        }

        updateBulkPurchaseButton();
    });

    const name = document.createElement("span");
    name.textContent = wish.name;

    const end = document.createElement("span");
    end.classList.add("wishlist-item-end");

    const price = document.createElement("span");
    if (wish.estimatedPrice != null) {
      price.textContent = `${wish.estimatedPrice} €`;
      end.appendChild(price);
    }

    const chevron = document.createElement("span");
    chevron.classList.add("wishlist-chevron");
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = "⌄";

    end.appendChild(chevron);
    header.append(checkbox, name, end);
    const details = document.createElement("div");
    details.classList.add("wishlist-item-details");

    const type = document.createElement("p");
    type.textContent = `Type : ${wishTypeLabels[wish.type] ?? wish.type}`;

    const game = document.createElement("p");
    game.textContent = `Jeu : ${gameLabels[wish.game] ?? wish.game}`;

    const faction = document.createElement("p");
    faction.textContent = `Faction : ${wish.faction ?? "Non renseignée"}`;

    const quantity = document.createElement("p");
    quantity.textContent = `Quantité souhaitée : ${wish.quantity}`;

    details.append(type, quantity);

    if (wish.game) {
      details.append(game);
    }

    if (wish.faction) {
      details.append(faction);
    }
    item.append(header, details);

    const purchaseButton = document.createElement("button");
    purchaseButton.type = "button";
    purchaseButton.classList.add("wishlist-purchase-btn");
    purchaseButton.textContent = "Produit acquis";

    purchaseButton.addEventListener("click", () => {
      openPurchaseDrawer(wish);
    });

    details.appendChild(purchaseButton);

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.classList.add("wishlist-edit-btn");
    editButton.textContent = "Modifier";

    editButton.addEventListener("click", () => {
      openAddWishlistDrawer(wish);
    });

    details.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("wishlist-delete-btn");
    deleteButton.textContent = "Supprimer";

    details.appendChild(deleteButton);

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
