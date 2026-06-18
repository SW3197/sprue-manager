import { getRatioSummary, getMiniaturesCountByStatus } from "../modules/ratio.js";
import { closeModal, openModal } from "../ui/modals.js";
import { showCollectionViewWithStatusFilter } from "../app.js";

export function openRatioModal() {
    const ratio = getRatioSummary();
    const statusCounts = getMiniaturesCountByStatus();

    const content = `
        <h2>Ratio peint / possédé</h2>
        
        <p>${ratio.painted} / ${ratio.total} figurines peintes</p>
        
        <p>${ratio.percentage} %</p>

        <h3>Répartition de la collection</h3>

        <ul class="ratio-status-list">
            <li><span>En boîte</span><strong>${statusCounts.boxed}</strong></li>
            <li><span>Assemblées</span><strong>${statusCounts.assembled}</strong></li>
            <li><span>Sous-couchées</span><strong>${statusCounts.primed}</strong></li>
            <li><span>Peintes</span><strong>${statusCounts.painted}</strong></li>
        </ul>
        
        <button id="show-painted-btn">
            Voir les figurines peintes
        </button>
    `;

    openModal(content);

    const showPaintedBtn = document.getElementById("show-painted-btn");

    showPaintedBtn.addEventListener("click", () => {
        closeModal();
        showCollectionViewWithStatusFilter("painted");
    });
}