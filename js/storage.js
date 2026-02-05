export function loadState() {
  return JSON.parse(localStorage.getItem("state"));
}

export function saveState(state) {
  localStorage.setItem("state", JSON.stringify(state));
}
