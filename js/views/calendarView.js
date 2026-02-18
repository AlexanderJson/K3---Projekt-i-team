import { loadState } from "../storage.js";
import { TASK_STATUSES } from "../status.js";

// ─── Pure Helper Functions (exported for testing) ───

/**
 * Returns the number of days in a given month.
 * @param {number} year 
 * @param {number} month - 0-indexed (0 = January)
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Returns the day-of-week for the 1st of the month (0 = Monday … 6 = Sunday).
 * JS Date uses 0 = Sunday, so we remap.
 */
export function getFirstDayOfWeek(year, month) {
  const day = new Date(year, month, 1).getDay(); // 0=Sun
  return day === 0 ? 6 : day - 1; // remap: 0=Mon … 6=Sun
}

/**
 * Filters tasks that have a deadline matching the given YYYY-MM-DD string.
 * @param {Array} tasks 
 * @param {string} dateStr - format "YYYY-MM-DD"
 */
export function getTasksForDate(tasks, dateStr) {
  if (!dateStr || !Array.isArray(tasks)) return [];
  return tasks.filter(t => t.deadline === dateStr);
}

// ─── Status → CSS class mapping ───

function statusClass(status) {
  if (status === TASK_STATUSES.TODO) return "cal-todo";
  if (status === TASK_STATUSES.IN_PROGRESS) return "cal-progress";
  if (status === TASK_STATUSES.DONE) return "cal-done";
  if (status === TASK_STATUSES.CLOSED) return "cal-closed";
  return "";
}

// ─── Main Render Function ───

let currentYear;
let currentMonth;

function initCurrentDate() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
}

// Initialize on first load
initCurrentDate();

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
const MONTH_NAMES = [
  "Januari", "Februari", "Mars", "April", "Maj", "Juni",
  "Juli", "Augusti", "September", "Oktober", "November", "December"
];

export function renderCalendar(container) {
  container.innerHTML = "";

  const state = loadState();
  const tasks = (state.tasks || []).filter(t => t.status !== TASK_STATUSES.CLOSED);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // ── Wrapper ──
  const wrapper = document.createElement("div");
  wrapper.className = "calendar";

  // ── Header (nav + month name) ──
  const header = document.createElement("div");
  header.className = "calendar-header";

  const prevBtn = document.createElement("button");
  prevBtn.className = "calendar-nav-btn";
  prevBtn.textContent = "◀";
  prevBtn.onclick = () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar(container);
  };

  const nextBtn = document.createElement("button");
  nextBtn.className = "calendar-nav-btn";
  nextBtn.textContent = "▶";
  nextBtn.onclick = () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar(container);
  };

  const todayBtn = document.createElement("button");
  todayBtn.className = "calendar-today-btn";
  todayBtn.textContent = "Idag";
  todayBtn.onclick = () => {
    initCurrentDate();
    renderCalendar(container);
  };

  const monthLabel = document.createElement("h2");
  monthLabel.className = "calendar-month-label";
  monthLabel.textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;

  header.append(prevBtn, monthLabel, todayBtn, nextBtn);
  wrapper.append(header);

  // ── Weekday labels ──
  const weekdayRow = document.createElement("div");
  weekdayRow.className = "calendar-grid calendar-weekdays";
  WEEKDAYS.forEach(day => {
    const cell = document.createElement("div");
    cell.className = "calendar-weekday-cell";
    cell.textContent = day;
    weekdayRow.append(cell);
  });
  wrapper.append(weekdayRow);

  // ── Day grid ──
  const grid = document.createElement("div");
  grid.className = "calendar-grid";

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);

  // Previous month padding
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = 0; i < firstDay; i++) {
    const dayNum = daysInPrevMonth - firstDay + 1 + i;
    const cell = createDayCell(dayNum, [], false, false);
    cell.classList.add("other-month");
    grid.append(cell);
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayTasks = getTasksForDate(tasks, dateStr);
    const isToday = dateStr === todayStr;
    const cell = createDayCell(day, dayTasks, isToday, true);
    grid.append(cell);
  }

  // Next month padding (fill to complete the grid row)
  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    const cell = createDayCell(i, [], false, false);
    cell.classList.add("other-month");
    grid.append(cell);
  }

  wrapper.append(grid);

  // ── Legend ──
  const legend = document.createElement("div");
  legend.className = "calendar-legend";
  legend.innerHTML = `
    <span class="legend-item"><span class="legend-dot cal-todo"></span>Att göra</span>
    <span class="legend-item"><span class="legend-dot cal-progress"></span>Pågår</span>
    <span class="legend-item"><span class="legend-dot cal-done"></span>Klar</span>
  `;
  wrapper.append(legend);

  container.append(wrapper);
}

// ─── Day Cell Builder ───

function createDayCell(dayNum, tasks, isToday, isCurrentMonth) {
  const cell = document.createElement("div");
  cell.className = `calendar-day${isToday ? " today" : ""}`;

  const number = document.createElement("span");
  number.className = "day-number";
  number.textContent = dayNum;
  cell.append(number);

  if (isCurrentMonth && tasks.length > 0) {
    const pillContainer = document.createElement("div");
    pillContainer.className = "pill-container";

    // Show up to 3 task pills, then a "+N" indicator
    const maxVisible = 3;
    const visible = tasks.slice(0, maxVisible);
    const overflow = tasks.length - maxVisible;

    visible.forEach(task => {
      const pill = document.createElement("div");
      pill.className = `task-pill ${statusClass(task.status)}`;
      pill.textContent = task.title;
      pill.title = `${task.title} (${task.status})`;
      pillContainer.append(pill);
    });

    if (overflow > 0) {
      const more = document.createElement("div");
      more.className = "task-pill-overflow";
      more.textContent = `+${overflow} till`;
      pillContainer.append(more);
    }

    cell.append(pillContainer);
  }

  return cell;
}
