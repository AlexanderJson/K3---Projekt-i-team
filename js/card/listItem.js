
import { TASK_STATUSES } from "../status.js";
import { cardFooter } from "./cardFooter.js";
import { cardHeader } from "./taskHeader.js";
import { cardBody } from "./cardBody.js";

export const listItem = (task, actions) => {


  const isClosed = task.status === TASK_STATUSES.CLOSED;
  const isDone = task.status === TASK_STATUSES.DONE;
  const isTodo = task.status === TASK_STATUSES.TODO;
  const flags = {isClosed, isDone, isTodo};

  const div = document.createElement("div");

  div.className = `listItem ${isClosed ? "is-closed" : ""} is-expandable`;
  div.setAttribute("role", "button");
  div.setAttribute("tabindex", "0");
  div.setAttribute("aria-expanded", "false");
  
  const toggleExpand = () => {
    const expanded = div.classList.toggle('is-expanded');
    div.setAttribute("aria-expanded", String(expanded));
  };

  div.onclick = (e) => {
    if (
      e.target.closest('.taskControls') || 
      e.target.closest('.task-contact-explicit') || 
      e.target.closest('.assignee-avatars-list')
    ) return;


    toggleExpand();
  };

  div.onkeydown = (e) => {
    if ((e.key === "Enter" || e.key === " ")) {
      if (e.target === div) { 
          e.preventDefault();
          toggleExpand();
      }
    }
  };

  

  div.append(
    cardHeader(task,flags),
    cardBody(task,{onNavigate: actions.onNavigate}),
    cardFooter(task,flags,actions)
  );
  
  return div;
};