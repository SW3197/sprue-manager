import { setupAddMiniatureForm } from "./forms.js";
import { state } from "../state.js";
import { saveState } from "../storage.js";
import { renderWishlist } from "../views/wishlistView.js";

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
