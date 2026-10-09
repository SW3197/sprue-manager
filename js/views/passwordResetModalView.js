import { openModal } from "../ui/modals.js";
import { resetPassword, updatePassword } from "../supabase.js";

export function openPasswordResetRequestModal(email = "") {
    const content = `
        <div class="password-reset-request">
            <h2>Mot de passe oublié ?</h2>
            
            <p>
                Saisissez l'adresse email associée à votre compte.
                Nous vous enverrons un lien permettant de réinitialiser votre mot de passe.
            </p>
            
            <form id="password-reset-request-form">
                <label for="password-reset-email">Adresse email</label>
                
                <input
                    type="email"
                    id="password-reset-email"
                    value="${email}"
                    required
                >
                
                <button type="submit">
                    Envoyer le lien
                </button>
                
            </form>

            <p id="password-reset-request-message"></p>

        </div>
    `;

    openModal(content);

    const form = document.getElementById("password-reset-request-form");
    const emailInput = document.getElementById("password-reset-email");
    const submitButton = form.querySelector('button[type="submit"]');
    const message = document.getElementById("password-reset-request-message");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        submitButton.disabled = true;
        submitButton.textContent = "Envoi en cours...";

        try {
            await resetPassword(email);
            message.textContent = "Si un compte correspond à cette adresse, un email de réinitialisation a été envoyé.";
        } catch (error) {
            message.textContent = "Impossible d'envoyer l'email de réinitialisation. Réessayez plus tard.";

            submitButton.disabled = false;
            submitButton.textContent = "Envoyer le lien";
        }
    });
}

export function openPasswordResetModal(onReturnToLogin) {
    const content = `
        <div class="password-reset">
            <h2>Nouveau mot de passe</h2>
            
            <p id="password-reset-instructions">
                Choisissez un nouveau mot de passe pour votre compte.
            </p>
            
            <form id="password-reset-form" class="password-reset-form">
                <label for="new-password">Nouveau mot de passe</label>
                <input
                    type="password"
                    id="new-password"
                    required
                >
                
                <label for="confirm-new-password">Confirmer le nouveau mot de passe</label>
                <input
                    type="password"
                    id="confirm-new-password"
                    required
                >

                <p id="password-reset-message"></p>

                <button type="submit">
                    Modifier mon mot de passe
                </button>
            </form>

            <button
                type="button"
                id="password-reset-success-button"
                class="hidden"
            >
                Retour à la connexion
            </button>
        </div>
    `;

    openModal(content, {
        closable: false,
    });

    const form = document.getElementById("password-reset-form");
    const instructions = document.getElementById("password-reset-instructions");
    const passwordInput = document.getElementById("new-password");
    const confirmPasswordInput = document.getElementById("confirm-new-password");
    const message = document.getElementById("password-reset-message");
    const successButton = document.getElementById("password-reset-success-button");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
            message.textContent = "Les mots de passe ne correspondent pas.";
            return;
        }

        try {
            await updatePassword(password);
            message.textContent = "Votre mot de passe a bien été modifié.";
            form.classList.add("hidden");
            instructions.classList.add("hidden");
            successButton.classList.remove("hidden");
        } catch (error) {
            message.textContent = "Impossible de modifier le mot de passe. Vérifiez qu'il est différent de l'ancien et qu'il respecte les critères requis.";
        }

        message.textContent = "";
    });

    successButton.addEventListener("click", () => {
        onReturnToLogin();
    });
}