import { loadState, saveState } from "../storage.js";
import { notify } from "../observer.js";

export function updateTaskAssigned(taskId, newAssigned) {
  if (!newAssigned) {
    throw new Error("Assigned value is required");
  }

  const state = loadState();

  if (!state || !state.tasks) {
    throw new Error("State not initialized");
  }

  const task = state.tasks.find(t => t.id === taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  task.assigned = newAssigned;

  saveState(state);
  notify();
}