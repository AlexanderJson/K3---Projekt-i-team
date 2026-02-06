export function createTask(
    {
        title,
        completed,
        status,
        assigned
    }
) 
    {
        return {
            title,
            completed,
            status,
            assigned
    };
}
