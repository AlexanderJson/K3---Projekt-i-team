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

  const mainMenuButtons = [
    { text: "Kalender",     icon: "calendar_month", view: "schedule" }, 
    { text: "Dashboard",    icon: "dashboard",      view: "dashboard" },
    { text: "Uppgifter",    icon: "assignment",     view: "tasks" },
    { text: "Kontakter",    icon: "group",          view: "contacts" },
    { text: "Inställningar", icon: "settings",       view: "settings" },
    { text: "Tema",         icon: "contrast",       view: "theme" } 
  ];

  mainMenuButtons.forEach((b, index) => {
    const btnElement = Btn({
      text: `<span class="nav-icon material-symbols-rounded">${b.icon}</span> <span class="nav-text">${b.text}</span>`, 
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

    if (index === 2) {
      const addBtn = Btn({
        text: `<span class="nav-icon material-symbols-rounded">add_circle</span><span class="nav-text">Lägg till uppgift</span>`,
        className: "menu-btn addTaskFab",
        onClick: () => {}
      });
      mainButtons.append(addBtn);
    }
  });

  const footerSection = document.createElement("div");
  footerSection.className = "menu-footer";
  footerSection.style.marginTop = "auto"; 

  div.append(mainButtons, footerSection);
  
  return div;
};