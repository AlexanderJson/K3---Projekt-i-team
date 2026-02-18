import { loadState, saveState } from "../storage.js";
import { notify } from "../observer.js";

// Vi tar emot rerenderCallback från viewController för att synka appen
export function renderSettings(container, rerenderCallback) {
  container.innerHTML = "";
  const state = loadState();
  const people = state.people || [];
  const teamName = state.settings?.teamName || "Mitt Team";

  const wrapper = document.createElement("div");
  wrapper.className = "settings-wrapper dashboard-fade-in";

  // --- RUBRIK ---
  const header = document.createElement("h2");
  header.className = "settings-main-title";
  header.textContent = "Inställningar";
  wrapper.append(header);

  // --- TEAM-SEKTION (Grid Layout) ---
  const teamSection = document.createElement("section");
  teamSection.className = "settings-section"; 
  teamSection.innerHTML = `
    <div class="settings-grid">
        <div class="settings-col">
            <label class="meta-label">TEAMETS NAMN</label>
            <input type="text" id="teamNameInput" value="${teamName}" class="settings-input main-input" spellcheck="false">
        </div>
        <div class="settings-col">
            <label class="meta-label">VECKOMÅL</label>
            <input type="number" id="weeklyTargetInput" value="${state.settings?.weeklyTarget || 5}" class="settings-input main-input" min="1" max="100">
        </div>
    </div>
  `;
  wrapper.append(teamSection);

  // --- MEDLEMS-SEKTION ---
  const peopleSection = document.createElement("section");
  peopleSection.className = "settings-section";
  peopleSection.style.flex = "1"; // Låt den ta upp kvarvarande plats
  peopleSection.style.display = "flex";
  peopleSection.style.flexDirection = "column";

  peopleSection.innerHTML = `<label class="meta-label">TEAMMEDLEMMAR</label>`;
  
  const list = document.createElement("div");
  list.className = "members-container-scroll"; 
  list.style.flex = "1"; // Låt listan växa

  let memberRows = [];

  const createMemberRow = (name) => {
    const row = document.createElement("div");
    row.className = "member-row";
    row.innerHTML = `
        <input type="text" value="${name}" class="premium-input member-edit-input" spellcheck="false" placeholder="Namn...">
        <button class="settings-btn btn-delete-small">RADERA</button>
    `;

    row.querySelector(".btn-delete-small").onclick = () => {
        row.remove(); 
        memberRows = memberRows.filter(r => r !== row);
    };
    
    return row;
  };

  // 1. RENDERA EXISTERANDE MEDLEMMAR
  people.forEach((person) => {
    if (person === "Ingen") return;
    const row = createMemberRow(person);
    list.append(row);
    memberRows.push(row);
  });

  const addBtn = document.createElement("button");
  addBtn.textContent = "+ LÄGG TILL NY MEDLEM";
  addBtn.className = "settings-btn btn-add-full";
  addBtn.onclick = () => {
    const row = createMemberRow("");
    list.append(row);
    memberRows.push(row);
    const newInput = row.querySelector("input");
    newInput.focus();
    // Scrolla ner till botten
    list.scrollTop = list.scrollHeight;
  };

  peopleSection.append(list, addBtn);
  wrapper.append(peopleSection);

  // --- FOOTER (Håller knapparna nere till höger) ---
  const footer = document.createElement("div");
  footer.className = "settings-footer";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "SPARA";
  saveBtn.className = "settings-btn btn-save-main";
  saveBtn.onclick = () => {
    const s = loadState();
    
    // 1. Spara teamnamn och veckomål
    const newTeamName = document.getElementById("teamNameInput").value.trim();
    const newWeeklyTarget = parseInt(document.getElementById("weeklyTargetInput").value) || 5;

    if (!s.settings) s.settings = {};
    s.settings.teamName = newTeamName;
    s.settings.weeklyTarget = newWeeklyTarget;

    // 2. Samla namn från rader
    const newPeople = memberRows
      .map(r => r.querySelector("input").value.trim())
      .filter(n => n !== "" && n.toLowerCase() !== "ingen");
    
    // 3. Säkerställ "Ingen"
    if (!newPeople.includes("Ingen")) {
        newPeople.unshift("Ingen");
    }
    
    s.people = newPeople;
    saveState(s);
    notify(); 

    // Använd callbacken från viewController istället för lokal rendering
    if (rerenderCallback) {
      rerenderCallback(); 
    } else {
      renderSettings(container, rerenderCallback);
    }
  };

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "AVBRYT";
  cancelBtn.className = "settings-btn btn-cancel-main";
  cancelBtn.onclick = () => {
    if (confirm("Vill du förkasta dina ändringar?")) {
        if (rerenderCallback) rerenderCallback();
    }
  };

  footer.append(cancelBtn, saveBtn); // Avbryt till vänster, Spara till höger
  wrapper.append(footer);
  container.append(wrapper);
}