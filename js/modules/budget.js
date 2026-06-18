/* Dépenses hors figurines :
peintures, pinceaux, matériel,
décors, etc.
*/

import { state } from "../state.js";
import { saveState } from "../storage.js";
import { createId } from "../utils/ids.js";
import { openBudgetDrawer } from "../views/budgetDrawerView.js";

export function addExpense(name, price) {
    const expense = {
        id: createId(),
        name,
        price: Number(price)
    };

    state.expenses.push(expense);

    saveState();
}

export function getMiniaturesTotal() {
    return state.miniatures.reduce((total, miniature) => {
        return total + Number(miniature.price ||0);
    }, 0);
}

export function getExpensesTotal() {
    return state.expenses.reduce((total, expense) => {
        return total + Number(expense.price || 0);
    }, 0);
}

export function getBudgetTotal() {
    return getMiniaturesTotal() + getExpensesTotal();
}

export function deleteExpense(expenseId) {
    state.expenses = state.expenses.filter((expense) => {
        return expense.id !== expenseId;
    });
    saveState();
}