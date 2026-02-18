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

        })

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


    

    }
)