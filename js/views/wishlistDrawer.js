import { openDrawer, closeDrawer } from "../ui/drawers.js";
import { state } from "../state.js";
import { saveState } from "../storage.js";
import { renderWishlist } from "./wishlistView.js";

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
    document.getElementById("wishlist-type").value = wishToEdit.type;
    document.getElementById("wishlist-name").value = wishToEdit.name;
    document.getElementById("wishlist-quantity").value = wishToEdit.quantity;
    document.getElementById("wishlist-price").value =
      wishToEdit.estimatedPrice ?? "";
    document.getElementById("wishlist-game").value = wishToEdit.game ?? "";
    document.getElementById("wishlist-faction").value =
      wishToEdit.faction ?? "";
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

  if (isEditing) {
    typeSelect.dispatchEvent(new Event("change"));
    }

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