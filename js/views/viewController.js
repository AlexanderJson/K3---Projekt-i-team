import { renderCalendar } from "./calendarView.js";
import { taskScreen } from "../taskList/taskScreen.js";
import { renderSettings } from "./settingsView.js"; 
import { renderContacts } from "./contactsView.js";
import { renderDashboard } from "./dashboardView.js";

export class ViewController {
  constructor(target, service) {
    this.container = target;
    this.service = service;
    this.activeView = "dashboard";
  }


setView(view, params = null) {
    this.activeView = view;
    this.params = params;
    this.render();
}


rerender() {
  this.render();
}

render() {
  if (!this.container) return;

  // Rensa containern helt innan ny rendering för att undvika dubbla element
  this.container.innerHTML = "";


  if (this.activeView === "dashboard") {
    // Vi skickar med state även här om dashboardView behöver det
    renderDashboard(this.container)
    return;
  }

  if (this.activeView === "calendar") {
    renderCalendar(this.container);
    return;
  }

  if (this.activeView === "tasks") {
    // Här skickar vi de faktiska uppgifterna från det laddade statet
    this.container.append(taskScreen(this.service));;
    return;
  }

  if (this.activeView === "settings") {
    renderSettings(this.container , ()=> this.rerender());
    return;
  }

  if (this.activeView === "contacts") {
    renderContacts(this.container, this.params);
    this.params = null;
    return;
  }
}
  
}

