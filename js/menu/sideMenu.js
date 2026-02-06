import { Btn } from "../comps/createButton.js";


function showScreen(){
    alert("Hello");
}

export const menu = () =>
{
    const div = document.createElement("div");
    const buttons = 
    [
        {text: "Uppgifter",className: "menuBtn", onClick:  showScreen},
        {text: "Schema", className: "menuBtn", onClick: showScreen},
        {text: "Kontakter",className: "menuBtn", onClick: showScreen},
    ];

    buttons.forEach(b => div.append(Btn(b)));


    return div;

}  