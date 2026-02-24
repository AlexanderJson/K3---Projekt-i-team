
export class TaskService
{
     constructor(repo)
     {
        this.repo = repo;
        this.tasks = new Map();
        this.rev = new Set();
        this.changed = new Map();
        
     }


     /*
        Helper function that generates a unique ID to each task 
        based on date/time + its index in the map. 
        returns {string}
     */

     _generateId()
     {
          return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
     }


     /*
        Helper for just checking if it exists. 
        Just slightly less memory instensive since
        we only return a bool 
     */
     _exists(id)
     {
        return this.tasks.has(id);
     }

     _save()
     {
        console.log("unit test-  should save");
        const array = Array.from(this.tasks.values());
        this.repo.save(array);
     }

     _clear()
     {
        this.tasks.clear();
        this.repo.clear();
     }

     _load()
     {
        this._clear();
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
    


     updateTask(updatedTask)
     {
        if (!updatedTask || updatedTask.id == null) return null;
        if(!this._exists(updatedTask.id)) return null;
        this.tasks.set(updatedTask.id, updatedTask);
        this.changed.set(updatedTask.id, updatedTask);
        this._save();
        return this.getTaskById(updatedTask.id); // shoudl return updated task with changes

     }


    addTask(task)
    {
        if (!task) return null;

        // We check if the task exists
        if(task.id != null && this._exists(task.id))
        {
            return this.updateTask(task);;
        } 

        // Otherwise we generate a new ID based on our formatting
        task.id = this._generateId(); // and yes, this should overwrite intentionally
        this.tasks.set(task.id, task);
        this._save();
        return this.getTaskById(task.id);
    }

    getTaskById(id)
    {
        const t =  this.tasks.get(id);
        console.log(`Fetched task ${t.id}: ${t.title}`);
        return t;
    }


    cacheTask(task)
    {
        task.id = this._generateId();
        this.patched.set(task.id, task);
        this.rev.add(task.id);
        this.cacheChanges
    }

    cacheChanges(id)
    {
        const threshold = 10; // tillfällig
        if(this.rev.size > threshold)
            {
                this.batchSave(); // signallerar att spara senaste batch och rensa
                this.rev.clear();
            }; 
        this.rev.set(id);
    }


    fetchCachedChanges()
    {
        const ids = this.rev.values();
        return ids.map(id => this.getTaskById(id)|| null);

    }

    // laga sen
    batchSave()
    {
        const array = Array.from(this.rev.values());
        this.repo.save(array);
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