import { jest } from '@jest/globals';
import { waitFor, fireEvent } from '@testing-library/dom';

const flushPromises = () => new Promise(process.nextTick);

// Mock globals
global.qrcode = function (a, b) {
    this.addData = jest.fn();
    this.make = jest.fn();
    this.createImgTag = jest.fn().mockReturnValue("<img>");
};

global.Html5Qrcode = {
    getCameras: jest.fn().mockResolvedValue([{ id: "cam1", label: "Camera 1" }])
};

let renderContacts;
let initContactsDB, getAllContacts, searchContacts, addContact, updateContact, deleteContact, importContacts, groupAlphabetically;
let loadState;

describe("contactsView", () => {
    let container;

    beforeEach(async () => {
        container = document.createElement("div");
        document.body.appendChild(container);
        jest.resetModules();
        jest.clearAllMocks();

        const mockContactsDb = {
            initContactsDB: jest.fn(),
            getAllContacts: jest.fn(),
            addContact: jest.fn(),
            updateContact: jest.fn(),
            deleteContact: jest.fn(),
            searchContacts: jest.fn(),
            importContacts: jest.fn(),
            groupAlphabetically: jest.fn()
        };

        const mockStorage = {
            loadState: jest.fn()
        };

        const mockVcard = {
            exportContactsToVCard: jest.fn(),
            parseVCard: jest.fn(),
            createVCard: jest.fn()
        };

        jest.unstable_mockModule("../js/utils/contactsDb.js", () => mockContactsDb);
        jest.unstable_mockModule("../js/storage.js", () => mockStorage);
        jest.unstable_mockModule("../js/utils/vcard.js", () => mockVcard);

        const view = await import("../js/views/contactsView.js");
        renderContacts = view.renderContacts;

        initContactsDB = mockContactsDb.initContactsDB;
        getAllContacts = mockContactsDb.getAllContacts;
        searchContacts = mockContactsDb.searchContacts;
        addContact = mockContactsDb.addContact;
        updateContact = mockContactsDb.updateContact;
        deleteContact = mockContactsDb.deleteContact;
        importContacts = mockContactsDb.importContacts;
        groupAlphabetically = mockContactsDb.groupAlphabetically;
        loadState = mockStorage.loadState;

        loadState.mockReturnValue({ people: ["Ingen", "Anna", "Björn"] });

        groupAlphabetically.mockImplementation((contacts) => {
            const map = new Map();
            contacts.forEach(c => {
                const letter = (c.name || "?").charAt(0).toUpperCase();
                if (!map.has(letter)) map.set(letter, []);
                map.get(letter).push(c);
            });
            return map;
        });

        getAllContacts.mockResolvedValue([
            { id: "1", name: "Test Contact", role: "Dev", company: "Company", phone: ["123"], email: ["test@example.com"], status: "Ej kontaktad", assignedTo: "Anna", isFavorite: false },
            { id: "2", name: "Another Contact", status: "Klar", isFavorite: true, assignedTo: "Björn" }
        ]);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test("Renders list of contacts", async () => {
        await renderContacts(container);
        expect(initContactsDB).toHaveBeenCalled();
        expect(getAllContacts).toHaveBeenCalled();

        const items = container.querySelectorAll(".contact-item");
        expect(items.length).toBe(2);
        expect(items[0].textContent).toContain("Test Contact");
        expect(items[1].textContent).toContain("Another Contact");
    });

    test("Filters by search term", async () => {
        await renderContacts(container);
        const searchInput = container.querySelector(".contacts-search");

        searchContacts.mockResolvedValue([{ id: "1", name: "Test Contact", isFavorite: false }]);

        searchInput.value = "Test";
        searchInput.dispatchEvent(new Event("input"));

        await new Promise(r => setTimeout(r, 250));
        await flushPromises();

        expect(searchContacts).toHaveBeenCalledWith("Test");
        const items = container.querySelectorAll(".contact-item");
        expect(items.length).toBe(1);
        expect(items[0].textContent).toContain("Test Contact");
    });

    test("Filters by status and assignee", async () => {
        await renderContacts(container);
        const selects = container.querySelectorAll(".contacts-actions select");
        const statusSelect = selects[0];
        const assigneeSelect = selects[1];

        statusSelect.value = "Klar";
        statusSelect.dispatchEvent(new Event("change"));

        let items = container.querySelectorAll(".contact-item");
        expect(items.length).toBe(1);

        statusSelect.value = "Alla";
        statusSelect.dispatchEvent(new Event("change"));

        assigneeSelect.value = "Anna";
        assigneeSelect.dispatchEvent(new Event("change"));

        items = container.querySelectorAll(".contact-item");
        expect(items.length).toBe(1);
    });

    test("Toggles favorites view", async () => {
        await renderContacts(container);

        const buttons = Array.from(container.querySelectorAll(".contacts-actions button"));
        const toggleFavBtn = buttons.find(b => b.textContent.includes("Visa favoriter") || b.textContent.includes("Visa alla"));
        expect(toggleFavBtn).toBeDefined();

        toggleFavBtn.click();
        await flushPromises();

        let items = container.querySelectorAll(".contact-item");
        expect(items.length).toBe(1);

        toggleFavBtn.click();
        await flushPromises();
        items = container.querySelectorAll(".contact-item");
        expect(items.length).toBe(2);
    });

    test("Can click a contact to view details", async () => {
        await renderContacts(container);
        const items = container.querySelectorAll(".contact-item");

        items[0].click();
        await flushPromises();

        const detailPanel = container.querySelector(".contacts-detail");
        expect(detailPanel.innerHTML).toContain("Test Contact");
        expect(detailPanel.innerHTML).toContain("test@example.com");
    });

    test("Can toggle star on a contact in list", async () => {
        await renderContacts(container);
        const items = container.querySelectorAll(".contact-item");
        const starBtn = items[0].querySelector(".contact-item-star");

        updateContact.mockResolvedValue();
        starBtn.click();
        await flushPromises();

        expect(updateContact).toHaveBeenCalled();
    });

    test("Switches detail tabs", async () => {
        await renderContacts(container, { highlightId: "1" });
        await flushPromises();

        const detailPanel = container.querySelector(".contacts-detail");
        const tabs = detailPanel.querySelectorAll(".detail-tab-btn");
        expect(tabs.length).toBe(2);

        tabs[1].click();
        expect(detailPanel.querySelector("#tab-history").classList.contains("active")).toBe(true);

        tabs[0].click();
        expect(detailPanel.querySelector("#tab-info").classList.contains("active")).toBe(true);
    });

    test("Creates a new contact via modal", async () => {
        await renderContacts(container);
        const addBtn = container.querySelector(".btn-add");
        addBtn.click();
        await flushPromises();

        const overlay = document.body.querySelector(".csv-modal-overlay");
        expect(overlay).not.toBeNull();

        const inputs = overlay.querySelectorAll("input");
        inputs[0].value = "New User";
        inputs[3].value = "321";

        const buttons = overlay.querySelectorAll("button");
        const saveBtn = Array.from(buttons).find(b => b.textContent === "Spara");

        addContact.mockResolvedValue();
        getAllContacts.mockResolvedValue([
            { id: "1", name: "Test Contact" },
            { id: "2", name: "Another Contact" },
            { id: "3", name: "New User", phone: ["321"] }
        ]);

        saveBtn.click();
        await flushPromises();

        expect(addContact).toHaveBeenCalled();
        expect(document.body.querySelector(".csv-modal-overlay")).toBeNull();

        const items = container.querySelectorAll(".contact-item");
        expect(items.length).toBe(3);
    });

    test("Deletes a contact", async () => {
        window.confirm = jest.fn().mockReturnValue(true);
        await renderContacts(container, { highlightId: "1" });
        await flushPromises();

        const deleteBtn = container.querySelector(".btn-danger");
        expect(deleteBtn).not.toBeNull();

        deleteContact.mockResolvedValue();
        getAllContacts.mockResolvedValue([
            { id: "2", name: "Another Contact", status: "Klar", isFavorite: true, assignedTo: "Björn" }
        ]);

        deleteBtn.click();
        await flushPromises();

        expect(deleteContact).toHaveBeenCalledWith("1");

        const items = container.querySelectorAll(".contact-item");
        expect(items.length).toBe(1);
    });

    test("Changes status via CRM tab", async () => {
        await renderContacts(container, { highlightId: "1" });
        await flushPromises();

        const detailPanel = container.querySelector(".contacts-detail");
        const tabs = detailPanel.querySelectorAll(".detail-tab-btn");
        tabs[1].click();

        const selects = detailPanel.querySelectorAll("select");
        const statusSelect = selects[0];

        updateContact.mockResolvedValue();
        statusSelect.value = "Förlorad";
        statusSelect.dispatchEvent(new Event("change"));
        await flushPromises();

        expect(updateContact).toHaveBeenCalled();
    });
});
