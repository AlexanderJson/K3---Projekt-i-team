export const listItem = (task) => 
{
    const div = document.createElement("div");
    const leftCard = document.createElement("div");
    leftCard.classList.add("leftCard");

    const statusCheck = document.createElement("input");
    statusCheck.type = "checkbox";

    const taskTitle = document.createElement("span");
    const assignedTitle = document.createElement("span");
    assignedTitle.classList.add("assignedTitle");
    assignedTitle.textContent = task.assigned;

    taskTitle.textContent = task.title;
    statusCheck.checked = task.completed;

    const statusBadge = document.createElement("span");
    statusBadge.classList.add("statusBadge");
    statusBadge.textContent = task.status;
    statusBadge.dataset.status = task.status;

    div.classList.add("listItem");

    leftCard.append(taskTitle, statusBadge, assignedTitle);
    
    div.append(leftCard, statusCheck);
    return div;
}