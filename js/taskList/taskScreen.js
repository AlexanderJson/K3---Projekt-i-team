import { taskList } from "./taskList.js";
import { TASK_STATUSES } from "../status.js";

export const taskScreen = (tasks) => 
{
    const screen = document.createDocumentFragment();

    const backlogList = tasks.filter(
        t => t.status === TASK_STATUSES.TODO
    );

    const progressList = tasks.filter(
        t => t.status === TASK_STATUSES.IN_PROGRESS
    );

    const doneList = tasks.filter(
        t => t.status === TASK_STATUSES.DONE
    );

    const backlog = taskList("Att göra", backlogList);
    const progress = taskList("Pågår", progressList);
    const done = taskList("Klart", doneList);

    screen.append(backlog, progress, done);
    return screen;
};
