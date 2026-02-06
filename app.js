
import { menu } from "./js/menu/sideMenu.js";

const app = document.getElementById("app");
app.classList.add("app");

const sideMenuDiv = document.createElement("div");
sideMenuDiv.append(menu());
sideMenuDiv.classList.add("left")


const mainContent = document.createElement("div");
mainContent.classList.add("content");








app.append(menu())

