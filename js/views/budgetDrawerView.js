import { state } from "../state.js";
import { getMiniaturesTotal } from "../modules/budget.js";
import { getExpensesTotal } from "../modules/budget.js";
import { getBudgetTotal } from "../modules/budget.js";
import { openDrawer } from "../ui/drawers.js";
import { setupAddExpenseForm } from "../ui/forms.js";
import { renderHomeView } from "./homeView.js";
import { deleteExpense } from "../modules/budget.js";

export function setupDeleteExpenseButtons() {
    const buttons = document.querySelectorAll(".delete-expense-btn");
    
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const expenseId = Number(button.dataset.expenseId);

            deleteExpense(expenseId);

            renderHomeView();
            openBudgetDrawer();
        });
    });
}

export function openBudgetDrawer() {

    const miniatureItems = state.miniatures.map((miniature) => {
        return `
            <li class="miniature-item">
                <span>${miniature.name}</span>
                <strong>${Number(miniature.price || 0).toFixed(2)} €</strong>
            </li>
        `;
    }).join("");

    const miniaturesTotal = getMiniaturesTotal();

    const expensesTotal = getExpensesTotal();

    const expenseItems = state.expenses.map((expense) => {
        return `
            <li class="expense-item">
                <span class="expense-name">${expense.name}</span>
                <strong class="expense-price">${Number(expense.price || 0).toFixed(2)} €</strong>
                <button
                    class="delete-expense-btn"
                    data-expense-id="${expense.id}"
                >
                X
                </button>
            </li>
        `;
    }).join("");

    const globalTotal = getBudgetTotal();

    openDrawer(`
        <h2>Budget hobby</h2>
        
        <p class="budget-total">Total global = ${globalTotal.toFixed(2)} €</p>

        <form id="add-expense-form" class="budget-form">
            <input
                type="text"
                id="expense-name"
                placeholder="Nom de la dépense"
            >

            <input
                type="number"
                id="expense-price"
                placeholder="Prix"
                min="0"
                step="0.01"
            >

            <button type="submit">
                Ajouter
            </button>

        </form>

        <div class="budget-columns">
            <section class="budget-column">
                <h3>Figurines</h3>
                <p>Total figurines : ${miniaturesTotal.toFixed(2)} €</p>

                <label>
                    Trier :
                    <select id="miniatures-budget-sort">
                        <option value="newest">Plus récent</option>
                        <option value="oldest">Plus ancien</option>
                        <option value="price-desc">Prix décroissant</option>
                        <option value="price-asc">Prix croissant</option>
                    </select>
                </label>

                <ul>
                    ${miniatureItems || "<li>Aucune figurine enregistrée pour le moment</li>"}
                </ul>
            </section>

            <section class="budget-column">
                <h3>Dépenses hobby</h3>
                <p>Total hobby : ${expensesTotal.toFixed(2)}€</p>

                <label>
                    Trier :
                    <select id="expenses-budget-sort">
                        <option value="newest">Plus récent</option>
                        <option value="oldest">Plus ancien</option>
                        <option value="price-desc">Prix décroissant</option>
                        <option value="price-asc">Prix croissant</option>
                    </select>
                </label>

                <ul>
                    ${expenseItems || "<li>Aucune dépense enregistrée pour le moment</li>"}
                </ul>
            </section>
        </div>

    `, "drawer-wide");

    setupAddExpenseForm();

    setupDeleteExpenseButtons();
    
}

//TODO : brancher les filtres