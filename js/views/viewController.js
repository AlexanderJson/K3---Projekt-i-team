import { renderDashboard } from "./dashboardView.js";
// calendarView, taskScreen, settingsView are lazy-loaded on demand (see render())
// contactsView is also lazy-loaded (see contacts block in render())
import { loadState } from "../storage.js";

let container = null;
let activeView = "dashboard";

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

  // Rensa containern helt innan ny rendering för att undvika dubbla element
  container.innerHTML = "";

  // Hämta ALLTID det senaste statet här för att garantera att nya tasks finns med
  const state = loadState();

  if (activeView === "dashboard") {
    // Vi skickar med state även här om dashboardView behöver det
    renderDashboard(container, state);
    return;
  }

  if (activeView === "calendar") {
    const { renderCalendar } = await import("./calendarView.js");
    renderCalendar(container);
    return;
  }

  if (activeView === "tasks") {
    const { taskScreen } = await import("../taskList/taskScreen.js");
    container.append(taskScreen());
    return;
  }

  if (activeView === "settings") {
    const { renderSettings } = await import("./settingsView.js");
    renderSettings(container, rerenderActiveView);
    return;
  }

  if (activeView === "contacts") {
    const params = window.viewParams;
    window.viewParams = null; // Rensa direkt (params redan kopierad)
    // Lazy-load contactsView to reduce initial JS payload
    const { renderContacts } = await import("./contactsView.js");
    renderContacts(container, params);
    return;
  }
}