import { addState } from "../storage.js";
import { TASK_STATUSES } from "../status.js";
import { getPeople } from "../people/peopleService.js";

export const addTaskDialog = () => {
  const overlay = document.createElement("div");
  overlay.className = "modalOverlay"; 
  const modal = document.createElement("div");
  modal.className = "modalCard"; 

  const people = getPeople(); 

  modal.innerHTML = `
    <h2>Skapa ny uppgift</h2>
    <div class="modal-body">
      <input type="text" id="taskTitle" placeholder="Vad ska göras?" class="modalInput">
      <textarea id="taskDesc" placeholder="Beskrivning..." class="modalInput" style="min-height: 100px; resize: none;"></textarea>
      
      <div class="modal-field">
        <label class="modal-label">Ansvarig:</label>
        <select id="taskAssigned" class="modalInput">
          ${people.map(person => 
            `<option value="${person}" ${person === "Ingen" ? "selected" : ""}>${person}</option>`
          ).join("")}
        </select>
      </div>

      <div class="modal-field">
        <label class="modal-label">Deadline:</label>
        <input type="date" id="taskDeadline" class="modalInput">
      </div>
    </div>
    <div class="modalButtons">
      <button id="cancelTask" class="cancelBtn">Avbryt</button>
      <button id="saveTask" class="confirmBtn">Spara</button>
    </div>
  `;

  modal.querySelector("#saveTask").onclick = () => {
    const title = modal.querySelector("#taskTitle").value.trim();
    const assigned = modal.querySelector("#taskAssigned").value;

    if (!title) return alert("Titeln får inte vara tom!");

    const newTask = {
      id: Date.now(),
      title: title,
      description: modal.querySelector("#taskDesc").value.trim(),
      deadline: modal.querySelector("#taskDeadline").value || 0,
      createdAt: new Date().toISOString(), 
      status: TASK_STATUSES.TODO,
      assigned: assigned, 
      completed: false,
      comment: ""
    };

    // 1. Spara datan
    addState(newTask);

    // 2. STÄNG MODALEN
    overlay.remove();

    // 3. SKICKA SIGNALEN (Detta är den magiska raden!)
    // Detta triggar window.addEventListener('renderApp') i din app.js
    window.dispatchEvent(new CustomEvent('renderApp'));
  };

  // Stäng om man klickar på bakgrunden
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  modal.querySelector("#cancelTask").onclick = () => overlay.remove();
  overlay.append(modal);
  return overlay; 
};