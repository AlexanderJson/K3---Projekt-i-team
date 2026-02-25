import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { fireEvent, within, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';

const mockTaskService = {
    addTask: jest.fn(),
    updateTask: jest.fn()
};

// Mocking dependencies with exact relative paths used in dialog.js
jest.unstable_mockModule('../js/people/peopleService.js', () => ({
    getPeople: jest.fn(() => ['Ingen', 'Alex', 'Sarah'])
}));

const mockContacts = [
    { id: 1, name: 'Anna Andersson', role: 'Dev' },
    { id: 2, name: 'Axis Communications', role: 'Partner' }
];

jest.unstable_mockModule('../js/utils/contactsDb.js', () => ({
    initContactsDB: jest.fn(() => Promise.resolve()),
    getAllContacts: jest.fn(() => Promise.resolve(mockContacts))
}));

jest.unstable_mockModule('../js/status.js', () => ({
    TASK_STATUSES: {
        TODO: "Att göra",
        IN_PROGRESS: "Pågår",
        DONE: "Klar",
        CLOSED: "Stängd"
    }
}));

const mockSendPushNotification = jest.fn();
jest.unstable_mockModule('../js/utils/toast.js', () => ({
    sendPushNotification: mockSendPushNotification
}));

// Import the module to test AFTER unstable mocks are set up
const dialogModule = await import('../js/comps/dialog.js');
const { addTaskDialog } = dialogModule;

describe('addTaskDialog DOM Component', () => {

    beforeEach(() => {
        // Reset dialog prototype methods for clean JSDOM behavior
        window.HTMLDialogElement.prototype.showModal = jest.fn();
        window.HTMLDialogElement.prototype.close = jest.fn(function () {
            this.open = false;
        });

        // Mock prompt/alert
        global.alert = jest.fn();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should render the dialog to the DOM with correct initial state', async () => {
        const dialog = addTaskDialog(mockTaskService);
        document.body.appendChild(dialog);

        const dialogScope = within(dialog);
        expect(dialogScope.getByRole('heading', { name: 'Skapa uppgift' })).toBeInTheDocument();
        expect(dialogScope.getByPlaceholderText(/Vad ska göras/i)).toBeInTheDocument();

        const cancelBtn = dialogScope.getByText('Avbryt');
        fireEvent.click(cancelBtn);
        expect(document.body.contains(dialog)).toBe(false);
    });

    test('should populate data when editing', () => {
        const mockTask = {
            id: '123',
            title: 'Fix Bug',
            description: 'Critical issue',
            deadline: '2026-12-31',
            assignedTo: ['Alex'],
            status: 'Att göra'
        };

        const dialog = addTaskDialog(mockTaskService, mockTask);
        document.body.appendChild(dialog);

        const dialogScope = within(dialog);
        expect(dialogScope.getByDisplayValue('Fix Bug')).toBeInTheDocument();
        expect(dialogScope.getByDisplayValue('Critical issue')).toBeInTheDocument();

        const alexCheckbox = dialogScope.getByLabelText('Alex');
        expect(alexCheckbox.checked).toBe(true);
    });

    test('checking Ingen unchecks other assignees', () => {
        const dialog = addTaskDialog(mockTaskService);        
        document.body.appendChild(dialog);

        const dialogScope = within(dialog);
        const ingenCheckbox = dialogScope.getByLabelText('🟢 Ledig uppgift');
        const alexCheckbox = dialogScope.getByLabelText('Alex');

        fireEvent.click(alexCheckbox);
        expect(alexCheckbox.checked).toBe(true);

        fireEvent.click(ingenCheckbox);
        expect(ingenCheckbox.checked).toBe(true);
        expect(alexCheckbox.checked).toBe(false);
    });

    test('saving a new task triggers taskService.addTask', () => {
        const dialog = addTaskDialog(mockTaskService);
        document.body.appendChild(dialog);

        const dialogScope = within(dialog);
        const titleInput = dialogScope.getByPlaceholderText(/Vad ska göras/i);
        fireEvent.change(titleInput, { target: { value: 'New Test Task' } });

        const saveBtn = dialogScope.getByText('Skapa uppgift');
        const dispatchSpy = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => { });

        fireEvent.click(saveBtn);

        expect(mockTaskService.addTask).toHaveBeenCalled();
        const calledArg = mockTaskService.addTask.mock.calls[0][0];
        expect(calledArg.title).toBe('New Test Task');
        expect(mockSendPushNotification).toHaveBeenCalledWith('Ny uppgift skapad', expect.any(String));

        expect(document.body.contains(dialog)).toBe(false);
        expect(dispatchSpy).toHaveBeenCalled();
        dispatchSpy.mockRestore();
    });

    test('empty title triggers alert and does not save', () => {
        const dialog = addTaskDialog(mockTaskService);
        document.body.appendChild(dialog);
        const dialogScope = within(dialog);
        const saveBtn = dialogScope.getByText('Skapa uppgift');

        fireEvent.click(saveBtn);

        expect(global.alert).toHaveBeenCalledWith('Titeln får inte vara tom!');
        expect(mockTaskService.addTask).not.toHaveBeenCalled();
    });

    test('closing dialog by clicking outside', () => {
        const dialog = addTaskDialog(mockTaskService);
        document.body.appendChild(dialog);

        // Mock dialog dimensions to simulate clicking outside the content
        dialog.getBoundingClientRect = jest.fn(() => ({
            top: 100, left: 100, bottom: 300, right: 300, width: 200, height: 200,
        }));

        fireEvent.click(dialog, { clientX: 50, clientY: 50 });
        expect(document.body.contains(dialog)).toBe(false);
    });

    test('autocomplete displays on typing', async () => {
        const dialog = addTaskDialog(mockTaskService);
        document.body.appendChild(dialog);
        
        await waitFor(() => {
            expect(document.querySelector('.autocomplete-suggestions')).toBeInTheDocument();
        });

        const titleInput = dialog.querySelector("#taskTitle");
        // Mock selection logic for autocomplete word detection
        Object.defineProperty(titleInput, 'selectionStart', { value: 4, writable: true });

        titleInput.value = 'Call Anna';
        fireEvent.input(titleInput);

        await waitFor(() => {
            expect(within(dialog).getByText('📇 Kontakter')).toBeInTheDocument();
            expect(within(dialog).getByText('Anna Andersson')).toBeInTheDocument();
        });
    });
});