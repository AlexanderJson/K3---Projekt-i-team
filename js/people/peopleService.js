import { loadState, saveState } from "../storage.js";
import { notify } from "../observer.js";

const PEOPLE_KEY = "people";
const DEFAULT_PEOPLE = ["Person 1", "Person 2"];

export function getPeople() {
  const state = loadState();
  return state?.[PEOPLE_KEY] ?? DEFAULT_PEOPLE;
}

export function addPerson(name) {
  if (!name) return;

  const state = loadState();
  const people = state?.[PEOPLE_KEY] ?? DEFAULT_PEOPLE;

  if (people.includes(name)) return;

  state[PEOPLE_KEY] = [...people, name];
  saveState(state);
  notify();
}

export function renamePerson(oldName, newName) {
  if (!newName) return;

  const state = loadState();
  if (!state?.[PEOPLE_KEY]) return;

  state[PEOPLE_KEY] = state[PEOPLE_KEY].map(person =>
    person === oldName ? newName : person
  );

  if (state.tasks) {
    state.tasks = state.tasks.map(task =>
      task.assigned === oldName
        ? { ...task, assigned: newName }
        : task
    );
  }

  saveState(state);
  notify();
}