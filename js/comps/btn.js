// js/comps/btn.js

export function Btn({text, className, onClick})
{
    const btn = document.createElement("button");
    
    // ÄNDRA HÄR: Från .textContent till .innerHTML
    btn.innerHTML = text; 
    
    btn.className = className;
    btn.addEventListener("click", onClick);
    return btn;
}