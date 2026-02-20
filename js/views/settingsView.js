/**
 * @file settingsView.js
 * @description Vy för applikationsinställningar.
 * Hanterar teamnamn, veckomål, medlemshantering,
 * systemåtgärder (kollapsbar med säkerhetsspärr) och JSON backup.
 * WCAG 2.1 AA: Semantisk HTML, ARIA, :focus-visible, JSDoc.
 */

import { loadState, saveState } from "../storage.js";
import { notify } from "../observer.js";
import { loadDemoWorkspace, loadDemoLIA } from "../taskList/seed.js";
import { clearAllContacts, initContactsDB, getAllContacts, importContacts } from "../utils/contactsDb.js";

/**
 * Renderar inställningsvyn i angiven container.
 * @param {HTMLElement} container - Målelementet att rendera i.
 * @param {Function} rerenderCallback - Callback för att synka om hela appen.
 * @returns {void}
 */
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

  // --- TEAM-SEKTION ---
  const teamSection = document.createElement("section");
  teamSection.className = "settings-section"; 
  teamSection.setAttribute("aria-label", "Teaminställningar");
  teamSection.innerHTML = `
    <div class="settings-grid">
        <div class="settings-col">
            <label class="meta-label" for="teamNameInput">TEAMETS NAMN</label>
            <input type="text" id="teamNameInput" value="${teamName}" class="settings-input main-input" spellcheck="false">
        </div>
        <div class="settings-col">
            <label class="meta-label" for="weeklyTargetInput">VECKOMÅL (UPPGIFTER)</label>
            <input type="number" id="weeklyTargetInput" value="${state.settings?.weeklyTarget || 5}" class="settings-input main-input" min="1" max="100">
        </div>
        <div class="settings-col">
            <label class="meta-label" for="weeklyCRMTargetInput">VECKOMÅL (CRM)</label>
            <input type="number" id="weeklyCRMTargetInput" value="${state.settings?.weeklyCRMTarget || 5}" class="settings-input main-input" min="1" max="100">
        </div>
    </div>
  `;
  wrapper.append(teamSection);

  // --- MEDLEMS-SEKTION ---
  const peopleSection = document.createElement("section");
  peopleSection.className = "settings-section";
  peopleSection.setAttribute("aria-label", "Teammedlemmar");
  peopleSection.style.flex = "1";
  peopleSection.style.display = "flex";
  peopleSection.style.flexDirection = "column";

  peopleSection.innerHTML = `<label class="meta-label">TEAMMEDLEMMAR</label>`;
  
  const list = document.createElement("div");
  list.className = "members-container-scroll"; 
  list.style.flex = "1";

  /** @type {HTMLElement[]} */
  let memberRows = [];

  /**
   * Skapar en rad för en teammedlem med input och radera-knapp.
   * @param {string} name - Medlemmens namn.
   * @returns {HTMLElement} Radelementet.
   */
  const createMemberRow = (name) => {
    const row = document.createElement("div");
    row.className = "member-row";
    row.innerHTML = `
        <input type="text" value="${name}" class="premium-input member-edit-input" spellcheck="false" placeholder="Namn..." aria-label="Medlemsnamn">
        <button class="settings-btn btn-delete-small" aria-label="Radera ${name || 'medlem'}">RADERA</button>
    `;
    row.querySelector(".btn-delete-small").onclick = () => {
        row.remove(); 
        memberRows = memberRows.filter(r => r !== row);
    };
    return row;
  };

  people.forEach((person) => {
    if (person === "Ingen") return;
    const row = createMemberRow(person);
    list.append(row);
    memberRows.push(row);
  });

  const addBtn = document.createElement("button");
  addBtn.textContent = "+ LÄGG TILL NY MEDLEM";
  addBtn.className = "settings-btn btn-add-full";
  addBtn.setAttribute("aria-label", "Lägg till ny teammedlem");
  addBtn.onclick = () => {
    const row = createMemberRow("");
    list.append(row);
    memberRows.push(row);
    row.querySelector("input").focus();
    list.scrollTop = list.scrollHeight;
  };

  peopleSection.append(list, addBtn);
  wrapper.append(peopleSection);

  // ═══════════════════════════════════════════════════════════════
  // SYSTEMÅTGÄRDER — Kollapsbar säkerhetsspärr (<details>)
  // ═══════════════════════════════════════════════════════════════
  const actionsDetails = document.createElement("details");
  actionsDetails.className = "settings-collapsible settings-section";

  const actionsSummary = document.createElement("summary");
  actionsSummary.className = "settings-collapsible-summary";
  actionsSummary.setAttribute("aria-label", "Expandera systemåtgärder (demo, radera, backup)");
  actionsSummary.innerHTML = `
    <span class="collapsible-icon">⚙️</span>
    <span class="collapsible-title">SYSTEMÅTGÄRDER</span>
    <span class="collapsible-chevron" aria-hidden="true">▶</span>
  `;
  actionsDetails.append(actionsSummary);

  const actionsContent = document.createElement("div");
  actionsContent.className = "settings-collapsible-content";

  // --- Demo-knappar ---
  const demoLabel = document.createElement("label");
  demoLabel.className = "meta-label";
  demoLabel.textContent = "DEMOLÄGEN";
  demoLabel.style.marginBottom = "8px";
  actionsContent.append(demoLabel);

  const demoRow = document.createElement("div");
  demoRow.className = "settings-action-row";

  const loadWorkspaceBtn = document.createElement("button");
  loadWorkspaceBtn.className = "settings-btn btn-load-demo";
  loadWorkspaceBtn.textContent = "🚀 Demo Workspace";
  loadWorkspaceBtn.setAttribute("aria-label", "Ladda demo med Tech/DevOps-data");
  loadWorkspaceBtn.onclick = async () => {
    await loadDemoWorkspace();
    if (rerenderCallback) rerenderCallback();
  };

  const loadLiaBtn = document.createElement("button");
  loadLiaBtn.className = "settings-btn btn-load-demo btn-load-lia";
  loadLiaBtn.textContent = "🎓 Demo LIA-Chase";
  loadLiaBtn.setAttribute("aria-label", "Ladda demo med LIA/praktikjakt-data");
  loadLiaBtn.onclick = async () => {
    await loadDemoLIA();
    if (rerenderCallback) rerenderCallback();
  };

  demoRow.append(loadWorkspaceBtn, loadLiaBtn);
  actionsContent.append(demoRow);

  // --- Backup-knappar ---
  const backupLabel = document.createElement("label");
  backupLabel.className = "meta-label";
  backupLabel.textContent = "BACKUP";
  backupLabel.style.marginTop = "16px";
  backupLabel.style.marginBottom = "8px";
  actionsContent.append(backupLabel);

  const backupRow = document.createElement("div");
  backupRow.className = "settings-action-row";

  const exportBtn = document.createElement("button");
  exportBtn.className = "settings-btn btn-load-demo";
  exportBtn.textContent = "📦 Exportera Backup";
  exportBtn.setAttribute("aria-label", "Exportera hela appens data som JSON-fil");
  exportBtn.onclick = async () => {
    const backupData = { state: loadState() };
    try {
      await initContactsDB();
      backupData.contacts = await getAllContacts();
    } catch (e) {
      backupData.contacts = [];
      console.warn("Kunde inte exportera kontakter:", e);
    }
    const dateStr = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lianer-backup-${dateStr}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.style.display = "none";
  importInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.state) { alert("Ogiltig backup-fil."); return; }

      if (!confirm("Varning: Din nuvarande data ersätts med backup-filen. Fortsätt?")) return;

      saveState(data.state);

      if (data.contacts && Array.isArray(data.contacts)) {
        await initContactsDB();
        await clearAllContacts();
        await importContacts(data.contacts);
      }

      notify();
      if (rerenderCallback) rerenderCallback();
    } catch (err) {
      alert("Kunde inte läsa backup-filen: " + err.message);
    }
    e.target.value = "";
  };

  const importBtn = document.createElement("button");
  importBtn.className = "settings-btn btn-load-demo";
  importBtn.textContent = "📂 Importera Backup";
  importBtn.setAttribute("aria-label", "Importera appdata från JSON-backup");
  importBtn.onclick = () => importInput.click();

  backupRow.append(exportBtn, importInput, importBtn);
  actionsContent.append(backupRow);

  // --- Rensa-knapp ---
  const dangerLabel = document.createElement("label");
  dangerLabel.className = "meta-label";
  dangerLabel.textContent = "FARLIGA ÅTGÄRDER";
  dangerLabel.style.marginTop = "16px";
  dangerLabel.style.marginBottom = "8px";
  dangerLabel.style.color = "var(--accent-crimson)";
  actionsContent.append(dangerLabel);

  const dangerRow = document.createElement("div");
  dangerRow.className = "settings-action-row";

  const clearBtn = document.createElement("button");
  clearBtn.className = "settings-btn btn-clear-all";
  clearBtn.textContent = "🗑️ Ta bort all data";
  clearBtn.setAttribute("aria-label", "Radera all sparad data permanent");
  clearBtn.onclick = async () => {
    if (!confirm("Varning: Detta raderar ALLA uppgifter, teammedlemmar och kontakter permanent. Vill du fortsätta?")) return;

    localStorage.removeItem("state");
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("column_state_") || key.startsWith("column_count_") || key === "taskViewFilter" || key === "ical_events")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    try {
      await initContactsDB();
      await clearAllContacts();
    } catch (err) {
      console.warn("Kunde inte rensa IndexedDB:", err);
    }

    notify();
    if (rerenderCallback) rerenderCallback();
  };

  dangerRow.append(clearBtn);
  actionsContent.append(dangerRow);

  actionsDetails.append(actionsContent);
  wrapper.append(actionsDetails);

  // --- FOOTER (Spara / Avbryt) ---
  const footer = document.createElement("div");
  footer.className = "settings-footer";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "SPARA";
  saveBtn.className = "settings-btn btn-save-main";
  saveBtn.setAttribute("aria-label", "Spara alla inställningar");
  saveBtn.onclick = () => {
    const s = loadState();
    
    const newTeamName = document.getElementById("teamNameInput").value.trim();
    const newWeeklyTarget = parseInt(document.getElementById("weeklyTargetInput").value) || 5;
    const newWeeklyCRMTarget = parseInt(document.getElementById("weeklyCRMTargetInput").value) || 5;

    if (!s.settings) s.settings = {};
    s.settings.teamName = newTeamName;
    s.settings.weeklyTarget = newWeeklyTarget;
    s.settings.weeklyCRMTarget = newWeeklyCRMTarget;

    const newPeople = memberRows
      .map(r => r.querySelector("input").value.trim())
      .filter(n => n !== "" && n.toLowerCase() !== "ingen");
    
    if (!newPeople.includes("Ingen")) {
        newPeople.unshift("Ingen");
    }
    
    s.people = newPeople;
    saveState(s);
    notify(); 

    if (rerenderCallback) {
      rerenderCallback(); 
    } else {
      renderSettings(container, rerenderCallback);
    }
  };

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "AVBRYT";
  cancelBtn.className = "settings-btn btn-cancel-main";
  cancelBtn.setAttribute("aria-label", "Avbryt ändringar");
  cancelBtn.onclick = () => {
    if (confirm("Vill du förkasta dina ändringar?")) {
        if (rerenderCallback) rerenderCallback();
    }
  };

  footer.append(cancelBtn, saveBtn);
  wrapper.append(footer);
  container.append(wrapper);
}