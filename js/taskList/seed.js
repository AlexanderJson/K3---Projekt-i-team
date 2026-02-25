import { createTask } from "../data/tasks.js";
import { TASK_STATUSES } from "../status.js";
import { saveState, loadState } from "../storage.js";
import { initContactsDB, importContacts, getAllContacts } from "../utils/contactsDb.js";
import { readCsv } from "../Reader/csvReader.js";


/**
 * @file seed.js
 * @description Hanterar initial- och demodata för Lianer-projektet.
 * Exporterar två demolägen: Tech Workspace och LIA Chase.
 * Alla datum sprids 30 dagar bakåt, deadlines har en mix av saknade, framtida och passerade.
 */

// ─── Datum-helpers ───

/**
 * Returnerar ett ISO-datum N dagar bakåt.
 * @param {number} n - Antal dagar bakåt.
 * @returns {string} ISO-datumsträng.
 */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

/**
 * Returnerar en YYYY-MM-DD-deadline, positiv = framtid, negativ = förflutet.
 * @param {number} offset - Dagar från idag.
 * @returns {string} Datumformat "YYYY-MM-DD".
 */
function dl(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ═══════════════════════════════════════════════════════════════════
// DEMO WORKSPACE — Tech-fokus
// ═══════════════════════════════════════════════════════════════════

/** @type {string[]} */
const techPeople = [
  "Ingen",
  "Linnea Malmgren",
  "Henrik Rosengren",
  "Ali Hassan",
  "Nora Söderlund",
  "Lukas Karlsson"
];

/**
 * Skapar 20 IT/Tech-uppgifter.
 * @returns {Array<Object>}
 */
function createTechTasks() {
  return [
    createTask({ id:"w1",  title:"Konfigurera CI/CD-pipeline",         description:"GitHub Actions: build, lint, deploy till staging vid push till main.",   status:TASK_STATUSES.TODO,        assignedTo:["Ali Hassan","Lukas Karlsson"], assigned:"Ali Hassan",       createdAt:daysAgo(28), deadline:dl(7) }),
    createTask({ id:"w2",  title:"Implementera JWT-autentisering",     description:"Login med access/refresh tokens och säker cookie-hantering.",            status:TASK_STATUSES.TODO,        assignedTo:["Henrik Rosengren"],            assigned:"Henrik Rosengren", createdAt:daysAgo(25), deadline:dl(14) }),
    createTask({ id:"w3",  title:"Designa databasschema för CRM",      description:"Normalisera tabeller: kontakter, företag, interaktioner + ER-diagram.",  status:TASK_STATUSES.TODO,        assignedTo:["Nora Söderlund","Ali Hassan"], assigned:"Nora Söderlund",   createdAt:daysAgo(20), deadline:dl(10) }),
    createTask({ id:"w4",  title:"Enhetstester för storage.js",        description:"Testa loadState, saveState, addState, removeById med Vitest.",           status:TASK_STATUSES.TODO,        assignedTo:["Lukas Karlsson"],              assigned:"Lukas Karlsson",   createdAt:daysAgo(15), deadline:0 }),
    createTask({ id:"w5",  title:"Lighthouse-poäng 90+",              description:"Fixa render-blocking, lazy-load bilder, optimera fonts.",                 status:TASK_STATUSES.TODO,        assignedTo:[],                              assigned:"Ingen",            createdAt:daysAgo(12), deadline:dl(21) }),
    createTask({ id:"w6",  title:"WebSocket-notifikationer",          description:"Real-time push vid uppgiftsändringar.",                                   status:TASK_STATUSES.TODO,        assignedTo:["Henrik Rosengren","Linnea Malmgren"], assigned:"Henrik Rosengren", createdAt:daysAgo(8), deadline:0 }),
    createTask({ id:"w7",  title:"WCAG-audit hela appen",             description:"Kör axe-core, mål: 0 violations på AA-nivå.",                             status:TASK_STATUSES.TODO,        assignedTo:[],                              assigned:"Ingen",            createdAt:daysAgo(5), deadline:dl(3) }),

    createTask({ id:"w8",  title:"REST API med Express.js",           description:"CRUD /tasks, /contacts, /users med Joi-validering.",                      status:TASK_STATUSES.IN_PROGRESS, assignedTo:["Ali Hassan"],                  assigned:"Ali Hassan",       createdAt:daysAgo(22), deadline:dl(-2) }),
    createTask({ id:"w9",  title:"Migrera till Vite från Webpack",    description:"Byt bundler, uppdatera imports, verifiera HMR.",                          status:TASK_STATUSES.IN_PROGRESS, assignedTo:["Linnea Malmgren"],             assigned:"Linnea Malmgren",  createdAt:daysAgo(18), deadline:dl(5) }),
    createTask({ id:"w10", title:"CSS → design tokens",              description:"Ersätt hårdkodade färger/storlekar med CSS custom properties.",             status:TASK_STATUSES.IN_PROGRESS, assignedTo:["Nora Söderlund"],              assigned:"Nora Söderlund",   createdAt:daysAgo(14), deadline:dl(2) }),
    createTask({ id:"w11", title:"IndexedDB offline-kontakter",       description:"CRUD mot IndexedDB med synk vid nätverksåterkomst.",                      status:TASK_STATUSES.IN_PROGRESS, assignedTo:["Lukas Karlsson","Ali Hassan"], assigned:"Lukas Karlsson",   createdAt:daysAgo(10), deadline:dl(-5) }),
    createTask({ id:"w12", title:"Docker Compose dev-miljö",          description:"Node + PostgreSQL + Redis i containers.",                                  status:TASK_STATUSES.IN_PROGRESS, assignedTo:["Henrik Rosengren"],            assigned:"Henrik Rosengren", createdAt:daysAgo(7),  deadline:0 }),
    createTask({ id:"w13", title:"Dark mode med localStorage",        description:"Spara tema-val, respektera prefers-color-scheme.",                         status:TASK_STATUSES.IN_PROGRESS, assignedTo:["Linnea Malmgren","Nora Söderlund"], assigned:"Linnea Malmgren", createdAt:daysAgo(3), deadline:dl(8) }),

    createTask({ id:"w14", title:"ESLint + Prettier setup",           description:"Airbnb-preset, husky pre-commit, lint-staged.",                            status:TASK_STATUSES.DONE, completed:true, assignedTo:["Lukas Karlsson"],              assigned:"Lukas Karlsson",   createdAt:daysAgo(30), deadline:dl(-15) }),
    createTask({ id:"w15", title:"UI-mockups i Figma",                description:"High-fidelity prototyper: Dashboard, Kanban, Kalender.",                   status:TASK_STATUSES.DONE, completed:true, assignedTo:["Nora Söderlund","Linnea Malmgren"], assigned:"Nora Söderlund", createdAt:daysAgo(27), deadline:dl(-10) }),
    createTask({ id:"w16", title:"PWA manifest + service worker",     description:"Installationsbar med Workbox offline-cache.",                               status:TASK_STATUSES.DONE, completed:true, assignedTo:["Ali Hassan"],                  assigned:"Ali Hassan",       createdAt:daysAgo(24), deadline:dl(-8) }),
    createTask({ id:"w17", title:"Observer-pattern (pub/sub)",        description:"Centralt notifikationssystem för alla vyer.",                               status:TASK_STATUSES.DONE, completed:true, assignedTo:["Henrik Rosengren","Lukas Karlsson"], assigned:"Henrik Rosengren", createdAt:daysAgo(21), deadline:0 }),

    createTask({ id:"w18", title:"GraphQL vs REST utvärdering",       description:"Jämförande analys: overhead, DX, caching.",                                 status:TASK_STATUSES.CLOSED, completed:true, assignedTo:["Henrik Rosengren"], assigned:"Henrik Rosengren", createdAt:daysAgo(29), closedReason:"REST valdes – enklare onboarding av juniorer." }),
    createTask({ id:"w19", title:"PoC: Svelte vs Vanilla JS",        description:"Bundle-storlek och DX-jämförelse.",                                          status:TASK_STATUSES.CLOSED, completed:true, assignedTo:["Linnea Malmgren"], assigned:"Linnea Malmgren",  createdAt:daysAgo(26), closedReason:"Vanilla JS behålls – färre beroenden." }),
    createTask({ id:"w20", title:"Firebase backend-test",             description:"Testat Firestore, Auth och hosting.",                                        status:TASK_STATUSES.CLOSED, completed:true, assignedTo:[],                  assigned:"Ingen",            createdAt:daysAgo(23), closedReason:"Self-hosted lösning föredras." }),
  ];
}

/** @type {import('../utils/contactsDb.js').DemoContact[]} */
const techContacts = [
  { id:2001, name:"Emma Lindqvist",   role:"Senior DevOps Engineer",  company:"Axis Communications", email:"emma.l@axis.com",       phone:"040-123 45 01", isFavorite:true,  status:"Pågående" },
  { id:2002, name:"Oscar Bergström",  role:"Frontend Lead",           company:"Telavox",             email:"oscar.b@telavox.se",    phone:"040-123 45 02", isFavorite:false, status:"Ej kontaktad" },
  { id:2003, name:"Sara Johansson",   role:"UX Designer",             company:"Jayway (Devoteam)",   email:"sara.j@jayway.com",     phone:"040-123 45 03", isFavorite:true,  status:"Klar" },
  { id:2004, name:"Marcus Eriksson",  role:"Fullstack Developer",     company:"Pocketlaw",           email:"marcus.e@pocketlaw.com",phone:"040-123 45 04", isFavorite:false, status:"Ej kontaktad" },
  { id:2005, name:"Fatima Al-Rashid", role:"Cloud Architect",         company:"Ericsson",            email:"fatima.ar@ericsson.com",phone:"040-123 45 05", isFavorite:true,  status:"Pågående" },
  { id:2006, name:"Jakob Nilsson",    role:"Backend Engineer",        company:"Qlik",                email:"jakob.n@qlik.com",      phone:"040-123 45 06", isFavorite:false, status:"Ej kontaktad" },
  { id:2007, name:"Ida Svensson",     role:"Tech Lead",               company:"Sigma Technology",    email:"ida.s@sigmatech.se",    phone:"040-123 45 07", isFavorite:false, status:"Ej kontaktad" },
  { id:2008, name:"Daniel Öberg",     role:"Data Engineer",           company:"H&M Group (Tech)",    email:"daniel.o@hm.com",       phone:"040-123 45 08", isFavorite:true,  status:"Återkom" },
  { id:2009, name:"Klara Pettersson", role:"Scrum Master",            company:"Fortnox",             email:"klara.p@fortnox.se",    phone:"040-123 45 09", isFavorite:false, status:"Ej kontaktad" },
  { id:2010, name:"Yousef Mansour",   role:"Security Analyst",        company:"Truesec",             email:"yousef.m@truesec.com",  phone:"040-123 45 10", isFavorite:false, status:"Ej kontaktad" },
];

// ═══════════════════════════════════════════════════════════════════
// DEMO LIA CHASE — Praktikjakt-fokus
// ═══════════════════════════════════════════════════════════════════

/** @type {string[]} */
const liaPeople = [
  "Ingen",
  "Linnea Malmgren",
  "Henrik Rosengren",
  "Ali Hassan",
  "Nora Söderlund",
  "Lukas Karlsson"
];




/**
 * Skapar 20 LIA/Praktik-uppgifter.
 * @returns {Array<Object>}
 */
function createLiaTasks() {
  return [
    createTask({ id:"l1",  title:"Ring Axis Communications",           description:"Följ upp inskickad ansökan, boka introduktionsmöte.",                       status:TASK_STATUSES.TODO,        assignedTo:["Linnea Malmgren"],             assigned:"Linnea Malmgren",  createdAt:daysAgo(28), deadline:dl(3) }),
    createTask({ id:"l2",  title:"Nätverka på LinkedIn",               description:"Lägg till rekryterare från Telavox, King och Jayway.",                      status:TASK_STATUSES.TODO,        assignedTo:["Nora Söderlund"],              assigned:"Nora Söderlund",   createdAt:daysAgo(26), deadline:0 }),
    createTask({ id:"l3",  title:"Boka studiebesök på Sigma",          description:"Kontakta Sara H för att arrangera visit med teamet.",                        status:TASK_STATUSES.TODO,        assignedTo:["Ali Hassan","Henrik Rosengren"], assigned:"Ali Hassan",     createdAt:daysAgo(24), deadline:dl(7) }),
    createTask({ id:"l4",  title:"Gemensamt team-möte: LIA-plan",      description:"Synka vilka företag var och en söker, undvik krockar.",                      status:TASK_STATUSES.TODO,        assignedTo:["Linnea Malmgren","Henrik Rosengren","Ali Hassan","Nora Söderlund","Lukas Karlsson"], assigned:"Linnea Malmgren", createdAt:daysAgo(22), deadline:dl(1) }),
    createTask({ id:"l5",  title:"Skicka ansökan till Fortnox",        description:"Anpassa CV och personligt brev till tjänsten.",                              status:TASK_STATUSES.TODO,        assignedTo:["Lukas Karlsson"],              assigned:"Lukas Karlsson",   createdAt:daysAgo(20), deadline:dl(10) }),
    createTask({ id:"l6",  title:"Uppdatera portfolio med K3-projekt",description:"Lägg till Lianer-appen och PWA-demo.",                                        status:TASK_STATUSES.TODO,        assignedTo:[],                              assigned:"Ingen",            createdAt:daysAgo(18), deadline:dl(14) }),
    createTask({ id:"l7",  title:"Maila handledare om referens",      description:"Be om referensbrev för LIA-ansökan.",                                         status:TASK_STATUSES.TODO,        assignedTo:["Nora Söderlund"],              assigned:"Nora Söderlund",   createdAt:daysAgo(15), deadline:0 }),

    createTask({ id:"l8",  title:"Förbered intervju med Qlik",       description:"Researcha företaget, förbered vanliga frågor.",                                status:TASK_STATUSES.IN_PROGRESS, assignedTo:["Henrik Rosengren"],           assigned:"Henrik Rosengren", createdAt:daysAgo(25), deadline:dl(-1) }),
    createTask({ id:"l9",  title:"CV-granskning gruppen",              description:"Alla granskar varandras CV:n och ger feedback.",                             status:TASK_STATUSES.IN_PROGRESS, assignedTo:["Linnea Malmgren","Nora Söderlund"], assigned:"Linnea Malmgren", createdAt:daysAgo(21), deadline:dl(2) }),
    createTask({ id:"l10", title:"Kontakta Ericsson HR",               description:"Skicka intresseanmälan till LIA-programmet.",                                status:TASK_STATUSES.IN_PROGRESS, assignedTo:["Ali Hassan"],                 assigned:"Ali Hassan",       createdAt:daysAgo(17), deadline:dl(-4) }),
    createTask({ id:"l11", title:"LinkedIn-profil granskning",        description:"Optimera headline, sammanfattning och kompetenser.",                           status:TASK_STATUSES.IN_PROGRESS, assignedTo:["Lukas Karlsson"],             assigned:"Lukas Karlsson",   createdAt:daysAgo(12), deadline:dl(5) }),
    createTask({ id:"l12", title:"Skriva personligt brev (mall)",     description:"Skapa en anpassningsbar mall för LIA-ansökningar.",                            status:TASK_STATUSES.IN_PROGRESS, assignedTo:["Nora Söderlund"],             assigned:"Nora Söderlund",   createdAt:daysAgo(8),  deadline:0 }),
    createTask({ id:"l13", title:"Mock-intervju med mentor",          description:"Öva intervju med kurskamrat, spela in för feedback.",                          status:TASK_STATUSES.IN_PROGRESS, assignedTo:["Henrik Rosengren","Ali Hassan"], assigned:"Henrik Rosengren", createdAt:daysAgo(5), deadline:dl(4) }),

    createTask({ id:"l14", title:"Skicka ansökan till Pocketlaw",     description:"Ansökan skickad. Fick svar: intresserade!",                                    status:TASK_STATUSES.DONE, completed:true, assignedTo:["Ali Hassan"],                 assigned:"Ali Hassan",       createdAt:daysAgo(30), deadline:dl(-12) }),
    createTask({ id:"l15", title:"Justera CV och Portfolio",          description:"Uppdaterat med senaste projekten och ny profilbild.",                           status:TASK_STATUSES.DONE, completed:true, assignedTo:["Linnea Malmgren","Henrik Rosengren","Ali Hassan","Nora Söderlund","Lukas Karlsson"], assigned:"Linnea Malmgren", createdAt:daysAgo(27), deadline:dl(-8) }),
    createTask({ id:"l16", title:"Mejlutkast till Axis",              description:"Professionell mall för intresseanmälan klar.",                                  status:TASK_STATUSES.DONE, completed:true, assignedTo:["Linnea Malmgren","Ali Hassan"], assigned:"Linnea Malmgren", createdAt:daysAgo(23), deadline:dl(-6) }),
    createTask({ id:"l17", title:"Researcha LIA-företag i Malmö",    description:"Lista med 15 potentiella företag upprättad.",                                    status:TASK_STATUSES.DONE, completed:true, assignedTo:["Lukas Karlsson"],             assigned:"Lukas Karlsson",   createdAt:daysAgo(19), deadline:0 }),

    createTask({ id:"l18", title:"PoC-app till H&M Tech",            description:"Prototyp-demo för att visa kompetens (avbruten).",                               status:TASK_STATUSES.CLOSED, completed:true, assignedTo:["Linnea Malmgren"],          assigned:"Linnea Malmgren",  createdAt:daysAgo(29), closedReason:"H&M hade inga LIA-platser kvar denna termin." }),
    createTask({ id:"l19", title:"Söka IKEA:s trainee-program",     description:"Trainee-programmet passade inte LIA-formatet.",                                  status:TASK_STATUSES.CLOSED, completed:true, assignedTo:["Nora Söderlund"],           assigned:"Nora Söderlund",   createdAt:daysAgo(25), closedReason:"Programmet kräver examen, inte LIA." }),
    createTask({ id:"l20", title:"Kontakta Tretton37",                description:"Undersökt möjligheter, fick nekat.",                                           status:TASK_STATUSES.CLOSED, completed:true, assignedTo:[],                           assigned:"Ingen",            createdAt:daysAgo(22), closedReason:"Inget LIA-samarbete med skolan just nu." }),
  ];
}

/** @type {Array<Object>} */
const liaContacts = [
  { id:3001, name:"Sara Holmberg",    role:"HR-ansvarig",           company:"Axis Communications", email:"sara.h@axis.com",      phone:"040-200 01 01", isFavorite:true,  status:"Pågående" },
  { id:3002, name:"Johan Kraft",      role:"Rekryterare",           company:"Telavox",             email:"johan.k@telavox.se",   phone:"040-200 01 02", isFavorite:false, status:"Ej kontaktad" },
  { id:3003, name:"Maria Lindström",  role:"LIA-koordinator",       company:"Sigma Technology",    email:"maria.l@sigmatech.se", phone:"040-200 01 03", isFavorite:true,  status:"Klar" },
  { id:3004, name:"Peter Svensson",   role:"Team Lead Frontend",    company:"Qlik",                email:"peter.s@qlik.com",     phone:"040-200 01 04", isFavorite:false, status:"Ej kontaktad" },
  { id:3005, name:"Anna Berg",        role:"Talent Acquisition",    company:"Ericsson",            email:"anna.b@ericsson.com",  phone:"040-200 01 05", isFavorite:true,  status:"Pågående" },
  { id:3006, name:"Erik Dahlberg",    role:"CTO",                   company:"Pocketlaw",           email:"erik.d@pocketlaw.com", phone:"040-200 01 06", isFavorite:false, status:"Ej kontaktad" },
  { id:3007, name:"Lina Johansson",   role:"Praktikansvarig",       company:"Fortnox",             email:"lina.j@fortnox.se",    phone:"040-200 01 07", isFavorite:false, status:"Ej kontaktad" },
  { id:3008, name:"Ahmad Mansour",    role:"Engineering Manager",   company:"King (Activision)",   email:"ahmad.m@king.com",     phone:"040-200 01 08", isFavorite:true,  status:"Återkom" },
  { id:3009, name:"Camilla Norberg",  role:"UX Lead",               company:"Jayway (Devoteam)",   email:"camilla.n@jayway.com", phone:"040-200 01 09", isFavorite:false, status:"Förlorad" },
  { id:3010, name:"Tobias Ekman",     role:"Handledare",            company:"Malmö Universitet",   email:"tobias.e@mau.se",      phone:"040-200 01 10", isFavorite:false, status:"Klar" },
];

// ═══════════════════════════════════════════════════════════════════
// Seed helpers
// ═══════════════════════════════════════════════════════════════════

/**
 * Seedar kontakter till IndexedDB med case-insensitive dubblettskydd.
 * @param {Array<Object>} contacts - Kontaktlista att importera.
 * @returns {Promise<void>}
 */
async function seedContacts(contacts) {
  try {
    await initContactsDB();
    const existing = await getAllContacts();
    const existingNames = new Set(existing.map(c => c.name.toLowerCase().trim()));
    const newContacts = contacts.filter(c => !existingNames.has(c.name.toLowerCase().trim()));
    if (newContacts.length > 0) await importContacts(newContacts);
  } catch (err) {
    console.warn("Kunde inte seeda kontakter:", err);
  }
}

// ═══════════════════════════════════════════════════════════════════
// Exported API
// ═══════════════════════════════════════════════════════════════════

/**
 * Initierar appens state med defaultdata om lagringen är tom.
 * @returns {void}
 */
export function initSeed() {
  const state = loadState();
  if (!state.people || state.people.length === 0) state.people = techPeople;
  if (!state.tasks || state.tasks.length === 0) state.tasks = createTechTasks();
  saveState(state);
  seedContacts(techContacts);
}

/**
 * Laddar Tech Workspace-demo (20 uppgifter, 10 kontakter).
 * Ersätter befintliga tasks och people.
 * @returns {Promise<void>}
 */
export async function loadDemoWorkspace() {
  const state = loadState();
  state.tasks = createTechTasks();
  state.people = techPeople;
  saveState(state);
  await seedContacts(techContacts);
}

/**
 * Laddar LIA Chase-demo (20 uppgifter, 10 kontakter).
 * Ersätter befintliga tasks och people.
 * @returns {Promise<void>}
 */
export async function loadDemoLIA() {
  const state = loadState();
  state.tasks = createLiaTasks();
  state.people = liaPeople;
  saveState(state);
  await seedContacts(liaContacts);
}





// ═══════════════════════════════════════════════════════════════════
// NYASTE SEED - DEMO från Linear CSV historik
// ═══════════════════════════════════════════════════════════════════


  async function readLocalCsv(path = "/team3.csv")
  {
    const res = await fetch(path);
    if(!res.ok) throw new Error(`Could not load ${path}`);
    const text = await res.text();
    return readCsv(new File([text], "team3.csv", {type: "text/csv"}));
  }
  const normalize = (row, key) =>
    row[key] ?? row[key.toUpperCase()] ?? row[key[0].toUpperCase() + key.slice(1)];
  const normalizeStatuses = (s) =>
  {
    const v = (s ?? "").toString().trim().toLowerCase();
    if(v==="done") return TASK_STATUSES.DONE;
    if(v==="in progress") return TASK_STATUSES.IN_PROGRESS;
    if(v==="todo") return TASK_STATUSES.TODO;
    if(v==="backlog") return TASK_STATUSES.TODO;
    return TASK_STATUSES.TODO;

  }


  export async function initTasksCSV(service, path="/team3.csv")
  {
    if (service.getTasks().length > 0) return;
    const data = await readLocalCsv(path);
    const tasks = data
      .flatMap((row) => {
      const title = (normalize(row, "title") ?? "").toString().trim();
      const id = (normalize(row, "id") ?? "").toString().trim();
      if (!id) return []; 
      if (!title) return []; 
      const statusRaw = normalize(row, "status");
      const assigneeRaw = normalize(row, "assignee");

      return [createTask({
        id,
        title,
        description: (normalize(row, "description") ?? "").toString().trim(),
        status: normalizeStatuses(statusRaw),
        assigned: (assigneeRaw ?? "").toString().trim() || "Ingen",
      })];
    })
    tasks.forEach(t => service.addTask(t));
      
  }