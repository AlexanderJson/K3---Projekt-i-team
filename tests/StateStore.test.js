import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { StateStore } from "../js/data/StateStore.js";

describe("StateStore", () => {

  let store;
  let memory;

  const tasks = [
    { id: "1", title: "Leta kontakter" },
    { id: "2", title: "ring lia" }
  ];

  beforeEach(() => {
    memory = {};

    global.localStorage = {
      getItem: jest.fn(key => memory[key] ?? null),
      setItem: jest.fn((key, value) => {
        memory[key] = value;
      }),
      removeItem: jest.fn(key => {
        delete memory[key];
      }),
      clear: jest.fn(() => {
        memory = {};
      })
    };

    store = new StateStore("state");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("load should return empty array if storage is empty", () => {
    const state = store.load();
    expect(state).toEqual([]);
  });

  test("load should return stored state", () => {
    localStorage.setItem("state", JSON.stringify(tasks));

    const state = store.load();

    expect(state.length).toBe(2);
    expect(state[0].title).toBe("Leta kontakter");
  });

  test("save should write data to localStorage", () => {
    store.save(tasks);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "state",
      JSON.stringify(tasks)
    );
  });

  test("clear should remove stored data", () => {
    store.save(tasks);
    store.clear();

    expect(localStorage.removeItem).toHaveBeenCalledWith("state");
  });

  test("load should return empty array if JSON is invalid", () => {
    memory["state"] = "{invalid json";

    const state = store.load();

    expect(state).toEqual([]);
  });

});
