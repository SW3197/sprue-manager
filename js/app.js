//Point d'entrée dans l'application.
//Il initialise les données, les vues,
//les écouteurs d'événement.
import { state } from "./state.js";
import { loadState, loadStateFromCloud } from "./storage.js";
import { renderCollection } from "./views/collectionView.js";
import { openAddMiniatureDrawer } from "./ui/drawers.js";
import { getFilteredMiniatures } from "./modules/miniatures.js";
import { renderHomeView } from "./views/homeView.js";
import { closeDrawer } from "./ui/drawers.js";
import { closeModal } from "./ui/modals.js";
import { supabase, signIn } from "./supabase.js";

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDrawer();
      closeModal();
    }
  });
}

async function initApp() {
  loadState();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    showLogin();
    return;
  }

  await loadStateFromCloud();

  renderHomeView();
  refreshCollection();
  setupKeyboardShortcuts();

  showApp();
}

const loginView = document.getElementById("login-view");
const appContainer = document.getElementById("app-container");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginError.textContent = "";

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const user = await signIn(email, password);

  if (!user) {
    loginError.textContent = "E-mail ou mot de passe incorrect.";
    return;
  }

  await loadStateFromCloud();

  renderHomeView();
  refreshCollection();
  setupKeyboardShortcuts();

  showApp();
});

function showLogin() {
  loginView.classList.remove("hidden");
  appContainer.classList.add("hidden");
}

function showApp() {
  loginView.classList.add("hidden");
  appContainer.classList.remove("hidden");
}

initApp();

loadState();

renderHomeView();
refreshCollection();

setupKeyboardShortcuts();

const homeBtn = document.getElementById("home-btn");
const collectionBtn = document.getElementById("collection-btn");

const homeView = document.getElementById("home-view");
const collectionView = document.getElementById("collection-view");

function showView(viewName) {
  closeDrawer();

  homeView.classList.add("hidden");
  collectionView.classList.add("hidden");

  if (viewName === "home") {
    homeView.classList.remove("hidden");
  }

  if (viewName === "collection") {
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
