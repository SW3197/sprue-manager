import { 
    addPaintingSession, 
    formatDuration, 
    getPaintingTotalMinutes, 
    getPaintingSessions,
    deletePaintingSession
} from "../modules/paintingSessions.js";
import { openDrawer } from "../ui/drawers.js";
import { state } from "../state.js";
import { renderHomeView } from "./homeView.js"
import { saveState } from "../storage.js";

function setupPaintingSessionForm() {
    const form = document.querySelector("#painting-session-form");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const date = document.querySelector("#painting-session-date").value;
        const durationMinutes = Number(document.querySelector("#painting-session-duration").value);
        const note = document.querySelector("#painting-session-note").value;

        addPaintingSession({
            date,
            durationMinutes,
            note
        });

        form.reset();

        console.log(state.paintingSessions);

        renderHomeView();

        openPaintingTimeDrawer();
    });
}

function setupPaintingSessionDelete(){
    const buttons = document.querySelectorAll(".delete-painting-session-btn");
        
        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                const sessionId = Number(button.dataset.sessionId);
    
                deletePaintingSession(sessionId);
    
                renderHomeView();
                openPaintingTimeDrawer();
            });
        });
}


export function openPaintingTimeDrawer() {
    
    const totalMinutes = getPaintingTotalMinutes();
    const formattedTotal = formatDuration(totalMinutes);

    const sessions = getPaintingSessions();

    const sortedSessions = [...sessions].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    const sessionsHtml = sortedSessions.length === 0
        ? `<p>Aucune session enregistrée pour le moment.</p>`
        : sortedSessions.map((session) => {
            return `
                <div class="painting-session-item">
                    <div class="painting-session-info">
                        <span>${session.date}</span>
                        <span>•</span>
                        <span>${formatDuration(session.durationMinutes)}</span>
                        <span>•</span>
                        <span>${session.note}</span>
                    </div>
                    
                    <button
                        class="delete-painting-session-btn"
                        data-session-id="${session.id}"
                    >
                        X
                    </button>
                </div>
            `;
        }).join("");

    const content = `
        <h2>Temps de peinture</h2>
        
        <section>
            <h3>Total cumulé</h3>
            <p>${formattedTotal}</p>
        </section
        
        <section>
            <h3>Ajouter une session</h3>
            
            <form id="painting-session-form">
                <label>
                    Date
                    <input type="date" id="painting-session-date" required>
                </label>
                
                <label>
                    Durée en minutes
                    <input type="number" id="painting-session-duration" min="1" required>
                </label>
                
                <label>
                    Note
                    <input type="text" id="painting-session-note">
                </label>
                
                <button type="submit">Ajouter</button>
            </form>
        </section>
            
        <section>
            <h3>Sessions passées</h3>
            <p>${sessionsHtml}</p>
        </section>
    `;

    openDrawer(content, "drawer-wide");

    setupPaintingSessionForm();

    setupPaintingSessionDelete();
}