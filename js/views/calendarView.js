/**
 * @file calendarView.js
 * @description Avancerad kalendervy med:
 * - Rutnät på laptop, vertikal Agenda-vy på mobil
 * - Teamfilter, veckonummer, iCal import/export
 * - Klickbara dagar + uppgifter/events med detaljpopup
 * WCAG 2.1 AA: aria-label, aria-live, Tab/Enter, Escape, JSDoc.
 */

import { loadState } from "../storage.js";
import { TASK_STATUSES } from "../status.js";
import { Btn } from "../comps/btn.js";
import { announceMessage } from "../utils/ariaAnnouncer.js";
import { addTaskDialog } from "../comps/dialog.js";
import {
  parseICS,
  exportTasksToICS,
  downloadICS,
  saveImportedEvents,
  getImportedEvents
} from "../utils/icalUtils.js";

// ─── Pure Helpers ───

/**
 * Returnerar antal dagar i angiven månad.
 * @param {number} year
 * @param {number} month - 0-indexerad.
 * @returns {number}
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Returnerar veckodagens index (0=Mån…6=Sön) för den 1:a i månaden.
 * @param {number} year
 * @param {number} month
 * @returns {number}
 */
export function getFirstDayOfWeek(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

/**
 * Filtrerar uppgifter med deadline som matchar angiven datumsträng.
 * @param {Array<Object>} tasks
 * @param {string} dateStr - "YYYY-MM-DD"
 * @returns {Array<Object>}
 */
export function getTasksForDate(tasks, dateStr) {
  if (!dateStr || !Array.isArray(tasks)) return [];
  return tasks.filter(t => t.deadline === dateStr);
}

/**
 * Filtrerar importerade iCal-events för ett datum.
 * @param {Array<Object>} events
 * @param {string} dateStr
 * @returns {Array<Object>}
 */
function getEventsForDate(events, dateStr) {
  if (!dateStr || !Array.isArray(events)) return [];
  return events.filter(e => e.dtstart === dateStr);
}

/**
 * Beräknar ISO 8601-veckonummer.
 * @param {Date} date
 * @returns {number}
 */
export function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// ─── Status → CSS ───

/**
 * @param {string} status
 * @returns {string}
 */
function statusClass(status) {
  if (status === TASK_STATUSES.TODO) return "cal-todo";
  if (status === TASK_STATUSES.IN_PROGRESS) return "cal-progress";
  if (status === TASK_STATUSES.DONE) return "cal-done";
  if (status === TASK_STATUSES.CLOSED) return "cal-closed";
  return "";
}

// ─── State ───

/** @type {number} */ let currentYear;
/** @type {number} */ let currentMonth;
/** @type {string} */ let calendarFilter = "Alla";

function initCurrentDate() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
}
initCurrentDate();

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
const WEEKDAY_FULL = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];
const MONTH_NAMES = [
  "Januari", "Februari", "Mars", "April", "Maj", "Juni",
  "Juli", "Augusti", "September", "Oktober", "November", "December"
];

/**
 * Avgör om vi ska rendera mobil agenda-vy.
 * @returns {boolean}
 */
function isMobile() {
  return window.innerWidth <= 768;
}

// ─── Main Render ───

/**
 * Renderar kalendervyn: rutnät på laptop, agenda på mobil.
 * @param {HTMLElement} container
 * @param {string} [focusId=null]
 */
