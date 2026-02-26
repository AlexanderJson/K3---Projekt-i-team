import { getTheme } from "../theme.js";
import {  toggleTheme } from "../theme.js";

export const toggleThemeBtn = () => 
{
    const button = document.createElement('button');
    button.className = "theme-btn-outer";
    const icon = document.createElement('i');
    icon.classList.add("material-symbols-rounded");

    const swapThemeIcon = () => {
        const current = getTheme();
        if(current === 'light')
        {
            icon.textContent = "sunny";
        }else {
            icon.textContent = "dark_mode";
        }
    };


    swapThemeIcon();

    button.addEventListener('click', () => 
    {
        toggleTheme();
        swapThemeIcon();
    })

    button.append(icon);
    return button;
}