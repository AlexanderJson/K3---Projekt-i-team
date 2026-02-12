import { notify } from "./observer.js";

const STORAGE_KEY = "state"; 


// TODO gör om sen
const TASK_KEY = "tasks";
const USER_KEY = "people";

// todo sätt argument
export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY); 
  return raw
  ? JSON.parse(raw)
  : {
      tasks: [],
      people: ["Ingen", "Person 1", "Person 2"] // TODO: KOLLA 
    };
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addState(value) {
  const state = loadState();
  if (!Array.isArray(state.tasks)) {
    state.tasks = [];
  }

  state.tasks.push(value);
  saveState(state);
  notify();
}

/**
 * Raderar en uppgift permanent från localStorage
 */
export function removeById(id) {
  const state = loadState();
  
  // Filtrera bort uppgiften med det specifika ID:t
  state.tasks = state.tasks.filter(task => task.id !== id);
  
  saveState(state);
  notify();
}

export function getTasks() {
  const state = loadState();
  return state.tasks || [];
}