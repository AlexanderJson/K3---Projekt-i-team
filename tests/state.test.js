

import { getTasks, loadState,addState, removeById, saveState } from "../js/storage.js";
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';


describe("state management", () => 

  {

    beforeEach(() => 
    {
      let store = {};
      global.localStorage =
      {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => 
        {
          store[key] = value;
        }),
        clear: jest.fn(() => 
        {
          store = {};
        })
      };
      jest.unstable_mockModule("../js/observer.js", () => ({
        notify: jest.fn()
    }));

    });

    afterEach(() =>  {jest.clearAllMocks();});

    test("loadstate should return default state if empty", () => 
    {
      const state = loadState();
      expect(state.tasks).toEqual([]);
      expect(state.people).toEqual(["Ingen", "Person 1", "Person 2"]);
    });


    test("loadstate should return state", () => 
    {
      localStorage.setItem("state", JSON.stringify({ tasks: [{ id: 1 }], people: [] })
    );
      const state = loadState();
      expect(state.tasks.length).toBe(1);
    
    });

    test("should add data in localstorage", () =>
    {
        const state = { tasks: [{ id: 1 }], people: [] };
        saveState(state);
        expect(localStorage.setItem).toHaveBeenCalled();
    });
    


    test("should add task to localstorage", () =>
    {
        addState({ id: 1, title: "Test" });
        const tasks = getTasks();
        expect(tasks.length).toBe(1);
        expect(tasks[0].title).toBe("Test");
    });


    test("should add remove task by id", () =>
    {
        addState({ id: 1 });
        addState({ id: 2 });
        removeById(1);
        const tasks = getTasks();
        expect(tasks.length).toBe(1);
        expect(tasks[0].id).toBe(2);
    });

  }

)