export function renderCalendar(container, focusId = null) {
  container.innerHTML = "";

  const state = loadState();
  let tasks = (state.tasks || []).filter(t => t.status !== TASK_STATUSES.CLOSED);
  const people = state.people || [];
  const importedEvents = getImportedEvents();

  if (calendarFilter !== "Alla") {
    tasks = tasks.filter(t => {
      if (Array.isArray(t.assignedTo) && t.assignedTo.includes(calendarFilter)) return true;
      return t.assigned === calendarFilter;
    });
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const wrapper = document.createElement("section");
  wrapper.className = "calendar";
  wrapper.setAttribute("aria-label", "Kalendervy över uppgifter");

  // ── Header ──
  wrapper.append(buildHeader(container));

  // ── Toolbar: filter + iCal ──
  wrapper.append(buildToolbar(people, container));

  // ── Render mode ──
  if (isMobile()) {
    wrapper.append(buildAgendaView(tasks, importedEvents, todayStr));
  } else {
    wrapper.append(buildGridView(tasks, importedEvents, todayStr));
  }

  // ── Legend ──
  const legend = document.createElement("div");
  legend.className = "calendar-legend";
  legend.setAttribute("aria-hidden", "true");
  legend.innerHTML = `
    <span class="legend-item"><span class="legend-dot cal-todo"></span>Att göra</span>
    <span class="legend-item"><span class="legend-dot cal-progress"></span>Pågår</span>
    <span class="legend-item"><span class="legend-dot cal-done"></span>Klar</span>
    <span class="legend-item"><span class="legend-dot cal-ical"></span>Extern (iCal)</span>
  `;
  wrapper.append(legend);

  container.append(wrapper);

  if (focusId) {
    const el = document.getElementById(focusId);
    if (el) el.focus();
  }
}

// ═══════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════

/**
 * Bygger kalenderheader med navigationsknappar.
 * @param {HTMLElement} container
 * @returns {HTMLElement}
 */
function buildHeader(container) {
  const header = document.createElement("header");
  header.className = "calendar-header";

  const prevBtn = Btn({
    text: "◀", className: "calendar-nav-btn", id: "cal-prev-btn",
    ariaLabel: "Föregående månad",
    onClick: () => {
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      renderCalendar(container, "cal-prev-btn");
      announceMessage(`Visar ${MONTH_NAMES[currentMonth]} ${currentYear}`);
    }
  });

  const nextBtn = Btn({
    text: "▶", className: "calendar-nav-btn", id: "cal-next-btn",
    ariaLabel: "Nästa månad",
    onClick: () => {
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      renderCalendar(container, "cal-next-btn");
      announceMessage(`Visar ${MONTH_NAMES[currentMonth]} ${currentYear}`);
    }
  });

  const todayBtn = Btn({
    text: "Idag", className: "calendar-today-btn", id: "cal-today-btn",
    ariaLabel: "Gå till nuvarande månad",
    onClick: () => {
      initCurrentDate();
      renderCalendar(container, "cal-today-btn");
      announceMessage(`Visar dagens månad: ${MONTH_NAMES[currentMonth]} ${currentYear}`);
    }
  });

  const monthLabel = document.createElement("h2");
  monthLabel.className = "calendar-month-label";
  monthLabel.id = "calendar-month-label";
  monthLabel.tabIndex = -1;
  monthLabel.textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;

  header.append(prevBtn, monthLabel, todayBtn, nextBtn);
  return header;
}

// ═══════════════════════════════════════════════════════
// TOOLBAR
// ═══════════════════════════════════════════════════════

/**
 * Bygger toolbar med teamfilter och iCal-knappar.
 * @param {Array<string>} people
 * @param {HTMLElement} container
 * @returns {HTMLElement}
 */
function buildToolbar(people, container) {
  const toolbar = document.createElement("div");
  toolbar.className = "calendar-filter-row";

  const filterLabel = document.createElement("label");
  filterLabel.className = "meta-label";
  filterLabel.setAttribute("for", "cal-team-filter");
  filterLabel.textContent = "VISA FÖR:";

  const filterSelect = document.createElement("select");
  filterSelect.id = "cal-team-filter";
  filterSelect.className = "taskFilterSelect calendar-team-filter";
  filterSelect.setAttribute("aria-label", "Filtrera kalender per teammedlem");

  const allOpt = document.createElement("option");
  allOpt.value = "Alla";
  allOpt.textContent = "Hela teamet";
  if (calendarFilter === "Alla") allOpt.selected = true;
  filterSelect.append(allOpt);

  people.forEach(p => {
    if (p === "Ingen") return;
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    if (calendarFilter === p) opt.selected = true;
    filterSelect.append(opt);
  });

  filterSelect.onchange = () => {
    calendarFilter = filterSelect.value;
    renderCalendar(container, "cal-team-filter");
    announceMessage(`Filtrerar: ${calendarFilter === "Alla" ? "Hela teamet" : calendarFilter}`);
  };

  toolbar.append(filterLabel, filterSelect);

  // iCal buttons
  const icalGroup = document.createElement("div");
  icalGroup.className = "ical-btn-group";

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".ics";
  importInput.style.display = "none";
  importInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const events = parseICS(text);
    if (events.length > 0) {
      saveImportedEvents(events);
      renderCalendar(container);
      announceMessage(`Importerade ${events.length} händelser`);
    } else {
      alert("Inga händelser hittades i filen.");
    }
    e.target.value = "";
  };

  const importBtn = Btn({
    text: "📥 .ics", className: "calendar-ical-btn", id: "cal-import-ics",
    ariaLabel: "Importera händelser från iCal-fil",
    onClick: () => importInput.click()
  });

  const exportBtn = Btn({
    text: "📤 Export", className: "calendar-ical-btn", id: "cal-export-ics",
    ariaLabel: "Exportera uppgifter som iCal-fil",
    onClick: () => {
      const allTasks = loadState().tasks || [];
      downloadICS(exportTasksToICS(allTasks));
      announceMessage("Kalender exporterad som .ics");
    }
  });

  icalGroup.append(importInput, importBtn, exportBtn);
  toolbar.append(icalGroup);
  return toolbar;
}

