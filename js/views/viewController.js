import { renderDashboard } from "./dashboardView.js";
import { taskScreen } from "../taskList/taskScreen.js";
import { loadState } from "../storage.js";

let container = null;
let activeView = "dashboard";

export function initViewController(target) {
  container = target;
}

export function setView(view) {
  activeView = view;
  render();
}

export function rerenderActiveView() {
  render();
}

function render() {
  if (!container) return;

  container.innerHTML = "";

  if (activeView === "dashboard") {
    renderDashboard(container);
    return;
  }

  if (activeView === "tasks") {
    const state = loadState();
    container.append(taskScreen(state.tasks || []));
    return;
  }
}