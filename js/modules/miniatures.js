/* Ajout, modification, suppression et 
filtrage des figurines.
*/
import { state } from "../state.js";
import { saveState } from "../storage.js";

export function addMiniature(miniature) {
    state.miniatures.push(miniature);

    saveState();
}

export function deleteMiniature(id) {
    state.miniatures = state.miniatures.filter((miniature) => {
        return miniature.id !== id;
    });

    saveState();
}

export function updateMiniatureStatus(id, newStatus) {
    const miniature = state.miniatures.find((miniature) => {
        return miniature.id === id;
    });

    if (!miniature) return;

    miniature.status = newStatus;

    saveState();
}

export function getFilteredMiniatures() {
    return state.miniatures.filter((miniature) => {
        const matchGame = 
            state.filters.game === "all" || miniature.game === state.filters.game;

        const matchStatus = 
            state.filters.status === "all" || miniature.status === state.filters.status;

        return matchGame && matchStatus;
    });
}