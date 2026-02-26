import { updateTaskStatus } from "./updateTaskStatus.js";
import { TASK_STATUSES } from "../status.js";
import { removeById, loadState, saveState } from "../storage.js";
import { addTaskDialog, showConfirmDialog, showPromptDialog } from "../comps/dialog.js";
import { setView } from "../views/viewController.js";
import { getPeople } from "../people/peopleService.js";

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
    empty.className = "avatar-empty glow-up-btn";
    empty.innerHTML = "<span class='status-dot'></span> Ledig";
    container.append(empty);
    return container;
  }

  const validNames = assignedNames.filter(name => name && name !== "Ingen");
  const allPeople = getPeople().filter(name => name !== "Ingen");
  
  // If all team members are assigned
  const isFullTeam = validNames.length > 0 && validNames.length >= allPeople.length;

  if (isFullTeam) {
    const teamBadge = document.createElement("div");
    teamBadge.className = "team-badge full-team tooltip-container";
    teamBadge.setAttribute("aria-label", validNames.join(", "));
    teamBadge.setAttribute("role", "text");
    teamBadge.setAttribute("tabindex", "0");
    const stateUrl = loadState();
    const currentTeamName = stateUrl?.settings?.teamName || "TEAM MALMÖ";
    teamBadge.textContent = currentTeamName.toUpperCase();
    container.append(teamBadge);
    return container;
  }

  validNames.forEach((name) => {
    const avatar = document.createElement("div");
    avatar.className = "assignee-avatar-circle tooltip-container";
    avatar.setAttribute("aria-label", name);
    avatar.setAttribute("role", "text");
    avatar.setAttribute("tabindex", "0");

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
  div.className = `listItem ${isClosed ? "is-closed" : ""}`;
  div.setAttribute("role", "listitem");
  div.setAttribute("tabindex", "0");

  const headerRow = document.createElement("div");
  headerRow.className = "card-header-row";

  const dateRow = document.createElement("div");
  dateRow.className = "date-row";
  dateRow.innerHTML = `
    <div class="meta-item" role="group" aria-label="Skapad: ${formatDate(task.createdAt)}"><span class="meta-label" aria-hidden="true">SKAPAD</span><span class="meta-value" aria-hidden="true">${formatDate(task.createdAt)}</span></div>
  `;

  if (task.deadline) {
    const isOverdue = new Date(task.deadline) < new Date() && !isDone && !isClosed;
    dateRow.innerHTML += `
      <div class="meta-item ${isOverdue ? "deadline-overdue" : ""}" role="group" aria-label="Deadline: ${formatDate(task.deadline)}">
        <span class="meta-label" aria-hidden="true">DEADLINE</span><span class="meta-value" aria-hidden="true">${formatDate(task.deadline)}</span>
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

  // Check if notes exist AND have entries
  const hasNotes = task.notes && task.notes.length > 0;

  if ((task.contactId && task.contactName) || hasNotes) {
    const extraRow = document.createElement("div");
    extraRow.className = "task-extra-row";

    if (task.contactId && task.contactName) {
      const linkDiv = document.createElement("div");
      linkDiv.className = "task-contact-pill tooltip-container";
      linkDiv.setAttribute("aria-label", "Gå till kontakt");
      linkDiv.innerHTML = `<span class="material-symbols-rounded" style="font-size:14px; margin-right:2px;">link</span> Kontakt: ${task.contactName} <span class="material-symbols-rounded arrow-icon">arrow_outward</span>`;

      linkDiv.onclick = (e) => {
        e.stopPropagation();
        setView('contacts', { highlightId: task.contactId });
      };

      extraRow.append(linkDiv);
    }

    if (hasNotes) {
      const noteBadge = document.createElement("div");
      noteBadge.className = "task-note-indicator tooltip-container";
      noteBadge.setAttribute("aria-label", `Denna uppgift har ${task.notes.length} notering(ar)`);
      // Använd en paperclip- eller chat-ikon. Vi använder styling i css för att göra den subtle-amber.
      noteBadge.innerHTML = `<span class="material-symbols-rounded" style="font-size:14px;">chat</span>`;
      extraRow.append(noteBadge);
    }

    mainContent.append(extraRow);
  }

  const footer = document.createElement("div");
  footer.className = "taskFooter row-layout";

  let assignedArray = task.assignedTo || [];
  if (assignedArray.length === 0 && task.assigned) assignedArray = [task.assigned];

  const avatars = renderAssigneeAvatars(assignedArray);

  // FIXAD: Tar inte emot 'e' här eftersom addBtn-hjälparen hanterar det!
  const openEditDialog = () => {
    addTaskDialog(task);
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

  const controls = document.createElement("nav");
  controls.className = "taskControls command-bar";
  controls.setAttribute("aria-label", "Uppgiftskontroller");

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

  addBtn("✕", "Ta bort", async () => {
    if (isClosed) {
      const confirmed = await showConfirmDialog("Radera permanent?");
      if (confirmed) removeById(task.id);
    } else {
      const reason = await showPromptDialog("Anledning till stängning:");
      if (reason?.trim()) updateTaskStatus(task.id, TASK_STATUSES.CLOSED, reason.trim());
    }
  }, "delete-btn");

  footer.append(controls);
  div.append(headerRow, mainContent, footer);

  // Klick på själva kortet (men inte knapparna) för att expandera/kollapsa
  div.addEventListener("click", (e) => {
    // Om man klickar inuti nav eller avatarer ska vi inte stänga/öppna kortet
    if (e.target.closest('.taskControls') || e.target.closest('.assignee-avatars-list') || e.target.closest('.task-contact-explicit')) {
      return;
    }
    div.classList.toggle('expanded');
  });

  return div;
};