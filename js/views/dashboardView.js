import { loadState } from "../storage.js";
import { testBtn } from "../comps/testBtn.js";
import { dashboardState } from "./dashboardState.js";
const STATUSES = [
  { key: "Att göra", css: "todo" },
  { key: "Pågår", css: "progress" },
  { key: "Klar", css: "done" }
];






export function renderDashboard(container) {
  container.innerHTML = "";

  const state = loadState();
  const stateManager = new dashboardState(state);
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

  // ---------- KONTROLLER ----------
  const controls = document.createElement("div");
  controls.className = "dashboard-controls";

  const select = document.createElement("select");
  select.className = "taskFilterSelect";

  const teamOption = document.createElement("option");
  teamOption.value = "Team";
  teamOption.textContent = `${teamName} & Favoriter`;
  select.append(teamOption);

  const allOption = document.createElement("option");
  allOption.value = "ALLA";
  allOption.textContent = "--- Visa alla dashboards ---";
  select.append(allOption);

  // Här renderas nu endast riktiga personer (Ingen är bortfiltrerad ovan)
  people.forEach(person => {
    const option = document.createElement("option");
    option.value = person;
    option.textContent = person;
    select.append(option);
  });

  select.value = currentFilter;
  select.addEventListener("change", () => {
    stateManager.saveCurrentFilter(select.value);
    renderDashboard(container);
  });

  controls.append(select);
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

  dashboardsToShow.forEach(name => {
    const box = document.createElement("div");
    box.className = "dashboard-box";

    const header = document.createElement("div");
    header.className = "dashboard-box-header";

    const heading = document.createElement("h3");
    heading.textContent = name === "Team" ? `${teamName}` : name;
    header.append(heading);

    if (name !== "Team") {
      const star = document.createElement("button");
      star.className = `dashboard-star ${favorites.includes(name) ? "is-active" : ""}`;
      star.innerHTML = favorites.includes(name) ? "★" : "☆";
      star.onclick = () => {
        const currentFavs = stateManager.loadFavorites();
        const updated = currentFavs.includes(name) 
          ? currentFavs.filter(f => f !== name) 
          : [...currentFavs, name];
        stateManager.saveFavorites(updated);
        renderDashboard(container);
      };
      header.append(star);
    }
    box.append(header);
    const relevantTasks = stateManager.getFilteredTasks(name);
    const totalCount = relevantTasks.length;
    const unassignedCount = stateManager.getUnassignedCount(relevantTasks);
    const completedThisWeek = stateManager.getCompletedThisWeek(relevantTasks);
    // --- VECKOMÅL / SPRINT MÅL (Som en egen "status-bar") ---
    // Hämta målet från inställningar (default 5)
    const weeklyTarget = stateManager.getWeeklyTarget();
    // Skapa Progress för målet
    const targetPercent = stateManager.getTargetPercentage(completedThisWeek,weeklyTarget);






    const total = document.createElement("div");
    total.className = "dashboard-total";
    total.textContent = `Totalt: ${totalCount}`;
    box.append(total);

    // NYTT: Visa antal lediga uppgifter om det är Team-kortet
    if (name === "Team") {
      // Justera marginalen på totalen för att få dem tajtare
      total.style.marginBottom = "0px";

      const unassignedDiv = document.createElement("div");
      unassignedDiv.className = "dashboard-total"; 
      
      // Samma stil som totalt (ingen opacity/font-size override)
      unassignedDiv.style.marginTop = "0px"; 
      
      unassignedDiv.innerHTML = `Lediga uppgifter: <span style="color: var(--accent-cyan); font-weight: 700;">${unassignedCount}</span>`;
      box.append(unassignedDiv);
    }
    



    // Återanvänd status-group strukturen för att matcha de andra exakt
    const targetGroup = document.createElement("div");
    targetGroup.className = "status-group open"; // Alltid öppen kanske? Eller valbart.
    targetGroup.style.marginTop = "8px"; // Tajtare

    // Custom header för målet
    const targetHeader = document.createElement("div");
    targetHeader.className = "status-toggle";
    targetHeader.style.cursor = "default"; // Inte klickbar på samma sätt
    // Använd klass för färgen så den funkar i både light/dark mode
    targetHeader.innerHTML = `
        <span class="dot" style="background:#8b5cf6; box-shadow:0 0 10px #8b5cf6;"></span>
        <span style="flex:1; color:var(--text-weekly-target); font-weight:700; letter-spacing:0.5px;">VECKOMÅL: ${completedThisWeek} / ${weeklyTarget}</span>
    `;

    const targetProgressWrap = document.createElement("div");
    targetProgressWrap.className = "progress-wrap";
    targetProgressWrap.innerHTML = `<div class="progress-bar" style="width: ${targetPercent}%; background: #8b5cf6; box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);"></div>`;

    targetGroup.append(targetHeader, targetProgressWrap);
    box.append(targetGroup);

    STATUSES.forEach(status => {
      const statusTasks = relevantTasks.filter(t => t.status === status.key);
      const percent = totalCount === 0 ? 0 : Math.round((statusTasks.length / totalCount) * 100);

      const group = document.createElement("div");
      group.className = "status-group";

      const toggle = document.createElement("button");
      toggle.className = "status-toggle";
      toggle.innerHTML = `<span class="dot ${status.css}"></span><span>${status.key}: ${statusTasks.length}</span><span class="chevron">▾</span>`;
      
      toggle.addEventListener("click", () => group.classList.toggle("open"));

      const progressWrap = document.createElement("div");
      progressWrap.className = "progress-wrap";
      progressWrap.innerHTML = `<div class="progress-bar ${status.css}" style="width: ${percent}%"></div>`;

      const list = document.createElement("ul");
      list.className = "status-list";
      
      if (statusTasks.length === 0) {
        list.innerHTML = `<li style="font-style:italic; opacity:0.5;">Inga uppgifter här</li>`;
      } else {
        statusTasks.forEach(task => {
          const li = document.createElement("li");
          li.textContent = task.title;
          li.className = "dashboard-item-text";
          list.append(li);
        });
      }

      group.append(toggle, progressWrap, list);
      box.append(group);
    });

    wrapper.append(box);
  });

  container.append(wrapper);
}