import { loadState, saveState } from "../storage.js";
import { notify } from "../observer.js";

export function renderSettings(container) {
  container.innerHTML = "";

  const state = loadState();
  const people = state.people || [];
  const teamName = state.settings?.teamName || "Mitt Team";

  const wrapper = document.createElement("div");
  wrapper.className = "settings-view";
  wrapper.style.padding = "24px";

  const title = document.createElement("h2");
  title.textContent = "Inställningar";
  wrapper.append(title);

  // ---------- SEKTION: TEAM-INSTÄLLNINGAR ----------
  const teamSection = document.createElement("section");
  teamSection.className = "settings-section";
  teamSection.style.marginBottom = "32px";

  const teamLabel = document.createElement("h3");
  teamLabel.textContent = "Team-inställningar";
  
  const nameInputLabel = document.createElement("label");
  nameInputLabel.textContent = "Teamets namn:";
  nameInputLabel.style.display = "block";
  nameInputLabel.style.marginBottom = "8px";

  const teamInput = document.createElement("input");
  teamInput.type = "text";
  teamInput.value = teamName;
  teamInput.className = "modalInput";
  teamInput.style.width = "100%";
  teamInput.style.maxWidth = "400px";

  const saveTeamBtn = document.createElement("button");
  saveTeamBtn.textContent = "Uppdatera teamnamn";
  saveTeamBtn.className = "confirmBtn";
  saveTeamBtn.style.marginTop = "12px";

  saveTeamBtn.addEventListener("click", () => {
    const currentState = loadState();
    if (!currentState.settings) currentState.settings = {};
    const newName = teamInput.value.trim();
    currentState.settings.teamName = newName;
    saveState(currentState);
    
    // Fixar så att namnet ändras i menyn direkt
    const menuBrand = document.querySelector(".menu-brand");
    if (menuBrand) {
      menuBrand.textContent = newName;
    }

    notify();
    alert("Teamnamnet har uppdaterats!");
  });

  teamSection.append(teamLabel, nameInputLabel, teamInput, saveTeamBtn);
  wrapper.append(teamSection);

  // ---------- SEKTION: HANTERA ANVÄNDARE ----------
  const peopleSection = document.createElement("section");
  peopleSection.className = "settings-section";

  const peopleTitle = document.createElement("h3");
  peopleTitle.textContent = "Hantera Teammedlemmar";
  
  const peopleList = document.createElement("div");
  peopleList.className = "settings-people-list";
  peopleList.style.marginTop = "16px";

  if (people.length === 0) {
    peopleList.innerHTML = "<p style='font-style:italic; opacity:0.6;'>Inga medlemmar tillagda.</p>";
  } else {
    // FIX: Tog bort 'index' här för att undvika ESLint-error
    people.forEach((person) => {
      const item = document.createElement("div");
      item.className = "settings-person-item";
      item.style.display = "flex";
      item.style.justifyContent = "space-between";
      item.style.alignItems = "center";
      item.style.padding = "12px";
      item.style.background = "rgba(255,255,255,0.05)";
      item.style.marginBottom = "8px";
      item.style.borderRadius = "4px";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = person;

      const actions = document.createElement("div");

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Ta bort";
      deleteBtn.className = "cancelBtn";
      deleteBtn.style.padding = "4px 12px";

      deleteBtn.addEventListener("click", () => {
        if (confirm(`Vill du verkligen ta bort ${person}?`)) {
          const currentState = loadState();
          currentState.people = currentState.people.filter(p => p !== person);
          saveState(currentState);
          notify();
          renderSettings(container);
        }
      });

      actions.append(deleteBtn);
      item.append(nameSpan, actions);
      peopleList.append(item);
    });
  }

  const addPersonBtn = document.createElement("button");
  addPersonBtn.textContent = "+ Lägg till medlem";
  addPersonBtn.className = "confirmBtn";
  addPersonBtn.style.marginTop = "16px";
  addPersonBtn.style.background = "#2ecc71";

  addPersonBtn.addEventListener("click", () => {
    const newName = prompt("Ange namn på ny teammedlem:");
    if (newName && newName.trim()) {
      const currentState = loadState();
      if (!currentState.people.includes(newName.trim())) {
        currentState.people.push(newName.trim());
        saveState(currentState);
        notify();
        renderSettings(container);
      } else {
        alert("Personen finns redan!");
      }
    }
  });

  peopleSection.append(peopleTitle, peopleList, addPersonBtn);
  wrapper.append(peopleSection);

  container.append(wrapper);
}