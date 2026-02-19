import { loadState } from "../storage.js";
import { dashboardState } from "./dashboardState.js";
import { dashboardControls } from "./dashboardController.js";
import { dashboardBoxes } from "./dashboardBoxes.js";




export function renderDashboard(container) {
  container.innerHTML = "";

  const state = loadState();
  const stateManager =  new dashboardState(state);
  const { 
    people,
    teamName,
    favorites,
    currentFilter
  } = stateManager.getState();
  const wrapper = document.createElement("div");
  wrapper.className = "dashboard";
  const title = document.createElement("h2");
  title.textContent = "Dashboard";
  wrapper.append(title);
  const controls = dashboardControls({
    teamName,
    people,
    currentFilter,
    onChange: () => renderDashboard(container)
  });


  wrapper.append(controls);

  // ---------- RENDERING AV KORT ----------
  let dashboardsToShow = ["Team"];

  if (currentFilter === "ALLA") {
    dashboardsToShow = ["Team", ...people];
  } else if (currentFilter === "Team") {
    dashboardsToShow = ["Team", ...favorites];
  } else {
    // Säkerställ att vi bara visar valda filter om personen fortfarande finns
    const combined = [currentFilter, ...favorites].filter(name => people.includes(name));
    dashboardsToShow = ["Team", ...new Set(combined)];
  }

    dashboardsToShow.forEach(name =>
    {
      const box = dashboardBoxes({
      name,
      stateManager,
      teamName,
      favorites,
      onRefresh: () => renderDashboard(container)
    });
  
    wrapper.append(box);
  });

  container.append(wrapper);
}
