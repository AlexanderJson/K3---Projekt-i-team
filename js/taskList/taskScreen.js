import { taskList } from "./taskList.js"


export const taskScreen = (tasks) => 
{
    const screen = document.createDocumentFragment();

    const backlogList = tasks.filter(t => t.status == "backlog");
    const progressList = tasks.filter(t => t.status == "progress");
    const doneList = tasks.filter(t => t.status == "done");

    const backlog = taskList("Backlog", backlogList);
    const progress = taskList("In Progress", progressList);
    const done = taskList("Done", doneList);

    screen.append(backlog,progress,done)
    return screen;
}