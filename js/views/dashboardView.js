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
  
  // Hämta det dynamiska teamnamnet från state (Subtask: visa teamnamn istället för statisk text)
  const teamName = state.settings?.teamName || "Mitt Team";

  const favorites =
    JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

  let currentFilter = localStorage.getItem("dashboardViewFilter") || "Team";

  // ---------- UI WRAPPER ----------
  const wrapper = document.createElement("div");
  wrapper.className = "dashboard";

  const title = document.createElement("h2");
  title.textContent = "Dashboard";
  wrapper.append(title);

  // ---------- DROPDOWN (Med dynamiskt teamnamn) ----------
  const controls = document.createElement("div");
  controls.className = "dashboard-controls";
  controls.style.marginBottom = "24px"; 

  const filterLabel = document.createElement("span");
  filterLabel.textContent = "Visa dashboard för: ";
  filterLabel.style.marginRight = "8px";

  const select = document.createElement("select");
  select.className = "taskFilterSelect"; 

  // Dynamiskt team-alternativ baserat på inställningar
  const teamOption = document.createElement("option");
  teamOption.value = "Team";
  teamOption.textContent = teamName; // Här används det sparade namnet, t.ex. "Team Malmö"
  select.append(teamOption);

  people.forEach(person => {
    const option = document.createElement("option");
    option.value = person;
    option.textContent = person;
    select.append(option);
  });

  select.value = currentFilter;

  select.addEventListener("change", (e) => {
    localStorage.setItem("dashboardViewFilter", e.target.value);
    render();
  });

  controls.append(filterLabel, select);
  wrapper.append(controls);

  // ---------- RENDER LOGIK ----------
  function render() {
    wrapper.querySelectorAll(".dashboard-box").forEach(b => b.remove());

    const activeFilter = localStorage.getItem("dashboardViewFilter") || "Team";

    const visiblePeople = activeFilter === "Team" 
      ? favorites 
      : [...new Set([activeFilter, ...favorites])];

    const dashboards = ["Team", ...visiblePeople];

    dashboards.forEach(name => {
      const box = document.createElement("div");
      box.className = "dashboard-box";

      const header = document.createElement("div");
      header.className = "dashboard-box-header";

      const heading = document.createElement("h3");
      // Använd teamnamnet även som rubrik på dashboard-boxen
      heading.textContent = name === "Team" ? teamName : name;
      header.append(heading);

      if (name !== "Team") {
        const star = document.createElement("button");
        star.className = "dashboard-star";
        star.innerHTML = favorites.includes(name) ? "★" : "☆";

        if (favorites.includes(name)) {
          star.classList.add("is-active");
        }

        star.addEventListener("click", () => {
          toggleFavorite(name);
        });

        header.append(star);
      }

      box.append(header);

      const relevantTasks =
        name === "Team"
          ? tasks
          : tasks.filter(t => t.assigned === name);

      const totalCount = relevantTasks.length;

      const total = document.createElement("div");
      total.className = "dashboard-total";
      total.textContent = `Totalt antal uppgifter: ${totalCount}`;
      box.append(total);

      STATUSES.forEach(status => {
        const statusTasks = relevantTasks.filter(
          t => t.status === status.key
        );

        const percent = totalCount === 0 ? 0 : Math.round((statusTasks.length / totalCount) * 100);

        const group = document.createElement("div");
        group.className = "status-group";

        const toggle = document.createElement("button");
        toggle.className = "status-toggle";

        const dot = document.createElement("span");
        dot.className = `dot ${status.css}`;

        const label = document.createElement("span");
        label.textContent = `${status.key}: ${statusTasks.length}`;

        const chevron = document.createElement("span");
        chevron.className = "chevron";
        chevron.textContent = "▾";

        toggle.append(dot, label, chevron);
        toggle.addEventListener("click", () => {
          group.classList.toggle("open");
        });

        const progressWrap = document.createElement("div");
        progressWrap.className = "progress-wrap";

        const progressBar = document.createElement("div");
        progressBar.className = `progress-bar ${status.css}`;
        progressBar.style.width = `${percent}%`;

        progressWrap.append(progressBar);

        const list = document.createElement("ul");
        list.className = "status-list";

        if (statusTasks.length === 0) {
          const emptyItem = document.createElement("li");
          emptyItem.textContent = "Inga uppgifter här";
          emptyItem.style.fontStyle = "italic";
          emptyItem.style.opacity = "0.5";
          list.append(emptyItem);
        } else {
          statusTasks.forEach(task => {
            const li = document.createElement("li");
            li.textContent = task.title;
            list.append(li);
          });
        }

        group.append(toggle, progressWrap, list);
        box.append(group);
      });

      wrapper.append(box);
    });
  }

  function toggleFavorite(name) {
    let updated;
    const currentFavs = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

    if (currentFavs.includes(name)) {
      updated = currentFavs.filter(f => f !== name);
    } else {
      updated = [...currentFavs, name];
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    renderDashboard(container);
  }

  render();
  container.append(wrapper);
}