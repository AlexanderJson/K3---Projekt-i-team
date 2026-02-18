import { loadState } from "../storage.js";
import { taskList } from "../taskList/taskList.js";
import { TASK_STATUSES } from "../status.js";

export const taskScreen = () => {
  const state = loadState();
  const people = state.people || [];
  
  let currentFilter = localStorage.getItem("taskViewFilter") || "Team";

  const screenWrapper = document.createElement("div");
  screenWrapper.classList.add("taskScreenWrapper");

  const contentArea = document.createElement("div");
  contentArea.classList.add("taskContentArea");

  // ---------- FILTERKONTROLLER ----------
  const filterContainer = document.createElement("div");
  filterContainer.classList.add("taskFilterContainer");

  const filterLabel = document.createElement("span");
  filterLabel.classList.add("filterLabel");
  filterLabel.textContent = "Visa uppgifter för: ";

  const select = document.createElement("select");
  select.classList.add("taskFilterSelect");

  // 1. Hela teamet
  const teamOption = document.createElement("option");
  teamOption.value = "Team";
  teamOption.textContent = "Hela Teamet";
  select.append(teamOption);

  // 3. SEPARATOR (En inaktiverad option som fungerar som linje)
  const teamSeparator = document.createElement("option");
  teamSeparator.disabled = true;
  teamSeparator.textContent = "────────────────";
  select.append(teamSeparator);

  // 2. Alla medlemmar (inklusive Lediga uppgifter)
  people.forEach(person => {
    const option = document.createElement("option");
    option.value = person;
    option.textContent = (person === "Ingen") ? "Lediga uppgifter" : person;
    if (person === currentFilter) option.selected = true;
    select.append(option);
  });

  // 3. SEPARATOR (En inaktiverad option som fungerar som linje)
  const archiveSeparator = document.createElement("option");
  archiveSeparator.disabled = true;
  archiveSeparator.textContent = "────────────────";
  select.append(archiveSeparator);

  // 4. ARKIVET (Längst ner)
  const archiveOption = document.createElement("option");
  archiveOption.value = "Arkiv";
  archiveOption.textContent = "📁 Visa Stängda Uppgifter";
  if (currentFilter === "Arkiv") archiveOption.selected = true;
  select.append(archiveOption);

  // ---------- RENDERING-LOGIK ----------
  const updateView = (selectedPerson) => {
    contentArea.innerHTML = ""; 

    const latestState = loadState();
    const tasks = latestState.tasks || [];

    const board = document.createElement("div");
    board.classList.add("taskBoard");

    // LOGIK FÖR ARKIV-VY
    if (selectedPerson === "Arkiv") {
      const archiveColumn = document.createElement("section");
      // Använder klasserna för korrekt röd styling och kolumnstruktur
      archiveColumn.className = "taskWrapper closed-tasks-archive";
      
      // I arkiv-vyn visar vi ALLA stängda uppgifter oavsett vem de var tilldelade
      const closedTasks = tasks.filter(t => t.status === TASK_STATUSES.CLOSED);
      archiveColumn.append(taskList(TASK_STATUSES.CLOSED, closedTasks));
      
      board.append(archiveColumn);
    } 
    // LOGIK FÖR VANLIG KANBAN-VY (TEAM ELLER PERSON)
    else {
      const filteredTasks = selectedPerson === "Team" 
        ? tasks 
        : tasks.filter(t => t.assigned === selectedPerson);

      const activeStatuses = [TASK_STATUSES.TODO, TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.DONE];
      
      activeStatuses.forEach(status => {
        const columnWrapper = document.createElement("section");
        columnWrapper.classList.add("taskWrapper");
        columnWrapper.setAttribute("data-status", status);

        const columnTasks = filteredTasks.filter(t => t.status === status);
        columnWrapper.append(taskList(status, columnTasks));
        board.append(columnWrapper);
      });
    }

    contentArea.append(board);
  };

  select.addEventListener("change", (e) => {
    const newPerson = e.target.value;
    localStorage.setItem("taskViewFilter", newPerson);
    updateView(newPerson);
  });

  // Initial rendering
  updateView(currentFilter);

  filterContainer.append(filterLabel, select);
  screenWrapper.append(filterContainer, contentArea);

  return screenWrapper;
};