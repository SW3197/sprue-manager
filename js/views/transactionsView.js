import { state } from "../state.js";
import { saveState } from "../storage.js";

function finalizePurchaseRemoval(transaction) {
    if (transaction.items.length === 0) {
        state.transactions = state.transactions.filter(
            (existingTransaction) =>
                existingTransaction.id !== transaction.id
        );
    } else {
        transaction.subtotal = transaction.items.reduce(
            (total, item) => {
                if (item.isGift) return total;

                return total + item.unitPrice * item.quantity;
            },
            0
        );

        transaction.total =
            transaction.subtotal + transaction.additionalCosts;
    }

    saveState();
    renderTransactions();
}

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
    const priceEditors = new Map();

    function createRemoveButton(onRemove) {
        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("transaction-remove-btn");
        button.title = "Retirer cet article";
        button.setAttribute("aria-label", "Retirer cet article");

        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg"
                width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 12h8"/>
            </svg>
        `;

        if (onRemove) {
            button.addEventListener("click", onRemove);
        }

        return button;
    }

    function createPriceEditor(item) {
        const editor = document.createElement("div");
        editor.classList.add("transaction-price-editor");

        // Champ de prix unitaire
        const priceInput = document.createElement("input");
        priceInput.type = "number";
        priceInput.min = "0";
        priceInput.step = "0.01";
        priceInput.value = item.unitPrice;
        priceInput.classList.add("transaction-price-input");
        priceInput.setAttribute("aria-label", "Prix unitaire");

        // Checkbox Cadeau
        const giftLabel = document.createElement("label");
        giftLabel.classList.add("transaction-gift-label");

        const giftCheckbox = document.createElement("input");
        giftCheckbox.type = "checkbox";
        giftCheckbox.checked = item.isGift === true;

        giftLabel.append(giftCheckbox, " Cadeau");

        // Désactiver le prix lorsqu'il s'agit d'un cadeau
        priceInput.disabled = giftCheckbox.checked;

        giftCheckbox.addEventListener("change", () => {
            priceInput.disabled = giftCheckbox.checked;
        });

        editor.append(priceInput, giftLabel);

        // Conserver les références aux champs pour l'enregistrement
        editor.priceInput = priceInput;
        editor.giftCheckbox = giftCheckbox;

        return editor;
    }

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

            const unitActions = document.createElement("div");
            unitActions.classList.add("transaction-item-actions");

            const isFirstUnit = !priceEditors.has(item.id);

            if (isFirstUnit) {
                const priceEditor = createPriceEditor(item);
                priceEditors.set(item.id, priceEditor);

                unitActions.append(unitPrice, priceEditor);
            } else {
                unitActions.append(unitPrice);
            }

            unitActions.appendChild(
                createRemoveButton(() => {
                    const confirmed = confirm(
                        `Supprimer définitivement "${unit.name}" de cet achat et de la Collection ?`
                    );

                    if (!confirmed) return;

                    // Supprimer uniquement l'unité sélectionnée
                    state.units = state.units.filter(
                        (existingUnit) => existingUnit.id !== unit.id
                    );

                    // Diminuer la quantité de l'article acheté
                    item.quantity -= 1;

                    // Supprimer l'article si aucun exemplaire ne reste
                    if (item.quantity === 0) {
                        transaction.items = transaction.items.filter(
                            (existingItem) => existingItem.id !== item.id
                        );
                    }

                    // Recalculer les montants
                    transaction.subtotal = transaction.items.reduce(
                        (total, purchasedItem) => {
                            if (purchasedItem.isGift) return total;

                            return total + purchasedItem.unitPrice * purchasedItem.quantity;
                        },
                        0
                    );

                    finalizePurchaseRemoval(transaction);
                })
            );

            unitRow.append(unitInfo, unitActions);
            content.appendChild(unitRow);
        });
    });

    // Afficher les coffrets achetés
    transaction.items
    .filter((item) => item.type === "box")
    .forEach((item) => {
        // Conteneur du coffret
        const boxRow = document.createElement("div");
        boxRow.classList.add("transaction-box");

        // En-tête du coffret
        const boxHeader = document.createElement("div");
        boxHeader.classList.add("transaction-box-header");

        const boxName = document.createElement("strong");
        boxName.textContent = item.name;

        const boxQuantity = document.createElement("span");
        boxQuantity.classList.add("transaction-box-quantity");

        if (item.quantity > 1) {
            boxQuantity.textContent = `× ${item.quantity}`;
        }

        const boxPrice = document.createElement("span");
        boxPrice.classList.add("transaction-unit-price");

        boxPrice.textContent = item.isGift
        ? "Cadeau"
        : (item.unitPrice * item.quantity).toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
            });

        const boxTitle = document.createElement("div");
        boxTitle.classList.add("transaction-box-title");

        boxTitle.append(boxName, boxQuantity);

        const boxActions = document.createElement("div");
        boxActions.classList.add("transaction-item-actions");

        const priceEditor = createPriceEditor(item);
        priceEditors.set(item.id, priceEditor);

        boxActions.append(
            boxPrice,
            priceEditor,
            createRemoveButton(() => {
                const confirmed = confirm(
                    `Supprimer définitivement le coffret "${item.name}" de cet achat et toutes les unités associées de la Collection ?`
                );

                if (!confirmed) return;

                // Supprimer les unités provenant de cet article
                state.units = state.units.filter(
                    (unit) => !(
                        unit.purchaseId === transaction.id &&
                        unit.purchaseItemId === item.id
                    )
                );

                // Retirer le coffret de la transaction
                transaction.items = transaction.items.filter(
                    (existingItem) => existingItem.id !== item.id
                );

                // Recalculer le sous-total
                transaction.subtotal = transaction.items.reduce(
                    (total, purchasedItem) => {
                        if (purchasedItem.isGift) return total;

                        return total +
                            purchasedItem.unitPrice * purchasedItem.quantity;
                    },
                    0
                );

                finalizePurchaseRemoval(transaction);
            })
        );

        boxHeader.append(boxTitle, boxActions);

        // Retrouver les unités issues du coffret
        const purchasedUnits = state.units.filter(
        (unit) =>
            unit.purchaseId === transaction.id &&
            unit.purchaseItemId === item.id
        );

        const boxUnits = document.createElement("div");
        boxUnits.classList.add("transaction-box-units");

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
        unitRow.appendChild(unitInfo);
        boxUnits.appendChild(unitRow);
        });

        boxRow.append(boxHeader, boxUnits);
        content.appendChild(boxRow);
    });

    // Afficher le matériel hobby
    transaction.items
    .filter((item) => item.type === "material")
    .forEach((item) => {
        const materialRow = document.createElement("div");
        materialRow.classList.add("transaction-unit");

        const materialInfo = document.createElement("div");
        materialInfo.classList.add("transaction-unit-info");

        const materialName = document.createElement("strong");
        materialName.textContent = item.name;

        const materialDetails = document.createElement("span");
        materialDetails.textContent = item.quantity > 1
        ? `Matériel hobby · × ${item.quantity}`
        : "Matériel hobby";

        materialInfo.append(materialName, materialDetails);

        const materialPrice = document.createElement("span");
        materialPrice.classList.add("transaction-unit-price");

        materialPrice.textContent = item.isGift
        ? "Cadeau"
        : (item.unitPrice * item.quantity).toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
            });

        const materialActions = document.createElement("div");
        materialActions.classList.add("transaction-item-actions");

        const priceEditor = createPriceEditor(item);
        priceEditors.set(item.id, priceEditor);

        materialActions.append(
            materialPrice,
            priceEditor,
            createRemoveButton(() => {
                const confirmed = confirm(
                    `Supprimer définitivement "${item.name}" de cet achat ?`
                );

                if (!confirmed) return;

                // Retirer le matériel de la transaction
                transaction.items = transaction.items.filter(
                    (existingItem) => existingItem.id !== item.id
                );

                // Recalculer le sous-total
                transaction.subtotal = transaction.items.reduce(
                    (total, purchasedItem) => {
                        if (purchasedItem.isGift) return total;

                        return total +
                            purchasedItem.unitPrice * purchasedItem.quantity;
                    },
                    0
                );

                finalizePurchaseRemoval(transaction);
            })
        );

        materialRow.append(materialInfo, materialActions);
        content.appendChild(materialRow);
    });

    // Afficher les frais supplémentaires lorsqu'ils existent
    if (transaction.additionalCosts !== 0) {
        const costsRow = document.createElement("div");
        costsRow.classList.add("transaction-additional-costs");

        const costsLabel = document.createElement("span");
        costsLabel.textContent = "Frais supplémentaires";

        const costsAmount = document.createElement("strong");
        costsAmount.textContent =
            transaction.additionalCosts.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
            });

        costsRow.append(costsLabel, costsAmount);
        content.appendChild(costsRow);
    }

    const actions = document.createElement("div");
    actions.classList.add("transaction-actions");

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.classList.add("transaction-edit-btn");
    editButton.title = "Modifier";
    editButton.setAttribute("aria-label", "Modifier la transaction");

    editButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg"
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
    </svg>
    `;

    const editIcon = editButton.innerHTML;

    const saveIcon = `
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path d="M20 6 9 17l-5-5"/>
    </svg>
    `;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("transaction-delete-btn");
    deleteButton.title = "Supprimer";
    deleteButton.setAttribute("aria-label", "Supprimer la transaction");

    deleteButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg"
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <path d="M3 6h18"/>
        <path d="M8 6V4h8v2"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v5"/>
        <path d="M14 11v5"/>
    </svg>
    `;

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.classList.add("transaction-cancel-btn");
    cancelButton.textContent = "Annuler";
    cancelButton.hidden = true;

    editButton.addEventListener("click", () => {
        if (card.classList.contains("editing")) {
            // Vérifier les prix avant de modifier les données
            for (const editor of priceEditors.values()) {
                const priceInput = editor.priceInput;
                const unitPrice = Number(priceInput.value);

                if (
                    priceInput.value.trim() === "" ||
                    !Number.isFinite(unitPrice) ||
                    unitPrice < 0 ||
                    !priceInput.validity.valid
                ) {
                    alert("Le prix unitaire doit être un montant valide et positif ou nul.");
                    priceInput.focus();
                    return;
                }
            }

            // Préparer les articles modifiés
            const updatedItems = transaction.items.map((item) => {
                const editor = priceEditors.get(item.id);

                if (!editor) return { ...item };

                return {
                    ...item,
                    unitPrice: Number(editor.priceInput.value),
                    isGift: editor.giftCheckbox.checked
                };
            });           

            const additionalCosts = Number(feesInput.value);

            if (
                feesInput.value.trim() === "" ||
                !Number.isFinite(additionalCosts) ||
                additionalCosts < 0
            ) {
                alert("Le montant des frais supplémentaires est invalide.");
                return;
            }

            const subtotal = updatedItems.reduce((total, item) => {
                if (item.isGift) return total;

                return total + item.unitPrice * item.quantity;
            }, 0);

            const total = subtotal + additionalCosts;

            // Appliquer les modifications à la transaction
            transaction.items = updatedItems;
            transaction.subtotal = subtotal;
            transaction.additionalCosts = additionalCosts;
            transaction.total = total;

            saveState();

            // Actualiser la vue
            renderTransactions();

            return;
        }

        card.classList.add("editing");
        editButton.innerHTML = saveIcon;

        editButton.title = "Enregistrer";
        editButton.setAttribute("aria-label", "Enregistrer les modifications");

        cancelButton.hidden = false;
        deleteButton.hidden = true;
    });

    cancelButton.addEventListener("click", () => {
        card.classList.remove("editing");
        editButton.innerHTML = editIcon;

        editButton.title = "Modifier";
        editButton.setAttribute("aria-label", "Modifier la transaction");

        cancelButton.hidden = true;
        deleteButton.hidden = false;
    });

    const editFields = document.createElement("div");
    editFields.classList.add("transaction-edit-fields");

    const addArticleButton = document.createElement("button");
    addArticleButton.type = "button";
    addArticleButton.classList.add("transaction-add-article-btn");
    addArticleButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg"
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v8"/>
        <path d="M8 12h8"/>
    </svg>
    <span>Ajouter un article</span>
    `;

    const feesGroup = document.createElement("div");
    feesGroup.classList.add(
        "transaction-edit-fees",
        "transaction-additional-costs"
    );

    const feesLabel = document.createElement("label");
    feesLabel.textContent = "Frais supplémentaires";

    const feesInput = document.createElement("input");
    feesInput.type = "number";
    feesInput.min = "0";
    feesInput.step = "0.01";
    feesInput.value = transaction.additionalCosts ?? 0;

    feesLabel.appendChild(feesInput);

    feesGroup.appendChild(feesLabel);
    editFields.append(addArticleButton, feesGroup);

    content.appendChild(editFields);

    actions.append(editButton, cancelButton, deleteButton);
    content.appendChild(actions);

    card.append(summary, content);
    transactionsList.appendChild(card);
  });
}