import { listItem } from "./listItem.js";

export const taskList = (status, tasks) => {
  const container = document.createElement("div");
  container.className = "task-column";

  const header = document.createElement("div");
  header.className = "taskHeader clickable-header";
  
  header.innerHTML = `
    <h1>
      <span class="taskArrow">▼</span>
      ${status} 
      <span class="taskCount">${tasks.length}</span>
    </h1>
  `;

  const listItemsContainer = document.createElement("div");
  listItemsContainer.className = "task-list-items";
  listItemsContainer.style.display = "flex";
  listItemsContainer.style.flexDirection = "column";
  listItemsContainer.style.gap = "16px";

  // Kolumn-expansion/kollaps
  header.onclick = () => {
    const isCollapsed = container.classList.toggle("collapsed");
    const arrow = header.querySelector(".taskArrow");
    arrow.style.transform = isCollapsed ? "rotate(-90deg)" : "rotate(0deg)";
    listItemsContainer.style.display = isCollapsed ? "none" : "flex";
  };

  if (tasks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "emptyState";
    empty.textContent = "Inga uppgifter";
    listItemsContainer.append(empty);
  } else {
    tasks.forEach(task => {
      listItemsContainer.append(listItem(task));
    });
  }

  container.append(header, listItemsContainer);
  return container;
};