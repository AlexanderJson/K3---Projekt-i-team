import { loadState, saveState } from "../storage.js";
import { notify } from "../observer.js";

export function renderSettings(container) {
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

  // --- TEAM-SEKTION ---
  const teamSection = document.createElement("section");
  teamSection.className = "settings-section"; 
  teamSection.innerHTML = `
    <label class="meta-label">Teamets namn</label>
    <div class="settings-row-flex"> 
        <input type="text" id="teamNameInput" value="${teamName}" class="settings-input main-input" spellcheck="false">
    </div>
  `;
  wrapper.append(teamSection);

  // --- MEDLEMS-SEKTION ---
  const peopleSection = document.createElement("section");
  peopleSection.className = "settings-section";
  peopleSection.innerHTML = `<label class="meta-label">Teammedlemmar</label>`;
  
  const list = document.createElement("div");
  list.className = "members-container-scroll"; 

  let memberRows = [];

  const createMemberRow = (name) => {
    const row = document.createElement("div");
    row.className = "member-row";
    row.innerHTML = `
        <input type="text" value="${name}" class="premium-input member-edit-input" spellcheck="false" placeholder="Namn...">
        <button class="settings-btn btn-delete-small">RADERA</button>
    `;

    // Hantera radering visuellt och i referenslistan
    row.querySelector(".btn-delete-small").onclick = () => {
        row.remove(); 
        memberRows = memberRows.filter(r => r !== row);
    };
    
    return row;
  };

  // 1. RENDERA EXISTERANDE MEDLEMMAR - Filtrera bort "Ingen" så den aldrig syns i listan
  people.forEach((person) => {
    if (person === "Ingen") return;
    const row = createMemberRow(person);
    list.append(row);
    memberRows.push(row);
  });

  const addBtn = document.createElement("button");
  addBtn.textContent = "+ LÄGG TILL MEDLEM";
  addBtn.className = "settings-btn btn-add-full";
  addBtn.onclick = () => {
    const row = createMemberRow("");
    list.append(row);
    memberRows.push(row);
    
    // Autofokus på den nya radens input för snabbare editering
    const newInput = row.querySelector("input");
    newInput.focus();
  };

  peopleSection.append(list, addBtn);
  wrapper.append(peopleSection);

  // --- FOOTER (Spara / Avbryt) ---
  const footer = document.createElement("div");
  footer.className = "settings-footer";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "SPARA ÄNDRINGAR";
  saveBtn.className = "settings-btn btn-save-main";
  saveBtn.onclick = () => {
    const s = loadState();
    
    // 1. Spara teamnamn
    const newTeamName = document.getElementById("teamNameInput").value.trim();
    if (!s.settings) s.settings = {};
    s.settings.teamName = newTeamName;

    // 2. Samla namn från rader och rensa tomma samt förhindra manuell skapelse av "Ingen"
    const newPeople = memberRows
      .map(r => r.querySelector("input").value.trim())
      .filter(n => n !== "" && n.toLowerCase() !== "ingen");
    
    // 3. SYSTEMKRISTISK FIX: Säkerställ att "Ingen" alltid finns i datan men förblir dold för användaren
    if (!newPeople.includes("Ingen")) {
        newPeople.unshift("Ingen");
    }
    
    s.people = newPeople;
    saveState(s);
    notify(); // Triggar sidomenyn och andra vyer att uppdatera sig
    renderSettings(container);
  };

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "AVBRYT";
  cancelBtn.className = "settings-btn btn-cancel-main";
  cancelBtn.onclick = () => {
    if (confirm("Vill du förkasta dina ändringar?")) {
        renderSettings(container);
    }
  };

  footer.append(saveBtn, cancelBtn);
  wrapper.append(footer);
  container.append(wrapper);
}