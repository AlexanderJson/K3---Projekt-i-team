

// WIP - har ej använt ännu 


export function Btn({text, className, onClick})
{
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = className;
    btn.addEventListener("click", onClick);
    return btn;
}