// ═══════════════════════════════════════════════════════
// GRID VIEW (Laptop/Desktop)
// ═══════════════════════════════════════════════════════

/**
 * Bygger klassiskt rutnät med veckonummer.
 * @param {Array<Object>} tasks
 * @param {Array<Object>} importedEvents
 * @param {string} todayStr
 * @returns {DocumentFragment}
 */
function buildGridView(tasks, importedEvents, todayStr) {
  const frag = document.createDocumentFragment();

  // Weekday labels
  const weekdayRow = document.createElement("div");
  weekdayRow.className = "calendar-grid calendar-weekdays calendar-grid-with-week";
  weekdayRow.setAttribute("aria-hidden", "true");

  const weekHeader = document.createElement("div");
  weekHeader.className = "calendar-weekday-cell calendar-week-col";
  weekHeader.textContent = "V.";
  weekdayRow.append(weekHeader);

  WEEKDAYS.forEach(day => {
    const cell = document.createElement("div");
    cell.className = "calendar-weekday-cell";
    cell.textContent = day;
    weekdayRow.append(cell);
  });
  frag.append(weekdayRow);

  // Build cells
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);
  const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYearIdx = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevYearIdx, prevMonthIdx);

  const allCells = [];

  for (let i = 0; i < firstDay; i++) {
    allCells.push({ dayNum: daysInPrevMonth - firstDay + 1 + i, dateStr: null, isCurrentMonth: false, tasks: [], events: [] });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    allCells.push({ dayNum: day, dateStr, isCurrentMonth: true, tasks: getTasksForDate(tasks, dateStr), events: getEventsForDate(importedEvents, dateStr) });
  }
  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    allCells.push({ dayNum: i, dateStr: null, isCurrentMonth: false, tasks: [], events: [] });
  }

  for (let rowStart = 0; rowStart < allCells.length; rowStart += 7) {
    const row = document.createElement("div");
    row.className = "calendar-grid calendar-grid-with-week";

    // Week number
    const weekCell = document.createElement("div");
    weekCell.className = "calendar-week-col calendar-week-number";
    const refCell = allCells[rowStart + 3] || allCells[rowStart];
    let weekDate;
    if (refCell.isCurrentMonth) {
      weekDate = new Date(currentYear, currentMonth, refCell.dayNum);
    } else if (rowStart === 0) {
      weekDate = new Date(prevYearIdx, prevMonthIdx, refCell.dayNum);
    } else {
      weekDate = new Date(currentMonth === 11 ? currentYear + 1 : currentYear, currentMonth === 11 ? 0 : currentMonth + 1, refCell.dayNum);
    }
    weekCell.textContent = getWeekNumber(weekDate);
    weekCell.setAttribute("aria-label", `Vecka ${weekCell.textContent}`);
    row.append(weekCell);

    for (let i = rowStart; i < rowStart + 7 && i < allCells.length; i++) {
      const c = allCells[i];
      const isToday = c.dateStr === todayStr;
      const cell = createDayCell(c.dayNum, c.tasks, c.events, isToday, c.isCurrentMonth, c.dateStr);
      if (!c.isCurrentMonth) cell.classList.add("other-month");
      row.append(cell);
    }
    frag.append(row);
  }

  return frag;
}

