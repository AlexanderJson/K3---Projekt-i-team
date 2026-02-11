import { notify } from "./observer.js";

const STORAGE_KEY = "state"; //TODO lagra i ENV 

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


export function addState(value)
{

  const state = loadState();
  if (!Array.isArray(state.tasks)) {
    state.tasks = [];
  }

  state.tasks.push(value);
  saveState(state);
  notify();
}


//todo fixa med id osv..!
export function removeById(id) 
{
  const state = loadState();
  state.tasks = state.tasks.filter(task => task.id !== id);
  saveState(state);
  notify();
}


export function getTasks(key)
{
  const raw = localStorage.getItem(key);
  console.log("Tolkat objekt:", raw);
  const data =  raw ? JSON.parse(raw) : { tasks: []};
  console.log(data);
}