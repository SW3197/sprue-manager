const loginView = document.getElementById("login-view");
const signupView = document.getElementById("signup-view");
const confirmEmailView = document.getElementById("confirm-email-view");
const appContainer = document.getElementById("app-container");

export function showLogin() {
  loginView.classList.remove("hidden");
  appContainer.classList.add("hidden");
  signupView.classList.add("hidden");
  confirmEmailView.classList.add("hidden");
}

export function showSignup() {
  loginView.classList.add("hidden");
  signupView.classList.remove("hidden");
  appContainer.classList.add("hidden");
  confirmEmailView.classList.add("hidden");
}

export function showConfirmEmail() {
  loginView.classList.add("hidden");
  signupView.classList.add("hidden");
  confirmEmailView.classList.remove("hidden");
  appContainer.classList.add("hidden");
}

export function showApp() {
  loginView.classList.add("hidden");
  signupView.classList.add("hidden");
  appContainer.classList.remove("hidden");
  confirmEmailView.classList.add("hidden");
}