import { loadState } from "../storage.js";
import { taskList } from "../taskList/taskList.js";
import { TASK_STATUSES } from "../status.js";
import { addTaskDialog } from "../comps/dialog.js";

/**
 * @file taskScreen.js
 * @description Hanterar huvudskärmen för uppgifter (Kanban-vyn).
 * Inkluderar filter för team/medlemmar och stöd för flera ansvariga per uppgift.
 */

/**
 * Skapar och returnerar huvudvyn för uppgiftshantering.
 * @returns {HTMLElement} Det sammansatta elementet för uppgiftsskärmen.
 */
export const taskScreen = () => {
  const state = loadState();
  const people = state.people || []; // Array med strängar (namn)
  
  // Hämtar senast använda filter eller sätter standard till "Team"
  let currentFilter = localStorage.getItem("taskViewFilter") || "Team";

  const screenWrapper = document.createElement("main");
  screenWrapper.classList.add("taskScreenWrapper");
  screenWrapper.setAttribute("aria-label", "Projekttavla");

  const contentArea = document.createElement("div");
  contentArea.classList.add("taskContentArea");

  // ---------- FILTERKONTROLLER (Semantisk Header) ----------
  const filterHeader = document.createElement("header");
  filterHeader.classList.add("taskFilterContainer");

  const filterLabel = document.createElement("label");
  filterLabel.setAttribute("for", "task-filter-select");
  filterLabel.classList.add("filterLabel");
  filterLabel.textContent = "Visa uppgifter för: ";

  const select = document.createElement("select");
  select.id = "task-filter-select";
  select.tabIndex = 0;
  select.classList.add("taskFilterSelect");
  select.setAttribute("aria-controls", "task-board");

  // 1. Hela teamet
  const teamOption = document.createElement("option");
  teamOption.value = "Team";
  teamOption.textContent = "Hela Teamet";
  if (currentFilter === "Team") teamOption.selected = true;
  select.append(teamOption);

  const teamSeparator = document.createElement("option");
  teamSeparator.disabled = true;
  teamSeparator.textContent = "────────────────";
  select.append(teamSeparator);

  // 2. Alla medlemmar (Hanterar datan som strängar nu!)
  people.forEach(personName => {
    const option = document.createElement("option");
    option.value = personName; 
    // Om personen är "Ingen", visa det snyggare i listan
    option.textContent = (personName === "Ingen") ? "🟢 Lediga uppgifter" : personName;
    
    if (personName === currentFilter) option.selected = true;
    select.append(option);
  });

  const archiveSeparator = document.createElement("option");
  archiveSeparator.disabled = true;
  archiveSeparator.textContent = "────────────────";
  select.append(archiveSeparator);

  // 3. Arkivet
  const archiveOption = document.createElement("option");
  archiveOption.value = "Arkiv";
  archiveOption.textContent = "📁 Visa Stängda Uppgifter";
  if (currentFilter === "Arkiv") archiveOption.selected = true;
  select.append(archiveOption);

  /**
   * Uppdaterar Kanban-tavlan baserat på valt filter.
   * @param {string} selectedFilter - Namnet på personen, "Team" eller "Arkiv".
   */
  const updateView = (selectedFilter) => {
    contentArea.innerHTML = ""; 

    const latestState = loadState();
    const tasks = latestState.tasks || [];

    // ═══════════════════════════════════════════════════════════════
    // EMPTY STATE – "Lianer Welcome Hero" (High-End Edition)
    // Visas om det inte finns NÅGRA uppgifter alls i systemet.
    // ═══════════════════════════════════════════════════════════════
    if (tasks.length === 0 && selectedFilter !== "Arkiv") {
      // Hide the filter bar
      filterHeader.style.display = "none";

      const emptyState = document.createElement("div");
      emptyState.className = "empty-state-container";
      emptyState.setAttribute("role", "region");
      emptyState.setAttribute("aria-label", "Välkommen till Lianer");

      emptyState.innerHTML = `
        <div class="hero-image-wrapper">
          <img src="./docs/images/demo/Slide11.jpg" alt="Lianer – A modern project planner" class="hero-image" />
          <div class="hero-image-overlay"></div>
        </div>

        <div class="empty-state-content">
          <h2 class="empty-state-title">Välkommen till Lianer</h2>
          <p class="empty-state-subtitle">Ett komplett verktyg för det moderna teamet</p>
          <p class="empty-state-body">
            Din arbetsyta är redo, men just nu ekar det tomt. En blank tavla är dock början på något stort!
            Här visualiserar ni teamets process från idé till färdig leverans. Ta kontroll över arbetsflödet,
            slipp bruset och samla hela teamets prioriteringar på en och samma plats.
          </p>

          <div class="empty-state-actions">
            <div class="action-card action-card-create" role="button" tabindex="0" aria-label="Skapa er första uppgift">
              <span class="action-card-icon shadow-glow-blue">⊕</span>
              <div>
                <strong>Börja här: Skapa er första uppgift</strong>
                <p>Sätt bollen i rullning genom att lägga till en uppgift med titel, beskrivning och ansvariga.</p>
              </div>
            </div>
            <div class="action-card action-card-demo" role="button" tabindex="0" aria-label="Utforska demolägen i Inställningar">
              <span class="action-card-icon shadow-glow-yellow">⚙</span>
              <div>
                <strong>Utforska potentialen</strong>
                <p>Gå till <strong>Inställningar → Systemåtgärder</strong> för att utforska våra demolägen:
                <code>Demo Workspace</code> eller <code>LIA-Chase</code>.</p>
              </div>
            </div>
          </div>

          <div class="empty-state-creators">
            <h3 class="empty-state-section-title">Meet the Creators</h3>
            <div class="creators-grid">
              <div class="creator-card">
                <div class="creator-name"><a href="https://github.com/AlexanderJson" target="_blank" rel="noopener noreferrer">Alexander Jansson</a></div>
                <div class="creator-links">
                  <a href="https://github.com/AlexanderJson" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="creator-link-btn"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg></a>
                  <a href="https://www.linkedin.com/in/alexander-jansson-b53542264/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="creator-link-btn linkedin"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
                </div>
              </div>
              <div class="creator-card">
                <div class="creator-name"><a href="https://github.com/husseinhasnawy" target="_blank" rel="noopener noreferrer">Hussein Hasnawy</a></div>
                <div class="creator-links">
                  <a href="https://github.com/husseinhasnawy" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="creator-link-btn"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg></a>
                  <a href="https://www.linkedin.com/in/hussein-hasnawy/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="creator-link-btn linkedin"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
                </div>
              </div>
              <div class="creator-card">
                <div class="creator-name"><a href="https://github.com/jocoborghol" target="_blank" rel="noopener noreferrer">Joco Borghol</a></div>
                <div class="creator-links">
                  <a href="https://github.com/jocoborghol" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="creator-link-btn"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg></a>
                  <a href="https://www.linkedin.com/in/joco-borghol/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="creator-link-btn linkedin"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Make the "Create" action card clickable
      const createCard = emptyState.querySelector(".action-card-create");
      if (createCard) {
        createCard.addEventListener("click", () => addTaskDialog());
        createCard.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addTaskDialog(); } });
      }

      // Make the "Demo" action card navigate to settings
      const demoCard = emptyState.querySelector(".action-card-demo");
      if (demoCard) {
        demoCard.addEventListener("click", () => {
          window.dispatchEvent(new CustomEvent("navigateTo", { detail: "settings" }));
        });
      }

      contentArea.append(emptyState);
      return;
    }

    // Show the filter bar (in case it was hidden by empty state)
    filterHeader.style.display = "";

    const board = document.createElement("div");
    board.id = "task-board";
    board.classList.add("taskBoard");
    board.setAttribute("role", "region");
    board.setAttribute("aria-live", "polite");

    // LOGIK FÖR ARKIV-VY (VG: Focus Management)
    if (selectedFilter === "Arkiv") {
      const archiveColumn = document.createElement("section");
      archiveColumn.className = "taskWrapper closed-tasks-archive";
      archiveColumn.setAttribute("aria-label", "Stängda uppgifter");
      
      const closedTasks = tasks.filter(t => t.status === TASK_STATUSES.CLOSED);
      archiveColumn.append(taskList(TASK_STATUSES.CLOSED, closedTasks));
      
      board.append(archiveColumn);
    } 
    // LOGIK FÖR KANBAN-VY (Hanterar array-logik för flera ansvariga som strängar)
    else {
      // Filtrerar uppgifter: Visa alla om "Team", annars kolla om personens namn finns i assignedTo-arrayen
      const filteredTasks = selectedFilter === "Team" 
        ? tasks 
        : tasks.filter(t => {
            // Kontrollera först i den nya arrayen, fallback till gamla 'assigned'
            if (t.assignedTo && Array.isArray(t.assignedTo)) {
              // Buggfix: 'Ledig' = tom array ELLER explicit "Ingen"
              if (selectedFilter === "Ingen") {
                return t.assignedTo.length === 0 || t.assignedTo.includes("Ingen");
              }
              return t.assignedTo.includes(selectedFilter);
            }
            return t.assigned === selectedFilter;
          });

      const activeStatuses = [TASK_STATUSES.TODO, TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.DONE];
      
      activeStatuses.forEach(status => {
        const columnWrapper = document.createElement("section");
        columnWrapper.classList.add("taskWrapper");
        columnWrapper.setAttribute("data-status", status);
        columnWrapper.setAttribute("aria-label", `Kolumn: ${status}`);

        const columnTasks = filteredTasks.filter(t => t.status === status);
        columnWrapper.append(taskList(status, columnTasks));
        board.append(columnWrapper);
      });
    }

    contentArea.append(board);
  };

  // Eventlyssnare för filterändring
  select.addEventListener("change", (e) => {
    const newFilter = e.target.value;
    localStorage.setItem("taskViewFilter", newFilter);
    updateView(newFilter);
    setTimeout(() => {
      const el = document.getElementById("task-filter-select");
      if (el) el.focus();
    }, 50);
  });

  // Initial rendering
  updateView(currentFilter);

  filterHeader.append(filterLabel, select);
  screenWrapper.append(filterHeader, contentArea);

  return screenWrapper;
};