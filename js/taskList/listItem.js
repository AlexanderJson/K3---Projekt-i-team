import { updateTaskAssigned } from "./updateTaskAssigned.js";
import { updateTaskStatus } from "./updateTaskStatus.js";
import { TASK_STATUSES } from "../status.js";
import { getPeople } from "../people/peopleService.js";
import { removeById, saveState, loadState } from "../storage.js";
import { addTaskDialog } from "../comps/dialog.js";
import { setView } from "../views/viewController.js";

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 0 || dateStr === "Nyss") return "Nyss";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString('sv-SE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: '2-digit' 
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
  // Helper för att göra kontaktnamn klickbara
  const formatDescription = (desc) => {
    if (!desc) return "Ingen beskrivning tillgänglig.";
    
    // Ladda kontakter
    const state = loadState(); 
    const contacts = state.contacts || [];
    
    // Valid Contacts Check
    if (!contacts || contacts.length === 0) return desc;

    let formatted = desc;
    contacts.forEach(contact => {
        if (!contact.name || contact.name.length < 2) return; // Skip invalid/short names
        
        try {
            // Escape special regex chars in name
            const safeName = contact.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${safeName}\\b`, 'g');
            formatted = formatted.replace(regex, `<span class="contact-link" data-id="${contact.id}">${contact.name}</span>`);
        } catch (e) {
            console.error("Regex fail for contact", contact.name, e);
        }
    });
    return formatted;
  };

  let rawTitle = task.title ? String(task.title).trim() : "";
  if (rawTitle.length === 0) rawTitle = "Utan titel";
  
  // Use plain title to avoid layout issues with HTML/line-clamp
  const titleText = rawTitle;
  const descHTML = formatDescription(task.description);

  mainContent.innerHTML = `
    <h3 class="taskTitle highlight-title">${titleText}</h3>
    <p class="taskDescription">${descHTML}</p>
  `;

  // EXPLICIT LINKED CONTACT
  if (task.contactId && task.contactName) {
      const linkDiv = document.createElement("div");
      linkDiv.className = "task-contact-explicit";
      linkDiv.style.cssText = "margin-top: 10px; padding: 6px 10px; background: rgba(34,211,238,0.1); border-radius: 4px; color: var(--accent-cyan); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: bold; border: 1px solid rgba(34,211,238,0.2);";
      linkDiv.innerHTML = `<span>👤</span> ${task.contactName} <span style="opacity:0.6;font-size:10px;">↗</span>`;
      
      linkDiv.onclick = (e) => {
        e.stopPropagation();
        setView('contacts', { highlightId: task.contactId });
      };
      
      mainContent.append(linkDiv);
  }

  // Lägg till klick-handlers för länkarna
  mainContent.querySelectorAll('.contact-link').forEach(link => {
      link.onclick = (e) => {
          e.stopPropagation(); // Hindra att kortet expanderar/kollapsar
          const id = link.dataset.id;
          setView('contacts', { highlightId: id });
      };
  });

  if (isClosed && task.closedReason) {
    const reasonBox = document.createElement("div");
    reasonBox.className = "closed-reason-display";
    reasonBox.innerHTML = `
      <span class="meta-label">STÄNGNINGSORSAK</span>
      <p class="reason-text">${task.closedReason}</p>
    `;
    mainContent.append(reasonBox);
  }

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

  if (!isClosed) {
    addBtn(
      `<span class="material-symbols-rounded">edit</span>`,
      () => {
        const dialog = addTaskDialog(task);
        document.body.append(dialog);
      },
      "edit-btn"
    );
  }

  footer.append(controls);
  div.append(headerRow, mainContent, footer);
  
  return div;
};