import { addState, loadState } from "../storage.js";
import { TASK_STATUSES } from "../status.js";

export const addTaskDialog = () => {
  const overlay = document.createElement("div");
  overlay.id = "addTaskModal";
  overlay.setAttribute("hidden", "");
  overlay.classList.add("modalOverlay");

  const modal = document.createElement("div");
  modal.classList.add("modalCard");

  const header = document.createElement("h2");
  header.textContent = "Lägg till uppgift";

  const titleInput = document.createElement("input");
  titleInput.classList.add("modalInput");
  titleInput.placeholder = "Titel på uppgift...";

  const state = loadState();
  const people = state.people || [];

  const assignedSelect = document.createElement("select");
  assignedSelect.classList.add("modalSelect");

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Tilldela person (valfritt)";
  assignedSelect.append(defaultOption);

  people.forEach(person => {
    const option = document.createElement("option");
    option.value = person;
    option.textContent = person;
    assignedSelect.append(option);
  });

  const buttonRow = document.createElement("div");
  buttonRow.classList.add("modalButtons");

  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "Skapa";
  confirmBtn.classList.add("confirmBtn");

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Avbryt";
  cancelBtn.classList.add("cancelBtn");

  cancelBtn.addEventListener("click", () => {
    overlay.setAttribute("hidden", "");
  });

  confirmBtn.addEventListener("click", () => {
    if (!titleInput.value.trim()) return;

    const newTask = {
      id: Date.now(),
      title: titleInput.value.trim(),
      assigned: assignedSelect.value || "",
      status: TASK_STATUSES.TODO
    };

    addState(newTask);

    titleInput.value = "";
    assignedSelect.value = "";
    overlay.setAttribute("hidden", "");
  });

  buttonRow.append(confirmBtn, cancelBtn);
  modal.append(header, titleInput, assignedSelect, buttonRow);
  overlay.append(modal);

  return overlay;
};