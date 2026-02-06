import { listItem } from "./listItem.js";


export const taskList = (text, tasks) => {

    const addBtn = document.createElement("button");
    addBtn.classList.add("addBtn");
    addBtn.textContent = "+"

    const rightCard = document.createElement("div");
    rightCard.classList.add("rightCard");


    const taskWrapper = document.createElement("div");
    taskWrapper.classList.add("taskWrapper");

    const statusType = document.createElement("h1");
    statusType.textContent = text;
    const statusCircle = document.createElement("div");
    statusCircle.classList.add("statusCircle");

    rightCard.append(statusType, addBtn);

    const taskHeader = document.createElement("div");
    taskHeader.classList.add("taskHeader");
    taskHeader.append(rightCard,statusCircle)

    const list = document.createElement("div");
    list.classList.add("taskList");
    tasks.forEach(task => {
        list.append(listItem(task));
    });

    taskWrapper.append(taskHeader,list);
    return taskWrapper;
}