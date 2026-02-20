import { initSeed } from "./js/taskList/seed.js";
import { menu } from "./js/menu/sideMenu.js";
import { subscribe } from "./js/observer.js";
import { initViewController, rerenderActiveView, setView } from "./js/views/viewController.js";
import { initTheme } from "./js/theme.js";
import { addTaskDialog } from "./js/comps/dialog.js";

/**
 * @file app.js
 * @description Huvudentrépunkt för Lianer Project Management App.
 * Hanterar initiering av tema, layoutstruktur och globala händelselyssnare.
 */

// Initiera tema (Mörkt/Ljust)
initTheme();

/** @type {HTMLElement} - Huvudcontainern definierad i index.html */
const app = document.getElementById("app");
app.classList.add("app");

/** * Sidomeny (Navigation)
 * @description Använder <aside> och role="navigation" för att markera sektionen som sekundärt innehåll/navigering.
 * @type {HTMLElement} 
 */
const sideMenuDiv = document.createElement("aside");
sideMenuDiv.classList.add("left");
sideMenuDiv.setAttribute("role", "navigation");
sideMenuDiv.setAttribute("aria-label", "Huvudmeny");
sideMenuDiv.append(menu());

/** * Huvudinnehåll (Main)
 * @description Använder <main> för att markera applikationens centrala innehåll, vilket är kritiskt för tillgänglighet.
 * @type {HTMLElement} 
 */
const mainContent = document.createElement("main");
mainContent.classList.add("center");
mainContent.setAttribute("id", "main-content");

// Bygg ihop applikationens grundstruktur
app.append(sideMenuDiv, mainContent);

/**
 * Initiera vyn-hanteraren och koppla den till huvudytan.
 */
initViewController(mainContent);

/**
 * Prenumerera på tillståndsändringar (The Observer Flow).
 * Vid varje ändring i datan renderas den aktiva vyn om.
 */
subscribe(() => rerenderActiveView());

/**
 * Initiera startdata och sätt startvyn till dashboard.
 */
initSeed();
setView("dashboard");

/**
 * Global händelselyssnare för interaktioner.
 * Hanterar bland annat öppning av dialogrutan för att lägga till nya uppgifter (FAB).
 * * @param {MouseEvent} e - Klickhändelsen.
 */
document.addEventListener("click", (e) => {
  /** @type {Element|null} - Hittar närmaste element med klassen .addTaskFab */
  const fabButton = e.target.closest(".addTaskFab");
  
  if (fabButton) {
    // 1. Rensa bort gamla modal-overlays om de mot förmodan ligger kvar
    const existingModal = document.querySelector(".modalOverlay");
    if (existingModal) existingModal.remove();

    /** * @type {HTMLDialogElement|HTMLElement} - Skapar en ny dialog-instans.
     * För optimal tillgänglighet bör addTaskDialog returnera ett <dialog>-element.
     */
    const dialog = addTaskDialog();
    
    // 3. Lägg till den i bodyn så den hamnar överst
    document.body.appendChild(dialog);
    
    // 4. Säkerställ att den inte är dold (om din dialog-kod använder hidden)
    dialog.removeAttribute("hidden");
    
    /** * Om dialog-elementet stöds av webbläsaren och är av typen HTMLDialogElement,
     * bör showModal() användas för att hantera fokus och skärmläsare automatiskt.
     */
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  }
});

/**
 * Service Worker och Background Sync registrering.
 * Hanterar Offline-stöd och datasynkronisering i bakgrunden.
 */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      /** @type {ServiceWorkerRegistration} */
      const registration = await navigator.serviceWorker.register("/service-worker.js");
      console.log("Service Worker registered");

      // Vänta tills service workern är aktiv
      await navigator.serviceWorker.ready;

      // Registrera Background Sync om det stöds av webbläsaren
      if ("sync" in registration) {
        try {
          await registration.sync.register("sync-data");
          console.log("Background Sync registered");
        } catch (err) {
          console.warn("Background Sync failed:", err);
        }
      }

    } catch (err) {
      console.warn("Service Worker registration failed:", err);
    }
  });
}