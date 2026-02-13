import { notify } from "./observer.js";

const STORAGE_KEY = "state"; 

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw
  ? JSON.parse(raw)
  : {
      tasks: [],
      people: ["Ingen", "Person 1", "Person 2"]
    };
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  // Viktigt: notify() gör att appen ritar om vyn direkt vid varje ändring
  notify(); 
}

export function addState(task) {
  const state = loadState();
  if (!Array.isArray(state.tasks)) {
    state.tasks = [];
  }
  state.tasks.push(task);
  saveState(state);
}

export function removeById(id) {
  const state = loadState();
  // String() säkerställer att id-matchningen fungerar oavsett om det är siffror eller text
  state.tasks = state.tasks.filter(task => String(task.id) !== String(id));
  saveState(state);
}

export function getTasks() {
  const state = loadState();
  return Array.isArray(state.tasks) ? state.tasks : [];
}