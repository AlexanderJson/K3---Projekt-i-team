import { updateTaskAssigned } from "./updateTaskAssigned.js";
import { updateTaskStatus } from "./updateTaskStatus.js";
import { TASK_STATUSES } from "../status.js";
import { getPeople } from "../people/peopleService.js";
import { removeById, saveState, loadState } from "../storage.js";
import { addTaskDialog } from "../comps/dialog.js";

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 0 || dateStr === "Nyss") return "Nyss";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('sv-SE', { 
    day: 'numeric', month: 'short', year: 'numeric' 
  });
};

const moveTask = (id, direction) => {
  const state = loadState();
  const tasks = state.tasks || [];
  const index = tasks.findIndex(t => String(t.id) === String(id));
  if (index === -1) return;

  const currentTask = tasks[index];
  const sameStatusTasks = tasks.filter(t => t.status === currentTask.status);
  const internalIndex = sameStatusTasks.findIndex(t => String(t.id) === String(id));
  const targetInternalIndex = internalIndex + direction;

  if (targetInternalIndex >= 0 && targetInternalIndex < sameStatusTasks.length) {
    const targetTask = sameStatusTasks[targetInternalIndex];
    const globalTargetIndex = tasks.findIndex(t => String(t.id) === String(targetTask.id));
    const temp = tasks[index];
    tasks[index] = tasks[globalTargetIndex];
    tasks[globalTargetIndex] = temp;
    saveState(state);
  }
};

export const listItem = (task) => {
  const isTodo = task.status === TASK_STATUSES.TODO;
  const isDone = task.status === TASK_STATUSES.DONE;
  const isClosed = task.status === TASK_STATUSES.CLOSED;
  const isLocked = isDone || isClosed;

  const div = document.createElement("div");
  div.className = `listItem ${isClosed ? "is-closed" : ""} is-expandable`;
  
  div.onclick = (e) => {
    if (e.target.closest('.taskControls') || e.target.closest('.assignedSelect')) return;
    div.classList.toggle('is-expanded');
  };

  // HEADER (Datum & Badge)
  const headerRow = document.createElement("div");
  headerRow.className = "card-header-row";

  // Ny behållare för rader av datum
  const dateRow = document.createElement("div");
  dateRow.className = "date-row";

  const createdBlock = document.createElement("div");
  createdBlock.className = "meta-item";
  createdBlock.innerHTML = `<span class="meta-label">SKAPAD</span><span class="meta-value">${formatDate(task.createdAt)}</span>`;
  dateRow.append(createdBlock);

  if (task.deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(task.deadline);
    const isOverdue = deadlineDate < today && task.status !== TASK_STATUSES.DONE && task.status !== TASK_STATUSES.CLOSED;

    const deadlineBlock = document.createElement("div");
    deadlineBlock.className = `meta-item ${isOverdue ? "deadline-overdue" : ""}`;
    deadlineBlock.innerHTML = `<span class="meta-label">DEADLINE</span><span class="meta-value">${formatDate(task.deadline)}</span>`;
    dateRow.append(deadlineBlock);
  }

  const badge = document.createElement("div");
  badge.className = "statusBadge hero-badge"; 
  badge.setAttribute("data-status", task.status);
  badge.textContent = task.status;
  
  // Vi lägger till dateRow istället för dateColumn
  headerRow.append(dateRow, badge);

  // CONTENT
  const mainContent = document.createElement("div");
  mainContent.className = "taskMainContent";
  mainContent.innerHTML = `
    <h3 class="taskTitle highlight-title">${task.title}</h3>
    <p class="taskDescription">${task.description || "Ingen beskrivning tillgänglig."}</p>
  `;

  // FOOTER
  const footer = document.createElement("div");
  footer.className = "taskFooter row-layout";

  // Namnhantering: Om uppgiften är låst (Klar/Stängd) men personen är borttagen, visa namnet ändå.
  const currentTeam = getPeople();
  const personExists = currentTeam.includes(task.assigned);

  if (isLocked && !personExists && task.assigned !== "Ingen") {
    // Visa det historiska namnet som en snygg etikett istället för en tom select
    const legacyName = document.createElement("div");
    legacyName.className = "legacy-assigned-name";
    legacyName.textContent = task.assigned;
    footer.append(legacyName);
  } else {
    // Normal rullista för aktiva uppgifter eller existerande personer
    const assignedSelect = document.createElement("select");
    assignedSelect.className = "assignedSelect compact-select";
    assignedSelect.disabled = isLocked;
    
    currentTeam.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p; 
      
      // Om namnet är "Ingen", visa "Ledig uppgift" istället
      opt.textContent = (p === "Ingen") ? "🟢 Ledig uppgift" : p;
      
      if (task.assigned === p) opt.selected = true;
      assignedSelect.append(opt);
    });

    assignedSelect.onchange = (e) => {
      e.stopPropagation();
      updateTaskAssigned(task.id, assignedSelect.value);
    };
    footer.append(assignedSelect);
  }

  const controls = document.createElement("div");
  controls.className = "taskControls dynamic-grid";

  const addBtn = (text, action, className = "") => {
    const btn = document.createElement("button");
    btn.className = `controlBtn large-control ${className}`;
    btn.innerHTML = text;
    btn.onclick = (e) => { e.stopPropagation(); action(); };
    controls.append(btn);
  };

  addBtn("↑", () => moveTask(task.id, -1));
  addBtn("↓", () => moveTask(task.id, 1));

  if (!isTodo && !isClosed) {
    const prevStatus = isDone ? TASK_STATUSES.IN_PROGRESS : TASK_STATUSES.TODO;
    addBtn("←", () => updateTaskStatus(task.id, prevStatus));
  }
  if (!isDone && !isClosed) {
    const nextStatus = isTodo ? TASK_STATUSES.IN_PROGRESS : TASK_STATUSES.DONE;
    addBtn("→", () => updateTaskStatus(task.id, nextStatus));
  }

  addBtn("✕", () => {
    if (isClosed) { if (confirm("Radera permanent?")) removeById(task.id); }
    else { const c = prompt("Anledning:"); if (c?.trim()) updateTaskStatus(task.id, TASK_STATUSES.CLOSED, c.trim()); }
  }, "delete-btn");

  addBtn(
  `<span class="material-symbols-rounded">edit</span>`,
  () => {
    const dialog = addTaskDialog(task);
    document.body.append(dialog);
  },
  "edit-btn"
);

  footer.append(controls);
  div.append(headerRow, mainContent, footer);
  
  return div;
};