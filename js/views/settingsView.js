import { loadState, saveState } from "../storage.js";
import { notify } from "../observer.js";
import { renamePerson } from "../people/peopleService.js";

export function renderSettings(container) {
  container.innerHTML = "";
  const state = loadState();
  const people = state.people || [];
  const teamName = state.settings?.teamName || "Mitt Team";

  const wrapper = document.createElement("div");
  wrapper.className = "settings-view";
  wrapper.style.padding = "24px";

  // --- TEAM-INSTÄLLNINGAR ---
  const teamSection = document.createElement("section");
  teamSection.className = "settings-section";
  teamSection.innerHTML = `<h3>Team-inställningar</h3><label>Teamets namn:</label>`;
  
  const teamInput = document.createElement("input");
  teamInput.type = "text";
  teamInput.value = teamName;
  teamInput.className = "modalInput";

  const saveTeamBtn = document.createElement("button");
  saveTeamBtn.textContent = "Uppdatera teamnamn";
  saveTeamBtn.className = "confirmBtn";
  saveTeamBtn.onclick = () => {
    const currentState = loadState();
    if (!currentState.settings) currentState.settings = {};
    currentState.settings.teamName = teamInput.value.trim();
    saveState(currentState);
    notify();
    alert("Teamnamnet har uppdaterats!");
  };

  teamSection.append(teamInput, saveTeamBtn);
  wrapper.append(teamSection);

  // --- HANTERA ANVÄNDARE ---
  const peopleSection = document.createElement("section");
  peopleSection.innerHTML = `<h3>Hantera Teammedlemmar</h3>`;
  const peopleList = document.createElement("div");

  people.forEach((person) => {
    const item = document.createElement("div");
    item.className = "settings-person-item";
    item.style.cssText = "display:flex; gap:10px; margin-bottom:12px; align-items:center;";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = person;
    nameInput.className = "modalInput";
    nameInput.style.flex = "1";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Spara";
    saveBtn.className = "confirmBtn";
    saveBtn.onclick = () => {
      renamePerson(person, nameInput.value.trim());
      renderSettings(container);
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Ta bort";
    deleteBtn.className = "cancelBtn";
    
    // HÄR ÄR FIXEN FÖR ATT BEHÅLLA NAMN VID RADERING
    deleteBtn.onclick = () => {
      if (confirm(`Vill du verkligen ta bort ${person}? Aktiva uppgifter blir lediga, men avslutade behåller historiken.`)) {
        const currentState = loadState();
        
        // 1. Ta bort från personlistan
        currentState.people = currentState.people.filter(p => p !== person);
        
        // 2. STÄDNING: Endast för aktiva uppgifter
        if (currentState.tasks) {
          currentState.tasks = currentState.tasks.map(task => {
            // Vi kollar om tasken är "Att göra" eller "Pågår"
            const isActive = task.status === "Att göra" || task.status === "Pågår"; 
            
            // Om den är aktiv och tillhör personen -> Sätt till "Ingen"
            if (task.assigned === person && isActive) {
              return { ...task, assigned: "Ingen" };
            }
            // Om den är "Klar" eller "Stängd" -> Låt namnet stå kvar för historik!
            return task;
          });
        }
        
        saveState(currentState);
        notify();
        renderSettings(container);
      }
    };

    item.append(nameInput, saveBtn, deleteBtn);
    peopleList.append(item);
  });

  const addPersonBtn = document.createElement("button");
  addPersonBtn.textContent = "+ Lägg till medlem";
  addPersonBtn.className = "confirmBtn";
  addPersonBtn.style.background = "#2ecc71";
  addPersonBtn.onclick = () => {
    const newName = prompt("Namn:");
    if (newName?.trim()) {
      const currentState = loadState();
      currentState.people.push(newName.trim());
      saveState(currentState);
      notify();
      renderSettings(container);
    }
  };

  peopleSection.append(peopleList, addPersonBtn);
  wrapper.append(peopleSection);
  container.append(wrapper);
}