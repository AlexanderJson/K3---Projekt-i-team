import { initSeed } from "./js/taskList/seed.js";
import { menu } from "./js/menu/sideMenu.js";
import { subscribe } from "./js/observer.js";
import { initViewController, rerenderActiveView, setView } from "./js/views/viewController.js";
import { initTheme } from "./js/theme.js";
import { addTaskDialog } from "./js/comps/dialog.js";

initTheme();

const app = document.getElementById("app");
app.classList.add("app");

const sideMenuDiv = document.createElement("div");
sideMenuDiv.classList.add("left");
sideMenuDiv.append(menu());

const mainContent = document.createElement("div");
mainContent.classList.add("center");

app.append(sideMenuDiv, mainContent);

initViewController(mainContent);

subscribe(() => rerenderActiveView());

initSeed();
setView("dashboard");

const dialog = addTaskDialog();
document.body.appendChild(dialog);

const fab = document.querySelector(".addTaskFab");

fab.addEventListener("click", () => {
  dialog.removeAttribute("hidden");
});