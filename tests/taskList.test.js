import { jest } from '@jest/globals';
import { waitFor, fireEvent } from '@testing-library/dom';

let taskList;

describe("taskList component", () => {
    beforeEach(async () => {
        jest.resetModules();
        jest.clearAllMocks();
        localStorage.clear();

        const mockListItem = {
            listItem: jest.fn(task => {
                const div = document.createElement("div");
                div.className = "mock-list-item";
                div.textContent = task.title;
                return div;
            })
        };

        jest.unstable_mockModule("../js/taskList/listItem.js", () => mockListItem);

        const module = await import("../js/taskList/taskList.js");
        taskList = module.taskList;
    });

    test("Renders a column with tasks", () => {
        const tasks = [
            { id: 1, title: "Task 1" },
            { id: 2, title: "Task 2" }
        ];

        const element = taskList("Att göra", tasks);
        expect(element.className).toContain("task-column");
        expect(element.getAttribute("data-status")).toBe("Att göra");

        // Header
        const header = element.querySelector(".taskHeader");
        expect(header.textContent).toContain("ATT GÖRA");
        expect(header.textContent).toContain("2"); // count

        // Items
        const items = element.querySelectorAll(".mock-list-item");
        expect(items.length).toBe(2);
        expect(items[0].textContent).toBe("Task 1");
    });

    test("Renders empty state", () => {
        const element = taskList("Pågår", []);
        const emptyState = element.querySelector(".emptyState");
        expect(emptyState).not.toBeNull();
        expect(emptyState.textContent).toBe("Inga uppgifter");
    });

    test("Renders Stängd column properly", () => {
        const element = taskList("Stängd", [{ id: 3, title: "Done" }]);
        expect(element.className).toContain("closed-tasks-archive");

        const description = element.querySelector(".archive-description");
        expect(description).not.toBeNull();
        expect(description.textContent).toContain("Här sparas uppgifter");
    });

    test("Toggles column expand/collapse", () => {
        // Initial state is expanded (0 tasks, but we don't care, default is expanded unless "collapsed" stored)
        const element = taskList("Att göra", [{ id: 1, title: "T1" }]);
        const header = element.querySelector(".taskHeader");
        const container = element.querySelector(".task-list-items");

        expect(element.classList.contains("collapsed")).toBe(false);
        expect(container.style.display).toBe("flex");

        // Click to collapse
        header.click();
        expect(element.classList.contains("collapsed")).toBe(true);
        expect(container.style.display).toBe("none");
        expect(localStorage.getItem("column_state_Att göra")).toBe("collapsed");

        // Click to expand
        header.click();
        expect(element.classList.contains("collapsed")).toBe(false);
        expect(container.style.display).toBe("flex");
        expect(localStorage.getItem("column_state_Att göra")).toBe("expanded");
    });

    test("Auto-expands when going from 0 to 1 task", () => {
        localStorage.setItem("column_count_Att göra", "0");
        localStorage.setItem("column_state_Att göra", "collapsed");

        const element = taskList("Att göra", [{ id: 1, title: "New Task" }]);
        expect(element.classList.contains("collapsed")).toBe(false);
        expect(localStorage.getItem("column_state_Att göra")).toBe("expanded");
        expect(localStorage.getItem("column_count_Att göra")).toBe("1");
    });
});