// ═══════════════════════════════════════════════════════
// AGENDA VIEW (Mobil)
// ═══════════════════════════════════════════════════════

/**
 * Bygger vertikal scroll-lista för mobila enheter.
 * Varje dag med händelser visas som en sektion.
 * @param {Array<Object>} tasks
 * @param {Array<Object>} importedEvents
 * @param {string} todayStr
 * @returns {HTMLElement}
 */
function buildAgendaView(tasks, importedEvents, todayStr) {
  const agendaWrapper = document.createElement("div");
  agendaWrapper.className = "agenda-view";
  agendaWrapper.setAttribute("role", "list");
  agendaWrapper.setAttribute("aria-label", "Agenda – händelser per dag");

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  let hasAnyItems = false;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayTasks = getTasksForDate(tasks, dateStr);
    const dayEvents = getEventsForDate(importedEvents, dateStr);
    const totalItems = dayTasks.length + dayEvents.length;

    if (totalItems === 0) continue;
    hasAnyItems = true;

    const isToday = dateStr === todayStr;
    const dateObj = new Date(currentYear, currentMonth, day);
    const weekdayIdx = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;
    const weekdayName = WEEKDAY_FULL[weekdayIdx];

    const section = document.createElement("article");
    section.className = `agenda-day${isToday ? " agenda-today" : ""}`;
    section.setAttribute("role", "listitem");

    // Day header
    const dayHeader = document.createElement("div");
    dayHeader.className = "agenda-day-header";
    dayHeader.innerHTML = `
      <span class="agenda-weekday">${weekdayName}</span>
      <span class="agenda-date">${day} ${MONTH_NAMES[currentMonth]}</span>
      ${isToday ? '<span class="agenda-today-badge">IDAG</span>' : ""}
    `;
    section.append(dayHeader);

    // Items
    const itemList = document.createElement("div");
    itemList.className = "agenda-items";

    dayTasks.forEach(task => {
      const item = document.createElement("div");
      item.className = "agenda-item";
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", `Redigera: ${task.title}`);

      item.innerHTML = `
        <span class="legend-dot ${statusClass(task.status)}"></span>
        <div class="agenda-item-content">
          <span class="agenda-item-title">${escapeHtml(task.title)}</span>
          ${task.description ? `<span class="agenda-item-desc">${escapeHtml(task.description.slice(0, 60))}${task.description.length > 60 ? "…" : ""}</span>` : ""}
        </div>
        <span class="agenda-item-status">${task.status}</span>
      `;

      const openEdit = () => addTaskDialog(task);
      item.addEventListener("click", openEdit);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEdit(); }
      });

      itemList.append(item);
    });

    dayEvents.forEach(event => {
      const item = document.createElement("div");
      item.className = "agenda-item agenda-item-ical";
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", `Visa detaljer: ${event.summary}`);

      const timeStr = event.startTime
        ? (event.endTime ? `${event.startTime}–${event.endTime}` : event.startTime)
        : "";

      item.innerHTML = `
        <span class="legend-dot cal-ical"></span>
        <div class="agenda-item-content">
          <span class="agenda-item-title">${escapeHtml(event.summary)}</span>
          <span class="agenda-item-desc">${timeStr ? `🕐 ${timeStr}` : ""}${timeStr && event.location ? " · " : ""}${event.location ? `📍 ${escapeHtml(event.location)}` : ""}</span>
        </div>
        <span class="agenda-item-status">Extern</span>
      `;

      const showDetail = () => showEventDetail(event);
      item.addEventListener("click", showDetail);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showDetail(); }
      });

      itemList.append(item);
    });

    section.append(itemList);
    agendaWrapper.append(section);
  }

  if (!hasAnyItems) {
    const empty = document.createElement("div");
    empty.className = "agenda-empty";
    empty.textContent = "Inga händelser denna månad.";
    agendaWrapper.append(empty);
  }

  return agendaWrapper;
}

// ═══════════════════════════════════════════════════════
// DAY CELL (Grid mode)
// ═══════════════════════════════════════════════════════

/**
 * Skapar en dagcell för rutnät.
 * @param {number} dayNum
 * @param {Array<Object>} tasks
 * @param {Array<Object>} events
 * @param {boolean} isToday
 * @param {boolean} isCurrentMonth
 * @param {string|null} dateStr
 * @returns {HTMLDivElement}
 */
