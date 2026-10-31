//Point d'entrée dans l'application.
//Il initialise les données, les vues,
//les écouteurs d'événement.

// =======================================
// IMPORTS
//========================================

import { state } from "./state.js";
import {
  loadState,
  loadStateFromCloud,
  clearLocalState,
  saveStateToCloud,
} from "./storage.js";
import { renderCollection } from "./views/collectionView.js";
import { openAddMiniatureDrawer, openAddWishlistDrawer } from "./ui/drawers.js";
import { getFilteredMiniatures } from "./modules/miniatures.js";
import { renderHomeView } from "./views/homeView.js";
import { closeDrawer } from "./ui/drawers.js";
import { closeModal, requestCloseModal } from "./ui/modals.js";
import {
  supabase,
  signIn,
  signOut,
  signUp,
  onAuthStateChange,
} from "./supabase.js";
import { showLogin, showSignup, showConfirmEmail, showApp } from "./authUI.js";
import { openGuestWarningModal } from "./views/guestWarningModalView.js";
import {
  openPasswordResetRequestModal,
  openPasswordResetModal,
} from "./views/passwordResetModalView.js";
import { renderWishlist } from "./views/wishlistView.js";

let isLoggedIn = false;
let isPasswordRecovery = false;

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

const continueAsGuestButton = document.getElementById(
  "continue-as-guest-button",
);

const logoutButton = document.getElementById("logout-button");

const forgotPasswordButton = document.getElementById("forgot-password-button");

// =======================================
//ÉLÉMENTS DU DOM - Application
// =======================================

const homeBtn = document.getElementById("home-btn");
const collectionBtn = document.getElementById("collection-btn");
const sessionsBtn = document.getElementById("sessions-btn");
const budgetBtn = document.getElementById("budget-btn");
const goalsBtn = document.getElementById("goals-btn");
const eventsBtn = document.getElementById("events-btn");

const homeView = document.getElementById("home-view");
const collectionView = document.getElementById("collection-view");

const transactionsView = document.getElementById("transactions-view");

const addMiniatureBtn = document.getElementById("add-miniature-btn");

const collectionPage = document.getElementById("collection-page");
const sessionsPage = document.getElementById("sessions-page");
const budgetPage = document.getElementById("budget-page");
const goalsPage = document.getElementById("goals-page");
const eventsPage = document.getElementById("events-page");

const unitsTab = document.getElementById("units-tab");
const transactionsTab = document.getElementById("transactions-tab");
const wishlistTab = document.getElementById("wishlist-tab");

const wishlistView = document.getElementById("wishlist-view");

const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const appSidebar = document.querySelector(".app-sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");

const addWishlistBtn = document.getElementById("add-wishlist-btn");

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
  collectionPage.classList.add("hidden");
  sessionsPage.classList.add("hidden");
  budgetPage.classList.add("hidden");
  goalsPage.classList.add("hidden");
  eventsPage.classList.add("hidden");

  if (viewName === "home") {
    homeView.classList.remove("hidden");
  }

  if (viewName === "collection") {
    collectionPage.classList.remove("hidden");
  }

  if (viewName === "sessions") {
    sessionsPage.classList.remove("hidden");
  }

  if (viewName === "budget") {
    budgetPage.classList.remove("hidden");
  }

  if (viewName === "goals") {
    goalsPage.classList.remove("hidden");
  }

  if (viewName === "events") {
    eventsPage.classList.remove("hidden");
  }

  // Mettre à jour le bouton de navigation actif
  const navButtons = [
    homeBtn,
    collectionBtn,
    sessionsBtn,
    budgetBtn,
    goalsBtn,
    eventsBtn,
  ];

  navButtons.forEach((button) => {
    button.classList.remove("active");
  });

  const activeButton = {
    home: homeBtn,
    collection: collectionBtn,
    sessions: sessionsBtn,
    budget: budgetBtn,
    goals: goalsBtn,
    events: eventsBtn,
  }[viewName];

  if (activeButton) {
    activeButton.classList.add("active");
  }

  // Refermer le menu mobile après navigation
  appSidebar.classList.remove("open");

  mobileMenuBtn.setAttribute("aria-expanded", "false");
  mobileMenuBtn.setAttribute("aria-label", "Ouvrir le menu de navigation");
  sidebarOverlay.classList.add("hidden");
}

function showCollectionTab(tabName) {
  collectionView.classList.add("hidden");
  transactionsView.classList.add("hidden");
  wishlistView.classList.add("hidden");

  if (tabName === "units") {
    collectionView.classList.remove("hidden");
  }

  if (tabName === "transactions") {
    transactionsView.classList.remove("hidden");
  }

  if (tabName === "wishlist") {
    wishlistView.classList.remove("hidden");
  }

  // Mettre à jour l'onglet actif
  const tabs = [unitsTab, transactionsTab, wishlistTab];

  tabs.forEach((tab) => {
    tab.classList.remove("active");
  });

  const activeTab = {
    units: unitsTab,
    transactions: transactionsTab,
    wishlist: wishlistTab,
  }[tabName];

  if (activeTab) {
    activeTab.classList.add("active");
  }
}

// =======================================
// FONCTIONS COLLECTION
// =======================================

export function refreshCollection() {
  //TODO V2 : affichage des unités
}

export function syncCollectionFiltersUI() {
  statusFilter.value = state.filters.status;
  gameFilter.value = state.filters.game;
}

export function showCollectionViewWithStatusFilter(status) {
  state.filters.status = status;

  syncCollectionFiltersUI();

  showView("collection");
  showCollectionTab("units");
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
  showCollectionTab("units");
});

sessionsBtn.addEventListener("click", () => {
  showView("sessions");
});

budgetBtn.addEventListener("click", () => {
  showView("budget");
});

goalsBtn.addEventListener("click", () => {
  showView("goals");
});

eventsBtn.addEventListener("click", () => {
  showView("events");
});

unitsTab.addEventListener("click", () => {
  showCollectionTab("units");
});

transactionsTab.addEventListener("click", () => {
  showCollectionTab("transactions");
});

wishlistTab.addEventListener("click", () => {
  renderWishlist();
  showCollectionTab("wishlist");
});

addWishlistBtn.addEventListener("click", () => {
  openAddWishlistDrawer();
});

mobileMenuBtn.addEventListener("click", () => {
  const isOpen = appSidebar.classList.toggle("open");
  sidebarOverlay.classList.toggle("hidden", !isOpen);

  mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
  mobileMenuBtn.setAttribute(
    "aria-label",
    isOpen ? "Fermer le menu de navigation" : "Ouvrir le menu de navigation",
  );
});

sidebarOverlay.addEventListener("click", () => {
  appSidebar.classList.remove("open");
  sidebarOverlay.classList.add("hidden");

  mobileMenuBtn.setAttribute("aria-expanded", "false");
  mobileMenuBtn.setAttribute("aria-label", "Ouvrir le menu de navigation");
});

// =======================================
// ÉVÉNEMENTS - Miniatures
// =======================================

addMiniatureBtn.addEventListener("click", () => {
  // TODO V2 : ouvrir le formulaire d'ajout d'unité ou d'achat
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

  showView("home");
  showApp();
  if (!isLoggedIn && !isPasswordRecovery) {
    openGuestWarningModal(
      () => {
        showLogin();
      },
      () => {
        showSignup();
      },
    );
  }
}

onAuthStateChange((event) => {
  console.log("Événement Supabase :", event);

  if (event === "PASSWORD_RECOVERY") {
    isPasswordRecovery = true;

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
