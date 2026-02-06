import { updateTaskStatus, TASK_STATUSES } from "../status.js";

function getNextStatus(currentStatus) {
  if (currentStatus === TASK_STATUSES.TODO) {
    return TASK_STATUSES.IN_PROGRESS;
  }

  if (currentStatus === TASK_STATUSES.IN_PROGRESS) {
    return TASK_STATUSES.DONE;
  }

  return null;
}

export const listItem = (task) => {
  const div = document.createElement("div");
  div.classList.add("listItem");

  const leftCard = document.createElement("div");
  leftCard.classList.add("leftCard");

  const taskTitle = document.createElement("span");
  taskTitle.textContent = task.title;

  const assignedTitle = document.createElement("span");
  assignedTitle.classList.add("assignedTitle");
  assignedTitle.textContent = task.assigned;

  const statusBadge = document.createElement("span");
  statusBadge.classList.add("statusBadge");
  statusBadge.textContent = task.status;
  statusBadge.dataset.status = task.status;

  const statusCheck = document.createElement("input");
  statusCheck.type = "checkbox";
  statusCheck.checked = task.completed;

  statusCheck.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  leftCard.append(taskTitle, statusBadge, assignedTitle);
  div.append(leftCard, statusCheck);

  div.addEventListener("click", () => {
    const nextStatus = getNextStatus(task.status);
    if (!nextStatus) return;

    updateTaskStatus(task.id, nextStatus);
  });

  return div;
};