function createDayCell(dayNum, tasks, events, isToday, isCurrentMonth, dateStr) {
  const cell = document.createElement("div");
  cell.className = `calendar-day${isToday ? " today" : ""}`;
  const totalItems = tasks.length + events.length;

  if (isCurrentMonth) {
    cell.tabIndex = 0;
    cell.setAttribute("role", "button");
    cell.setAttribute("aria-label",
      totalItems > 0
        ? `${dayNum} ${MONTH_NAMES[currentMonth]}, ${totalItems} händelse${totalItems > 1 ? "r" : ""}`
        : `${dayNum} ${MONTH_NAMES[currentMonth]}`
    );
  }

  const number = document.createElement("span");
  number.className = "day-number";
  number.textContent = dayNum;
  number.setAttribute("aria-hidden", "true");
  cell.append(number);

  if (isCurrentMonth && totalItems > 0) {
    const pillContainer = document.createElement("div");
    pillContainer.className = "pill-container";
    const maxVisible = 3;
    let count = 0;

    for (const task of tasks) {
      if (count >= maxVisible) break;
      const pill = document.createElement("div");
      pill.className = `task-pill ${statusClass(task.status)}`;
      pill.textContent = task.title;
      pill.title = `${task.title} (${task.status})`;
      pillContainer.append(pill);
      count++;
    }

    for (const event of events) {
      if (count >= maxVisible) break;
      const pill = document.createElement("div");
      pill.className = "task-pill cal-ical";
      pill.textContent = event.summary;
      pill.title = `${event.summary} (Extern)`;
      pillContainer.append(pill);
      count++;
    }

    const overflow = totalItems - maxVisible;
    if (overflow > 0) {
      const more = document.createElement("div");
      more.className = "task-pill-overflow";
      more.textContent = `+${overflow} till`;
      pillContainer.append(more);
    }
    cell.append(pillContainer);
  }

  if (isCurrentMonth) {
    const openPopup = () => showDayPopup(cell, tasks, events, dateStr, dayNum);
    cell.addEventListener("click", openPopup);
    cell.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPopup(); }
    });
  }

  return cell;
}

// ═══════════════════════════════════════════════════════
// DAY POPUP (Grid mode click)
// ═══════════════════════════════════════════════════════

/**
 * Visar popup med dagens alla händelser.
 * @param {HTMLElement} anchorCell
 * @param {Array<Object>} tasks
 * @param {Array<Object>} events
 * @param {string} dateStr
 * @param {number} dayNum
 */
function showDayPopup(anchorCell, tasks, events, dateStr, dayNum) {
  document.querySelectorAll(".calendar-day-popup").forEach(p => p.remove());

  const popup = document.createElement("div");
  popup.className = "calendar-day-popup";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-label", `Uppgifter ${dayNum} ${MONTH_NAMES[currentMonth]}`);

  const popupHeader = document.createElement("div");
  popupHeader.className = "popup-header";
  popupHeader.innerHTML = `<strong>${dayNum} ${MONTH_NAMES[currentMonth]} ${currentYear}</strong>`;

  const closeBtn = document.createElement("button");
  closeBtn.className = "popup-close-btn";
  closeBtn.textContent = "✕";
  closeBtn.setAttribute("aria-label", "Stäng popup");
  closeBtn.onclick = () => popup.remove();
  popupHeader.append(closeBtn);
  popup.append(popupHeader);

  const allItems = [
    ...tasks.map(t => ({ type: "task", data: t })),
    ...events.map(e => ({ type: "event", data: e }))
  ];

  if (allItems.length === 0) {
    const empty = document.createElement("div");
    empty.className = "popup-empty";
    empty.textContent = "Inga händelser denna dag.";
    popup.append(empty);
  } else {
    const list = document.createElement("ul");
    list.className = "popup-task-list";
    list.setAttribute("role", "list");

    allItems.forEach(item => {
      const li = document.createElement("li");
      li.className = "popup-task-item";
      li.tabIndex = 0;
      li.setAttribute("role", "button");

      const dot = document.createElement("span");
      const title = document.createElement("span");
      title.className = "popup-task-title";

      if (item.type === "task") {
        dot.className = `legend-dot ${statusClass(item.data.status)}`;
        title.textContent = item.data.title;
        li.setAttribute("aria-label", `Redigera: ${item.data.title}`);
        li.append(dot, title);

        const openEdit = () => { popup.remove(); addTaskDialog(item.data); };
        li.addEventListener("click", openEdit);
        li.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEdit(); }
        });
      } else {
        // KLICKBAR extern event → detaljvy
        dot.className = "legend-dot cal-ical";
        const timePrefix = item.data.startTime ? `${item.data.startTime} ` : "";
        title.textContent = `${timePrefix}${item.data.summary}`;
        li.setAttribute("aria-label", `Visa detaljer: ${item.data.summary}`);
        li.append(dot, title);

        const showDetail = () => { popup.remove(); showEventDetail(item.data); };
        li.addEventListener("click", showDetail);
        li.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showDetail(); }
        });
      }

      list.append(li);
    });
    popup.append(list);
  }

  anchorCell.style.position = "relative";
  anchorCell.append(popup);

  const outsideClick = (e) => {
    if (!popup.contains(e.target) && !anchorCell.contains(e.target)) {
      popup.remove();
      document.removeEventListener("click", outsideClick);
    }
  };
  setTimeout(() => document.addEventListener("click", outsideClick), 0);

  const escHandler = (e) => {
    if (e.key === "Escape") {
      popup.remove();
      document.removeEventListener("keydown", escHandler);
      anchorCell.focus();
    }
  };
  document.addEventListener("keydown", escHandler);
}

