import { createId } from "../utils/ids.js";
import { addMiniature } from "../modules/miniatures.js";
import { refreshCollection } from "../app.js";
import { closeDrawer } from "./drawers.js";
import { addExpense } from "../modules/budget.js";
import { openBudgetDrawer } from "../views/budgetDrawerView.js";
import { renderHomeView } from "../views/homeView.js";

export function setupAddMiniatureForm() {
    const form = document.getElementById("add-miniature-form");
    form.addEventListener("submit", event => {
        event.preventDefault();

        const nameInput = document.getElementById("miniature-name");
        const gameSelect = document.getElementById("miniature-game");
        const priceInput = document.getElementById("miniature-price");
        const price = Number(priceInput.value) || 0;
        const newMiniature = {
            id: createId(),
            name: nameInput.value,
            game: gameSelect.value,
            status: "boxed",
            price
        };

       addMiniature(newMiniature);
       
       refreshCollection();
       
       closeDrawer();
    });
}

export function setupAddExpenseForm() {
    const form = document.getElementById("add-expense-form");

    if (!form) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const nameInput = document.getElementById("expense-name");
        const priceInput = document.getElementById("expense-price");

        addExpense(nameInput.value, priceInput.value);

        renderHomeView();
        openBudgetDrawer();
    });
}