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
  
  let selectedContact = isEdit && taskToEdit.contactId ? { id: taskToEdit.contactId, name: taskToEdit.contactName } : null;

  modal.innerHTML = `
    <h2>${titleText}</h2>
    <div class="modal-body">
      <textarea id="taskTitle" placeholder="Vad ska göras?" class="modalInput" style="height: 54px; min-height: 54px; resize: none; overflow: hidden; padding-top: 12px; line-height: 1.4;"></textarea>
      <textarea id="taskDesc" placeholder="Beskrivning..." class="modalInput" style="min-height: 100px; resize: none;"></textarea>
      
      <!-- Visual indicator for linked contact -->
      <div id="linkedContactBadge" style="display:none;align-items:center;gap:6px;background:rgba(34,211,238,0.1);border:1px solid var(--accent-cyan);padding:6px 10px;border-radius:6px;margin-bottom:10px;color:var(--accent-cyan);font-size:12px;">
        <span>🔗 Länkad till: <strong id="linkedContactName"></strong></span>
        <span id="removeLink" style="cursor:pointer;opacity:0.7;margin-left:auto;">✕</span>
      </div>
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
  
  const badge = modal.querySelector("#linkedContactBadge");
  const badgeName = modal.querySelector("#linkedContactName");
  const removeLink = modal.querySelector("#removeLink");
  
  const updateBadge = () => {
      if (selectedContact) {
          badge.style.display = "flex";
          badgeName.textContent = selectedContact.name;
      } else {
          badge.style.display = "none";
      }
  };
  
  removeLink.onclick = () => {
      selectedContact = null;
      updateBadge();
  };
  
  updateBadge(); // Init

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
          deadline,
          contactId: selectedContact ? selectedContact.id : null,
          contactName: selectedContact ? selectedContact.name : null
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
        contactId: selectedContact ? selectedContact.id : null,
        contactName: selectedContact ? selectedContact.name : null,
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
    // --- AUTOCOMPLETE LOGIC ---
    // Fetch from IndexedDB async
    import("../utils/contactsDb.js").then(({ getAllContacts, initContactsDB }) => {
        initContactsDB().then(() => {
            getAllContacts().then(contacts => {
                if (contacts && contacts.length > 0) {
                    const attachAutocomplete = (inputEl) => {
                        inputEl.setAttribute("autocomplete", "off");

                        const wrapper = document.createElement("div");
                        wrapper.style.position = "relative";
                        inputEl.parentNode.insertBefore(wrapper, inputEl);
                        wrapper.append(inputEl);

                        const box = document.createElement("div");
                        box.className = "autocomplete-suggestions";
                        Object.assign(box.style, {
                          position: "absolute",
                          top: "100%",
                          left: "0",
                          right: "0",
                          zIndex: "6000",
                          display: "none",
                          background: "var(--bg-deep, #111)",
                          border: "1px solid var(--accent-cyan)",
                          borderRadius: "0 0 8px 8px",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
                          maxHeight: "160px",
                          overflowY: "auto"
                        });
                        wrapper.append(box);

                        inputEl.addEventListener("input", () => {
                          const val = inputEl.value;
                          const cursorPos = inputEl.selectionStart;
                          const before = val.slice(0, cursorPos);
                          // Split by spaces but also handle empty input
                          const words = before.split(/\s+/);
                          const word = words[words.length - 1];

                          if (word.length < 2) { box.style.display = "none"; return; }

                          const matches = contacts.filter(c =>
                            c.name.toLowerCase().startsWith(word.toLowerCase())
                          );

                          if (matches.length === 0) { box.style.display = "none"; return; }

                          box.innerHTML = "";

                          const label = document.createElement("div");
                          label.textContent = "📇 Kontakter";
                          label.style.cssText = "padding:6px 12px;font-size:11px;color:var(--accent-cyan);letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.08);";
                          box.append(label);

                          matches.forEach(m => {
                            const item = document.createElement("div");
                            item.style.cssText = "padding:10px 14px;cursor:pointer;color:var(--text-main);display:flex;align-items:center;gap:8px;transition:background 0.15s;";

                            const nameSpan = document.createElement("span");
                            nameSpan.textContent = m.name;
                            nameSpan.style.fontWeight = "bold";

                            const roleSpan = document.createElement("span");
                            roleSpan.textContent = m.role || m.company || "";
                            roleSpan.style.cssText = "font-size:12px;color:var(--text-dim);margin-left:auto;";

                            item.append(nameSpan, roleSpan);
                            item.onmouseover = () => { item.style.background = "rgba(34,211,238,0.1)"; };
                            item.onmouseout = () => { item.style.background = "transparent"; };

                            item.onclick = () => {
                              // 1. Insert Text
                              const after = val.slice(cursorPos);
                              const beforeWord = before.slice(0, -word.length);
                              inputEl.value = beforeWord + m.name + " " + after;
                              box.style.display = "none";
                              inputEl.focus();
                              
                              // 2. Link Contact
                              selectedContact = m;
                              updateBadge();
                            };
                            box.append(item);
                          });

                          box.style.display = "block";
                        });

                        // Stäng vid klick utanför
                        const closeHandler = (e) => {
                          if (e.target !== inputEl && !box.contains(e.target)) {
                            box.style.display = "none";
                          }
                        };
                        // Attach to window/overlay instead of just overlay to catch all clicks?
                        // But overlay is modal, so clicks outside are overlay clicks.
                        overlay.addEventListener("click", closeHandler);
                    };

                    // Applicera på BÅDA fälten
                    const titleInput = modal.querySelector("#taskTitle");
                    const descInput = modal.querySelector("#taskDesc");
                    
                    if (titleInput) attachAutocomplete(titleInput);
                    if (descInput) attachAutocomplete(descInput);
                }
            });
        });
    });

  return overlay; 
};