import { openModal, closeModal } from "../ui/modals.js";

export function openGuestWarningModal(onLogin, onSignup) {
    openModal(`
        <h2>Bienvenue sur Sprue Manager</h2>
        
        <p>
            Vous utilisez actuellement Sprue Manager en mode visiteur.
            Vos données sont enregistrées uniquement sur cet appareil.
        </p>
        
        <p>
            Si vous avez déjà un compte, connectez-vous pour 
            retrouver vos données et profiter de la sauvegarde 
            en ligne.
        </p>
        
        <button id="guest-login-button">Se connecter</button>
        
        <button id="continue-as-guest-modal-button">
            Continuer en mode visiteur
        </button>
        
        <p>Vous n'avez pas encore de compte ?</p>
        
        <button id="guest-signup-button">
            Créer un compte
        </button>
    `, {
        closable: false,
    });

    const continueAsGuestButton = document.getElementById("continue-as-guest-modal-button");

    continueAsGuestButton.addEventListener("click", () => {
        closeModal();
    });

    const guestLoginButton = document.getElementById("guest-login-button");

    guestLoginButton.addEventListener("click", () => {
        closeModal();
        onLogin();
    });

    const guestSignupButton = document.getElementById("guest-signup-button");

    guestSignupButton.addEventListener("click", () => {
        closeModal();
        onSignup();
    });
}