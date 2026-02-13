import { Btn } from "../comps/btn.js";
import { setView } from "../views/viewController.js";
import { toggleThemeBtn } from "../comps/themeBtn.js";
import { loadState } from "../storage.js";

export const menu = () => {
  const state = loadState();
  const teamName = state.settings?.teamName || "Mitt Team";

  const div = document.createElement("div");
  div.classList.add("menu");

  // --- BRANDING ---
  const brand = document.createElement("div");
  brand.classList.add("menu-brand");
  brand.style.padding = "24px 16px"; 
  brand.style.fontWeight = "900";
  brand.style.fontSize = "1.2rem";
  brand.style.letterSpacing = "1px";
  brand.style.borderBottom = "1px solid var(--border)";
  brand.style.marginBottom = "16px";
  brand.style.color = "var(--accent-cyan)";
  brand.textContent = teamName.toUpperCase();
  div.append(brand);

  // --- HUVUDNAVIGERING ---
  const mainButtons = document.createElement("div");
  mainButtons.classList.add("menu-main");

  const mainMenuButtons = [
    { text: "Dashboard", icon: "📊", view: "dashboard" },
    { text: "Uppgifter", icon: "📋", view: "tasks" },
    { text: "Schema",    icon: "📅", view: "schedule" },
    { text: "Kontakter", icon: "👥", view: "contacts" },
    { text: "Inställningar", icon: "⚙️", view: "settings" }
  ];

  mainMenuButtons.forEach(b => {
    const btnElement = Btn({
      // Vi lägger ikon och text i en container för CSS-kontroll
      text: `<span class="nav-icon">${b.icon}</span> <span class="nav-text">${b.text}</span>`,
      className: `menu-btn ${b.view === "settings" ? "settings-link" : ""}`,
      onClick: () => {
        if (b.view === "schedule" || b.view === "contacts") {
          alert("Kommer snart!");
        } else {
          setView(b.view);
        }
      }
    });
    mainButtons.append(btnElement);
  });

  // --- ACTION SEKTION (Ny uppgift) ---
  const addSection = document.createElement("div");
  addSection.classList.add("menu-action-section");
  addSection.style.padding = "32px 12px";
  
  const addBtn = Btn({
    text: `<span class="add-icon">+</span> <span class="nav-text">Ny uppgift</span>`,
    className: "side-add-btn addTaskFab", 
    onClick: () => {} // Hanteras via app.js
  });
  
  addSection.append(addBtn);

  // --- FOOTER (Endast Tema) ---
  const footerSection = document.createElement("div");
  footerSection.classList.add("menu-footer");
  footerSection.style.marginTop = "auto";
  footerSection.style.padding = "16px";
  footerSection.style.borderTop = "1px solid var(--border)";

  footerSection.append(toggleThemeBtn());

  // Bygg ihop allt
  div.append(mainButtons, addSection, footerSection);
  
  return div;
};