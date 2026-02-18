const createTaskItem = (data) => {
    const { 
        ID, Title, Description, Status, Assignee, 
        Created, Updated, Started, Completed, 
        Canceled, Duedate 
    } = data;

    return Object.freeze({
        id: ID,
        title: Title,
        description: Description,
        status: Status,
        assignee: Assignee,
        created: Created,
        updated: Updated,
        started: Started,
        completed: Completed,
        canceled: Canceled,
        dueDate: Duedate,
    });
};