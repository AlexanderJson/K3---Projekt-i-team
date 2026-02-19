import { renderDashboard } from "./dashboardView.js";
import { renderCalendar } from "./calendarView.js";
import { taskScreen } from "../taskList/taskScreen.js";
import { renderSettings } from "./settingsView.js";
import { loadState } from "../storage.js";
import {testScreen} from '../comps/testScreen.js';

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

  // Rensa containern helt innan ny rendering för att undvika dubbla element
  container.innerHTML = "";

  // Hämta ALLTID det senaste statet här för att garantera att nya tasks finns med
  const state = loadState();

  if (activeView === "dashboard") {
    // Vi skickar med state även här om dashboardView behöver det
    renderDashboard(container, state);
    return;
  }

  if (activeView === "schedule") {
    container.append(testScreen());  
    return;
  }

  

  if (activeView === "tasks") {
    // Här skickar vi de faktiska uppgifterna från det laddade statet
    const tasks = state.tasks || [];
    container.append(taskScreen(tasks));
    return;
  }

  if (activeView === "settings") {
    renderSettings(container, rerenderActiveView);
    return;
  }
}