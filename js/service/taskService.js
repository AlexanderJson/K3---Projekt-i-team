
export class taskService
{
     constructor(repo)
     {
        this.repo = repo;
        this.tasks = new Map();
     }

     _save()
     {
        const array = Array.from(this.tasks.values());
        this.repo.save(array);
     }

     _load()
     {
        const data = this.repo.load(); //exception till ui sen med
        data.forEach(
            task => 
                {
                    this.tasks.set(task.id,task)
                }
            );
     }

     _filter(k,v)
     {
        return Array.from(this.tasks.values())
            .filter(t=>t[k] === v);
     }

     getTasks()
     {
        return Array.from(this.tasks.values());
     }


    addTask(task)
    {
        this.tasks.set(task.id, task);
        this._save();
    }

    getTaskById(id)
    {
        return this.tasks.get(id);
    }

    init()
    {
        this._load();
    }

     // Filters

     byStatus(status)
     {
        return this._filter("status",status);
     }

     byAssigned(assigned)
     {
        return this._filter("assigned",assigned);
     }
}