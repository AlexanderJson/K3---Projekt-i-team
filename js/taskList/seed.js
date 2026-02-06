import { createTask } from "./tasks.js";
import { TASK_STATUSES } from "../status.js";

export const tasks = [

  createTask({
    title: "Leta kontakter",
    completed: false,
    status: TASK_STATUSES.TODO,
    assigned: "Alex"
  }),

  createTask({
    title: "Ring runt",
    completed: false,
    status: TASK_STATUSES.TODO,
    assigned: "Jotso"
  }),

  createTask({
    title: "Sammanställ lista",
    completed: false,
    status: TASK_STATUSES.TODO,
    assigned: "Alex"
  }),

  createTask({
    title: "Förbered pitch",
    completed: false,
    status: TASK_STATUSES.TODO,
    assigned: "Hussein"
  }),

  createTask({
    title: "Skapa mall för mail",
    completed: false,
    status: TASK_STATUSES.TODO,
    assigned: "Jotso"
  }),

  createTask({
    title: "Kontakta företag",
    completed: false,
    status: TASK_STATUSES.IN_PROGRESS,
    assigned: "Alex"
  }),

  createTask({
    title: "Följa upp svar",
    completed: false,
    status: TASK_STATUSES.IN_PROGRESS,
    assigned: "Jotso"
  }),

  createTask({
    title: "Boka möten",
    completed: false,
    status: TASK_STATUSES.IN_PROGRESS,
    assigned: "Hussein"
  }),

  createTask({
    title: "Uppdatera LinkedIn",
    completed: false,
    status: TASK_STATUSES.IN_PROGRESS,
    assigned: "Alex"
  }),

  createTask({
    title: "Samla feedback",
    completed: false,
    status: TASK_STATUSES.IN_PROGRESS,
    assigned: "Jotso"
  }),

  createTask({
    title: "Justera CV",
    completed: true,
    status: TASK_STATUSES.DONE,
    assigned: "Alex"
  }),

  createTask({
    title: "Skapa nytt CV",
    completed: true,
    status: TASK_STATUSES.DONE,
    assigned: "Hussein"
  }),

  createTask({
    title: "Ta ny profilbild",
    completed: true,
    status: TASK_STATUSES.DONE,
    assigned: "Alex"
  }),

  createTask({
    title: "Publicera inlägg",
    completed: true,
    status: TASK_STATUSES.DONE,
    assigned: "Jotso"
  }),

  createTask({
    title: "Skicka ansökan",
    completed: true,
    status: TASK_STATUSES.DONE,
    assigned: "Hussein"
  }),

  createTask({
    title: "Avsluta gammal kontakt",
    completed: true,
    status: TASK_STATUSES.CLOSED,
    assigned: "Alex"
  }),

  createTask({
    title: "Stäng ärende",
    completed: true,
    status: TASK_STATUSES.CLOSED,
    assigned: "Jotso"
  }),

  createTask({
    title: "Arkivera material",
    completed: true,
    status: TASK_STATUSES.CLOSED,
    assigned: "Hussein"
  }),

  createTask({
    title: "Sammanfatta resultat",
    completed: true,
    status: TASK_STATUSES.CLOSED,
    assigned: "Alex"
  }),

  createTask({
    title: "Rensa backlog",
    completed: true,
    status: TASK_STATUSES.CLOSED,
    assigned: "Jotso"
  })

];