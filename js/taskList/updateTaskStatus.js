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
  
  const isCompleted = (newStatus === TASK_STATUSES.DONE || newStatus === TASK_STATUSES.CLOSED);
  task.completed = isCompleted;

  // Sätt datum när den blir klar (eller ta bort om den flyttas tillbaka)
  if (isCompleted && !task.completedDate) {
    task.completedDate = new Date().toISOString();
  } else if (!isCompleted) {
    task.completedDate = null;
  }
  
  if (newStatus === TASK_STATUSES.CLOSED && comment) {
    const today = new Date().toLocaleDateString('sv-SE');
    
    // Skapa noteringen (Utan namn, bara datum och kommentar)
    const closeNote = `\n\n[STÄNGD ${today}]: ${comment}`;
    
    // Lägg till i beskrivningen
    task.description = (task.description || "") + closeNote;
    
    // task.comment behövs egentligen inte längre om vi sparar i beskrivningen, 
    // men vi kan låta den vara eller ta bort den. Jag tar bort den för att inte ha dubbeldata.
    // task.comment = comment; 
  }

  saveState(state);
  notify();
}