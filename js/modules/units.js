function assignUnitSuffix(unit, existingUnits) {
    const matchingUnits = existingUnits.filter(
        (existingUnit) =>
            existingUnit.name === unit.name &&
            existingUnit.game === unit.game
    );

    if (matchingUnits.length === 0) {
        unit.nameSuffix = "";
        return;
    }

    const usedSuffixes = new Set(
        matchingUnits.map((existingUnit) => existingUnit.nameSuffix)
    );

    let number = 1;

    while (usedSuffixes.has(`(${number})`)) {
        number++;
    }

    unit.nameSuffix = `(${number})`;
}

export function createUnitsFromPurchase(purchase, existingUnits = []) {
    const units = [];

    purchase.items.forEach((item) => {
        if (item.type === "material") {
            return;
        }

        for (let i = 0; i < item.quantity; i++) {
            if (item.type === "unit") {
                const newUnit = {
                    id: crypto.randomUUID(),
                    purchaseId: purchase.id,
                    name: item.name,
                    nameSuffix: "",
                    game: item.game,
                    faction: item.faction,
                    miniatureCount: item.miniatureCount,
                    status: "boxed",
                    ownershipStatus: "owned"
                };

                assignUnitSuffix(newUnit, [...existingUnits, ...units]);

                units.push(newUnit);
            }

            if (item.type === "box") {
                item.composition.forEach((containedUnit) => {
                    const newUnit = {
                        id: crypto.randomUUID(),
                        purchaseId: purchase.id,
                        name: containedUnit.name,
                        nameSuffix: "",
                        game: item.game,
                        faction: containedUnit.faction,
                        miniatureCount: containedUnit.miniatureCount,
                        status: "boxed",
                        ownershipStatus: "owned"
                    };

                    assignUnitSuffix(newUnit, [...existingUnits, ...units]);

                    units.push(newUnit);
                });
            }
        }
    });

    return units;
}