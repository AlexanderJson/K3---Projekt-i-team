import { createTask } from "./tasks.js";
import { TASK_STATUSES } from "../status.js";
import { saveState, loadState } from "../storage.js";

const initialTasks = [
  createTask({
    id: "1",
    title: "Leta kontakter",
    completed: false,
    status: TASK_STATUSES.TODO,
    assigned: "Alex"
  }),
  createTask({
    id: "2",
    title: "Ring runt",
    completed: false,
    status: TASK_STATUSES.TODO,
    assigned: "Jotso"
  }),
  createTask({
    id: "3",
    title: "Kontakta företag",
    completed: false,
    status: TASK_STATUSES.IN_PROGRESS,
    assigned: "Alex"
  }),
  createTask({
    id: "4",
    title: "Justera CV",
    completed: true,
    status: TASK_STATUSES.DONE,
    assigned: "Alex"
  })
];

export function initSeed() {
  const state = loadState();

  if (!state || !state.tasks || state.tasks.length === 0) {
    saveState({ tasks: initialTasks });
  }
}