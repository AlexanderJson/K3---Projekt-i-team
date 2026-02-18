// js/comps/btn.js




export function Btn({text, className, onClick})
{
    const btn = document.createElement("button");
    
    btn.innerHTML = text; 
    
    btn.className = className;
    btn.addEventListener("click", onClick);
    return btn;
}