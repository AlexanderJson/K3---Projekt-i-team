import { loadState } from "../storage.js";
import { taskList } from "../taskList/taskList.js";
import { TASK_STATUSES } from "../status.js";

/**
 * @file taskScreen.js
 * @description Hanterar huvudskärmen för uppgifter (Kanban-vyn).
 * Inkluderar filter för team/medlemmar och stöd för flera ansvariga per uppgift.
 */

/**
 * Skapar och returnerar huvudvyn för uppgiftshantering.
 * @returns {HTMLElement} Det sammansatta elementet för uppgiftsskärmen.
 */
export const taskScreen = (taskService) => {

  const state = loadState();
  const people = state.people || []; // Array med strängar (namn)


  // Hämtar senast använda filter eller sätter standard till "Team"
  let currentFilter = localStorage.getItem("taskViewFilter") || "Team";

  const screenWrapper = document.createElement("main");
  screenWrapper.classList.add("taskScreenWrapper");
  screenWrapper.setAttribute("aria-label", "Projekttavla");

  const contentArea = document.createElement("div");
  contentArea.classList.add("taskContentArea");

  // ---------- FILTERKONTROLLER (Semantisk Header) ----------
  const filterHeader = document.createElement("header");
  filterHeader.classList.add("taskFilterContainer");

  const filterLabel = document.createElement("label");
  filterLabel.setAttribute("for", "task-filter-select");
  filterLabel.classList.add("filterLabel");
  filterLabel.textContent = "Visa uppgifter för: ";

  const select = document.createElement("select");
  select.id = "task-filter-select";
  select.classList.add("taskFilterSelect");
  select.setAttribute("aria-controls", "task-board");

  // 1. Hela teamet
  const teamOption = document.createElement("option");
  teamOption.value = "Team";
  teamOption.textContent = "Hela Teamet";
  if (currentFilter === "Team") teamOption.selected = true;
  select.append(teamOption);

  const teamSeparator = document.createElement("option");
  teamSeparator.disabled = true;
  teamSeparator.textContent = "────────────────";
  select.append(teamSeparator);

  // 2. Alla medlemmar (Hanterar datan som strängar nu!)
  people.forEach(personName => {
    const option = document.createElement("option");
    option.value = personName; 
    // Om personen är "Ingen", visa det snyggare i listan
    option.textContent = (personName === "Ingen") ? "🟢 Lediga uppgifter" : personName;
    
    if (personName === currentFilter) option.selected = true;
    select.append(option);
  });

  const archiveSeparator = document.createElement("option");
  archiveSeparator.disabled = true;
  archiveSeparator.textContent = "────────────────";
  select.append(archiveSeparator);

  // 3. Arkivet
  const archiveOption = document.createElement("option");
  archiveOption.value = "Arkiv";
  archiveOption.textContent = "📁 Visa Stängda Uppgifter";
  if (currentFilter === "Arkiv") archiveOption.selected = true;
  select.append(archiveOption);

  /**
   * Uppdaterar Kanban-tavlan baserat på valt filter.
   * @param {string} selectedFilter - Namnet på personen, "Team" eller "Arkiv".
   */
  const updateView = (selectedFilter) => {
    contentArea.innerHTML = ""; 

    const tasks  = taskService.getTasks();

    const board = document.createElement("div");
    board.id = "task-board";
    board.classList.add("taskBoard");
    board.setAttribute("role", "region");
    board.setAttribute("aria-live", "polite");

    // LOGIK FÖR ARKIV-VY (VG: Focus Management)
    if (selectedFilter === "Arkiv") {
      const archiveColumn = document.createElement("section");
      archiveColumn.className = "taskWrapper closed-tasks-archive";
      archiveColumn.setAttribute("aria-label", "Stängda uppgifter");
      
      const closedTasks = tasks.filter(t => t.status === TASK_STATUSES.CLOSED);
      archiveColumn.append(taskList(TASK_STATUSES.CLOSED, closedTasks));
      
      board.append(archiveColumn);
    } 
    // LOGIK FÖR KANBAN-VY (Hanterar array-logik för flera ansvariga som strängar)
    else {
      // Filtrerar uppgifter: Visa alla om "Team", annars kolla om personens namn finns i assignedTo-arrayen
      const filteredTasks = selectedFilter === "Team" 
        ? tasks 
        : tasks.filter(t => {
            // Kontrollera först i den nya arrayen, fallback till gamla 'assigned'
            if (t.assignedTo && Array.isArray(t.assignedTo)) {
              // Buggfix: 'Ledig' = tom array ELLER explicit "Ingen"
              if (selectedFilter === "Ingen") {
                return t.assignedTo.length === 0 || t.assignedTo.includes("Ingen");
              }
              return t.assignedTo.includes(selectedFilter);
            }
            return t.assigned === selectedFilter;
          });

      const activeStatuses = [TASK_STATUSES.TODO, TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.DONE];
      
      activeStatuses.forEach(status => {
        const columnWrapper = document.createElement("section");
        columnWrapper.classList.add("taskWrapper");
        columnWrapper.setAttribute("data-status", status);
        columnWrapper.setAttribute("aria-label", `Kolumn: ${status}`);

        const columnTasks = filteredTasks.filter(t => t.status === status);
        columnWrapper.append(taskList(status, columnTasks));
        board.append(columnWrapper);
      });
    }

    contentArea.append(board);
  };

  // Eventlyssnare för filterändring
  select.addEventListener("change", (e) => {
    const newFilter = e.target.value;
    localStorage.setItem("taskViewFilter", newFilter);
    updateView(newFilter);
  });

  // Initial rendering
  updateView(currentFilter);

  filterHeader.append(filterLabel, select);
  screenWrapper.append(filterHeader, contentArea);

  return screenWrapper;
};