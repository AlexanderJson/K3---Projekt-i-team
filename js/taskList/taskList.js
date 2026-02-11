import { listItem } from "./listItem.js";

export const taskList = (text, tasks) => {
  const taskWrapper = document.createElement("div");
  taskWrapper.classList.add("taskWrapper");
  taskWrapper.dataset.status = text;

  const taskHeader = document.createElement("div");
  taskHeader.classList.add("taskHeader");
  taskHeader.setAttribute("role", "button");

  const titleWrap = document.createElement("div");
  titleWrap.classList.add("taskTitleWrap");

  const statusType = document.createElement("h1");
  statusType.textContent = text;

  const count = document.createElement("span");
  count.classList.add("taskCount");
  count.textContent = tasks.length;

  const arrow = document.createElement("button");
  arrow.classList.add("taskArrow");
  arrow.textContent = "▾";

  titleWrap.append(statusType, count);
  taskHeader.append(titleWrap, arrow);

  const list = document.createElement("div");
  list.classList.add("taskList");

  if (tasks.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Inga uppgifter";
    empty.classList.add("emptyState");
    list.append(empty);
  } else {
    tasks.forEach(task => {
      list.append(listItem(task));
    });
  }

  let isOpen = true;

  arrow.addEventListener("click", () => {
    isOpen = !isOpen;
    taskWrapper.classList.toggle("collapsed", !isOpen);
    arrow.textContent = isOpen ? "▾" : "▸";
  });

  taskWrapper.append(taskHeader, list);
  return taskWrapper;
};