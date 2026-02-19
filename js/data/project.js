export const createTaskItem = (data) => {
    const { 
        id, title, description, status, assignee, 
        created, updated, started, completed, 
        canceled, duedate
    } = data;

    return Object.freeze({
        id, title, description, status, assignee,
        created, updated, started, completed,
        canceled, dueDate: duedate
    });
};