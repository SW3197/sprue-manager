//Point d'entrée dans l'application.
//Il initialise les données, les vues,
//les écouteurs d'événement.
import { state } from "./state.js";
import { loadState } from "./storage.js";
import { renderCollection } from "./views/collectionView.js";
import { openAddMiniatureDrawer } from "./ui/drawers.js";
import { getFilteredMiniatures } from "./modules/miniatures.js";
import { renderHomeView } from "./views/homeView.js";
import { closeDrawer } from "./ui/drawers.js";
import { closeModal } from "./ui/modals.js";

function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeDrawer();
            closeModal();
        }
    });
}

loadState();

renderHomeView();
refreshCollection();

setupKeyboardShortcuts();

const homeBtn = document.getElementById("home-btn");
const collectionBtn = document.getElementById("collection-btn");

const homeView = document.getElementById("home-view");
const collectionView = document.getElementById("collection-view");

function showView(viewName){
    
    closeDrawer();

    homeView.classList.add("hidden");
    collectionView.classList.add("hidden");

    if(viewName ==="home"){
        homeView.classList.remove("hidden");
    }

    if(viewName ==="collection"){
        collectionView.classList.remove("hidden");
    }
}

homeBtn.addEventListener("click", () => {
    renderHomeView();
    showView("home");
});

collectionBtn.addEventListener("click", () => {
    showView("collection");
});

const addMiniatureBtn = document.getElementById("add-miniature-btn");

addMiniatureBtn.addEventListener("click", () => {
    openAddMiniatureDrawer();
});

const gameFilter = document.getElementById("game-filter");
const statusFilter = document.getElementById("status-filter");

export function refreshCollection() {
    const filteredMiniatures = getFilteredMiniatures();
    renderCollection(filteredMiniatures);
}

gameFilter.addEventListener("change", () => {
    state.filters.game = gameFilter.value;
    refreshCollection();
});

statusFilter.addEventListener("change", () => {
    state.filters.status = statusFilter.value;
    refreshCollection();
});

export function syncCollectionFiltersUI() {
    const statusFilter = document.getElementById("status-filter");
    const gameFilter = document.getElementById("game-filter");

    statusFilter.value = state.filters.status;
    gameFilter.value = state.filters.game;
}

export function showCollectionViewWithStatusFilter(status) {
    state.filters.status = status;

    syncCollectionFiltersUI();

    showView("collection");
    refreshCollection();
}