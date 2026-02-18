import { listItem } from "./listItem.js";

export const taskList = (status, tasks) => {
  const container = document.createElement("div");
  
  // Hämta sparat läge från localStorage
  const storageKey = `column_state_${status}`;
  const savedState = localStorage.getItem(storageKey);
  const isInitiallyExpanded = savedState !== "collapsed";

  // AUTO-EXPAND LOGIC: Only 0 -> 1 transition triggers auto-open
  const countKey = `column_count_${status}`;
  const lastCount = parseInt(localStorage.getItem(countKey) || "0");
  const currentCount = tasks.length;

  let shouldBeExpanded = isInitiallyExpanded;

  // Om kolumnen var tom sist, och nu har uppgifter -> Öppna upp
  if (lastCount === 0 && currentCount > 0) {
    shouldBeExpanded = true;
    localStorage.setItem(storageKey, "expanded"); // Spara det nya läget
  }

  // Uppdatera räknaren för nästa gång
  localStorage.setItem(countKey, currentCount);

  // Sätter klassen baserat på sparat läge. Om ej öppen (eller inget sparat) -> collapsed
  const baseClass = "task-column";
  const archiveClass = status === "Stängd" ? " closed-tasks-archive" : "";
  const collapsedClass = shouldBeExpanded ? "" : " collapsed";
  
  container.className = `${baseClass}${archiveClass}${collapsedClass}`;
  container.setAttribute("data-status", status); // Viktigt för CSS-färgstyrning

  const header = document.createElement("div");
  header.className = "taskHeader clickable-header";
  
  // Sätt pilens rotation baserat på initialt läge
  const initialRotation = shouldBeExpanded ? "0deg" : "-90deg";

  header.innerHTML = `
    <div class="header-content">
      <span class="arrow-wrapper">
        <span class="taskArrow" style="transform: rotate(${initialRotation}); display: inline-block; transition: transform 0.3s ease;">▼</span>
      </span>
      <span class="status-text">${status === "Stängd" ? "STÄNGD" : status}</span>
    </div>
    <span class="taskCount">${tasks.length}</span>
  `;

  const listItemsContainer = document.createElement("div");
  listItemsContainer.className = "task-list-items";
  // Visa eller dölj baserat på sparat läge
  listItemsContainer.style.display = shouldBeExpanded ? "flex" : "none";
  listItemsContainer.style.flexDirection = "column";
  listItemsContainer.style.gap = "16px";

  if (status === "Stängd") {
    const description = document.createElement("p");
    description.className = "archive-description";
    description.textContent = "Här sparas uppgifter som inte längre är aktuella, har avbrutits eller arkiverats för att hålla din aktiva tavla ren.";
    
    // Om container är collapsed, dölj även description
    description.style.display = shouldBeExpanded ? "block" : "none";

    container.append(header, description, listItemsContainer); 
  } else {
    container.append(header, listItemsContainer);
  }

  header.onclick = () => {
    // Toggle logic
    const isCollapsed = container.classList.toggle("collapsed");
    const isExpanded = !isCollapsed;

    // Spara nytt läge
    localStorage.setItem(storageKey, isExpanded ? "expanded" : "collapsed");
    
    const arrow = header.querySelector(".taskArrow");
    if (arrow) {
        arrow.style.transform = isCollapsed ? "rotate(-90deg)" : "rotate(0deg)";
    }
    
    listItemsContainer.style.display = isCollapsed ? "none" : "flex";

    // Hantera beskrivningen i arkivet om den finns
    const description = container.querySelector(".archive-description");
    if (description) {
        description.style.display = isCollapsed ? "none" : "block";
    }
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

  return container;
};