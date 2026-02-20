/**
 * @file icalUtils.js
 * @description iCal (RFC 5545) import/export-verktyg för Lianer-appen.
 * Hanterar parsing av .ics-filer och generering av iCal-data från uppgifter.
 * @module icalUtils
 */

/**
 * Parsar en iCal-textsträng och extraherar VEVENT-poster.
 * @param {string} icsText - Råtext från en .ics-fil.
 * @returns {Array<{uid: string, summary: string, dtstart: string, dtend: string, description: string, location: string}>}
 */
export function parseICS(icsText) {
  if (!icsText || typeof icsText !== "string") return [];

  const events = [];
  const blocks = icsText.split("BEGIN:VEVENT");

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split("END:VEVENT")[0];
    const rawStart = extractField(block, "DTSTART");
    const rawEnd = extractField(block, "DTEND");
    const event = {
      uid: extractField(block, "UID"),
      summary: extractField(block, "SUMMARY"),
      dtstart: parseICalDate(rawStart),
      dtend: parseICalDate(rawEnd),
      startTime: parseICalTime(rawStart),
      endTime: parseICalTime(rawEnd),
      description: extractField(block, "DESCRIPTION"),
      location: extractField(block, "LOCATION")
    };
    if (event.summary && event.dtstart) {
      events.push(event);
    }
  }

  return events;
}

/**
 * Extraherar ett fältvärde ur en VEVENT-block.
 * Hanterar fält med parametrar (t.ex. DTSTART;VALUE=DATE:20260220).
 * @param {string} block - VEVENT-textblock.
 * @param {string} field - Fältnamnet (t.ex. "SUMMARY").
 * @returns {string} Fältvärdet eller tom sträng.
 */
function extractField(block, field) {
  // Matcha rad som börjar med fältnamnet, med eller utan parametrar
  const regex = new RegExp(`^${field}[;:](.*)$`, "mi");
  const match = block.match(regex);
  if (!match) return "";

  let value = match[1];
  // Ta bort eventuella parametrar före kolon (t.ex. ";VALUE=DATE:")
  const colonIdx = value.indexOf(":");
  if (colonIdx !== -1 && field !== "DESCRIPTION") {
    value = value.substring(colonIdx + 1);
  }

  // Unfolding: iCal använder CRLF + mellanslag för radbrytning
  return value.replace(/\r?\n\s/g, "").trim();
}

/**
 * Konverterar iCal-datum (YYYYMMDD / YYYYMMDDTHHmmss / YYYYMMDDTHHmmssZ)
 * till YYYY-MM-DD-format.
 * @param {string} icalDate - iCal-datumsträng.
 * @returns {string} Datum i YYYY-MM-DD-format, eller tom sträng.
 */
function parseICalDate(icalDate) {
  if (!icalDate || icalDate.length < 8) return "";
  const cleaned = icalDate.replace(/[^0-9T]/g, "");
  const year = cleaned.substring(0, 4);
  const month = cleaned.substring(4, 6);
  const day = cleaned.substring(6, 8);
  return `${year}-${month}-${day}`;
}

/**
 * Extraherar tid (HH:MM) från iCal-datumsträng.
 * Returnerar tom sträng om datumet saknar tidskomponent.
 * @param {string} icalDate - iCal-datumsträng (t.ex. "20260220T143000Z").
 * @returns {string} Tid i HH:MM-format, eller tom sträng.
 */
function parseICalTime(icalDate) {
  if (!icalDate || !icalDate.includes("T")) return "";
  const cleaned = icalDate.replace(/[^0-9T]/g, "");
  const tIdx = cleaned.indexOf("T");
  if (tIdx === -1 || cleaned.length < tIdx + 5) return "";
  const hours = cleaned.substring(tIdx + 1, tIdx + 3);
  const minutes = cleaned.substring(tIdx + 3, tIdx + 5);
  return `${hours}:${minutes}`;
}

/**
 * Formaterar ett Date-objekt som iCal-datum (YYYYMMDDTHHmmssZ).
 * @param {Date} date - JS Date-objekt.
 * @returns {string} iCal-formaterad datumsträng.
 */
function toICalDate(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/**
 * Genererar en iCal (.ics) textsträng från en lista uppgifter.
 * Bara uppgifter med deadline inkluderas.
 * @param {Array<Object>} tasks - Lista av task-objekt.
 * @param {string} [calName="Lianer Tasks"] - Kalendernamn.
 * @returns {string} Fullständig iCal-textsträng.
 */
export function exportTasksToICS(tasks, calName = "Lianer Tasks") {
  const tasksWithDeadline = tasks.filter(t => t.deadline && t.deadline !== "0" && t.deadline !== 0);

  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lianer//TaskApp//SV",
    `X-WR-CALNAME:${calName}`,
    "CALSCALE:GREGORIAN"
  ];

  tasksWithDeadline.forEach(task => {
    const startDate = new Date(task.deadline + "T09:00:00");
    const endDate = new Date(task.deadline + "T10:00:00");
    const createdDate = task.createdAt ? new Date(task.createdAt) : new Date();

    ics.push(
      "BEGIN:VEVENT",
      `UID:lianer-${task.id}@lianer.app`,
      `DTSTAMP:${toICalDate(createdDate)}`,
      `DTSTART:${toICalDate(startDate)}`,
      `DTEND:${toICalDate(endDate)}`,
      `SUMMARY:${(task.title || "").replace(/[,;\\]/g, " ")}`,
      `DESCRIPTION:${(task.description || "").replace(/\n/g, "\\n").replace(/[,;\\]/g, " ")}`,
      `STATUS:${task.status === "Klar" ? "COMPLETED" : "NEEDS-ACTION"}`,
      "END:VEVENT"
    );
  });

  ics.push("END:VCALENDAR");
  return ics.join("\r\n");
}

/**
 * Triggar nedladdning av en iCal-fil.
 * @param {string} icsContent - iCal-textsträng.
 * @param {string} [filename="lianer-tasks.ics"] - Filnamn.
 */
export function downloadICS(icsContent, filename = "lianer-tasks.ics") {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── LocalStorage for imported iCal events ──

/** @type {string} */
const ICAL_STORAGE_KEY = "ical_events";

/**
 * Sparar importerade iCal-events till localStorage.
 * @param {Array<Object>} events - Parsade events.
 */
export function saveImportedEvents(events) {
  const existing = getImportedEvents();
  // Deduplicera baserat på uid
  const uids = new Set(existing.map(e => e.uid));
  const newEvents = events.filter(e => !uids.has(e.uid));
  const merged = [...existing, ...newEvents];
  localStorage.setItem(ICAL_STORAGE_KEY, JSON.stringify(merged));
}

/**
 * Hämtar alla importerade iCal-events från localStorage.
 * @returns {Array<Object>}
 */
export function getImportedEvents() {
  try {
    return JSON.parse(localStorage.getItem(ICAL_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Rensar alla importerade iCal-events.
 */
export function clearImportedEvents() {
  localStorage.removeItem(ICAL_STORAGE_KEY);
}
