// js/comps/btn.js

/**
 * @file btn.js
 * @description Återanvändbar knappkomponent för användargränssnittet.
 * Säkerställer konsekvent design och inbyggt tillgänglighetsstöd via ARIA.
 */

/**
 * @typedef {Object} BtnProps
 * @property {string} text - Texten eller HTML-innehållet i knappen.
 * @property {string} className - CSS-klasser för styling.
 * @property {function} onClick - Callback-funktion för klickhändelsen.
 * @property {string} [ariaLabel] - Valfri aria-label för skärmläsare (viktigt för ikonknappar).
 * @property {string} [title] - Valfri tooltip-text.
 * @property {string} [id] - Valfritt ID för elementet.
 * @property {string} [type='button'] - Typ av knapp (submit, button, etc.).
 */

/**
 * Skapar ett standardiserat knapp-element.
 * @param {BtnProps} props - Egenskaper för knappen.
 * @returns {HTMLButtonElement} Det skapade knapp-elementet.
 */
export function Btn({ text, className, onClick, ariaLabel, title, id, type = "button" }) {
    const btn = document.createElement("button");
    
    // Använd innerHTML temporärt för ikonstöd m.m.
    btn.innerHTML = text; 
    
    btn.className = className;
    btn.type = type;

    if (id) btn.id = id;
    if (ariaLabel) btn.setAttribute("aria-label", ariaLabel);
    if (title) btn.title = title;

    btn.addEventListener("click", onClick);
    return btn;
}