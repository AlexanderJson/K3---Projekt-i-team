import { updateTaskStatus } from "./updateTaskStatus.js";
import { TASK_STATUSES } from "../status.js";

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

  const title = document.createElement("span");
  title.textContent = task.title;

  const assigned = document.createElement("span");
  assigned.classList.add("assignedTitle");
  assigned.textContent = task.assigned;

  const badge = document.createElement("span");
  badge.classList.add("statusBadge");
  badge.textContent = task.status;
  badge.dataset.status = task.status;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.status === TASK_STATUSES.DONE;

  checkbox.addEventListener("change", () => {
    let newStatus;

    if (checkbox.checked) {
      newStatus = getNextStatus(task.status);
    } else {
      newStatus = getPrevStatus(task.status);
    }

    if (!newStatus) return;

    updateTaskStatus(task.id, newStatus);
  });

  leftCard.append(title, badge, assigned);
  div.append(leftCard, checkbox);

  return div;
};
