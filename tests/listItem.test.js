import { jest } from '@jest/globals';

let listItem;
let mockActions;

describe("listItem component", () => {
    beforeEach(async () => {
        jest.resetModules();
        jest.clearAllMocks();

        window.confirm = jest.fn().mockReturnValue(true);
        window.prompt = jest.fn().mockReturnValue("Reason");

        mockActions = {
            onNavigate: jest.fn(),
            onEditTask: jest.fn(),
            onMoveTask: jest.fn(),
            onChangeStatus: jest.fn(),
            onDeleteTask: jest.fn()
        };

 
        jest.unstable_mockModule("../js/status.js", () => ({
            TASK_STATUSES: {
                TODO: "Att göra",
                IN_PROGRESS: "Pågår",
                DONE: "Klar",
                CLOSED: "Stängd"
            }
        }));


        const module = await import("../js/card/listItem.js");
        listItem = module.listItem;
    });

    test("Renders a basic task item with correct content", () => {
        const task = { 
            id: 1, 
            title: "Test Task", 
            description: "Detailed description", 
            status: "Att göra", 
            assignedTo: ["Anna Johansson"] 
        };
        const el = listItem(task, mockActions);
        
        expect(el.className).toContain("listItem");
        expect(el.querySelector(".taskTitle").textContent).toBe("Test Task");
        expect(el.querySelector(".taskDescription").textContent).toBe("Detailed description");
        expect(el.querySelector(".statusBadge").textContent).toBe("Att göra");
        
        const avatar = el.querySelector(".assignee-avatar-circle");
        expect(avatar.textContent).toBe("AJ");
    });

    test("Renders default values if fields are missing", () => {
        const task = { id: 2, status: "Pågår" };
        const el = listItem(task, mockActions);
        
        expect(el.querySelector(".taskTitle").textContent).toBe("Utan titel");
        expect(el.querySelector(".taskDescription").textContent).toBe("Ingen beskrivning.");
        expect(el.querySelector(".avatar-empty")).not.toBeNull();
    });

    test("Toggles expansion when clicking the main container", () => {
        const task = { id: 1, status: "Att göra" };
        const el = listItem(task, mockActions);
        
        expect(el.classList.contains("is-expanded")).toBe(false);
        expect(el.getAttribute("aria-expanded")).toBe("false");

        el.click();
        expect(el.classList.contains("is-expanded")).toBe(true);
        expect(el.getAttribute("aria-expanded")).toBe("true");

        el.click();
        expect(el.classList.contains("is-expanded")).toBe(false);
    });

    test("Clicking avatar triggers edit action and stops propagation", () => {
        const task = { id: 1, status: "Att göra", assignedTo: ["Anna"] };
        const el = listItem(task, mockActions);
        const avatarContainer = el.querySelector(".assignee-avatars-list");
        
        avatarContainer.click();
        
        expect(mockActions.onEditTask).toHaveBeenCalledWith(task);
         expect(el.classList.contains("is-expanded")).toBe(false);
    });

    test("Triggers task movement via buttons", () => {
        const task = { id: "T1", status: "Att göra" };
        const el = listItem(task, mockActions);
        
         const upBtn = el.querySelector('button[aria-label="Flytta upp"]');
        upBtn.click();
        
        expect(mockActions.onMoveTask).toHaveBeenCalledWith("T1", "up");
    });

    test("Triggers status change when moving right", () => {
        const task = { id: "T1", status: "Att göra" };
        const el = listItem(task, mockActions);
        
        const rightBtn = el.querySelector('button[aria-label="Flytta höger"]');
        rightBtn.click();
        
         expect(mockActions.onChangeStatus).toHaveBeenCalledWith("T1", "Pågår");
    });

    test("Deletes task via the delete button", () => {
        const task = { id: 5, status: "Stängd" };
        const el = listItem(task, mockActions);
        const deleteBtn = el.querySelector('button[aria-label="Ta bort"]');

        deleteBtn.click();
        expect(mockActions.onDeleteTask).toHaveBeenCalledWith(task);
    });

    test("Navigates to linked contact", () => {
        const task = { id: 1, status: "Att göra", contactId: "C1", contactName: "Bob" };
        const el = listItem(task, mockActions);
        const link = el.querySelector(".task-contact-explicit");
        
        link.click();
        expect(mockActions.onNavigate).toHaveBeenCalledWith("contacts", { highlightId: "C1" });
    });

    test("Highlights overdue deadline if date is in the past", () => {
        const pastDate = "2020-01-01";
        const task = { id: 1, status: "Att göra", deadline: pastDate };
        const el = listItem(task, mockActions);
        
        const overdue = el.querySelector(".deadline-overdue");
        expect(overdue).not.toBeNull();
    });
});