// ═══════════════════════════════════════════════════════
// EVENT DETAIL MODAL (iCal)
// ═══════════════════════════════════════════════════════

/**
 * Visar en fullskärmsmodal med extern händelsedetaljer.
 * @param {Object} event - Parsad iCal-event.
 */
function showEventDetail(event) {
  // Ta bort existerande
  document.querySelectorAll(".event-detail-overlay").forEach(o => o.remove());

  const overlay = document.createElement("div");
  overlay.className = "modalOverlay event-detail-overlay";
  overlay.setAttribute("role", "presentation");

  const modal = document.createElement("div");
  modal.className = "modalCard event-detail-card";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", `Händelsedetaljer: ${event.summary}`);

  // Bygg tidsvisning
  const timeDisplay = event.startTime
    ? (event.endTime ? `${event.startTime} – ${event.endTime}` : event.startTime)
    : "";

  modal.innerHTML = `
    <h2 class="event-detail-title">
      <span class="legend-dot cal-ical" style="width:12px;height:12px;"></span>
      ${escapeHtml(event.summary)}
    </h2>
    <div class="event-detail-body">
      <div class="event-detail-row">
        <span class="event-detail-label">📅 Datum</span>
        <span class="event-detail-value">${event.dtstart || "Ej angivet"}</span>
      </div>
      ${timeDisplay ? `
      <div class="event-detail-row">
        <span class="event-detail-label">🕐 Tid</span>
        <span class="event-detail-value">${timeDisplay}</span>
      </div>` : ""}
      ${event.location ? `
      <div class="event-detail-row">
        <span class="event-detail-label">📍 Plats</span>
        <span class="event-detail-value">${escapeHtml(event.location)}</span>
      </div>` : ""}
      ${event.description ? `
      <div class="event-detail-row event-detail-desc">
        <span class="event-detail-label">📋 Beskrivning</span>
        <p class="event-detail-value">${linkifyHtml(escapeHtml(event.description).replace(/\\n/g, "<br>"))}</p>
      </div>` : ""}
    </div>
    <div class="modalButtons">
      <button class="cancelBtn event-detail-close" aria-label="Stäng">Stäng</button>
    </div>
  `;

  modal.querySelector(".event-detail-close").onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  const escHandler = (e) => {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);

  overlay.append(modal);
  document.body.append(overlay);
}

// ─── Utility ───

/**
 * HTML-escape.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

/**
 * Konverterar råa webbadresser till klickbara HTML-länkar.
 * @param {string} text - The encoded HTML text.
 * @returns {string} The HTML string with active <a> tags.
 */
function linkifyHtml(text) {
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: underline;">${url}</a>`;
  });
}
