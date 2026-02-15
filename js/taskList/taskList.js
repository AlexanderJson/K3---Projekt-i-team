import { listItem } from "./listItem.js";

export const taskList = (status, tasks) => {
  const container = document.createElement("div");
  
  // Sätter klassen till closed-tasks-archive om status är Stängd för att få röd styling
  container.className = status === "Stängd" ? "closed-tasks-archive" : "task-column";

  const header = document.createElement("div");
  header.className = "taskHeader clickable-header";
  
  header.innerHTML = `
    <div class="header-content">
      <span class="taskArrow">▼</span>
      <span class="status-text">${status}</span>
    </div>
    <span class="taskCount">${tasks.length}</span>
  `;

  const listItemsContainer = document.createElement("div");
  listItemsContainer.className = "task-list-items";
  listItemsContainer.style.display = "flex";
  listItemsContainer.style.flexDirection = "column";
  listItemsContainer.style.gap = "16px";

  // Hanterar ordningen på elementen och lägger till beskrivningen för arkivet
  if (status === "Stängd") {
    const description = document.createElement("p");
    description.className = "archive-description";
    description.textContent = "Här sparas uppgifter som inte längre är aktuella, har avbrutits eller arkiverats för att hålla din aktiva tavla ren.";
    
    container.append(header, description, listItemsContainer); 
  } else {
    container.append(header, listItemsContainer);
  }

  // Kolumn-expansion/kollaps
  header.onclick = () => {
    const isCollapsed = container.classList.toggle("collapsed");
    const arrow = header.querySelector(".taskArrow");
    if (arrow) {
        arrow.style.transform = isCollapsed ? "rotate(-90deg)" : "rotate(0deg)";
    }
    listItemsContainer.style.display = isCollapsed ? "none" : "flex";
  };

  // Renderar kort eller tomma tillstånd
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

  return container;
};