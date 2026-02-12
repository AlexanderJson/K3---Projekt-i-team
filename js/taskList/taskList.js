import { listItem } from "./listItem.js";

export const taskList = (status, tasks) => {
  const container = document.createElement("div");
  container.className = "task-column";

  const header = document.createElement("div");
  header.className = "task-column-header";
  //todo - ta bort och gör om detta (cors osv)
  header.innerHTML = `<h3>${status} <span class="task-count">${tasks.length}</span></h3>`;
  
  const list = document.createElement("div");
  list.className = "task-list-items";

  if (tasks.length === 0) {
    list.innerHTML = `<p class="empty-msg">Inga uppgifter</p>`;
  } else {
    tasks.forEach(task => {
      list.append(listItem(task));
    });
  }

  container.append(header, list);
  return container;
};