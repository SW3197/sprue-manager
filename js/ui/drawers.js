import { setupAddMiniatureForm } from "./forms.js";
import { state } from "../state.js";

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