import { getPeople, addPerson, renamePerson } from "./peopleService.js";
import { notify } from "../observer.js";

export function openPeopleModal() {
  const overlay = document.createElement("div");
  overlay.classList.add("modalOverlay");

  const modal = document.createElement("div");
  modal.classList.add("modal");

  const title = document.createElement("h2");
  title.textContent = "Hantera personer";

  const list = document.createElement("div");
  list.classList.add("modalList");

  getPeople().forEach(person => {
    const row = document.createElement("div");
    row.classList.add("modalRow");

    const input = document.createElement("input");
    input.value = person;

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Spara";

    saveBtn.addEventListener("click", () => {
      if (input.value.trim()) {
        renamePerson(person, input.value.trim());
        notify();
        document.body.removeChild(overlay);
      }
    });

    row.append(input, saveBtn);
    list.append(row);
  });

  const addInput = document.createElement("input");
  addInput.placeholder = "Ny person";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Lägg till";

  addBtn.addEventListener("click", () => {
    if (addInput.value.trim()) {
      addPerson(addInput.value.trim());
      notify();
      document.body.removeChild(overlay);
    }
  });

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Stäng";
  closeBtn.classList.add("secondary");

  closeBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  modal.append(title, list, addInput, addBtn, closeBtn);
  overlay.append(modal);
  document.body.append(overlay);
}