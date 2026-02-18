import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { taskService } from "../js/service/taskService.js";


describe("taskService", () => 
    {
        let service;
        let store;


    const tasks = [
    { id: "1", title: "Task 1", status: "TODO", assigned: "A" },
    { id: "2", title: "Task 2", status: "DONE", assigned: "B" }
    ];


    beforeEach(() => 
    {
        store = 
        {
            load: jest.fn(),
            save: jest.fn()
        };
        service = new taskService(store);
    });

    test("addTask should add task to memory and save to storage", () => 
        {
          service.addTask(tasks);
          expect(service.getTasks().length).toBe(1);
          expect(store.save).toHaveBeenCalledWith([tasks]);
        })

    test("init should load tasks from store", () => 
        {
            store.load.mockReturnValue(tasks);
            service.init();
            expect(service.getTasks().length).toBe(2);
            expect(service.getTaskById("2").title).toBe("Task 2")
        })

    test("getTaskById should return matching task to id", () => 
        {
            store.load.mockReturnValue(tasks);
            service.init();
            const result = service.getTaskById("2");
            expect(result.title).toBe("Task 2");

        });
    }

    
)



/*

    test("init should load tasks from store", () => 
        {

        })

    test("getTaskById should return matching task to id", () => 
        {

        })

    test("byStatus should return matching task to status", () => 
        {

        })

    test("byAssigned should return matching task to assigned", () => 
        {

        })


    


*/

