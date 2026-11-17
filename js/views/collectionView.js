import { deleteMiniature, updateMiniatureStatus } from "../modules/miniatures.js";
import { refreshCollection } from "../app.js";
import { gameLabels } from "../utils/games.js";
import { state } from "../state.js";

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

export function renderCollection(unitsToRender = state.units) {
    miniaturesGrid.innerHTML = "";

    unitsToRender.forEach(unit => {

        const card = `
            <div class="miniature-card">
                <h3>${unit.name} ${unit.nameSuffix || ""}</h3>

                <p>${gameLabels[unit.game] || unit.game}</p>

                <p>Faction : ${unit.faction || "Non renseignée"}</p>

                <p>Figurines : ${unit.miniatureCount ?? "Non renseigné"}</p>

                <p>Statut : ${unit.status}</p>
            </div>
        `;
        miniaturesGrid.innerHTML += card;
    });
}

//Récuperer le container
//Parcourir les figurines
//Générer du HTML