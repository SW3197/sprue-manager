export function openModal(content) {
    const modalContainer = document.getElementById("modal-container");
    
    modalContainer.innerHTML = `
        <div class="modal-overlay">
            <div class="modal">
                <button id="close-modal-btn">X</button>
                
                ${content}
            </div>
        </div>
    `;

    setupModalOverlay();

    const closeModalBtn = document.getElementById("close-modal-btn");

    closeModalBtn.addEventListener("click", () => {
        closeModal();
    });
}

export function closeModal() {
    const modalContainer = document.getElementById("modal-container");

    modalContainer.innerHTML = "";
}

function setupModalOverlay() {
    const modalOverlay = document.querySelector(".modal-overlay");
    const modal = document.querySelector(".modal");

    modalOverlay.addEventListener("click", () => {
        closeModal();
    });

    modal.addEventListener("click", (event) => {
        event.stopPropagation();
    });
}