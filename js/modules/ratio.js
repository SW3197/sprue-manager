import { state } from "../state.js";

export function getOwnedMiniaturesCount() {
    return state.miniatures.length;
}

export function getPaintedMiniaturesCount() {
    return state.miniatures.filter(miniature => miniature.status === "painted").length;
}

export function getPaintedRatio() {
    const total = getOwnedMiniaturesCount();
    const painted = getPaintedMiniaturesCount();

    if(total === 0) {
        return 0;
    }

    return Math.round((painted / total) * 100);
}

export function getRatioSummary() {
    return {
        painted: getPaintedMiniaturesCount(),
        total: getOwnedMiniaturesCount(),
        percentage: getPaintedRatio()
    };
}

export function getMiniaturesCountByStatus() {
    return {
        boxed: state.miniatures.filter(miniature => miniature.status === "boxed").length,
        assembled: state.miniatures.filter(miniature => miniature.status === "assembled").length,
        primed: state.miniatures.filter(miniature => miniature.status === "primed").length,
        painted: state.miniatures.filter(miniature => miniature.status === "painted").length,
    };
}