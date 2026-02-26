import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { screen, fireEvent, within, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';

// Setup mocks BEFORE imports
jest.unstable_mockModule('../js/people/peopleService.js', () => ({
    getPeople: jest.fn(() => ['Ingen', 'Alex', 'Sarah'])
}));

const mockContacts = [
    { id: 1, name: 'Anna Andersson', role: 'Dev' },
    { id: 2, name: 'Axis Communications', role: 'Partner' }
];

const mockGetAllContacts = jest.fn(() => Promise.resolve(mockContacts));

jest.unstable_mockModule('../js/utils/contactsDb.js', () => ({
    initContactsDB: jest.fn(() => Promise.resolve()),
    getAllContacts: mockGetAllContacts
}));

// Create mock functions we can assert on
const mockAddState = jest.fn();
const mockSaveState = jest.fn();
let mockState = { tasks: [] };

jest.unstable_mockModule('../js/storage.js', () => ({
    addState: mockAddState,
    loadState: jest.fn(() => mockState),
    saveState: mockSaveState
}));

const mockSendPushNotification = jest.fn();
jest.unstable_mockModule('../js/utils/toast.js', () => ({
    sendPushNotification: mockSendPushNotification
}));

// Now import the module to test AFTER unstable mocks are set up
const { addTaskDialog } = await import('../js/comps/dialog.js');

describe('addTaskDialog DOM Component', () => {

    beforeEach(() => {
        mockState = { tasks: [] };
        // Reset dialog prototype methods for clean JSDOM behavior
        window.HTMLDialogElement.prototype.showModal = jest.fn();
        window.HTMLDialogElement.prototype.close = jest.fn(function () {
            this.open = false;
        });

        // Mock prompt/alert
        global.alert = jest.fn();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    test('should render the dialog to the DOM with correct initial state', async () => {
        const overlay = addTaskDialog();
        document.body.appendChild(overlay);

        const dialogScope = within(overlay);
        expect(dialogScope.getByRole('heading', { name: 'Skapa uppgift', hidden: true })).toBeInTheDocument();
        expect(dialogScope.getByPlaceholderText('Vad ska göras? (t.ex. Kontakta Axis)')).toBeInTheDocument();
        expect(dialogScope.getByPlaceholderText('Beskrivning av uppgiften...')).toBeInTheDocument();

        const cancelBtn = dialogScope.getByText('Avbryt');
        expect(cancelBtn).toBeInTheDocument();

        fireEvent.click(cancelBtn);
        // Using remove() removes it from DOM
        expect(document.body.contains(overlay)).toBe(false);
    });

    test('should populate data and check corresponding assignees when editing', () => {
        const mockTask = {
            id: '123',
            title: 'Fix Bug',
            description: 'Fix the nasty bug in the system',
            deadline: '2026-12-31',
            assignedTo: ['Alex'],
            notes: []
        };

        const overlay = addTaskDialog(mockTask);
        document.body.appendChild(overlay);

        const dialogScope = within(overlay);
        expect(dialogScope.getByRole('heading', { name: 'Redigera uppgift', hidden: true })).toBeInTheDocument();
        expect(dialogScope.getByDisplayValue('Fix Bug')).toBeInTheDocument();
        expect(dialogScope.getByDisplayValue('Fix the nasty bug in the system')).toBeInTheDocument();
        expect(dialogScope.getByDisplayValue('2026-12-31')).toBeInTheDocument();

        const ingenCheckbox = dialogScope.getByLabelText('🟢 Ledig uppgift');
        const alexCheckbox = dialogScope.getByLabelText('Alex');
        expect(ingenCheckbox.checked).toBe(false);
        expect(alexCheckbox.checked).toBe(true);
    });

    test('checking Ingen unchecks other assignees', () => {
        const overlay = addTaskDialog();
        document.body.appendChild(overlay);

        const dialogScope = within(overlay);
        const ingenCheckbox = dialogScope.getByLabelText('🟢 Ledig uppgift');
        const alexCheckbox = dialogScope.getByLabelText('Alex');

        fireEvent.click(alexCheckbox);
        expect(alexCheckbox.checked).toBe(true);

        fireEvent.click(ingenCheckbox);
        expect(ingenCheckbox.checked).toBe(true);
        expect(alexCheckbox.checked).toBe(false);
    });

    test('saving a new task triggers addState and dispatchEvent', () => {
        const overlay = addTaskDialog();
        document.body.appendChild(overlay);

        const dialogScope = within(overlay);
        const titleInput = dialogScope.getByPlaceholderText('Vad ska göras? (t.ex. Kontakta Axis)');
        fireEvent.change(titleInput, { target: { value: 'New Test Task' } });

        const saveBtn = dialogScope.getByRole('button', { name: 'Skapa uppgift', hidden: true });

        const dispatchSpy = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => { });

        fireEvent.click(saveBtn);

        expect(mockAddState).toHaveBeenCalled();
        const calledArg = mockAddState.mock.calls[0][0];
        expect(calledArg.title).toBe('New Test Task');
        expect(calledArg.status).toBe('Att göra');

        // Push notification created
        expect(mockSendPushNotification).toHaveBeenCalledWith('Ny uppgift skapad', expect.any(String));

        expect(document.body.contains(overlay)).toBe(false);
        expect(dispatchSpy).toHaveBeenCalled();
        dispatchSpy.mockRestore();
    });

    test('saving an an editing task triggers saveState and handles status changes properly', () => {
        const mockTask = {
            id: '123',
            title: 'Fix Bug',
            description: 'Fix',
            deadline: '',
            status: 'Att göra',
            notes: []
        };
        mockState.tasks = [mockTask]; // set up mock state 

        const overlay = addTaskDialog(mockTask);
        document.body.appendChild(overlay);
        const dialogScope = within(overlay);

        // Ensure "status" changes via notes push logic - well, dialog only saves title/desc/deadline directly.
        // It updates the whole task representation in State. Suppose we change title and assignees
        const titleInput = dialogScope.getByDisplayValue('Fix Bug');
        fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

        const saveBtn = dialogScope.getByRole('button', { name: 'Spara ändringar', hidden: true });
        fireEvent.click(saveBtn);

        expect(mockSaveState).toHaveBeenCalled();
        const savedState = mockSaveState.mock.calls[0][0];
        expect(savedState.tasks[0].title).toBe('Updated Title');
        expect(document.body.contains(overlay)).toBe(false);
    });

    test('saving an editing task with a changed status triggers notes and notifications', () => {
        // App has oldStatus='Att göra', but taskToEdit (from UI dragging or otherwise) says 'Klar'
        const mockTask = { id: '123', title: 'Bug', status: 'Klar' };
        mockState.tasks = [{ id: '123', status: 'Att göra' }];

        const overlay = addTaskDialog(mockTask);
        document.body.appendChild(overlay);

        // Save
        const saveBtn = within(overlay).getByRole('button', { name: 'Spara ändringar', hidden: true });
        fireEvent.click(saveBtn);

        const savedState = mockSaveState.mock.calls[mockSaveState.mock.calls.length - 1][0];
        // Note added
        expect(savedState.tasks[0].notes.length).toBe(1);
        expect(savedState.tasks[0].notes[0].type).toBe('status');
        expect(mockSendPushNotification).toHaveBeenCalled();
    });

    test('empty title triggers alert and does not save', () => {
        const overlay = addTaskDialog();
        document.body.appendChild(overlay);
        const dialogScope = within(overlay);
        const saveBtn = dialogScope.getByRole('button', { name: 'Skapa uppgift', hidden: true });

        fireEvent.click(saveBtn);

        expect(global.alert).toHaveBeenCalledWith('Titeln får inte vara tom!');
        expect(mockAddState).not.toHaveBeenCalled();
        // dialog still open
        expect(document.body.contains(overlay)).toBe(true);
    });

    test('closing dialog by clicking outside (overlay)', () => {
        const overlay = addTaskDialog();
        document.body.appendChild(overlay);

        // Simulate click outside the dialog bounding rect
        overlay.getBoundingClientRect = jest.fn(() => ({
            top: 100,
            left: 100,
            bottom: 300,
            right: 300,
            width: 200,
            height: 200,
        }));

        fireEvent.click(overlay, { clientX: 50, clientY: 50 });
        expect(document.body.contains(overlay)).toBe(false);
    });

    test('editing task handles notes properly and escapes HTML', () => {
        const mockTask = {
            id: '123',
            title: 'Note Test',
            status: 'Att göra',
            notes: [
                { text: 'Old note', date: new Date().toISOString(), type: 'note', author: '' }
            ]
        };

        const overlay = addTaskDialog(mockTask);
        document.body.appendChild(overlay);
        const dialogScope = within(overlay);

        // Log should contain "Old note"
        expect(dialogScope.getByText('Old note')).toBeInTheDocument();

        const noteInput = dialogScope.getByPlaceholderText('Skriv en notering...');
        const addNoteBtn = dialogScope.getByRole('button', { name: 'Lägg till notering', hidden: true });

        // Add note with HTML
        fireEvent.change(noteInput, { target: { value: '<div>Evil script</div>' } });
        fireEvent.click(addNoteBtn);

        // Check if note is added
        expect(mockTask.notes.length).toBe(2);

        // HTML is escaped and rendered safely so we should find "<div>Evil script</div>" as text
        expect(dialogScope.getByText('<div>Evil script</div>')).toBeInTheDocument();

        // Input should be cleared
        expect(noteInput.value).toBe('');
    });

    test('autocomplete displays on typing and populates on click', async () => {
        const overlay = addTaskDialog();
        document.body.appendChild(overlay);
        const dialogScope = within(overlay);

        // We must wait for the async import of contactsDb inside the component to finish
        await waitFor(() => {
            expect(document.querySelector('.autocomplete-suggestions')).toBeInTheDocument();
        });

        const titleInput = dialogScope.getByPlaceholderText('Vad ska göras? (t.ex. Kontakta Axis)');

        // We mock setSelectionRange since JSDOM might lack proper support for selectionStart during change
        titleInput.setSelectionRange = () => { };
        Object.defineProperty(titleInput, 'selectionStart', { value: 4, writable: true });

        titleInput.value = 'Call Anna';
        titleInput.selectionStart = 9; // End of 'Anna'
        fireEvent.input(titleInput, { target: { value: 'Call Anna' } });

        // The autocomplete box should appear
        await waitFor(() => {
            expect(dialogScope.getByText('📇 Kontakter')).toBeInTheDocument();
        });

        // Click Anna Andersson
        const suggestion = dialogScope.getByText('Anna Andersson');
        fireEvent.click(suggestion);

        // Value should be updated
        expect(titleInput.value.trim()).toBe('Call Anna Andersson');
        expect(dialogScope.getByText('🔗 Länkad till:')).toBeInTheDocument();
    });

    // We can also test the contact unlinking
    test('removes linked contact when X is clicked', () => {
        const mockTask = {
            id: '12',
            title: 'Talk to Axis',
            contactId: 2,
            contactName: 'Axis Communications'
        };

        const overlay = addTaskDialog(mockTask);
        document.body.appendChild(overlay);
        const dialogScope = within(overlay);

        expect(dialogScope.getByText('Axis Communications')).toBeInTheDocument();
        const removeBtn = dialogScope.getByText('✕');
        fireEvent.click(removeBtn);

        // Badge is hidden via display: none, we can check visibility or style
        const badge = document.getElementById('linkedContactBadge');
        expect(badge.style.display).toBe('none');
    });

    test('ignores empty notes', () => {
        const mockTask = { id: '345', title: 'Note test' };
        const overlay = addTaskDialog(mockTask);
        document.body.appendChild(overlay);

        const noteInput = overlay.querySelector("#taskNoteInput");
        const addNoteBtn = overlay.querySelector("#addNoteBtn");

        // Empty note
        noteInput.value = "  ";
        fireEvent.click(addNoteBtn);

        expect(mockTask.notes).toBeUndefined(); // Nothing added
    });

    test('renders notes correctly even if notes array is missing initially', () => {
        const mockTask = { id: '345', title: 'Note test' }; // No notes array
        const overlay = addTaskDialog(mockTask);
        document.body.appendChild(overlay);

        const noteInput = overlay.querySelector("#taskNoteInput");
        const addNoteBtn = overlay.querySelector("#addNoteBtn");

        // Valid note
        noteInput.value = "New Note";
        fireEvent.click(addNoteBtn);

        expect(mockTask.notes.length).toBe(1);
        expect(overlay.querySelector('#notesLog').textContent).toContain("New Note");
    });

    test('autocomplete ignores short searches and handles empty results', async () => {
        const overlay = addTaskDialog();
        document.body.appendChild(overlay);
        const titleInput = overlay.querySelector("#taskTitle");

        // Wait for attachAutocomplete
        await waitFor(() => {
            expect(document.querySelector('.autocomplete-suggestions')).toBeInTheDocument();
        });

        titleInput.setSelectionRange = () => { };
        Object.defineProperty(titleInput, 'selectionStart', { value: 1, writable: true });

        // Short search (length 1)
        titleInput.value = 'A';
        titleInput.selectionStart = 1;
        fireEvent.input(titleInput, { target: { value: 'A' } });

        const box = overlay.querySelector('.autocomplete-suggestions');
        expect(box.style.display).toBe('none');

        // No matches search
        Object.defineProperty(titleInput, 'selectionStart', { value: 4, writable: true });
        titleInput.value = 'Zyxw';
        titleInput.selectionStart = 4;
        fireEvent.input(titleInput, { target: { value: 'Zyxw' } });
        expect(box.style.display).toBe('none');
    });

    test('closes autocomplete box when clicking outside', async () => {
        const overlay = addTaskDialog();
        document.body.appendChild(overlay);
        const titleInput = overlay.querySelector("#taskTitle");

        await waitFor(() => {
            expect(document.querySelector('.autocomplete-suggestions')).toBeInTheDocument();
        });

        titleInput.setSelectionRange = () => { };
        Object.defineProperty(titleInput, 'selectionStart', { value: 4, writable: true });

        titleInput.value = 'Anna';
        titleInput.selectionStart = 4;
        fireEvent.input(titleInput, { target: { value: 'Anna' } });

        const box = overlay.querySelector('.autocomplete-suggestions');

        // Verify it opened
        await waitFor(() => {
            expect(box.style.display).toBe('block');
        });

        // Click outside (e.g., on the overlay background)
        fireEvent.click(overlay);
        expect(box.style.display).toBe('none');
    });
});
