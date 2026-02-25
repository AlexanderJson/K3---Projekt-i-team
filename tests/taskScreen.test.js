import { jest } from '@jest/globals';
import { waitFor, fireEvent } from '@testing-library/dom';

let taskScreen;
let loadState;
let mockTaskService; 

describe("taskScreen component", () => {
    beforeEach(async () => {
        jest.resetModules();
        jest.clearAllMocks();
        localStorage.clear();
        mockTaskService = {
        getTasks: jest.fn(() => [
            { id: 1, title: "T1", status: "Att göra", assigned: "Anna", assignedTo: ["Anna"] },
            { id: 2, title: "T2", status: "Pågår", assigned: "Björn", assignedTo: ["Björn"] },
            { id: 3, title: "T3", status: "Klar", assigned: "Ingen", assignedTo: ["Ingen"] },
            { id: 4, title: "T4", status: "Stängd", assigned: "Anna", assignedTo: ["Anna"] },
            { id: 5, title: "T5", status: "Att göra", assigned: "Björn" }
        ]),
        _compareRank: jest.fn(() => 0),
        moveTask: jest.fn(),
        changeStatus: jest.fn(),
        deleteTask: jest.fn()
        };
        const mockStorage = {
            loadState: jest.fn(),
            saveState: jest.fn()
        };

        const mockTaskList = {
            taskList: jest.fn((status, tasks) => {
                const div = document.createElement("div");
                div.className = "mock-task-list";
                div.setAttribute("data-status", status);
                div.textContent = `${status} - ${tasks.length} tasks`;
                return div;
            })
        };

        jest.unstable_mockModule("../js/storage.js", () => mockStorage);
        jest.unstable_mockModule("../js/taskList/taskList.js", () => mockTaskList);

         const mockStatus = {
            TASK_STATUSES: {
                TODO: "Att göra",
                IN_PROGRESS: "Pågår",
                DONE: "Klar",
                CLOSED: "Stängd"
            }
        };
        jest.unstable_mockModule("../js/status.js", () => mockStatus);


        const module = await import("../js/taskList/taskScreen.js");
        taskScreen = module.taskScreen;
        loadState = mockStorage.loadState;
        

         loadState.mockReturnValue({
            people: ["Ingen", "Anna", "Björn"],
            tasks: [
                { id: 1, title: "T1", status: "Att göra", assigned: "Anna", assignedTo: ["Anna"] },
                { id: 2, title: "T2", status: "Pågår", assigned: "Björn", assignedTo: ["Björn"] },
                { id: 3, title: "T3", status: "Klar", assigned: "Ingen", assignedTo: ["Ingen"] },
                { id: 4, title: "T4", status: "Stängd", assigned: "Anna", assignedTo: ["Anna"] },
                 { id: 5, title: "T5", status: "Att göra", assigned: "Björn" }
            ]
        });
    });

    test("Renders Team view default", () => {
        const screen = taskScreen({
            taskService: mockTaskService,   
            navigate: jest.fn()  });
        expect(screen.tagName).toBe("MAIN");

        const filterSelect = screen.querySelector(".taskFilterSelect");
        expect(filterSelect.value).toBe("Team");

        const lists = screen.querySelectorAll(".mock-task-list");
        expect(lists.length).toBe(3); // TODO, IN_PROGRESS, DONE

         expect(lists[0].textContent).toContain("Att göra - 2 tasks");  
        expect(lists[1].textContent).toContain("Pågår - 1 tasks");  
        expect(lists[2].textContent).toContain("Klar - 1 tasks");  
    });

    test("Filters by specific person", () => {
        localStorage.setItem("taskViewFilter", "Anna");
        const screen = taskScreen({
            taskService: mockTaskService,   
            navigate: jest.fn()  });
        const filterSelect = screen.querySelector(".taskFilterSelect");
        expect(filterSelect.value).toBe("Anna");

        const lists = screen.querySelectorAll(".mock-task-list");
         expect(lists[0].textContent).toContain("Att göra - 1 tasks"); // T1
        expect(lists[1].textContent).toContain("Pågår - 0 tasks");
        expect(lists[2].textContent).toContain("Klar - 0 tasks");
    });

    test("Filters by old format person", () => {
        localStorage.setItem("taskViewFilter", "Björn");
        const screen = taskScreen({
            taskService: mockTaskService,   
            navigate: jest.fn()  });
        const lists = screen.querySelectorAll(".mock-task-list");
         expect(lists[0].textContent).toContain("Att göra - 1 tasks"); // T5
        expect(lists[1].textContent).toContain("Pågår - 1 tasks"); // T2
    });

    test("Filters by Ingen (Unassigned)", () => {
        localStorage.setItem("taskViewFilter", "Ingen");
        const screen = taskScreen({
            taskService: mockTaskService,   
            navigate: jest.fn()  });
        const lists = screen.querySelectorAll(".mock-task-list");
         expect(lists[2].textContent).toContain("Klar - 1 tasks"); // T3
    });

    test("Renders Archive view", () => {
        localStorage.setItem("taskViewFilter", "Arkiv");
        const screen = taskScreen({
            taskService: mockTaskService,   
            navigate: jest.fn()  });
        const lists = screen.querySelectorAll(".mock-task-list");
        expect(lists.length).toBe(1);  
        expect(lists[0].textContent).toContain("Stängd - 1 tasks"); // T4
    });

    test("Updates view when filter changes", () => {
        const screen = taskScreen({
            taskService: mockTaskService,   
            navigate: jest.fn()  });
        const filterSelect = screen.querySelector(".taskFilterSelect");

        filterSelect.value = "Anna";
        filterSelect.dispatchEvent(new Event("change"));

        expect(localStorage.getItem("taskViewFilter")).toBe("Anna");

        const lists = screen.querySelectorAll(".mock-task-list");
        expect(lists[0].textContent).toContain("Att göra - 1 tasks");
    });
});
