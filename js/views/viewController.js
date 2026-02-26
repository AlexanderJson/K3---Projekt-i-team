import { renderDashboard } from "./dashboardView.js";
// calendarView, taskScreen, settingsView, contactsView are lazy-loaded on demand
import { loadState } from "../storage.js";

let container = null;
let activeView = "dashboard";
let currentRenderId = 0;

export function initViewController(target) {
  container = target;
}

export async function setView(view, params = null) {
  activeView = view;
  if (params) window.viewParams = params;
  await render();
}

export async function rerenderActiveView() {
  await render();
}

async function render() {
  if (!container) return;

  const renderId = ++currentRenderId;

  // Each branch clears the container AFTER the renderId check to prevent
  // race conditions where a superseded render leaves the screen blank.

  const state = loadState();

  if (activeView === "dashboard") {
    if (renderId !== currentRenderId) return;
    container.innerHTML = "";
    renderDashboard(container, state);
    return;
  }

  if (activeView === "calendar") {
    const { renderCalendar } = await import("./calendarView.js");
    if (renderId !== currentRenderId) return;
    container.innerHTML = "";
    renderCalendar(container);
    return;
  }

  if (activeView === "tasks") {
    const { taskScreen } = await import("../taskList/taskScreen.js");
    if (renderId !== currentRenderId) return;
    container.innerHTML = "";
    container.append(taskScreen());
    return;
  }

  if (activeView === "settings") {
    const { renderSettings } = await import("./settingsView.js");
    if (renderId !== currentRenderId) return;
    container.innerHTML = "";
    renderSettings(container, rerenderActiveView);
    return;
  }

  if (activeView === "contacts") {
    const params = window.viewParams;
    window.viewParams = null;
    const { renderContacts } = await import("./contactsView.js");
    if (renderId !== currentRenderId) return;
    container.innerHTML = "";
    renderContacts(container, params);
    return;
  }
}