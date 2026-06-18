import { getBudgetTotal, getExpensesTotal } from "../modules/budget.js";
import { openBudgetDrawer } from "./budgetDrawerView.js";
import { getRatioSummary } from "../modules/ratio.js";
import { openRatioModal } from "./ratioModalView.js";
import { openPaintingTimeDrawer } from "./paintingTimeDrawerView.js";
import { getPaintingTotalMinutes } from "../modules/paintingSessions.js";
import { formatDuration } from "../modules/paintingSessions.js";

export function renderPaintingCard() {
    const paintingCardContainer = document.getElementById("painting-card-container");
    const totalMinutes = getPaintingTotalMinutes();
    const formattedTotal = formatDuration(totalMinutes);

    paintingCardContainer.innerHTML = `
        <article class="dashboard-card" id="painting-card">
            <h2>Temps de peinture</h2>
            
            <p class="dashboard-card-value">
                ${formattedTotal}
            </p>
            <p class="dashboard-card-detail">
                Temps cumulé de peinture
            </p>

        </article>
    `;

    const paintingCard = document.getElementById("painting-card");

    paintingCard.addEventListener("click", () => {
        openPaintingTimeDrawer();
    })
}

function renderRatioCard() {
    const ratioCardContainer = document.getElementById("ratio-card-container");
    const ratio = getRatioSummary();

    ratioCardContainer.innerHTML = `
        <article class="dashboard-card" id="ratio-card">
            <h2>Ratio peint / possédé</h2>
            <p class="dashboard-card-value">
                ${ratio.painted} / ${ratio.total}
            </p>
            <p class="dashboard-card-detail">
                ${ratio.percentage} % de ta collection est peinte
            </p>
        </article>
    `;

    const ratioCard = document.getElementById("ratio-card");

    ratioCard.addEventListener("click", () => {
        openRatioModal();
    });
}

export function renderBudgetCard() {
    const budgetCardContainer = document.getElementById("budget-card-container");
    const totalBudgetValue = getBudgetTotal();

    budgetCardContainer.innerHTML = `
        <article class="dashboard-card" id="budget-card">
            <h2>Budget hobby</h2>
            <p>${totalBudgetValue.toFixed(2)} €</p>
            <p>Dépenses cumulées</p>
        </article>
    `;

    const budgetCard = document.getElementById("budget-card");

    budgetCard.addEventListener("click", () => {
        openBudgetDrawer();
    });
}

export function renderHomeView() {
    renderBudgetCard();
    renderPaintingCard();
    renderRatioCard();
}