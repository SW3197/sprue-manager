/* Gère uniquement le stockage des données.
Pour l'instant en localStorage, plus tard
à revoir pour un accès sur plusieurs appareils.
*/

import { state } from "./state.js";

const STORAGE_KEY = "sprue-manager-state";

export function saveState() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );

}

export function loadState() {
    const savedState = localStorage.getItem(STORAGE_KEY);

    if (!savedState) return;

    const parsedState = JSON.parse(savedState);

    state.miniatures = parsedState.miniatures || [];

    state.expenses = parsedState.expenses || [];

    state.paintingSessions = parsedState.paintingSessions || [];

    state.filters = parsedState.filters || {
        game: "all",
        status: "all"
    };
}