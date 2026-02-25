import { jest } from '@jest/globals';
import { waitFor, fireEvent } from '@testing-library/dom';

let listItem;
let updateTaskStatus, removeById, loadState, saveState, addTaskDialog, setView;
let TASK_STATUSES;

describe("listItem component", () => {
    let mockWindowDispatchEvent;

    beforeEach(async () => {
        jest.resetModules();
        jest.clearAllMocks();

        mockWindowDispatchEvent = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => { });
        window.confirm = jest.fn().mockReturnValue(true);
        window.prompt = jest.fn().mockReturnValue("Reason");

        TASK_STATUSES = {
            TODO: "Att göra",
            IN_PROGRESS: "Pågår",
            DONE: "Klar",
            CLOSED: "Stängd"
        };

        const mockUpdateTaskStatus = { updateTaskStatus: jest.fn() };
        const mockStorage = {
            removeById: jest.fn(),
            loadState: jest.fn().mockReturnValue({
                tasks: [
                    { id: 1, title: "T1", status: "Att göra" },
                    { id: 2, title: "T2", status: "Att göra" }
                ]
            }),
            saveState: jest.fn()
        };
        const mockDialog = {
            addTaskDialog: jest.fn(),
            showConfirmDialog: jest.fn().mockResolvedValue(true),
            showPromptDialog: jest.fn().mockResolvedValue("Reason")
        };
        const mockView = { setView: jest.fn() };
        const mockStatus = { TASK_STATUSES };

        jest.unstable_mockModule("../js/taskList/updateTaskStatus.js", () => mockUpdateTaskStatus);
        jest.unstable_mockModule("../js/storage.js", () => mockStorage);
        jest.unstable_mockModule("../js/comps/dialog.js", () => mockDialog);
        jest.unstable_mockModule("../js/views/viewController.js", () => mockView);
        jest.unstable_mockModule("../js/status.js", () => mockStatus);

        const module = await import("../js/taskList/listItem.js");
        listItem = module.listItem;

        updateTaskStatus = mockUpdateTaskStatus.updateTaskStatus;
        removeById = mockStorage.removeById;
        loadState = mockStorage.loadState;
        saveState = mockStorage.saveState;
        addTaskDialog = mockDialog.addTaskDialog;
        setView = mockView.setView;
    });

    afterEach(() => {
        mockWindowDispatchEvent.mockRestore();
    });

    test("Renders a basic task item", () => {
        const task = { id: 1, title: "Test Task", description: "Desc", status: "Att göra", assignedTo: ["Anna"] };
        const el = listItem(task);

        expect(el.className).toContain("listItem");
        expect(el.querySelector(".taskTitle").textContent).toBe("Test Task");
        expect(el.querySelector(".taskDescription").textContent).toBe("Desc");
        expect(el.querySelector(".statusBadge").textContent).toBe("Att göra");

        // Assigned avatars
        const avatar = el.querySelector(".assignee-avatar-circle");
        expect(avatar.textContent).toBe("A"); // Initials for Anna
    });

    test("Renders default values if fields missing", () => {
        const task = { id: 2, status: "Pågår" };
        const el = listItem(task);

        expect(el.querySelector(".taskTitle").textContent).toBe("Utan titel");
        expect(el.querySelector(".taskDescription").textContent).toBe("Ingen beskrivning.");
        expect(el.querySelector(".avatar-empty").textContent).toContain("Ledig");
    });



    test("Opens edit dialog when clicking avatar", () => {
        const task = { id: 1, status: "Att göra", assignedTo: ["Anna"] };
        const el = listItem(task);

        const avatarContainer = el.querySelector(".assignee-avatars-list");
        avatarContainer.click();

        expect(addTaskDialog).toHaveBeenCalledWith(task);
    });

    test("Keyboard Enter/Space opens edit dialog on avatar", () => {
        const task = { id: 1, status: "Att göra", assignedTo: ["Anna"] };
        const el = listItem(task);

        const avatarContainer = el.querySelector(".assignee-avatars-list");
        avatarContainer.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

        expect(addTaskDialog).toHaveBeenCalledWith(task);

        avatarContainer.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
        expect(addTaskDialog).toHaveBeenCalledTimes(2);
    });

    test("Moves task up and down within status", () => {
        const task = { id: 2, status: "Att göra" }; // task 2 is at index 1
        const el = listItem(task);

        const controlBtns = el.querySelectorAll(".controlBtn");
        const upBtn = Array.from(controlBtns).find(b => b.textContent && b.textContent.includes("↑"));

        upBtn.click();
        expect(saveState).toHaveBeenCalled();
        expect(mockWindowDispatchEvent).toHaveBeenCalled();
    });

    test("Moves task status left and right", () => {
        const task = { id: 1, status: "Pågår" };
        const el = listItem(task);

        const controlBtns = el.querySelectorAll(".controlBtn");
        const leftBtn = Array.from(controlBtns).find(b => b.textContent && b.textContent.includes("←"));
        const rightBtn = Array.from(controlBtns).find(b => b.textContent && b.textContent.includes("→"));

        leftBtn.click();
        expect(updateTaskStatus).toHaveBeenCalledWith(1, "Att göra");

        rightBtn.click();
        expect(updateTaskStatus).toHaveBeenCalledWith(1, "Klar");
    });

    test("Deletes task (for closed)", async () => {
        const task = { id: 1, status: "Stängd" };
        const el = listItem(task);

        const deleteBtn = el.querySelector(".controlBtn.delete-btn");
        deleteBtn.click();

        await waitFor(() => {
            expect(removeById).toHaveBeenCalledWith(1);
        });
    });

    test("Closes task via prompt (for open)", async () => {
        const task = { id: 1, status: "Att göra" };
        const el = listItem(task);

        const deleteBtn = el.querySelector(".controlBtn.delete-btn");
        deleteBtn.click();

        await waitFor(() => {
            expect(updateTaskStatus).toHaveBeenCalledWith(1, "Stängd", "Reason");
        });
    });

    test("Renders explicit contact link and interacts", () => {
        const task = { id: 1, status: "Att göra", contactId: 99, contactName: "Test Contact" };
        const el = listItem(task);

        const linkDiv = el.querySelector(".task-contact-explicit");
        expect(linkDiv).not.toBeNull();

        // We have to mock the fact that it was created as a sibling to h3 and p inside the taskMainContent
        // The implementation appends to mainContent, unfortunately it doesn't give it a separate class 
        // Wait, it gave it the class "task-contact-explicit"

        linkDiv.click();
        expect(setView).toHaveBeenCalledWith("contacts", { highlightId: 99 });
    });

    test("Formats deadline correctly and highlights overdue", () => {
        const pastDate = new Date(Date.now() - 86400000).toISOString();
        const task = { id: 1, status: "Att göra", deadline: pastDate };
        const el = listItem(task);

        const overdueItem = el.querySelector(".deadline-overdue");
        expect(overdueItem).not.toBeNull();
    });
});
