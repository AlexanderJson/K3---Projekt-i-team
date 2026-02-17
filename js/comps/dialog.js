import { addState, loadState, saveState } from "../storage.js";
import { TASK_STATUSES } from "../status.js";
import { getPeople } from "../people/peopleService.js";

/**
 * Återanvändbar dialog för att både skapa och redigera uppgifter.
 * @param {Object|null} taskToEdit - Om ett task-objekt skickas med går modalen in i redigeringsläge.
 */
export const addTaskDialog = (taskToEdit = null) => {
  const overlay = document.createElement("div");
  overlay.className = "modalOverlay"; 
  const modal = document.createElement("div");
  modal.className = "modalCard"; 

  const people = getPeople(); 
  const isEdit = !!taskToEdit;
  const titleText = isEdit ? "Redigera uppgift" : "Skapa ny uppgift";
  const btnText = isEdit ? "Spara ändringar" : "Spara";

  modal.innerHTML = `
    <h2>${titleText}</h2>
    <div class="modal-body">
      <input type="text" id="taskTitle" placeholder="Vad ska göras?" class="modalInput">
      <textarea id="taskDesc" placeholder="Beskrivning..." class="modalInput" style="min-height: 100px; resize: none;"></textarea>
      
      <div class="modal-field">
        <label class="modal-label">Ansvarig:</label>
        <select id="taskAssigned" class="modalInput">
          ${people.map(person => {
            // Om vi redigerar, kolla om denna person är den som är assigned
            const isSelected = isEdit && taskToEdit.assigned === person;
            // Om vi skapar ny, sätt "Ingen" som default
            const isDefault = !isEdit && person === "Ingen";
            
            return `<option value="${person}" ${isSelected || isDefault ? "selected" : ""}>
              ${person === "Ingen" ? "🟢 Ledig uppgift" : person}
            </option>`;
          }).join("")}
        </select>
      </div>

      <div class="modal-field">
        <label class="modal-label">Deadline:</label>
        <input type="date" id="taskDeadline" class="modalInput">
      </div>
    </div>
    <div class="modalButtons">
      <button id="cancelTask" class="cancelBtn">Avbryt</button>
      <button id="saveTask" class="confirmBtn">${btnText}</button>
    </div>
  `;

  // --- POPULERA FÄLT VID REDIGERING ---
  if (isEdit) {
    modal.querySelector("#taskTitle").value = taskToEdit.title;
    modal.querySelector("#taskDesc").value = taskToEdit.description || "";
    modal.querySelector("#taskAssigned").value = taskToEdit.assigned;
    // Deadline kräver formatet YYYY-MM-DD för att visas i input[type="date"]
    if (taskToEdit.deadline) {
        modal.querySelector("#taskDeadline").value = taskToEdit.deadline;
    }
  }

  modal.querySelector("#saveTask").onclick = () => {
    const title = modal.querySelector("#taskTitle").value.trim();
    const description = modal.querySelector("#taskDesc").value.trim();
    const assigned = modal.querySelector("#taskAssigned").value;
    const deadline = modal.querySelector("#taskDeadline").value || 0;

    if (!title) return alert("Titeln får inte vara tom!");

    if (isEdit) {
      // --- UPPDATERA EXISTERANDE STATE ---
      const state = loadState();
      const index = state.tasks.findIndex(t => String(t.id) === String(taskToEdit.id));
      
      if (index !== -1) {
        state.tasks[index] = {
          ...taskToEdit, // Behåll id, status, createdAt, comment osv.
          title,
          description,
          assigned,
          deadline
        };
        saveState(state);
      }
    } else {
      // --- SKAPA NYTT STATE ---
      const newTask = {
        id: Date.now(),
        title,
        description,
        deadline,
        createdAt: new Date().toISOString(), 
        status: TASK_STATUSES.TODO,
        assigned, 
        completed: false,
        comment: ""
      };
      addState(newTask);
    }

    overlay.remove();
    // Signalera till appen att rita om vyer
    window.dispatchEvent(new CustomEvent('renderApp'));
  };

  // Stäng-logik
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  modal.querySelector("#cancelTask").onclick = () => overlay.remove();
  
  overlay.append(modal);
  return overlay; 
};