import { taskList } from "./taskList.js";
import { TASK_STATUSES } from "../status.js";
import { loadState } from "../storage.js";

export const taskScreen = (tasks) => {
  const state = loadState();
  const people = state.people || [];
  
  // Hämta dynamiskt teamnamn från inställningar
  const teamName = state.settings?.teamName || "Mitt Team";
  
  let currentFilter = localStorage.getItem("taskViewFilter") || "Team";

  const screenWrapper = document.createElement("div");
  screenWrapper.classList.add("taskScreenWrapper");

  // ---------- FILTERKONTROLLER ----------
  const filterContainer = document.createElement("div");
  filterContainer.classList.add("taskFilterContainer");

  const filterLabel = document.createElement("label");
  filterLabel.textContent = "Visa uppgifter för: ";
  filterLabel.style.marginRight = "8px";

  const select = document.createElement("select");
  select.classList.add("taskFilterSelect");

  // Dynamiskt team-alternativ (istället för statiska "Hela Teamet")
  const teamOption = document.createElement("option");
  teamOption.value = "Team";
  teamOption.textContent = teamName; 
  select.append(teamOption);

  people.forEach(person => {
    const option = document.createElement("option");
    option.value = person;
    option.textContent = person;
    select.append(option);
  });

  select.value = currentFilter;

  // Vid ändring sparar vi valet och renderar om tavlan lokalt
  select.addEventListener("change", () => {
    localStorage.setItem("taskViewFilter", select.value);
    renderBoard(); 
  });

  filterContainer.append(filterLabel, select);
  screenWrapper.append(filterContainer);

  const boardContainer = document.createElement("div");
  screenWrapper.append(boardContainer);

  // ---------- RENDERING AV BOARD ----------
  function renderBoard() {
    boardContainer.innerHTML = "";
    const activeFilter = localStorage.getItem("taskViewFilter") || "Team";

    const filteredTasks = activeFilter === "Team" 
      ? tasks 
      : tasks.filter(t => t.assigned === activeFilter);

    const board = document.createElement("div");
    board.classList.add("taskBoard");

    const todo = filteredTasks.filter(t => t.status === TASK_STATUSES.TODO);
    const inProgress = filteredTasks.filter(t => t.status === TASK_STATUSES.IN_PROGRESS);
    const done = filteredTasks.filter(t => t.status === TASK_STATUSES.DONE);

    board.append(
      taskList("Att göra", todo),
      taskList("Pågår", inProgress),
      taskList("Klar", done)
    );
    
    boardContainer.append(board);
  }

  renderBoard();

  return screenWrapper;
};