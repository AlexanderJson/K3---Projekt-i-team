import { Btn } from "../comps/btn.js";
import { setView } from "../views/viewController.js";
import { toggleThemeBtn } from "../comps/themeBtn.js";
import { loadState } from "../storage.js";

// DEV ONLY - reset state
function resetState() {
  const ok = confirm("DEV: Rensa all local state?");
  if (!ok) return;

  localStorage.removeItem("state");
  location.reload();
}

export const menu = () => {
  const state = loadState();
  const teamName = state.settings?.teamName || "Mitt Team";

  const div = document.createElement("div");
  div.classList.add("menu");

  // --- TEAM NAMN ---
  const brand = document.createElement("div");
  brand.classList.add("menu-brand");
  brand.style.padding = "16px"; 
  brand.style.fontWeight = "bold";
  brand.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
  brand.style.marginBottom = "16px";
  brand.textContent = teamName;
  div.append(brand);

  // --- ÖVRE MENYVAL ---
  const mainButtons = document.createElement("div");
  mainButtons.classList.add("menu-main");

  const mainMenuButtons = [
    {
      text: "Dashboard",
      className: "menu-btn",
      onClick: () => setView("dashboard")
    },
    {
      text: "Uppgifter",
      className: "menu-btn",
      onClick: () => setView("tasks")
    },
    {
      text: "Schema",
      className: "menu-btn",
      onClick: () => alert("Ej implementerat ännu")
    },
    {
      text: "Kontakter",
      className: "menu-btn",
      onClick: () => alert("Ej implementerat ännu")
    },
    {
      text: "Inställningar",
      className: "menu-btn settings-link",
      onClick: () => setView("settings")
    }
  ];

  mainMenuButtons.forEach(b => mainButtons.append(Btn(b)));

  // --- NY SEKTION: LÄGG TILL UPPGIFT (Samma stil som themeBtn) ---
  const addSection = document.createElement("div");
  addSection.style.padding = "24px 12px"; // Ger luft mellan navigering och dev-del
  
  const addBtn = Btn({
    text: "+ Ny uppgift",
    className: "side-add-btn addTaskFab", // Klassen addTaskFab krävs för klick-lyssnaren i app.js
    onClick: () => {} // Logiken hanteras centralt i app.js via event delegation
  });
  
  addSection.append(addBtn);

  // --- NEDRE SEKTION (DEV & THEME) ---
  const themeBtn = toggleThemeBtn();
  const devButtons = document.createElement("div");
  devButtons.classList.add("menu-dev");

  devButtons.append(
    Btn({
      text: "DEV: Reset state",
      className: "menu-btn dev",
      onClick: resetState
    }),
    themeBtn
  );

  // Lägg till alla delar i huvudmenyn
  div.append(mainButtons, addSection, devButtons);
  
  return div;
};