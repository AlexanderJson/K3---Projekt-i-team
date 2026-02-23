/**
 * @file dialog.js
 * @description Modal-dialog för att skapa/redigera uppgifter.
 * Inkluderar: titel, beskrivning, deadline, teamtilldelning,
 * kontakt-autocomplete, och tidsstämplad noteringslogg.
 * WCAG 2.1 AA: role="dialog", aria-modal, :focus-visible, JSDoc.
 */
import { addState, loadState, saveState } from "../storage.js";
import { TASK_STATUSES } from "../status.js";
import { getPeople } from "../people/peopleService.js";

/**
 * Öppnar en modal för att skapa eller redigera en uppgift.
 * @param {Object|null} taskToEdit - Befintlig uppgift att redigera, eller null för ny.
 * @returns {HTMLElement} Overlay-elementet.
 */
export const addTaskDialog = (taskToEdit = null) => {
  const overlay = document.createElement("div");
  overlay.className = "modalOverlay"; 
  overlay.setAttribute("role", "presentation");

  const modal = document.createElement("div");
  modal.className = "modalCard modalCard-expanded"; 
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", taskToEdit ? "Redigera uppgift" : "Skapa ny uppgift");

  const people = getPeople(); 
  const isEdit = !!taskToEdit;
  
  const titleText = isEdit ? "Redigera uppgift" : "Skapa uppgift";
  const btnText = isEdit ? "Spara ändringar" : "Skapa uppgift";
  
  let selectedContact = isEdit && taskToEdit.contactId ? { id: taskToEdit.contactId, name: taskToEdit.contactName } : null;
  
  let selectedAssignees = [];
  if (isEdit) {
    if (taskToEdit.assignedTo && Array.isArray(taskToEdit.assignedTo)) {
      selectedAssignees = taskToEdit.assignedTo;
    } else if (taskToEdit.assigned) {
      selectedAssignees = [taskToEdit.assigned];
    }
  }

  modal.innerHTML = `
    <h2>${titleText}</h2>
    <div class="modal-body ${isEdit ? "modal-split" : ""}">
      <div class="modal-col-left">
        <label for="taskTitle" class="sr-only">Titel</label>
        <textarea id="taskTitle" placeholder="Vad ska göras? (t.ex. Kontakta Axis)" class="modalInput" style="height: 54px; min-height: 54px; resize: none; overflow: hidden; padding-top: 12px; line-height: 1.4;"></textarea>
        
        <label for="taskDesc" class="sr-only">Beskrivning</label>
        <textarea id="taskDesc" placeholder="Beskrivning av uppgiften..." class="modalInput" style="min-height: 80px; resize: none;"></textarea>
        
        <div id="linkedContactBadge" style="display:none;align-items:center;gap:6px;background:rgba(34,211,238,0.1);border:1px solid var(--accent-cyan);padding:6px 10px;border-radius:6px;margin-bottom:10px;color:var(--accent-cyan);font-size:12px;">
          <span>🔗 Länkad till: <strong id="linkedContactName"></strong></span>
          <span id="removeLink" style="cursor:pointer;opacity:0.7;margin-left:auto;">✕</span>
        </div>

        <div class="modal-field">
          <label class="modal-label">Vilka i teamet är ansvariga?</label>
          <div class="assignee-selector-grid" role="group" aria-label="Teammedlemmar">
            ${people.map(personName => {
              const isChecked = selectedAssignees.includes(personName) ? "checked" : "";
              const displayName = personName === "Ingen" ? "🟢 Ledig uppgift" : personName;
              return `
                <label class="assignee-chip">
                  <input type="checkbox" value="${personName}" ${isChecked}>
                  <span class="chip-text">${displayName}</span>
                </label>
              `;
            }).join("")}
          </div>
        </div>

        <div class="modal-field">
          <label class="modal-label">Deadline:</label>
          <input type="date" id="taskDeadline" class="modalInput">
        </div>
      </div>

      ${isEdit ? `
      <div class="modal-col-right">
        <div class="modal-field modal-notes-section">
          <label class="modal-label">📝 Noteringslogg</label>
          <div class="modal-notes-input-row">
            <textarea id="taskNoteInput" placeholder="Skriv en notering..." class="modalInput task-note-input" style="min-height:50px;resize:none;"></textarea>
            <button type="button" id="addNoteBtn" class="confirmBtn task-note-btn" aria-label="Lägg till notering">+ Notera</button>
          </div>
          <div id="notesLog" class="modal-notes-log" role="log" aria-label="Noteringshistorik"></div>
        </div>
      </div>
      ` : ""}
    </div>
    <div class="modalButtons">
      <button id="cancelTask" class="cancelBtn">Avbryt</button>
      <button id="saveTask" class="confirmBtn">${btnText}</button>
    </div>
  `;

  // Populate values
  if (isEdit) {
    modal.querySelector("#taskTitle").value = taskToEdit.title || "";
    modal.querySelector("#taskDesc").value = taskToEdit.description || "";
    if (taskToEdit.deadline) {
        modal.querySelector("#taskDeadline").value = taskToEdit.deadline;
    }
  }
  
  // Contact badge
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
  updateBadge();

  // --- Exclusive checkbox logic ---
  const checkboxes = modal.querySelectorAll('.assignee-chip input[type="checkbox"]');
  const ingenCb = Array.from(checkboxes).find(cb => cb.value === "Ingen");

  checkboxes.forEach(cb => {
      cb.addEventListener('change', (e) => {
          if (e.target.value === "Ingen" && e.target.checked) {
              checkboxes.forEach(other => {
                  if (other.value !== "Ingen") other.checked = false;
              });
          } else if (e.target.value !== "Ingen" && e.target.checked) {
              if (ingenCb) ingenCb.checked = false;
          }
      });
  });

  // --- Notes Log (only for edit mode) ---
  if (isEdit) {
    const notesLog = modal.querySelector("#notesLog");
    const noteInput = modal.querySelector("#taskNoteInput");
    const addNoteBtn = modal.querySelector("#addNoteBtn");

    /**
     * Renderar noteringsloggen i modalen.
     */
    const renderNotes = () => {
      notesLog.innerHTML = "";
      const notes = taskToEdit.notes || [];
      if (notes.length === 0) {
        notesLog.innerHTML = `<div class="notes-empty">Ingen historik ännu.</div>`;
        return;
      }
      // Kronologisk, nyast först
      [...notes].reverse().forEach(note => {
        const item = document.createElement("div");
        item.className = `notes-item ${note.type === "status" ? "notes-status" : ""}`;
        const dateStr = new Date(note.date).toLocaleString("sv-SE").slice(0, 16);
        item.innerHTML = `
          <div class="notes-meta">
            <span class="notes-date">${dateStr}</span>
            ${note.author ? `<span class="notes-author">${note.author}</span>` : ""}
          </div>
          <div class="notes-text">${escapeHtml(note.text)}</div>
        `;
        notesLog.append(item);
      });
    };

    addNoteBtn.onclick = () => {
      const text = noteInput.value.trim();
      if (!text) return;
      if (!taskToEdit.notes) taskToEdit.notes = [];
      taskToEdit.notes.push({
        text,
        date: new Date().toISOString(),
        type: "note",
        author: "" // Could be current user if auth exists
      });
      noteInput.value = "";
      renderNotes();
    };

    renderNotes();
  }

  // --- Save ---
  modal.querySelector("#saveTask").onclick = () => {
    const title = modal.querySelector("#taskTitle").value.trim();
    const description = modal.querySelector("#taskDesc").value.trim();
    const deadline = modal.querySelector("#taskDeadline").value || 0;

    const assignedTo = Array.from(modal.querySelectorAll('.assignee-chip input:checked')).map(cb => cb.value);
    const primaryAssignee = assignedTo.length > 0 ? assignedTo[0] : "Ingen";

    if (!title) return alert("Titeln får inte vara tom!");

    if (isEdit) {
      const state = loadState();
      const index = state.tasks.findIndex(t => String(t.id) === String(taskToEdit.id));
      
      if (index !== -1) {
        const oldStatus = state.tasks[index].status;
        state.tasks[index] = {
          ...taskToEdit,
          title,
          description,
          assigned: primaryAssignee, 
          assignedTo, 
          deadline,
          notes: taskToEdit.notes || [],
          contactId: selectedContact ? selectedContact.id : null,
          contactName: selectedContact ? selectedContact.name : null
        };

        // Log status change as note
        if (oldStatus !== state.tasks[index].status) {
          if (!state.tasks[index].notes) state.tasks[index].notes = [];
          state.tasks[index].notes.push({
            text: `Status ändrad: ${oldStatus} → ${state.tasks[index].status}`,
            date: new Date().toISOString(),
            type: "status"
          });
        }

        saveState(state);
      }
    } else {
      const newTask = {
        id: Date.now(),
        title,
        description,
        deadline,
        createdAt: new Date().toISOString(), 
        status: TASK_STATUSES.TODO,
        assigned: primaryAssignee, 
        assignedTo, 
        contactId: selectedContact ? selectedContact.id : null,
        contactName: selectedContact ? selectedContact.name : null,
        completed: false,
        comment: "",
        notes: []
      };
      addState(newTask);
    }

    overlay.remove();
    window.dispatchEvent(new CustomEvent('renderApp'));
  };

  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  modal.querySelector("#cancelTask").onclick = () => overlay.remove();
  
  overlay.append(modal);

  // --- Autocomplete ---
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
                          position: "absolute", top: "100%", left: "0", right: "0", zIndex: "6000",
                          display: "none", background: "var(--bg-deep, #111)", border: "1px solid var(--accent-cyan)",
                          borderRadius: "0 0 8px 8px", boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
                          maxHeight: "160px", overflowY: "auto"
                      });
                      wrapper.append(box);

                      inputEl.addEventListener("input", () => {
                          const val = inputEl.value;
                          const cursorPos = inputEl.selectionStart;
                          const before = val.slice(0, cursorPos);
                          const words = before.split(/\s+/);
                          const word = words[words.length - 1];

                          if (word.length < 2) { box.style.display = "none"; return; }

                          const matches = contacts.filter(c => c.name.toLowerCase().startsWith(word.toLowerCase()));
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
                                  const after = val.slice(cursorPos);
                                  const beforeWord = before.slice(0, -word.length);
                                  inputEl.value = beforeWord + m.name + " " + after;
                                  box.style.display = "none";
                                  inputEl.focus();
                                  
                                  selectedContact = m;
                                  updateBadge();
                              };
                              box.append(item);
                          });
                          box.style.display = "block";
                      });

                      const closeHandler = (e) => {
                          if (e.target !== inputEl && !box.contains(e.target)) box.style.display = "none";
                      };
                      overlay.addEventListener("click", closeHandler);
                  };

                  const titleInput = modal.querySelector("#taskTitle");
                  const descInput = modal.querySelector("#taskDesc");
                  
                  if (titleInput) attachAutocomplete(titleInput);
                  if (descInput) attachAutocomplete(descInput);
              }
          });
      });
  });

  // --- Focus Trap & Arrow Navigation ---
  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let focusableElements = Array.from(modal.querySelectorAll(focusableSelectors));
  
  // Set initial focus
  setTimeout(() => {
    if (focusableElements.length) focusableElements[0].focus();
  }, 10);

  modal.addEventListener('keydown', (e) => {
    focusableElements = Array.from(modal.querySelectorAll(focusableSelectors));
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) { 
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else { 
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      // Allow native arrow behavior in text inputs/textareas
      if (['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName) && 
          !['checkbox', 'radio', 'button'].includes(document.activeElement.type)) {
        return; 
      }
      e.preventDefault();
      const currentIndex = focusableElements.indexOf(document.activeElement);
      if (currentIndex !== -1) {
        let nextIndex = currentIndex + (e.key === 'ArrowDown' ? 1 : -1);
        if (nextIndex < 0) nextIndex = focusableElements.length - 1;
        if (nextIndex >= focusableElements.length) nextIndex = 0;
        focusableElements[nextIndex].focus();
      }
    } else if (e.key === 'Escape') {
      overlay.remove();
    }
  });

  return overlay; 
};

/**
 * Escape HTML-tecken för säker rendering.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}