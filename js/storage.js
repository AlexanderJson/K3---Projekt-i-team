const STORAGE_KEY = "state";

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw
  ? JSON.parse(raw)
  : {
      tasks: [],
      people: ["Person 1", "Person 2"]
    };
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}