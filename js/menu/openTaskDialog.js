import { addTaskDialog } from "../comps/dialog.js";


/**
 * (Flyttade till egen fil och satte på menyn istället för att göra den global /Alexander)
 * Händelselyssnare för interaktioner.
 * Hanterar bland annat öppning av dialogrutan för att lägga till nya uppgifter (FAB).
 * * @param {MouseEvent} e - Klickhändelsen.
 */

export const openTaskDialog = ({ taskService, taskToEdit = null }) => 
{
    const existingModal = document.querySelector(".modalOverlay");
    if(existingModal) existingModal.remove();

    /** * @type {HTMLDialogElement|HTMLElement} - Skapar en ny dialog-instans.
    * För optimal tillgänglighet bör addTaskDialog returnera ett <dialog>-element.
    */
    const dialog = addTaskDialog(taskService, taskToEdit);
    // 3. Lägg till den i bodyn så den hamnar överst
    document.body.appendChild(dialog);
    // 4. Säkerställ att den inte är dold (om din dialog-kod använder hidden)
    dialog.removeAttribute("hidden");
    /** * Om dialog-elementet stöds av webbläsaren och är av typen HTMLDialogElement,
     * bör showModal() användas för att hantera fokus och skärmläsare automatiskt.
     */
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    }
}








