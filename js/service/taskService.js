
export class TaskService
{
     constructor(repo)
     {
        this.repo = repo;
        this.tasks = new Map();
        this.dirtyIds = new Set();
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



    init()
    {
        this._load();
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


    /*
        Adds new task. 
        Branches: 
        1) if null should return error (todo); 
        2) if it exists  should return error(todo);
        3) if else should: 
        * generate unique ID (we use our own format on all for now)
        * add to batchSaved(map) and dirtIds(id)
        * return task by id - more expensive, but safe way to make sure the task got added
    */
    addTask(task)
    {
        if (!task) return null;

        // We check if the task exists
        if(this._exists(task.id))
        {
            return null; //Could update but it mixes too many concepts and makes it harder to communicate errors with the user
        } 

        // Otherwise we generate a new ID based on our formatting
        task.id = this._generateId(); // and yes, this should overwrite intentionally
        this.tasks.set(task.id, task);
        this.dirtyIds.set(id);
        this._save();
        return this.getTaskById(task.id);
    }

    /*
        Returns full task by ID
    */
    getTaskById(id)
    {
        const t =  this.tasks.get(id);
        console.log(`Fetched task ${t.id}: ${t.title}`);
        return t;
    }
    

     /*
        Just default filtering if needed. 
        returns by status.
     */

     byStatus(status)
     {
        return this._filter("status",status);
     }

     /*
      Returns by assigned
    */

     byAssigned(assigned)
     {
        return this._filter("assigned",assigned);
     }


    /*
        This adds an ID to the dirtyIds set. 
        The idea is to keep track of currently changed items
        so we only update them while rerendering in list.
        I put a threshold of max 20 ids before flushing it.
    */

    markDirty(id)
    {        
        if(id== null) return;

        const maxBatchSize = 20;
        if(this.dirtyIds.size >= maxBatchSize) this.consumeDirtyIds();
        this.dirtyIds.add(id);
    }

    /*
        This consumes the ids aka clears it and returns the ids.
    */

    consumeDirtyIds()
    {
        const ids = Array.from(this.dirtyIds);
        this.dirtyIds.clear();
        console.log("Consumed dirtyIds:", ids);
        return ids;
    }


    consumeChangedTasks()
    {
        const changedTasks = Array.from(this.changed.values());
        this.changed.clear();
        
        return changedTasks;
    }


    fetchCachedChanges()
    {
        const ids = this.dirtyIds.values();
        return ids.map(id => this.getTaskById(id)|| null);

    }


}