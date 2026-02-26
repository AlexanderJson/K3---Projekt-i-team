
import { TASK_STATUSES } from "../status.js";



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
const assigneeAvatars = (task, {onEditTask}) =>
{
  let assignedArray = task.assignedTo || [];
  if (assignedArray.length === 0 && task.assigned) assignedArray = [task.assigned];
  
  const avatars = renderAssigneeAvatars(assignedArray);
  
  // FIXAD: Tar inte emot 'e' här eftersom addBtn-hjälparen hanterar det!
  const openEditDialog = () =>  onEditTask(task);

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
  return avatars;
}
const cardFooter = (task, {isDone, isClosed, isTodo},{onEditTask, onMoveTask, onChangeStatus, onDeleteTask}) =>
{
  const footer = document.createElement("div");
  footer.className = "taskFooter row-layout";


  const avatars = assigneeAvatars(task, { onEditTask });
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

    addBtn("↑", "Flytta upp", () => onMoveTask?.(task.id, "up"));
    addBtn("↓", "Flytta ner", () => onMoveTask?.(task.id, "down"));

  
  if (!isTodo && !isClosed) {
    const prevStatus = isDone ? TASK_STATUSES.IN_PROGRESS : TASK_STATUSES.TODO;
    addBtn("←", "Flytta vänster", () => onChangeStatus(task.id, prevStatus));
  }
  if (!isDone && !isClosed) {
    const nextStatus = isTodo ? TASK_STATUSES.IN_PROGRESS : TASK_STATUSES.DONE;
    addBtn("→", "Flytta höger", () => onChangeStatus(task.id, nextStatus));
  }

  if (!isClosed) {
    // FIXAD: Nu fungerar din redigera-knapp igen!
    addBtn('<span class="material-symbols-rounded">edit</span>', "Redigera", () => onEditTask(task), "edit-btn");
  }

  addBtn("✕", "Ta bort", () => onDeleteTask(task));

  footer.append(controls);
  return footer;
}

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 0 || dateStr === "Nyss") return "Nyss";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('sv-SE', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const cardHeader = (task, {isDone, isClosed}) =>
{
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
  return headerRow;
}
const cardBody = (task, {onNavigate}) =>
{
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
      onNavigate("contacts", { highlightId: task.contactId });
    };
    
    mainContent.append(linkDiv);
  }
  return mainContent;
}


export const listItem = (task, actions = {}) => {
  const isClosed = task.status === TASK_STATUSES.CLOSED;
  const isDone = task.status === TASK_STATUSES.DONE;
  const isTodo = task.status === TASK_STATUSES.TODO;
  const flags = {isClosed, isDone, isTodo};

  const div = document.createElement("div");
  div.className = `listItem ${isClosed ? "is-closed" : ""}`;
  div.setAttribute("role", "listitem");

  // Added for some unit tests to pass (temp)
  const safeActions = {
  onNavigate: actions.onNavigate ?? (() => {}),
  onEditTask: actions.onEditTask ?? (() => {}),
  onMoveTask: actions.onMoveTask ?? (() => {}),
  onChangeStatus: actions.onChangeStatus ?? (() => {}),
  onDeleteTask: actions.onDeleteTask ?? (() => {})
  };




  

  div.append(
    cardHeader(task,flags),
    cardBody(task,{ onNavigate: safeActions.onNavigate }),
    cardFooter(task,flags,safeActions)
  );
  
  return div;
};