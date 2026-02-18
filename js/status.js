import { loadState, saveState } from "./storage.js";

// Central definition av tillåtna statusar
export const TASK_STATUSES = Object.freeze({
  TODO: "Att göra",
  IN_PROGRESS: "Pågår",
  DONE: "Klar",
  CLOSED: "Stängd"
});

// Validera att statusen existerar
export function isValidTaskStatus(status) {
  return Object.values(TASK_STATUSES).includes(status);
}

// Affärsregel: Stängda uppgifter kräver en kommentar/anledning
export function requiresCommentForStatus(status) {
  return status === TASK_STATUSES.CLOSED;
}

/**
 * Uppdaterar status på en uppgift
 * @param {number} taskId 
 * @param {string} newStatus 
 * @param {string} comment - Obligatorisk om status är CLOSED
 */
export function updateTaskStatus(taskId, newStatus, comment = "") {
  if (!isValidTaskStatus(newStatus)) {
    throw new Error("Invalid task status");
  }

  // Kontrollera om kommentar saknas när man stänger
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

  // Uppdatera status och logik för avklarad
  task.status = newStatus;
  
  // En uppgift räknas som färdig i statistiken om den är Klar ELLER Stängd
  task.completed = (newStatus === TASK_STATUSES.DONE || newStatus === TASK_STATUSES.CLOSED);

  // Om den stängs, spara anledningen i beskrivningen
  if (newStatus === TASK_STATUSES.CLOSED && comment) {
    const today = new Date().toLocaleDateString('sv-SE');
    // Lägg till en tydlig avgränsare och datumstämpel
    const closeNote = `\n\n[STÄNGD ${today}]: ${comment}`;
    
    // Om beskrivning saknas, skapa den. Annars lägg till.
    task.description = (task.description || "") + closeNote;
    
    // Vi kan också spara den i task.comment för bakåtkompatibilitet om det behövs, men beskrivningen är det synliga stället.
    task.comment = comment;
  }

  saveState(state);
 }