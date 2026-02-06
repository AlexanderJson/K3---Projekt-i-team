import { Btn } from "../comps/createButton.js";


function showScreen(){
    alert("Hello");
}

export const menu = () =>
{
    const div = document.createElement("div");
    const buttons = 
    [
        {text: "Uppgifter",className: "menu-btn", onClick:  showScreen},
        {text: "Schema", className: "menu-btn", onClick: showScreen},
        {text: "Kontakter",className: "menu-btn", onClick: showScreen},
    ];

    buttons.forEach(b => div.append(Btn(b)));

    div.classList.add("menu");
    return div;

}  