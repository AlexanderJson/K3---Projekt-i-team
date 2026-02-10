import { initSeed } from "./js/taskList/seed.js";
import { menu } from "./js/menu/sideMenu.js";
import { subscribe } from "./js/observer.js";
import { initViewController, rerenderActiveView, setView } from "./js/views/viewController.js";
import { initTheme } from "./js/theme.js";
initTheme();

const app = document.getElementById("app");
app.classList.add("app");
// Sidebar
const sideMenuDiv = document.createElement("div");
sideMenuDiv.classList.add("left");
sideMenuDiv.append(menu());

// Main content
const mainContent = document.createElement("div");
mainContent.classList.add("center");

app.append(sideMenuDiv, mainContent);

// Init view controller
initViewController(mainContent);

// Re-render AKTIV vy när state ändras
subscribe(() => rerenderActiveView());

// Init data + startvy
initSeed();
setView("dashboard");

