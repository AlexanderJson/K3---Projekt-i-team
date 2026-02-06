import { initSeed } from "./js/taskList/seed.js";
import { menu } from "./js/menu/sideMenu.js";
import { taskScreen } from "./js/taskList/taskScreen.js";
import { subscribe } from "./js/observer.js";
import { loadState } from "./js/storage.js";

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

function render() {
  mainContent.innerHTML = "";

  const state = loadState();

  if (!state || !state.tasks || state.tasks.length === 0) {
    return;
  }

  mainContent.append(taskScreen(state.tasks));
}

// Observer
subscribe(render);

// Init + första render
initSeed();
render();