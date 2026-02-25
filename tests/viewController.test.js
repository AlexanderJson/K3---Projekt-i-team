import { jest } from '@jest/globals';

const flushPromises = () => new Promise(process.nextTick);

let initViewController, setView, rerenderActiveView;
let renderDashboard, renderCalendar, renderSettings, renderContacts, taskScreen;
let loadState;

describe("viewController", () => {
    let container;

    beforeEach(async () => {
        container = document.createElement("div");

        jest.resetModules();
        jest.clearAllMocks();

        const mockDashboard = { renderDashboard: jest.fn() };
        const mockCalendar = { renderCalendar: jest.fn() };
        const mockTasks = { taskScreen: jest.fn().mockReturnValue(document.createElement("div")) };
        const mockSettings = { renderSettings: jest.fn() };
        const mockContacts = { renderContacts: jest.fn() };
        const mockStorage = { loadState: jest.fn().mockReturnValue({ tasks: [] }) };

        jest.unstable_mockModule("../js/views/dashboardView.js", () => mockDashboard);
        jest.unstable_mockModule("../js/views/calendarView.js", () => mockCalendar);
        jest.unstable_mockModule("../js/taskList/taskScreen.js", () => mockTasks);
        jest.unstable_mockModule("../js/views/settingsView.js", () => mockSettings);
        jest.unstable_mockModule("../js/views/contactsView.js", () => mockContacts);
        jest.unstable_mockModule("../js/storage.js", () => mockStorage);

        const controller = await import("../js/views/viewController.js");
        initViewController = controller.initViewController;
        setView = controller.setView;
        rerenderActiveView = controller.rerenderActiveView;

        renderDashboard = mockDashboard.renderDashboard;
        renderCalendar = mockCalendar.renderCalendar;
        taskScreen = mockTasks.taskScreen;
        renderSettings = mockSettings.renderSettings;
        renderContacts = mockContacts.renderContacts;
        loadState = mockStorage.loadState;

        initViewController(container);
    });

    test("Renders dashboard", async () => {
        await setView("dashboard");
        expect(renderDashboard).toHaveBeenCalledWith(container, { tasks: [] });
    });

    test("Renders calendar", async () => {
        await setView("calendar");
        expect(renderCalendar).toHaveBeenCalledWith(container);
    });

    test("Renders tasks", async () => {
        await setView("tasks");
        expect(taskScreen).toHaveBeenCalledWith();
        expect(container.children.length).toBe(1);
    });

    test("Renders settings", async () => {
        await setView("settings");
        expect(renderSettings).toHaveBeenCalledWith(container, rerenderActiveView);
    });

    test("Renders contacts with params", async () => {
        await setView("contacts", { highlightId: '123' });
        expect(renderContacts).toHaveBeenCalledWith(container, { highlightId: '123' });

        // Params should be cleared after usage
        await rerenderActiveView();
        expect(renderContacts).toHaveBeenLastCalledWith(container, null);
    });
});
