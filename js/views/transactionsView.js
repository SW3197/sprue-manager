import { state } from "../state.js";

export function renderTransactions() {
  const transactionsList = document.getElementById("transactions-list");

  transactionsList.replaceChildren();

  if (state.transactions.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Aucune transaction enregistrée.";

    transactionsList.appendChild(emptyMessage);
    return;
  }

  // Trier les transactions de la plus récente à la plus ancienne
  const sortedTransactions = [...state.transactions].sort((a, b) => {
        // Les transactions sans date sont placées à la fin
        if (!a.date && !b.date) {
            return b.createdAt.localeCompare(a.createdAt);
        }

        if (!a.date) return 1;
        if (!b.date) return -1;

        // Trier les dates connues de la plus récente à la plus ancienne
        const dateComparison = b.date.localeCompare(a.date);

        if (dateComparison !== 0) {
            return dateComparison;
        }

        // Départager les transactions ayant la même date
        return b.createdAt.localeCompare(a.createdAt);
    });

  sortedTransactions.forEach((transaction) => {
    // Carte dépliable
    const card = document.createElement("details");
    card.classList.add("transaction-card");

    // En-tête cliquable
    const summary = document.createElement("summary");
    summary.classList.add("transaction-summary");

    const type = document.createElement("span");
    type.classList.add("transaction-type");
    type.textContent = "🛒 Achat";

    const date = document.createElement("span");
    date.classList.add("transaction-date");

    date.textContent = transaction.date
      ? new Date(`${transaction.date}T00:00:00`).toLocaleDateString("fr-FR")
      : "Date inconnue";

    const amount = document.createElement("span");
    amount.classList.add("transaction-amount");

    amount.textContent = transaction.total.toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR"
    });

    summary.append(type, date, amount);

    // Contenu dépliable (à compléter à l'étape suivante)
    const content = document.createElement("div");
    content.classList.add("transaction-content");

    // Afficher les unités achetées individuellement
    transaction.items
    .filter((item) => item.type === "unit")
    .forEach((item) => {
        const purchasedUnits = state.units.filter(
        (unit) =>
            unit.purchaseId === transaction.id &&
            unit.purchaseItemId === item.id
        );

        purchasedUnits.forEach((unit) => {
        const unitRow = document.createElement("div");
        unitRow.classList.add("transaction-unit");

        const unitInfo = document.createElement("div");
        unitInfo.classList.add("transaction-unit-info");

        const unitName = document.createElement("strong");
        unitName.textContent = [unit.name, unit.nameSuffix]
            .filter(Boolean)
            .join(" ");

        const miniatureCount = document.createElement("span");
        miniatureCount.textContent =
            `${unit.miniatureCount} figurine${unit.miniatureCount > 1 ? "s" : ""}`;

        unitInfo.append(unitName, miniatureCount);

        const unitPrice = document.createElement("span");
        unitPrice.classList.add("transaction-unit-price");

        unitPrice.textContent = item.isGift
            ? "Cadeau"
            : item.unitPrice.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
            });

        unitRow.append(unitInfo, unitPrice);
        content.appendChild(unitRow);
        });
    });

    card.append(summary, content);
    transactionsList.appendChild(card);
  });
}