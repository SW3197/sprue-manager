const drawerContainer = document.getElementById("drawer-container");

export function openDrawer(content, extraClass = "") {
  drawerContainer.innerHTML = `
        <div class="drawer-overlay">
            <div class="drawer ${extraClass}">
                <button id="close-drawer-btn">
                    X
                </button>
            
                ${content}
            </div>
        </div>
    `;

  setupDrawerCloseButton();
  setupDrawerOverlay();
}

export function closeDrawer() {
  drawerContainer.innerHTML = "";
}

function setupDrawerCloseButton() {
  const closeDrawerBtn = document.getElementById("close-drawer-btn");

  closeDrawerBtn.addEventListener("click", () => {
    closeDrawer();
  });
}

function setupDrawerOverlay() {
  const drawerOverlay = document.querySelector(".drawer-overlay");
  const drawer = document.querySelector(".drawer");

  drawerOverlay.addEventListener("click", () => {
    closeDrawer();
  });

  drawer.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}