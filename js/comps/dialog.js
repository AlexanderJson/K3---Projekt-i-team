
import { addState } from "../storage.js";
import { TASK_STATUSES } from "../status.js";
export const addTaskDialog = () => {
    const div = document.createElement("div");
    div.id = "addTaskModal";
    div.setAttribute("hidden", "");
    const header = document.createElement("h1");
    header.textContent = "Lägg till uppgift";
    const title = document.createElement("input");
    const start = document.createElement("input");
    const end = document.createElement("input");
    const confirmBtn = document.createElement("button");
    const closeBtn = document.createElement("button");

    closeBtn.textContent = "Stäng";
    
    closeBtn.addEventListener("click", () => {
        div.setAttribute("hidden", "");
    });

    confirmBtn.textContent = "Lägg till";
        confirmBtn.addEventListener("click", () => {
        const state =
        {
            title: title.value, 
            start: start.value,
            end: end.value,
            status: TASK_STATUSES.TODO
        }
        addState(state);
        console.log("added new")
    });
    div.append(header, title, start, end, confirmBtn, closeBtn);
    return div;
}

