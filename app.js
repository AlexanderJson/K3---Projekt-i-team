import { initSeed } from "./js/taskList/seed.js";
import { menu } from "./js/menu/sideMenu.js";
import { subscribe } from "./js/observer.js";
import { initViewController, rerenderActiveView, setView } from "./js/views/viewController.js";
import { initTheme } from "./js/theme.js";
import { addTaskDialog } from "./js/comps/dialog.js";

// Initiera tema (Mörkt/Ljust)
initTheme();

// Grundstruktur för appen
const app = document.getElementById("app");
app.classList.add("app");

// Sidomeny
const sideMenuDiv = document.createElement("div");
sideMenuDiv.classList.add("left");
sideMenuDiv.append(menu());

// Huvudinnehåll
const mainContent = document.createElement("div");
mainContent.classList.add("center");

app.append(sideMenuDiv, mainContent);

// Initiera vy-hantering
initViewController(mainContent);

// Prenumerera på state-ändringar (The Observer Flow)
subscribe(() => rerenderActiveView());

// Startdata och initial vy
initSeed();
setView("dashboard");

/**
 * LOGIK FÖR ATT LÄGGA TILL UPPGIFTER
 * Vi lyssnar på klick på hela dokumentet för att fånga upp plus-knappen 
 * oavsett när den renderas i DOM:en.
 */
document.addEventListener("click", (e) => {
  // Kontrollera om klicket skedde på plus-knappen (FAB)
  if (e.target.closest(".addTaskFab")) {
    
    // 1. Rensa bort gamla modal-overlays om de mot förmodan ligger kvar
    const existingModal = document.querySelector(".modalOverlay");
    if (existingModal) existingModal.remove();

    // 2. Skapa en ny dialog-instans genom att anropa funktionen
    const dialog = addTaskDialog();
    
    // 3. Lägg till den i bodyn så den hamnar överst
    document.body.appendChild(dialog);
    
    // 4. Säkerställ att den inte är dold (om din dialog-kod använder hidden)
    dialog.removeAttribute("hidden");
  }
});


if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js");
      console.log("Service Worker registered");

      // Registrera Background Sync när SW är redo
      if ("sync" in registration) {
        await registration.sync.register("sync-data");
        console.log("Background Sync registered");
      }
    } catch (err) {
      console.error("Service Worker registration failed:", err);
    }
  });
}

