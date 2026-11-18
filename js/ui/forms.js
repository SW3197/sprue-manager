import { addExpense } from "../modules/budget.js";
import { openBudgetDrawer } from "../views/budgetDrawerView.js";
import { renderHomeView } from "../views/homeView.js";

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