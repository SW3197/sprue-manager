//Point d'entrée dans l'application.
//Il initialise les données, les vues,
//les écouteurs d'événement.

// =======================================
// IMPORTS
//========================================

import { state } from "./state.js";
import { loadState, loadStateFromCloud, clearLocalState, saveStateToCloud } from "./storage.js";
import { renderCollection } from "./views/collectionView.js";
import { openAddMiniatureDrawer } from "./ui/drawers.js";
import { getFilteredMiniatures } from "./modules/miniatures.js";
import { renderHomeView } from "./views/homeView.js";
import { closeDrawer } from "./ui/drawers.js";
import { closeModal, requestCloseModal } from "./ui/modals.js";
import { supabase, signIn, signOut, signUp, onAuthStateChange } from "./supabase.js";
import { showLogin, showSignup, showConfirmEmail, showApp } from "./authUI.js"
import { openGuestWarningModal } from "./views/guestWarningModalView.js";
import { openPasswordResetRequestModal, openPasswordResetModal } from "./views/passwordResetModalView.js";

let isLoggedIn = false;

// =======================================
//ÉLÉMENTS DU DOM - Authentification
// =======================================

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const loginButton = document.getElementById("login-button");
const loginEmailInput = document.getElementById("login-email");

const cancelLoginButton = document.getElementById("cancel-login-button");

const signupForm = document.getElementById("signup-form");
const signupButton = document.getElementById("signup-button");
const cancelSignupButton = document.getElementById("cancel-signup-button");
const signupError = document.getElementById("signup-error");

const continueAsGuestButton = document.getElementById("continue-as-guest-button");

const logoutButton = document.getElementById("logout-button");

const forgotPasswordButton = document.getElementById("forgot-password-button");

// =======================================
//ÉLÉMENTS DU DOM - Application
// =======================================

const homeBtn = document.getElementById("home-btn");
const collectionBtn = document.getElementById("collection-btn");

const homeView = document.getElementById("home-view");
const collectionView = document.getElementById("collection-view");

const addMiniatureBtn = document.getElementById("add-miniature-btn");

// =======================================
//ÉLÉMENTS DU DOM - Filtres
// =======================================

const gameFilter = document.getElementById("game-filter");
const statusFilter = document.getElementById("status-filter");

// =======================================
// FONCTIONS D'AFFICHAGE
// =======================================

function updateAuthUI(isLoggedIn) {
  if (isLoggedIn) {
    loginButton.classList.add("hidden");
    logoutButton.classList.remove("hidden");
  } else {
    loginButton.classList.remove("hidden");
    logoutButton.classList.add("hidden");
  }
}

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

// =======================================
// FONCTIONS COLLECTION
// =======================================

export function refreshCollection() {
  const filteredMiniatures = getFilteredMiniatures();
  renderCollection(filteredMiniatures);
}

export function syncCollectionFiltersUI() {
  statusFilter.value = state.filters.status;
  gameFilter.value = state.filters.game;
}

export function showCollectionViewWithStatusFilter(status) {
  state.filters.status = status;

  syncCollectionFiltersUI();

  showView("collection");
  refreshCollection();
}

// =======================================
// ÉVÉNEMENTS - Authentification
// =======================================

loginButton.addEventListener("click", () => {
  showLogin();
});

cancelLoginButton.addEventListener("click", () => {
  showApp();
});

signupButton.addEventListener("click", () => {
  showSignup();
});

cancelSignupButton.addEventListener("click", () => {
  showLogin();
});

continueAsGuestButton.addEventListener("click", () => {
  showApp();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginError.textContent = "";

  const email = loginEmailInput.value.trim();
  const password = document.getElementById("login-password").value;

  const user = await signIn(email, password);

  if (!user) {
    loginError.textContent = "E-mail ou mot de passe incorrect.";
    return;
  }

  await loadStateFromCloud();

  renderHomeView();
  refreshCollection();

  isLoggedIn = true;
  updateAuthUI(isLoggedIn);
  showApp();
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  signupError.textContent = "";

  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  const user = await signUp(email, password);

  if (!user) {
    signupError.textContent = "Impossible de créer le compte.";
    return;
  }

  showConfirmEmail();
});

logoutButton.addEventListener("click", async () => {
  const success = await signOut();

  if (!success) {
    console.error("La déconnexion a échoué.");
    return;
  }

  clearLocalState();

  renderHomeView();
  refreshCollection();

  isLoggedIn = false;
  updateAuthUI(isLoggedIn);
  showApp();
});

forgotPasswordButton.addEventListener("click", () => {
  const email = loginEmailInput.value.trim();

  openPasswordResetRequestModal(email);
});

// =======================================
// ÉVÉNEMENTS - Navigation
// =======================================

homeBtn.addEventListener("click", () => {
  renderHomeView();
  showView("home");
});

collectionBtn.addEventListener("click", () => {
  showView("collection");
});

// =======================================
// ÉVÉNEMENTS - Miniatures
// =======================================

addMiniatureBtn.addEventListener("click", () => {
    openAddMiniatureDrawer();
});

// =======================================
// ÉVÉNEMENTS - Filtres
// =======================================

gameFilter.addEventListener("change", () => {
  state.filters.game = gameFilter.value;
  refreshCollection();
});

statusFilter.addEventListener("change", () => {
  state.filters.status = statusFilter.value;
  refreshCollection();
});

// =======================================
// INITIALISATION DE L'APP
// =======================================

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDrawer();
      requestCloseModal();
    }
  });
}

async function initApp() {
  loadState();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  isLoggedIn = session !== null;

  if (session) {
    const cloudStatus = await loadStateFromCloud();

    if (cloudStatus === "empty") {
      await saveStateToCloud();
    }
  }

  updateAuthUI(isLoggedIn);

  renderHomeView();
  refreshCollection();
  setupKeyboardShortcuts();

  showApp();
  if (!isLoggedIn) {
    openGuestWarningModal(
      () => {
        showLogin();
      },
      () => {
        showSignup();
      }
    );
  }
}

onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") {
    openPasswordResetModal(async () => {
      const success = await signOut();

      if (!success) {
        console.error("La déconnexion a échoué.");
        return;
      }

      clearLocalState();

      isLoggedIn = false;
      closeModal();
      showLogin();
    });
  }
});

initApp();
