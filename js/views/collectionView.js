import { deleteMiniature, updateMiniatureStatus } from "../modules/miniatures.js";
import { refreshCollection } from "../app.js";
import { gameLabels } from "../utils/games.js";

const miniaturesGrid = document.getElementById("miniatures-grid");

function setupDeleteButtons() {
    const deleteButtons = document.querySelectorAll(".delete-miniature-btn");

    deleteButtons.forEach((button) => {

        button.addEventListener("click", () => {
            
        const id = Number(button.dataset.id);
        deleteMiniature(id);
        refreshCollection();
        });
    });
}

function setupStatusSelects() {
    const statusSelects = document.querySelectorAll(".status-select");

    statusSelects.forEach((select) => {
        select.addEventListener("change", () => {
            const id = Number(select.dataset.id);
            const newStatus = select.value;

            updateMiniatureStatus(id, newStatus);
            refreshCollection();
        });
    });
}

export function renderCollection(miniaturesToRender = miniatures) {
    miniaturesGrid.innerHTML = "";

    miniaturesToRender.forEach(miniature => {

        const card = `
        <div class = "miniature-card">

        <h3>${miniature.name}</h3>
        <p>${gameLabels[miniature.game] || miniature.game}</p>

        <select
            class="status-select"
            data-id="${miniature.id}"
            >
            <option value="boxed" ${miniature.status === "boxed" ? "selected" : ""}>
            Boîte
            </option>

            <option value="assembled" ${miniature.status === "assembled" ? "selected" : ""}>
            Assemblée
            </option>

            <option value="primed" ${miniature.status === "primed" ? "selected" : ""}>
            Sous-couchée
            </option>

            <option value="painted" ${miniature.status === "painted" ? "selected" : ""}>
            Peinte
            </option>

        </select>

        <br>

        <button
            class="delete-miniature-btn"
            data-id="${miniature.id}"
        >
        Supprimer
        </button>

        </div>
        `;

        miniaturesGrid.innerHTML += card;

        setupDeleteButtons();
        setupStatusSelects();
    });
}

//Récuperer le container
//Parcourir les figurines
//Générer du HTML