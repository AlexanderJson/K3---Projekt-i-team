import { updateTaskAssigned } from "./updateTaskAssigned.js";
import { updateTaskStatus } from "./updateTaskStatus.js";
import { TASK_STATUSES } from "../status.js";
import { getPeople } from "../people/peopleService.js";
import { openPeopleModal } from "../people/peopleModal.js";

function getNextStatus(status) {
  if (status === TASK_STATUSES.TODO) return TASK_STATUSES.IN_PROGRESS;
  if (status === TASK_STATUSES.IN_PROGRESS) return TASK_STATUSES.DONE;
  return null;
}

function getPrevStatus(status) {
  if (status === TASK_STATUSES.DONE) return TASK_STATUSES.IN_PROGRESS;
  if (status === TASK_STATUSES.IN_PROGRESS) return TASK_STATUSES.TODO;
  return null;
}

export const listItem = (task) => {
  const div = document.createElement("div");
  div.classList.add("listItem");

  const leftCard = document.createElement("div");
  leftCard.classList.add("leftCard");

  // Titel
  const title = document.createElement("span");
  title.classList.add("taskTitle");
  title.textContent = task.title;

  // Status badge
  const badge = document.createElement("span");
  badge.classList.add("statusBadge");
  badge.textContent = task.status;
  badge.dataset.status = task.status;

  // Assigned dropdown
  const assignedSelect = document.createElement("select");
  assignedSelect.classList.add("assignedSelect");

  const people = getPeople();

  people.forEach(person => {
    const option = document.createElement("option");
    option.value = person;
    option.textContent = person;
    if (task.assigned === person) option.selected = true;
    assignedSelect.appendChild(option);
  });

  // Divider
  const divider = document.createElement("option");
  divider.disabled = true;
  divider.textContent = "────────────";
  assignedSelect.appendChild(divider);

  // Manage people
  const manageOption = document.createElement("option");
  manageOption.value = "__manage__";
  manageOption.textContent = "✏️ Hantera personer";
  assignedSelect.appendChild(manageOption);

  assignedSelect.addEventListener("change", () => {
    if (assignedSelect.value === "__manage__") {
      openPeopleModal();
      assignedSelect.value = task.assigned;
      return;
    }

    updateTaskAssigned(task.id, assignedSelect.value);
  });

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.status === TASK_STATUSES.DONE;

  checkbox.addEventListener("change", () => {
    const newStatus = checkbox.checked
      ? getNextStatus(task.status)
      : getPrevStatus(task.status);

    if (!newStatus) return;
    updateTaskStatus(task.id, newStatus);
  });

  leftCard.append(title, badge, assignedSelect);
  div.append(leftCard, checkbox);

  return div;
};