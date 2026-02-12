import { updateTaskAssigned } from "./updateTaskAssigned.js";
import { updateTaskStatus } from "./updateTaskStatus.js";
import { TASK_STATUSES } from "../status.js";
import { getPeople } from "../people/peopleService.js";
import { removeById } from "../storage.js";

/**
 * Formaterar datum till svensk standard: "12 feb 2026"
 */
const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 0 || dateStr === "Nyss") return "Nyss";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('sv-SE', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

export const listItem = (task) => {
  const isClosed = task.status === TASK_STATUSES.CLOSED;
  const isDone = task.status === TASK_STATUSES.DONE;
  // Lås redigering om uppgiften är klar eller arkiverad för att skydda historiken
  const isLocked = isClosed || isDone;

  const div = document.createElement("div");
  div.className = `listItem ${isClosed ? "is-closed" : ""}`;
  if (isLocked) div.classList.add("isLocked");

  const leftCard = document.createElement("div");
  leftCard.className = "leftCard";

  // --- STATUS BADGE ---
  // Denna använder data-status så din CSS kan färglägga den (blå/gul/grön)
  const badge = document.createElement("div");
  badge.className = "statusBadge";
  badge.setAttribute("data-status", task.status);
  badge.textContent = task.status;

  // --- META RAD (Datum & Deadline) ---
  const metaRow = document.createElement("div");
  metaRow.className = "task-meta-row";
  
  // Skapad datum
  const createdDiv = document.createElement("div");
  createdDiv.className = "meta-item";
  createdDiv.innerHTML = `<span class="meta-label">Skapad:</span> <span class="meta-value">${formatDate(task.createdAt)}</span>`;
  metaRow.append(createdDiv);

  // Deadline (visas endast om den finns och blir röd via din CSS-klass)
  if (task.deadline && task.deadline !== 0) {
    const deadlineDiv = document.createElement("div");
    deadlineDiv.className = "meta-item deadline-highlight";
    deadlineDiv.innerHTML = `<span class="meta-label">Deadline:</span> <span class="meta-value">${formatDate(task.deadline)}</span>`;
    metaRow.append(deadlineDiv);
  }

  // --- TITEL ---
  const title = document.createElement("span");
  title.className = "taskTitle";
  title.textContent = task.title;

  // --- PERSONVAL (Dropdown) ---
  const assignedSelect = document.createElement("select");
  assignedSelect.className = "assignedSelect";
  
  if (isLocked) {
    assignedSelect.disabled = true;
    assignedSelect.style.opacity = "0.7";
  }

  const people = getPeople();
  
  // FIX: Behåll namn på personer som raderats (t.ex. Alex) om uppgiften är historisk
  if (!people.includes(task.assigned) && task.assigned !== "Ingen") {
    const oldOpt = document.createElement("option");
    oldOpt.value = task.assigned;
    oldOpt.textContent = task.assigned;
    oldOpt.selected = true;
    assignedSelect.append(oldOpt);
  }

  people.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p; 
    opt.textContent = p;
    if (task.assigned === p) opt.selected = true;
    assignedSelect.append(opt);
  });

  assignedSelect.onchange = () => updateTaskAssigned(task.id, assignedSelect.value);

  // --- KONTROLLER (Pilar & Radera) ---
  const controls = document.createElement("div");
  controls.className = "taskControls";

  // Visa pilar endast om uppgiften inte är stängd/arkiverad
  if (!isClosed) {
    // Bakåt-pil
    if (task.status !== TASK_STATUSES.TODO) {
      const b = document.createElement("button"); 
      b.className = "backBtn"; 
      b.innerHTML = "←";
      b.onclick = () => updateTaskStatus(task.id, isDone ? TASK_STATUSES.IN_PROGRESS : TASK_STATUSES.TODO);
      controls.append(b);
    }
    // Framåt-pil
    if (task.status !== TASK_STATUSES.DONE) {
      const n = document.createElement("button"); 
      n.className = "nextBtn"; 
      n.innerHTML = "→";
      n.onclick = () => updateTaskStatus(task.id, task.status === TASK_STATUSES.TODO ? TASK_STATUSES.IN_PROGRESS : TASK_STATUSES.DONE);
      controls.append(n);
    }
  }

  // Radera/Arkivera-knapp (X)
  const delBtn = document.createElement("button");
  delBtn.className = "deleteTaskBtn"; 
  delBtn.innerHTML = "✕";
  delBtn.onclick = (e) => {
    e.stopPropagation();
    if (isClosed) {
      if (confirm("Vill du radera denna uppgift permanent från arkivet?")) {
        removeById(task.id);
      }
    } else {
      const reason = prompt("Ange anledning till att uppgiften stängs:");
      if (reason?.trim()) {
        updateTaskStatus(task.id, TASK_STATUSES.CLOSED, reason.trim());
      }
    }
  };
  controls.append(delBtn);

  // --- MONTERING ---
  leftCard.append(badge, metaRow, title, assignedSelect);
  div.append(leftCard, controls);

  return div;
};