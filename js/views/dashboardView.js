import { loadState } from "../storage.js";

const STATUSES = [
  { key: "Att göra", css: "todo" },
  { key: "Pågår", css: "progress" },
  { key: "Klar", css: "done" }
];

export function renderDashboard(container, selectedPeople = []) {
  container.innerHTML = "";

  const state = loadState();
  const tasks = state.tasks || [];
  const people = state.people || [];

  const wrapper = document.createElement("div");
  wrapper.className = "dashboard";

  // ---- Titel ----
  const title = document.createElement("h2");
  title.textContent = "Dashboard";
  wrapper.append(title);

  // ---- Filter (personer) ----
  const filters = document.createElement("div");
  filters.className = "dashboard-filters";

  people.forEach(person => {
    const label = document.createElement("label");
    label.className = "dashboard-filter";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selectedPeople.includes(person);

    checkbox.addEventListener("change", () => {
      const updated = checkbox.checked
        ? [...selectedPeople, person]
        : selectedPeople.filter(p => p !== person);

      renderDashboard(container, updated);
    });

    label.append(checkbox, person);
    filters.append(label);
  });

  wrapper.append(filters);

  // ---- Dashboards (Team alltid först) ----
  const dashboards = ["Team", ...selectedPeople];

  dashboards.forEach(name => {
    const box = document.createElement("div");
    box.className = "dashboard-box";

    const heading = document.createElement("h3");
    heading.textContent = name;
    box.append(heading);

    const relevantTasks =
      name === "Team"
        ? tasks
        : tasks.filter(t => t.assigned === name);

    const totalCount = relevantTasks.length;

    const total = document.createElement("div");
    total.className = "dashboard-total";
    total.textContent = `Totalt antal uppgifter: ${totalCount}`;
    box.append(total);

    // ---- Statusgrupper ----
    STATUSES.forEach(status => {
      const statusTasks = relevantTasks.filter(
        t => t.status === status.key
      );

      const percent = totalCount === 0
        ? 0
        : Math.round((statusTasks.length / totalCount) * 100);

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

      // ---- Progress bar ----
      const progressWrap = document.createElement("div");
      progressWrap.className = "progress-wrap";

      const progressBar = document.createElement("div");
      progressBar.className = `progress-bar ${status.css}`;
      progressBar.style.width = `${percent}%`;

      progressWrap.append(progressBar);

      // ---- Lista med uppgifter ----
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

  container.append(wrapper);
}