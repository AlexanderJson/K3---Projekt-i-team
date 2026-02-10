import { loadState } from "../storage.js";

export function renderDashboardPanel({ person = null }) {
  const state = loadState();
  const tasks = state.tasks || [];

  const filteredTasks = person
    ? tasks.filter(t => t.assigned === person)
    : tasks;

  const panel = document.createElement("section");
  panel.classList.add("dashboard-panel");

  const title = document.createElement("h2");
  title.textContent = person ? person : "Team";

  const total = document.createElement("p");
  total.textContent = `Total antal uppgifter: ${filteredTasks.length}`;

  const list = document.createElement("ul");

  const counts = {};
  filteredTasks.forEach(t => {
    counts[t.assigned] = (counts[t.assigned] || 0) + 1;
  });

  Object.entries(counts).forEach(([name, count]) => {
    const li = document.createElement("li");
    li.textContent = `${name}: ${count} uppgifter`;
    list.append(li);
  });

  panel.append(title, total, list);
  return panel;
}