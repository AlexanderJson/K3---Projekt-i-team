/**
 * @file tasks.js
 * @description Fabriksfunktion för att skapa uppgiftsobjekt.
 * Säkerställer att alla uppgifter har en konsekvent datastruktur
 * oavsett vilka fält som skickas in.
 */

/**
 * @typedef {Object} TaskData
 * @property {string|number} id - Unikt ID för uppgiften.
 * @property {string} title - Titel/rubrik.
 * @property {string} [description=''] - Beskrivning av uppgiften.
 * @property {boolean} [completed=false] - Om uppgiften är avklarad.
 * @property {string} status - Uppgiftens status (TASK_STATUSES).
 * @property {string} [assigned='Ingen'] - Primär ansvarig (bakåtkompatibilitet).
 * @property {Array<string>} [assignedTo=[]] - Lista med ansvariga namn.
 * @property {string|number} [deadline=0] - Deadline i YYYY-MM-DD eller 0.
 * @property {string} [createdAt] - ISO-datum för när uppgiften skapades.
 * @property {string|number|null} [contactId=null] - Länkad kontakts ID.
 * @property {string|null} [contactName=null] - Länkad kontakts namn.
 * @property {string} [closedReason=''] - Anledning till stängning.
 * @property {string} [comment=''] - Kommentar (bakåtkompatibilitet).
 */

/**
 * Skapar ett standardiserat uppgiftsobjekt med säkra standardvärden.
 * @param {TaskData} data - Indata för uppgiften.
 * @returns {TaskData} Ett komplett uppgiftsobjekt.
 */
export function createTask({
  id,
  title,
  description = "",
  completed = false,
  status,
  assigned = "Ingen",
  assignedTo = [],
  deadline = 0,
  createdAt = new Date().toISOString(),
  contactId = null,
  contactName = null,
  closedReason = "",
  comment = ""
}) {
  return {
    id,
    title,
    description,
    completed,
    status,
    assigned,
    assignedTo,
    deadline,
    createdAt,
    contactId,
    contactName,
    closedReason,
    comment
  };
}