import { loadState } from "../storage.js";

const FAVORITES_KEY = "dashboard:favorites";

const STATUSES = [
  { key: "Att göra", css: "todo" },
  { key: "Pågår", css: "progress" },
  { key: "Klar", css: "done" }
];

export function renderDashboard(container) {
  container.innerHTML = "";

  const state = loadState();
  const tasks = state.tasks || [];
  const people = state.people || []; 
  const teamName = state.settings?.teamName || "Mitt Team";

  // Städning av favoriter för att undvika tomma sektioner
  let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  favorites = favorites.filter(name => people.includes(name));
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

  let currentFilter = localStorage.getItem("dashboardViewFilter") || "Team";

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

  // Proffsigt namn för standardvalet i dropdown
  const teamOption = document.createElement("option");
  teamOption.value = "Team";
  teamOption.textContent = `${teamName} & Favoriter`;
  select.append(teamOption);

  const allOption = document.createElement("option");
  allOption.value = "ALLA";
  allOption.textContent = "--- Visa alla dashboards ---";
  select.append(allOption);

  people.forEach(person => {
    const option = document.createElement("option");
    option.value = person;
    option.textContent = person;
    select.append(option);
  });

  select.value = currentFilter;
  select.addEventListener("change", () => {
    localStorage.setItem("dashboardViewFilter", select.value);
    renderDashboard(container);
  });

  controls.append(select);
  wrapper.append(controls);

  // ---------- RENDERING AV KORT ----------
  const activeFilter = localStorage.getItem("dashboardViewFilter") || "Team";
  let dashboardsToShow = ["Team"];

  if (activeFilter === "ALLA") {
    dashboardsToShow = ["Team", ...people];
  } else if (activeFilter === "Team") {
    dashboardsToShow = ["Team", ...favorites];
  } else {
    const combined = [activeFilter, ...favorites].filter(name => people.includes(name));
    dashboardsToShow = ["Team", ...new Set(combined)];
  }

  dashboardsToShow.forEach(name => {
    const box = document.createElement("div");
    box.className = "dashboard-box";

    const header = document.createElement("div");
    header.className = "dashboard-box-header";

    const heading = document.createElement("h3");
    // Nu visas Teamnamnet som rubrik på huvudkortet
    heading.textContent = name === "Team" ? `${teamName}` : name;
    header.append(heading);

    if (name !== "Team") {
      const star = document.createElement("button");
      star.className = `dashboard-star ${favorites.includes(name) ? "is-active" : ""}`;
      star.innerHTML = favorites.includes(name) ? "★" : "☆";
      star.onclick = () => {
        const currentFavs = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
        const updated = currentFavs.includes(name) 
          ? currentFavs.filter(f => f !== name) 
          : [...currentFavs, name];
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
        renderDashboard(container);
      };
      header.append(star);
    }
    box.append(header);

    const filteredTasks = tasks.filter(t => t.status !== "Stängd" && t.status !== "CLOSED");
const relevantTasks = name === "Team" ? filteredTasks : filteredTasks.filter(t => t.assigned === name);
    const totalCount = relevantTasks.length;

    const total = document.createElement("div");
    total.className = "dashboard-total";
    total.textContent = `Totalt: ${totalCount}`;
    box.append(total);

    STATUSES.forEach(status => {
      const statusTasks = relevantTasks.filter(t => t.status === status.key);
      const percent = totalCount === 0 ? 0 : Math.round((statusTasks.length / totalCount) * 100);

      const group = document.createElement("div");
      group.className = "status-group";

      const toggle = document.createElement("button");
      toggle.className = "status-toggle";
      toggle.innerHTML = `<span class="dot ${status.css}"></span><span>${status.key}: ${statusTasks.length}</span><span class="chevron">▾</span>`;
      
      // Gör raden klickbar för att fälla ut listan
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
          list.append(li);
          li.className = "dashboard-item-text";
        });
      }

      group.append(toggle, progressWrap, list);
      box.append(group);
    });

    wrapper.append(box);
  });

  container.append(wrapper);
}