import { updateTaskStatus } from "./updateTaskStatus.js";
import { TASK_STATUSES } from "../status.js";
import { removeById, loadState, saveState } from "../storage.js";
import { addTaskDialog } from "../comps/dialog.js";
import { setView } from "../views/viewController.js";

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 0 || dateStr === "Nyss") return "Nyss";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('sv-SE', { day: '2-digit', month: '2-digit', year: '2-digit' });
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
    window.dispatchEvent(new CustomEvent('renderApp')); 
  }
};

const renderAssigneeAvatars = (assignedNames = []) => {
  const container = document.createElement("div");
  container.className = "assignee-avatars-list";
  container.setAttribute("role", "button");
  container.setAttribute("tabindex", "0");
  container.setAttribute("aria-label", "Hantera ansvariga");

  if (!assignedNames || assignedNames.length === 0 || (assignedNames.length === 1 && assignedNames[0] === "Ingen")) {
    const empty = document.createElement("span");
    empty.className = "avatar-empty";
    empty.innerHTML = "🟢 Ledig <span style='font-size: 10px; opacity: 0.5; margin-left: 4px;'>✎</span>";
    container.append(empty);
    return container;
  }

  const validNames = assignedNames.filter(name => name && name !== "Ingen");
  
  validNames.forEach((name) => {
    const avatar = document.createElement("div");
    avatar.className = "assignee-avatar-circle";
    avatar.title = name;
    
    // Plockar ut initialerna
    const initials = name.split(" ").map(n => n.charAt(0)).join("").substring(0, 2).toUpperCase();
    avatar.textContent = initials;
    
    container.append(avatar);
  });

  return container;
};

export const listItem = (task) => {
  const isClosed = task.status === TASK_STATUSES.CLOSED;
  const isDone = task.status === TASK_STATUSES.DONE;
  const isTodo = task.status === TASK_STATUSES.TODO;
  
  const div = document.createElement("div");
  div.className = `listItem ${isClosed ? "is-closed" : ""} is-expandable`;
  div.setAttribute("role", "button");
  div.setAttribute("tabindex", "0");
  div.setAttribute("aria-expanded", "false");
  
  const toggleExpand = () => {
    const expanded = div.classList.toggle('is-expanded');
    div.setAttribute("aria-expanded", String(expanded));
  };

  div.onclick = (e) => {
    if (e.target.closest('.taskControls') || e.target.closest('.task-contact-explicit') || e.target.closest('.assignee-avatars-list')) return;
    toggleExpand();
  };

  div.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.target === div) { 
          e.preventDefault();
          toggleExpand();
      }
    }
  };

  const headerRow = document.createElement("div");
  headerRow.className = "card-header-row";

  const dateRow = document.createElement("div");
  dateRow.className = "date-row";
  dateRow.innerHTML = `
    <div class="meta-item"><span class="meta-label">SKAPAD</span><span class="meta-value">${formatDate(task.createdAt)}</span></div>
  `;

  if (task.deadline) {
    const isOverdue = new Date(task.deadline) < new Date() && !isDone && !isClosed;
    dateRow.innerHTML += `
      <div class="meta-item ${isOverdue ? "deadline-overdue" : ""}">
        <span class="meta-label">DEADLINE</span><span class="meta-value">${formatDate(task.deadline)}</span>
      </div>
    `;
  }

  const badge = document.createElement("div");
  badge.className = "statusBadge hero-badge";
  badge.setAttribute("data-status", task.status);
  badge.textContent = task.status;

  headerRow.append(dateRow, badge);

  const mainContent = document.createElement("div");
  mainContent.className = "taskMainContent";
  mainContent.innerHTML = `
    <h3 class="taskTitle highlight-title">${task.title || "Utan titel"}</h3>
    <p class="taskDescription">${task.description || "Ingen beskrivning."}</p>
  `;

  if (task.contactId && task.contactName) {
    const linkDiv = document.createElement("div");
    linkDiv.className = "task-contact-explicit";
    linkDiv.style.cssText = "margin-top: 10px; padding: 6px 10px; background: rgba(34,211,238,0.1); border-radius: 4px; color: var(--accent-cyan); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: bold; border: 1px solid rgba(34,211,238,0.2); width: fit-content;";
    linkDiv.innerHTML = `<span>🔗</span> Länkad till: ${task.contactName} <span style="opacity:0.6;font-size:10px;">↗</span>`;
    
    linkDiv.onclick = (e) => {
      e.stopPropagation(); 
      setView('contacts', { highlightId: task.contactId }); 
    };
    
    mainContent.append(linkDiv);
  }

  const footer = document.createElement("div");
  footer.className = "taskFooter row-layout";

  let assignedArray = task.assignedTo || [];
  if (assignedArray.length === 0 && task.assigned) assignedArray = [task.assigned];
  
  const avatars = renderAssigneeAvatars(assignedArray);
  
  // FIXAD: Tar inte emot 'e' här eftersom addBtn-hjälparen hanterar det!
  const openEditDialog = () => {
      const dialog = addTaskDialog(task);
      document.body.append(dialog);
  };

  // Om man klickar direkt på avatarerna
  avatars.onclick = (e) => {
      e.stopPropagation();
      openEditDialog();
  };
  avatars.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          openEditDialog();
      }
  };

  footer.append(avatars);

  const controls = document.createElement("div");
  controls.className = "taskControls dynamic-grid";

  const addBtn = (icon, label, action, className = "") => {
    const btn = document.createElement("button");
    btn.className = `controlBtn ${className}`;
    btn.innerHTML = icon;
    btn.setAttribute("aria-label", label);
    btn.onclick = (e) => { e.stopPropagation(); action(); };
    controls.append(btn);
  };

  addBtn("↑", "Flytta upp", () => moveTask(task.id, -1));
  addBtn("↓", "Flytta ner", () => moveTask(task.id, 1));

  if (!isTodo && !isClosed) {
    const prevStatus = isDone ? TASK_STATUSES.IN_PROGRESS : TASK_STATUSES.TODO;
    addBtn("←", "Flytta vänster", () => updateTaskStatus(task.id, prevStatus));
  }
  if (!isDone && !isClosed) {
    const nextStatus = isTodo ? TASK_STATUSES.IN_PROGRESS : TASK_STATUSES.DONE;
    addBtn("→", "Flytta höger", () => updateTaskStatus(task.id, nextStatus));
  }

  if (!isClosed) {
    // FIXAD: Nu fungerar din redigera-knapp igen!
    addBtn('<span class="material-symbols-rounded">edit</span>', "Redigera", openEditDialog, "edit-btn");
  }

  addBtn("✕", "Ta bort", () => {
    if (isClosed) {
      if (confirm("Radera permanent?")) removeById(task.id);
    } else {
      const reason = prompt("Anledning till stängning:");
      if (reason?.trim()) updateTaskStatus(task.id, TASK_STATUSES.CLOSED, reason.trim());
    }
  }, "delete-btn");

  footer.append(controls);
  div.append(headerRow, mainContent, footer);
  
  return div;
};