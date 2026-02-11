import { taskList } from "./taskList.js";
import { TASK_STATUSES } from "../status.js";
import { addTaskDialog } from "../comps/dialog.js";

export const taskScreen = (tasks) => {
  const board = document.createElement("div");
  board.classList.add("taskBoard");

  const todo = tasks.filter(t => t.status === TASK_STATUSES.TODO);
  const inProgress = tasks.filter(t => t.status === TASK_STATUSES.IN_PROGRESS);
  const done = tasks.filter(t => t.status === TASK_STATUSES.DONE);
  const taskDialog = addTaskDialog();
  board.append(
    taskList("Att göra", todo),
    taskList("Pågår", inProgress),
    taskList("Klar", done),
    taskDialog
  );

  return board;
};
