import { state } from "../state.js";
import { saveState } from "../storage.js";
import { openAddWishlistDrawer } from "../ui/drawers.js";

export function renderWishlist() {
  const wishlistGrid = document.getElementById("wishlist-grid");

  wishlistGrid.innerHTML = "";

  if (state.wishlist.length === 0) {
    wishlistGrid.innerHTML = "<p>Votre wishlist est vide.</p>";
    return;
  }

  state.wishlist.forEach((wish) => {
    const item = document.createElement("details");
    item.classList.add("wishlist-item");

    const header = document.createElement("summary");
    header.classList.add("wishlist-item-header");

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
    header.append(name, end);
    const details = document.createElement("div");
    details.classList.add("wishlist-item-details");

    const type = document.createElement("p");
    type.textContent = `Type : ${wish.type}`;

    const game = document.createElement("p");
    game.textContent = `Jeu : ${wish.game ?? "Non renseigné"}`;

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
