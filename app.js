import { initSeed } from "./js/taskList/seed.js";
import { menu } from "./js/menu/sideMenu.js";
import { subscribe } from "./js/observer.js";
import { initViewController, rerenderActiveView, setView } from "./js/views/viewController.js";
import { initTheme } from "./js/theme.js";
import { addTaskDialog } from "./js/comps/dialog.js";

// 1. Initiera globala inställningar
initTheme();

// 2. Skapa grundstrukturen (Layouten)
const app = document.getElementById("app");
app.classList.add("app");

// Sidomeny (Innehåller nu "+ Ny uppgift"-knappen)
const sideMenuDiv = document.createElement("div");
sideMenuDiv.classList.add("left");
sideMenuDiv.append(menu());

// Huvudinnehåll (Vyer renderas här)
const mainContent = document.createElement("div");
mainContent.classList.add("center");

// Montera huvudkomponenterna
app.append(sideMenuDiv, mainContent);

// 3. Initiera system
initViewController(mainContent);
subscribe(() => rerenderActiveView()); // Uppdatera vyn automatiskt vid ändringar

// 4. Ladda startdata och sätt startvy
initSeed();
setView("dashboard");

/**
 * LOGIK FÖR DIALOGRUTA (Event Delegation)
 * Vi lyssnar på hela dokumentet. Om användaren klickar på en knapp
 * med klassen .addTaskFab (som nu finns i din meny), öppnas dialogen.
 */
document.addEventListener("click", (e) => {
  const target = e.target.closest(".addTaskFab");
  
  if (target) {
    // Rensa eventuella gamla modal-element som fastnat
    const existingModal = document.querySelector(".modalOverlay");
    if (existingModal) existingModal.remove();

    // Skapa och returnera ett nytt Node-element från dialog-modulen
    const dialog = addTaskDialog();
    
    // Lägg till dialogen i DOM:en
    document.body.appendChild(dialog);
    
    // Säkerställ visibilitet
    dialog.removeAttribute("hidden");
  }
});