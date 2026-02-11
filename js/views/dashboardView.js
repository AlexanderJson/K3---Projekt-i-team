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

  const favorites =
    JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

  // ---------- UI WRAPPER ----------
  const wrapper = document.createElement("div");
  wrapper.className = "dashboard";

  const title = document.createElement("h2");
  title.textContent = "Dashboard";
  wrapper.append(title);

  // ---------- DROPDOWN (tillfällig vy) ----------
  const controls = document.createElement("div");
  controls.className = "dashboard-controls";

  const select = document.createElement("select");
  select.multiple = true;
  select.className = "dashboard-select";

  people.forEach(person => {
    const option = document.createElement("option");
    option.value = person;
    option.textContent = person;
    select.append(option);
  });

  controls.append(select);
  wrapper.append(controls);

  let selectedPeople = [];

  select.addEventListener("change", () => {
    selectedPeople = Array.from(select.selectedOptions).map(
      o => o.value
    );
    render();
  });

  // ---------- RENDER DASHBOARDS ----------
  function render() {
    // rensa gamla boxar
    wrapper
      .querySelectorAll(".dashboard-box")
      .forEach(b => b.remove());

    const visiblePeople = [
      ...new Set([
        ...favorites,
        ...selectedPeople.filter(p => !favorites.includes(p))
      ])
    ];

    const dashboards = ["Team", ...visiblePeople];

    dashboards.forEach(name => {
      const box = document.createElement("div");
      box.className = "dashboard-box";

      // ----- HEADER -----
      const header = document.createElement("div");
      header.className = "dashboard-box-header";

      const heading = document.createElement("h3");
      heading.textContent = name;
      header.append(heading);

      // ----- STAR (endast personer) -----
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

      // ----- DATA -----
      const relevantTasks =
        name === "Team"
          ? tasks
          : tasks.filter(t => t.assigned === name);

      const totalCount = relevantTasks.length;

      const total = document.createElement("div");
      total.className = "dashboard-total";
      total.textContent = `Totalt antal uppgifter: ${totalCount}`;
      box.append(total);

      // ----- STATUS -----
      STATUSES.forEach(status => {
        const statusTasks = relevantTasks.filter(
          t => t.status === status.key
        );

        const percent =
          totalCount === 0
            ? 0
            : Math.round(
                (statusTasks.length / totalCount) * 100
              );

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

        statusTasks.forEach(task => {
          const li = document.createElement("li");
          li.textContent = task.title;
          list.append(li);
        });

        group.append(toggle, progressWrap, list);
        box.append(group);
      });

      wrapper.append(box);
    });
  }

  // ---------- FAVORIT-LOGIK ----------
  function toggleFavorite(name) {
    let updated;

    if (favorites.includes(name)) {
      updated = favorites.filter(f => f !== name);
    } else {
      updated = [...favorites, name];
    }

    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(updated)
    );

    renderDashboard(container);
  }

  render();
  container.append(wrapper);
}