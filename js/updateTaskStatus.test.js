import { jest } from '@jest/globals';

let updateTaskStatus;
let isValidTaskStatus, requiresCommentForStatus;
let loadState, saveState;
let notify;
let sendPushNotification;

describe("updateTaskStatus", () => {
    beforeEach(async () => {
        jest.resetModules();
        jest.clearAllMocks();

        const mockStatus = {
            isValidTaskStatus: jest.fn().mockReturnValue(true),
            requiresCommentForStatus: jest.fn().mockReturnValue(false),
            TASK_STATUSES: {
                TODO: "Att göra",
                IN_PROGRESS: "Pågår",
                DONE: "Klar",
                CLOSED: "Stängd"
            }
        };

        const mockStorage = {
            loadState: jest.fn(),
            saveState: jest.fn()
        };

        const mockObserver = {
            notify: jest.fn()
        };

        const mockToast = {
            sendPushNotification: jest.fn()
        };

        jest.unstable_mockModule("../js/status.js", () => mockStatus);
        jest.unstable_mockModule("../js/storage.js", () => mockStorage);
        jest.unstable_mockModule("../js/observer.js", () => mockObserver);
        jest.unstable_mockModule("../js/utils/toast.js", () => mockToast);

        const module = await import("../js/taskList/updateTaskStatus.js");
        updateTaskStatus = module.updateTaskStatus;

        isValidTaskStatus = mockStatus.isValidTaskStatus;
        requiresCommentForStatus = mockStatus.requiresCommentForStatus;
        loadState = mockStorage.loadState;
        saveState = mockStorage.saveState;
        notify = mockObserver.notify;
        sendPushNotification = mockToast.sendPushNotification;

        loadState.mockReturnValue({
            tasks: [
                { id: 1, title: "Task 1", status: "Att göra" },
                { id: 2, title: "Task 2", status: "Klar", completed: true, completedDate: "123" }
            ]
        });
    });

    test("Updates task status successfully and saves", () => {
        updateTaskStatus(1, "Pågår");

        expect(saveState).toHaveBeenCalled();
        const stateArg = saveState.mock.calls[0][0];
        const task = stateArg.tasks.find(t => t.id === 1);

        expect(task.status).toBe("Pågår");
        expect(task.completed).toBe(false);
        expect(notify).toHaveBeenCalled();
        expect(sendPushNotification).toHaveBeenCalledWith("Status Ändrad", "'Task 1' har flyttats till Pågår.");
    });

    test("Marks task as DONE and sends correct notification", () => {
        updateTaskStatus(1, "Klar");

        expect(saveState).toHaveBeenCalled();
        const stateArg = saveState.mock.calls[0][0];
        const task = stateArg.tasks.find(t => t.id === 1);

        expect(task.status).toBe("Klar");
        expect(task.completed).toBe(true);
        expect(task.completedDate).toBeDefined();

        expect(sendPushNotification).toHaveBeenCalledWith("Uppgift Klar! ✅", "'Task 1' är nu markerad som färdig.");
    });

    test("Moving from DONE to TODO clears completed status and date", () => {
        updateTaskStatus(2, "Att göra");

        const stateArg = saveState.mock.calls[0][0];
        const task = stateArg.tasks.find(t => t.id === 2);

        expect(task.status).toBe("Att göra");
        expect(task.completed).toBe(false);
        expect(task.completedDate).toBeNull();
    });

    test("Closing task appends note to description when comment provided", () => {
        updateTaskStatus(1, "Stängd", "Reason for closing");

        const stateArg = saveState.mock.calls[0][0];
        const task = stateArg.tasks.find(t => t.id === 1);

        expect(task.description).toContain("[STÄNGD");
        expect(task.description).toContain("Reason for closing");
    });

    test("Throws error for invalid status", () => {
        isValidTaskStatus.mockReturnValue(false);
        expect(() => updateTaskStatus(1, "InvalidStatus")).toThrow("Invalid task status");
    });

    test("Throws error when moving to status requiring comment without providing one", () => {
        requiresCommentForStatus.mockReturnValue(true);
        expect(() => updateTaskStatus(1, "Stängd")).toThrow("Comment is required for closed tasks");
    });

    test("Throws error if state is empty", () => {
        loadState.mockReturnValue(null);
        expect(() => updateTaskStatus(1, "Pågår")).toThrow("State not initialized");
    });

    test("Throws error if task not found", () => {
        expect(() => updateTaskStatus(999, "Pågår")).toThrow("Task not found");
    });
});
