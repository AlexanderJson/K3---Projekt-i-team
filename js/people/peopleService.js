import { loadState, saveState } from "../storage.js";
import { notify } from "../observer.js";

const PEOPLE_KEY = "people";
// Vi ser till att "Ingen" alltid är ett alternativ som systemet förstår
const DEFAULT_PEOPLE = ["Ingen", "Person 1", "Person 2"];

export function getPeople() {
  const state = loadState();
  let people = state?.[PEOPLE_KEY] ?? DEFAULT_PEOPLE;
  
  // Säkerställ att "Ingen" alltid finns med i listan för dropdowns
  if (!people.includes("Ingen")) {
    people = ["Ingen", ...people];
  }
  return people;
}

export function addPerson(name) {
  if (!name || name === "Ingen") return;

  const state = loadState();
  const people = state?.[PEOPLE_KEY] ?? ["Person 1", "Person 2"];

  if (people.includes(name)) return;

  state[PEOPLE_KEY] = [...people, name];
  saveState(state);
  notify();
}

export function renamePerson(oldName, newName) {
  if (!newName || oldName === "Ingen") return;

  const state = loadState();
  if (!state?.[PEOPLE_KEY]) return;

  state[PEOPLE_KEY] = state[PEOPLE_KEY].map(person =>
    person === oldName ? newName : person
  );

  if (state.tasks) {
    state.tasks = state.tasks.map(task =>
      task.assigned === oldName ? { ...task, assigned: newName } : task
    );
  }

  saveState(state);
  notify();
}