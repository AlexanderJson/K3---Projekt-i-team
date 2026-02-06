import { taskList } from "./taskList.js";
import { TASK_STATUSES } from "../status.js";

export const taskScreen = (tasks) => {
  const fragment = document.createDocumentFragment();

  const todo = tasks.filter(t => t.status === TASK_STATUSES.TODO);
  const inProgress = tasks.filter(t => t.status === TASK_STATUSES.IN_PROGRESS);
  const done = tasks.filter(t => t.status === TASK_STATUSES.DONE);

  fragment.append(
    taskList("Att göra", todo),
    taskList("Pågår", inProgress),
    taskList("Klar", done)
  );

  return fragment;
};
