import { Btn } from "../comps/btn.js";
import { setView } from "../views/viewController.js";
import { toggleThemeBtn } from "../comps/themeBtn.js";
import { loadState } from "../storage.js"; // Importerad för att hämta teamnamn

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

  // --- TEAM NAMN (Huvudrubrik i menyn) ---
  const brand = document.createElement("div");
  brand.classList.add("menu-brand");
  brand.style.padding = "16px"; // 8px-regeln
  brand.style.fontWeight = "bold";
  brand.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
  brand.style.marginBottom = "16px";
  brand.textContent = teamName;
  div.append(brand);

  // Övre menyval
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
    // NY KNAPP: Inställningar
    {
      text: "Inställningar",
      className: "menu-btn settings-link",
      onClick: () => setView("settings")
    }
  ];

  mainMenuButtons.forEach(b => mainButtons.append(Btn(b)));

  const themeBtn = toggleThemeBtn();

  // Nedre DEV-knapp
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

  div.append(mainButtons, devButtons);
  return div;
};