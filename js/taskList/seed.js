import { createTask } from "./tasks.js";
import { TASK_STATUSES } from "../status.js";
import { saveState, loadState } from "../storage.js";

const initialTasks = [
  createTask({
    id: "1",
    title: "Leta kontakter",
    completed: false,
    status: TASK_STATUSES.TODO,
    assigned: "Person 1"
  }),
  createTask({
    id: "2",
    title: "Ring runt",
    completed: false,
    status: TASK_STATUSES.TODO,
    assigned: "Person 2"
  }),
  createTask({
    id: "3",
    title: "Kontakta företag",
    completed: false,
    status: TASK_STATUSES.IN_PROGRESS,
    assigned: "Person 1"
  }),
  createTask({
    id: "4",
    title: "Justera CV",
    completed: true,
    status: TASK_STATUSES.DONE,
    assigned: "Person 1"
  })
];

const defaultPeople = ["Person 1", "Person 2"];

export function initSeed() {
  const state = loadState();

  // Säkerställ people (skrivs aldrig över)
  if (!state.people) {
    state.people = defaultPeople;
  }

  // Sätt initiala tasks endast om tomt
  if (!state.tasks || state.tasks.length === 0) {
    state.tasks = initialTasks;
  }

  saveState(state);
}