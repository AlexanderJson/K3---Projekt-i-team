class TaskService extends EventTarget
{
    constructor(repo)
    {
        super();
        this.repo = repo;
        this.tasks = this.repo.getAll();

    }



    getTasks()
    {
        return this.tasks;
    }

    getAssigned()
    {

    }

    
    


}