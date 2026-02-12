import { loadState } from "../storage.js";
import { taskList } from "../taskList/taskList.js";
import { TASK_STATUSES } from "../status.js";

export const taskScreen = () => {
  // Hämta data
  const state = loadState();
  const tasks = state.tasks || [];
  const people = state.people || [];
  
  // Hämta filter från localStorage
  let currentFilter = localStorage.getItem("taskViewFilter") || "Team";

  const screenWrapper = document.createElement("div");
  screenWrapper.classList.add("taskScreenWrapper");

  // Skapa en behållare för själva innehållet (board + arkiv)
  // Detta gör att vi kan uppdatera listorna utan att röra dropdown-menyn
  const contentArea = document.createElement("div");
  contentArea.classList.add("taskContentArea");

  // ---------- 1. FILTERKONTROLLER (Högst upp) ----------
  const filterContainer = document.createElement("div");
  filterContainer.classList.add("taskFilterContainer");

  const filterLabel = document.createElement("span");
  filterLabel.textContent = "Visa uppgifter för: ";
  filterLabel.style.marginRight = "12px";

  const select = document.createElement("select");
  select.classList.add("taskFilterSelect");

  // Skapa Team-alternativ
  const teamOption = document.createElement("option");
  teamOption.value = "Team";
  teamOption.textContent = "Hela Teamet";
  select.append(teamOption);

  // Skapa Person-alternativ
  people.forEach(person => {
    const option = document.createElement("option");
    option.value = person;
    option.textContent = person;
    if (person === currentFilter) option.selected = true;
    select.append(option);
  });

  // RENDERING-LOGIK (Denna körs varje gång vi byter person)
  const updateView = (selectedPerson) => {
    contentArea.innerHTML = ""; // Rensa nuvarande vy

    // Filtrera tasks
    const filteredTasks = selectedPerson === "Team" 
      ? tasks 
      : tasks.filter(t => t.assigned === selectedPerson);

    // Skapa Board
    const board = document.createElement("div");
    board.classList.add("taskBoard");

    const activeStatuses = [TASK_STATUSES.TODO, TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.DONE];
    activeStatuses.forEach(status => {
      const columnTasks = filteredTasks.filter(t => t.status === status);
      board.append(taskList(status, columnTasks));
    });

    // Skapa Arkiv
    const archiveWrapper = document.createElement("div");
    archiveWrapper.className = "archive-wrapper";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "archive-toggle-btn";
    toggleBtn.textContent = "Visa stängda uppgifter";

    const archiveContainer = document.createElement("div");
    archiveContainer.className = "closed-tasks-archive";
    archiveContainer.style.display = "none";

    const closedTasks = filteredTasks.filter(t => t.status === TASK_STATUSES.CLOSED);
    archiveContainer.append(taskList(TASK_STATUSES.CLOSED, closedTasks));

    toggleBtn.addEventListener("click", () => {
      const isHidden = archiveContainer.style.display === "none";
      archiveContainer.style.display = isHidden ? "block" : "none";
      toggleBtn.textContent = isHidden ? "Dölj stängda uppgifter" : "Visa stängda uppgifter";
    });

    archiveWrapper.append(toggleBtn, archiveContainer);
    contentArea.append(board, archiveWrapper);
  };

  // Event listener för dropdown
  select.addEventListener("change", (e) => {
    const newPerson = e.target.value;
    localStorage.setItem("taskViewFilter", newPerson);
    updateView(newPerson); // Uppdaterar vyn direkt utan att ladda om sidan!
  });

  // Initial körning
  updateView(currentFilter);

  filterContainer.append(filterLabel, select);
  screenWrapper.append(filterContainer, contentArea);

  return screenWrapper;
};