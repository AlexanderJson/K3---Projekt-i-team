import {
  isValidTaskStatus,
  requiresCommentForStatus,
  TASK_STATUSES
} from "../status.js";

import { loadState, saveState } from "../storage.js";
import { notify } from "../observer.js";

export function updateTaskStatus(taskId, newStatus, comment = "") {
  if (!isValidTaskStatus(newStatus)) {
    throw new Error("Invalid task status");
  }

  if (requiresCommentForStatus(newStatus) && !comment) {
    throw new Error("Comment is required for closed tasks");
  }

  const state = loadState();

  if (!state || !state.tasks) {
    throw new Error("State not initialized");
  }

  const task = state.tasks.find(t => t.id === taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  task.status = newStatus;
  task.completed = newStatus === TASK_STATUSES.DONE;

  if (newStatus === TASK_STATUSES.CLOSED) {
    task.comment = comment;
  }

  saveState(state);
  notify();
}