import { Btn } from "../comps/btn.js";

function showScreen() {
  alert("Ej implementerat ännu");
}

// DEV ONLY – reset state
function resetState() {
  const ok = confirm("DEV: Rensa all local state?");
  if (!ok) return;

  localStorage.removeItem("state");
  location.reload();
}

export const menu = () => {
  const div = document.createElement("div");
  div.classList.add("menu");

  const buttons = [
    { text: "Uppgifter", className: "menu-btn", onClick: showScreen },
    { text: "Schema", className: "menu-btn", onClick: showScreen },
    { text: "Kontakter", className: "menu-btn", onClick: showScreen },

    // DEV-knapp (tas bort senare)
    { text: "DEV: Reset state", className: "menu-btn dev", onClick: resetState }
  ];

  buttons.forEach(b => div.append(Btn(b)));

  return div;
};