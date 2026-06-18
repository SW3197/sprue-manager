/* Ajout des temps de peinture
et calculs liés.
*/

import { state } from "../state.js";
import { saveState } from "../storage.js";
import { createId } from "../utils/ids.js";

export function getPaintingTotalMinutes() {
    return state.paintingSessions.reduce((total, session) => {
        return total + session.durationMinutes;
    }, 0);
}

export function formatDuration(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h${String(minutes).padStart(2, "0")}`;
}

export function addPaintingSession({date, durationMinutes, note}) {
    state.paintingSessions.push({
        id: createId(),
        date,
        durationMinutes,
        note
    });

    saveState();
}

export function deletePaintingSession(id) {
    state.paintingSessions = state.paintingSessions.filter(
        session => session.id !== id
    );

    saveState();
}

export function getPaintingSessions() {
    return state.paintingSessions;
}

