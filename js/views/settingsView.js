import { loadState, saveState } from "../storage.js";
import { notify } from "../observer.js"; // Nu används denna korrekt nedan
import { renamePerson } from "../people/peopleService.js";

export function renderSettings(container) {
  container.innerHTML = "";
  const state = loadState();
  const people = state.people || [];
  const teamName = state.settings?.teamName || "Mitt Team";

  const wrapper = document.createElement("div");
  wrapper.className = "settings-wrapper dashboard-fade-in";

  // --- TEAM-INSTÄLLNINGAR (Bredare & Renare) ---
  const teamCard = document.createElement("section");
  teamCard.className = "settings-card tight-card";
  teamCard.innerHTML = `
    <h3 class="settings-title">Team-inställningar</h3>
    <div class="settings-column">
        <label class="meta-label">Teamets namn</label>
        <div class="settings-field">
            <input type="text" id="teamNameInput" value="${teamName}" class="modalInput settings-input main-team-input">
            <button id="saveTeamName" class="confirmBtn small-btn">Uppdatera</button>
        </div>
    </div>
  `;
  
  teamCard.querySelector("#saveTeamName").onclick = () => {
    const name = teamCard.querySelector("#teamNameInput").value.trim();
    const currentState = loadState();
    if (!currentState.settings) currentState.settings = {};
    currentState.settings.teamName = name;
    saveState(currentState);
    notify(); // Fixar ESLint-varningen genom att faktiskt använda importen
    alert("Teamnamnet har sparats!");
  };

  wrapper.append(teamCard);

  // --- HANTERA MEDLEMMAR (Proffsig lista) ---
  const peopleCard = document.createElement("section");
  peopleCard.className = "settings-card tight-card";
  peopleCard.innerHTML = `<h3 class="settings-title">Teammedlemmar</h3>`;
  
  const list = document.createElement("div");
  list.className = "settings-list-container";

  people.forEach((person) => {
    if (person === "Ingen") return;

    const row = document.createElement("div");
    row.className = "settings-row-premium";

    const input = document.createElement("input");
    input.type = "text";
    input.value = person;
    input.className = "modalInput premium-input";

    const actions = document.createElement("div");
    actions.className = "row-actions";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Spara";
    saveBtn.className = "confirmBtn xsmall-btn";
    saveBtn.onclick = () => {
      renamePerson(person, input.value.trim());
      notify(); // Uppdaterar sidomenyn och andra vyer direkt
      renderSettings(container);
    };

    const delBtn = document.createElement("button");
    delBtn.textContent = "Radera";
    delBtn.className = "cancelBtn xsmall-btn ghost-btn"; // "Ghost" gör den mindre skrikig
    delBtn.onclick = () => {
      if (confirm(`Vill du ta bort ${person}?`)) {
        const s = loadState();
        s.people = s.people.filter(p => p !== person);
        saveState(s);
        notify();
        renderSettings(container);
      }
    };

    actions.append(saveBtn, delBtn);
    row.append(input, actions);
    list.append(row);
  });

  const addBtn = document.createElement("button");
  addBtn.textContent = "+ Lägg till ny medlem";
  addBtn.className = "confirmBtn secondary-btn full-width-btn";
  addBtn.onclick = () => {
    const n = prompt("Ange namn på den nya medlemmen:");
    if (n?.trim()) {
      const s = loadState();
      s.people.push(n.trim());
      saveState(s);
      notify();
      renderSettings(container);
    }
  };

  peopleCard.append(list, addBtn);
  wrapper.append(peopleCard);
  container.append(wrapper);
}