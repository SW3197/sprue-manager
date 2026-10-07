let currentModalClosable = true;

export function openModal(content, options = {}) {
    const { closable = true } = options;
    currentModalClosable = closable;

    const modalContainer = document.getElementById("modal-container");
    
    modalContainer.innerHTML = `
        <div class="modal-overlay">
            <div class="modal">
                ${closable ? '<button id="close-modal-btn">X</button>' : ''}
                
                ${content}
            </div>
        </div>
    `;

    setupModalOverlay();

    const closeModalBtn = document.getElementById("close-modal-btn");

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            requestCloseModal();
        });
    }
}

export function requestCloseModal() {
    if (currentModalClosable) {
        closeModal();
    }
}

export function closeModal() {
    const modalContainer = document.getElementById("modal-container");

    modalContainer.innerHTML = "";
}

function setupModalOverlay() {
    const modalOverlay = document.querySelector(".modal-overlay");
    const modal = document.querySelector(".modal");

    modalOverlay.addEventListener("click", () => {
        requestCloseModal();
    });

    modal.addEventListener("click", (event) => {
        event.stopPropagation();
    });
}