import { loadState } from "../storage.js";
import { taskList } from "../taskList/taskList.js";
import { TASK_STATUSES } from "../status.js";

export const taskScreen = () => {
  // Vi hämtar statet inuti huvudfunktionen varje gång den anropas
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

  const teamOption = document.createElement("option");
  teamOption.value = "Team";
  teamOption.textContent = "Hela Teamet";
  select.append(teamOption);

  people.forEach(person => {
    const option = document.createElement("option");
    option.value = person;
    
    // Ändrar visningstexten för "Ingen" till "Lediga uppgifter"
    option.textContent = (person === "Ingen") ? "🟢 Lediga uppgifter" : person;
    
    if (person === currentFilter) option.selected = true;
    select.append(option);
  });

  // RENDERING-LOGIK
  const updateView = (selectedPerson) => {
    contentArea.innerHTML = ""; 

    // VIKTIGT: Hämta de allra senaste uppgifterna från LocalStorage här
    const latestState = loadState();
    const tasks = latestState.tasks || [];

    const filteredTasks = selectedPerson === "Team" 
      ? tasks 
      : tasks.filter(t => t.assigned === selectedPerson);

    const board = document.createElement("div");
    board.classList.add("taskBoard");

    const activeStatuses = [TASK_STATUSES.TODO, TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.DONE];
    
    activeStatuses.forEach(status => {
      const columnWrapper = document.createElement("section");
      columnWrapper.classList.add("taskWrapper");
      columnWrapper.setAttribute("data-status", status);

      const columnTasks = filteredTasks.filter(t => t.status === status);
      columnWrapper.append(taskList(status, columnTasks));
      board.append(columnWrapper);
    });

    // ---------- ARKIV-SEKTION ----------
    const archiveWrapper = document.createElement("div");
    archiveWrapper.className = "archive-wrapper";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "archive-toggle-btn";
    toggleBtn.textContent = "Visa stängda uppgifter";

    const archiveContainer = document.createElement("div");
    archiveContainer.className = "closed-tasks-archive";
    archiveContainer.style.display = "none";

    const archiveColumnWrapper = document.createElement("div");
    archiveColumnWrapper.classList.add("taskWrapper");
    archiveColumnWrapper.setAttribute("data-status", TASK_STATUSES.CLOSED);

    const closedTasks = filteredTasks.filter(t => t.status === TASK_STATUSES.CLOSED);
    archiveColumnWrapper.append(taskList(TASK_STATUSES.CLOSED, closedTasks));
    archiveContainer.append(archiveColumnWrapper);

    toggleBtn.addEventListener("click", () => {
      const isHidden = archiveContainer.style.display === "none";
      archiveContainer.style.display = isHidden ? "block" : "none";
      toggleBtn.textContent = isHidden ? "Dölj stängda uppgifter" : "Visa stängda uppgifter";
    });

    archiveWrapper.append(toggleBtn, archiveContainer);
    contentArea.append(board, archiveWrapper);
  };

  select.addEventListener("change", (e) => {
    const newPerson = e.target.value;
    localStorage.setItem("taskViewFilter", newPerson);
    updateView(newPerson);
  });

  updateView(currentFilter);

  filterContainer.append(filterLabel, select);
  screenWrapper.append(filterContainer, contentArea);

  return screenWrapper;
};