import { jest } from '@jest/globals';

let initSeed, loadDemoWorkspace, loadDemoLIA;
let loadState, saveState;
let initContactsDB, importContacts, getAllContacts;
let createTask;

describe("seed data utilities", () => {
    beforeEach(async () => {
        jest.resetModules();
        jest.clearAllMocks();

        const mockStorage = {
            loadState: jest.fn(),
            saveState: jest.fn()
        };

        const mockContactsDb = {
            initContactsDB: jest.fn().mockResolvedValue(),
            importContacts: jest.fn().mockResolvedValue(),
            getAllContacts: jest.fn().mockResolvedValue([])
        };

        const mockTasks = {
            createTask: jest.fn((input) => ({ ...input, isCreated: true }))
        };

        jest.unstable_mockModule("../js/storage.js", () => mockStorage);
        jest.unstable_mockModule("../js/utils/contactsDb.js", () => mockContactsDb);
        jest.unstable_mockModule("../js/data/tasks.js", () => mockTasks);

        const module = await import("../js/taskList/seed.js");
        initSeed = module.initSeed;
        loadDemoWorkspace = module.loadDemoWorkspace;
        loadDemoLIA = module.loadDemoLIA;

        loadState = mockStorage.loadState;
        saveState = mockStorage.saveState;
        initContactsDB = mockContactsDb.initContactsDB;
        importContacts = mockContactsDb.importContacts;
        getAllContacts = mockContactsDb.getAllContacts;
        createTask = mockTasks.createTask;
    });

    test("initSeed populates state if empty", () => {
        loadState.mockReturnValue({}); // Empty state

        initSeed();

        expect(saveState).toHaveBeenCalled();
        const state = saveState.mock.calls[0][0];

        expect(state.people).toBeDefined();
        expect(state.people.length).toBeGreaterThan(0);
        expect(state.tasks).toBeDefined();
        expect(state.tasks.length).toBeGreaterThan(0);
        expect(createTask).toHaveBeenCalled();

        expect(initContactsDB).toHaveBeenCalled(); // Contacts are also seeded
    });

    test("initSeed does not overwrite existing people/tasks", () => {
        loadState.mockReturnValue({
            people: ["Custom Person"],
            tasks: [{ id: 1, title: "Custom Task" }]
        });

        initSeed();

        expect(saveState).toHaveBeenCalled();
        const state = saveState.mock.calls[0][0];

        expect(state.people).toEqual(["Custom Person"]);
        expect(state.tasks).toEqual([{ id: 1, title: "Custom Task" }]);
        expect(createTask).not.toHaveBeenCalled();
    });

    test("loadDemoWorkspace replaces state with tech data", async () => {
        loadState.mockReturnValue({
            people: ["Old"],
            tasks: []
        });

        await loadDemoWorkspace();

        expect(saveState).toHaveBeenCalled();
        const state = saveState.mock.calls[0][0];

        expect(state.people).toContain("Linnea Malmgren");
        expect(state.tasks.length).toBe(20);
        expect(state.tasks[0].title).toBe("Konfigurera CI/CD-pipeline");

        expect(initContactsDB).toHaveBeenCalled();
        expect(importContacts).toHaveBeenCalled();
    });

    test("loadDemoLIA replaces state with LIA data", async () => {
        loadState.mockReturnValue({
            people: ["Old"],
            tasks: []
        });

        await loadDemoLIA();

        expect(saveState).toHaveBeenCalled();
        const state = saveState.mock.calls[0][0];

        expect(state.people).toContain("Ali Hassan");
        expect(state.tasks.length).toBe(20);
        expect(state.tasks[0].title).toBe("Ring Axis Communications");

        expect(initContactsDB).toHaveBeenCalled();
        expect(importContacts).toHaveBeenCalled();
    });

    test("seedContacts prevents duplicates", async () => {
        loadState.mockReturnValue({});
        getAllContacts.mockResolvedValue([
            { name: "Emma Lindqvist" } // Tech contact 1
        ]);

        await loadDemoWorkspace();

        // Tech demo creates 10 contacts. We mock that Emma is already there. So importContacts is called with 9.
        expect(importContacts).toHaveBeenCalled();
        const importedArray = importContacts.mock.calls[0][0];
        expect(importedArray.length).toBe(9); // 10 original - 1 existing
        expect(importedArray.find(c => c.name === "Emma Lindqvist")).toBeUndefined();
    });
});
