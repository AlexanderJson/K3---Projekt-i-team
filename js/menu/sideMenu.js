import { Btn } from "../comps/btn.js";
import { setView } from "../views/viewController.js";
import { toggleThemeBtn } from "../comps/themeBtn.js";
import { loadState } from "../storage.js";
import { subscribe } from "../observer.js";

export const menu = () => {
  const div = document.createElement("div");
  div.classList.add("menu");

  const updateBrandName = (brandElement) => {
    const state = loadState();
    const teamName = state.settings?.teamName || "Mitt Team";
    brandElement.innerHTML = `<span class="nav-text">${teamName.toUpperCase()}</span>`;
  };

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "menu-toggle-btn";
  toggleBtn.innerHTML = "◀"; 
  toggleBtn.onclick = () => {
    const isCollapsed = div.classList.toggle("collapsed");
    toggleBtn.innerHTML = isCollapsed ? "▶" : "◀";
    document.body.classList.toggle("menu-is-collapsed", isCollapsed);
  };
  div.append(toggleBtn);

  const brand = document.createElement("div");
  brand.classList.add("menu-brand");
  updateBrandName(brand); 
  div.append(brand);

  subscribe(() => {
    updateBrandName(brand);
  });

  const mainButtons = document.createElement("div");
  mainButtons.classList.add("menu-main");

  // Alla knappar inkl Tema ligger nu i samma lista för att linjera på mobil
  const mainMenuButtons = [
    { text: "Kalender",     icon: "📅", view: "schedule" }, 
    { text: "Dashboard",    icon: "📊", view: "dashboard" },
    { text: "Uppgifter",    icon: "📋", view: "tasks" },
    { text: "Kontakter",    icon: "👥", view: "contacts" },
    { text: "Inställningar", icon: "⚙️", view: "settings" },
    { text: "Tema",         icon: "🌗", view: "theme" } 
  ];

  mainMenuButtons.forEach((b, index) => {
    const btnElement = Btn({
      // Vi behåller span-taggarna men döljer texten via CSS för en ren ikon-look
      text: `<span class="nav-icon">${b.icon}</span> <span class="nav-text">${b.text}</span>`, 
      className: `menu-btn ${b.view === "settings" ? "settings-link" : ""}`,
      onClick: () => {
        if (b.view === "theme") {
          const actualBtn = toggleThemeBtn(); 
          actualBtn.click();
        } else if (b.view === "schedule" || b.view === "contacts") {
          alert("Kommer snart!");
        } else {
          setView(b.view);
        }
      }
    });
    
    mainButtons.append(btnElement);

    // Infogar Ny Uppgift efter index 2 (Uppgifter)
    if (index === 2) {
      const addBtn = Btn({
        text: `<span class="nav-icon">+</span>`,
        className: "menu-btn addTaskFab",
        onClick: () => {
          console.log("Öppna Ny Uppgift Modal");
        }
      });
      mainButtons.append(addBtn);
    }
  });

  // Vi döljer footerSection på mobil helt och hållet
  const footerSection = document.createElement("div");
  footerSection.className = "menu-footer";
  footerSection.style.marginTop = "auto"; 
  // Vi lämnar denna tom eller döljer den via CSS för desktop-pilen

  div.append(mainButtons, footerSection);
  
  return div;
};