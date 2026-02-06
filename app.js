
import { menu } from "./js/menu/sideMenu.js";
import { taskScreen } from "./js/taskList/taskScreen.js";
import { tasks } from "./js/taskList/seed.js";
const app = document.getElementById("app");
app.classList.add("app");

const sideMenuDiv = document.createElement("div");
sideMenuDiv.append(menu());
sideMenuDiv.classList.add("left")


const mainContent = document.createElement("div");
mainContent.classList.add("center");
mainContent.append(taskScreen(tasks))







app.append(sideMenuDiv, mainContent)

