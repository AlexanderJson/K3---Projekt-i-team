

// Central definition of allowed task statuses
export const TASK_STATUSES = Object.freeze({
  TODO: "Att göra", //Planerat, Kommande,Ej påbörjat
  IN_PROGRESS: "Pågår",
  DONE: "Klar",
  CLOSED: "Stängd"
});

// Validate that a status value is allowed
export function isValidTaskStatus(status) {
  return Object.values(TASK_STATUSES).includes(status);
}

// Business rule: closed tasks must have a comment (UI enforced later)
export function requiresCommentForStatus(status) {
  return status === TASK_STATUSES.CLOSED;
}

