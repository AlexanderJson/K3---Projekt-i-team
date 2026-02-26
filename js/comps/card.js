// WIP - har ej använt ännu 

export const card = ({title, text, completed}) =>
{
    const div = document.createElement("div");
    const cardLeft = document.createElement("div");
    div.classList.add("card");
    cardLeft.classList.add("card-left");
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    const titleText = document.createElement("span");
    titleText.textContent = title;

    const desc = document.createElement("span");
    desc.textContent = text;

    checkbox.checked = completed;

    cardLeft.append(titleText,desc);
    div.append(cardLeft, checkbox)
    return div;
}