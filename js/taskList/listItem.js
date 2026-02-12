import { updateTaskAssigned } from "./updateTaskAssigned.js";
import { updateTaskStatus } from "./updateTaskStatus.js";
import { TASK_STATUSES } from "../status.js";
import { getPeople } from "../people/peopleService.js";
import { removeById } from "../storage.js";

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 0 || dateStr === "Nyss") return "Nyss";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('sv-SE', { 
    day: 'numeric', month: 'short', year: 'numeric' 
  });
};

export const listItem = (task) => {
  const isClosed = task.status === TASK_STATUSES.CLOSED;
  const isDone = task.status === TASK_STATUSES.DONE;
  const isLocked = isClosed || isDone; // Lås om klar/stängd

  const div = document.createElement("div");
  div.className = `listItem ${isClosed ? "is-closed" : ""}`;

  const leftCard = document.createElement("div");
  leftCard.className = "leftCard";

  // META-RAD (Skapad & Deadline)
  const metaRow = document.createElement("div");
  metaRow.className = "task-meta-row";
  metaRow.innerHTML = `
    <div class="meta-item"><span class="meta-label">Skapad:</span> ${formatDate(task.createdAt)}</div>
    ${task.deadline && task.deadline !== 0 ? `<div class="meta-item deadline-highlight"><span class="meta-label">Deadline:</span> ${formatDate(task.deadline)}</div>` : ""}
  `;

  const title = document.createElement("span");
  title.className = "taskTitle";
  title.textContent = task.title;

  if (task.description) {
    const desc = document.createElement("p");
    desc.className = "task-desc-text";
    desc.textContent = task.description;
    leftCard.append(desc);
  }

  const assignedSelect = document.createElement("select");
  assignedSelect.className = "assignedSelect";
  
  if (isLocked) {
    assignedSelect.disabled = true;
    assignedSelect.style.opacity = "0.7";
  }

  const people = getPeople();
  // FIX: Om personen raderats men tasken är KLAR/STÄNGD -> Visa namnet ändå!
  if (!people.includes(task.assigned) && task.assigned !== "Ingen") {
    const oldOpt = document.createElement("option");
    oldOpt.value = task.assigned;
    oldOpt.textContent = task.assigned;
    oldOpt.selected = true;
    assignedSelect.append(oldOpt);
  }

  people.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p; opt.textContent = p;
    if (task.assigned === p) opt.selected = true;
    assignedSelect.append(opt);
  });
  assignedSelect.onchange = () => updateTaskAssigned(task.id, assignedSelect.value);

  const controls = document.createElement("div");
  controls.className = "taskControls";

  // Pilar för navigering
  if (!isClosed) {
    if (task.status !== TASK_STATUSES.TODO) {
      const b = document.createElement("button"); b.className = "backBtn"; b.innerHTML = "←";
      b.onclick = () => updateTaskStatus(task.id, task.status === TASK_STATUSES.DONE ? TASK_STATUSES.IN_PROGRESS : TASK_STATUSES.TODO);
      controls.append(b);
    }
    if (task.status !== TASK_STATUSES.DONE) {
      const n = document.createElement("button"); n.className = "nextBtn"; n.innerHTML = "→";
      n.onclick = () => updateTaskStatus(task.id, task.status === TASK_STATUSES.TODO ? TASK_STATUSES.IN_PROGRESS : TASK_STATUSES.DONE);
      controls.append(n);
    }
  }

  const delBtn = document.createElement("button");
  delBtn.className = "deleteTaskBtn"; delBtn.innerHTML = "✕";
  delBtn.onclick = (e) => {
    e.stopPropagation();
    if (isClosed) {
      if (confirm("Radera helt från arkivet?")) removeById(task.id);
    } else {
      const c = prompt("Anledning för arkivering:");
      if (c?.trim()) updateTaskStatus(task.id, TASK_STATUSES.CLOSED, c.trim());
    }
  };
  controls.append(delBtn);

  leftCard.prepend(metaRow);
  leftCard.append(title, assignedSelect);
  div.append(leftCard, controls);
  return div;
};