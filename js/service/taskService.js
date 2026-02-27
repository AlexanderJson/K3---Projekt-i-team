


/*
    @class

    Service layer for tasks.
    Centralizes CRUD + ordering and filtering. 

    Main purpose:
    - keep all data persistent during rerendering of DOM 
    by storing data. Instead of fetching from localstorage 100x times,
    we can just store the data we need in-memory instead, and refresh when changing. 
    
    
    - Data here is stored primarily in Map as the single source of truth.
      I chose a map structure since lookup times are O(1) and that makes
      it pretty ideal for fetching tasks often. 
   
    - dirtyIds is a Set , also O(1) - it stores ids only. Purpose is to
    later implement this to save rerenders. By keeping tabs on changed
    items we dont have to send full tables to UI for small changes.
   
    - changed stores the latest full version of changed tasks. This
    was an unfinished idea to implement batch saving (to reduce calls to storage)


*/
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
        const array = Array.from(this.tasks.values());
        this.repo.save(array);
     }



        _load()
        {
            const data = this.repo.load() || [];
            data.forEach(task => {
                this.tasks.set(task.id, task);
            });
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



     deleteTask(id)
     {
        if (!id) return null;
        const task = this.getTaskById(id);
        if (!task) return null;

        this.tasks.delete(id);
        this._save();
        return task;
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


/*
     Testa:
     branches: 
     4: (expect(null), expect(null), expect(doesNOTcall generateID), success -> expect (CALLS generateID), expect(returns task))

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
        if (!task.id) task.id = this._generateId();
        this.getLatestOrderId(task);

        this.tasks.set(task.id, task);
        //this.dirtyIds.set(task.id);
        this._save();
        console.log("call");
        return this.getTaskById(task.id);
    }

    /*
        Returns full task by ID
    */
    getTaskById(id) {
    const t = this.tasks.get(id);
    if (!t) return null;
    console.log(`Fetched task ${t.id}: ${t.title}`);
    return t;
    }
        

    /*
        Just default filtering if needed. 
        returns by status.
     */

    byStatus(status) {
        return this._filter("status", status);
    }
    
     changeStatus(id, newStatus)
     {
        if (!id || !newStatus) return null;
        const task = this.getTaskById(id); 
        if (!task) return null;
        console.log("STATUS ",task.status);
        if(task.status === newStatus) return task;
        task.status = newStatus;
        this.getLatestOrderId(task);
        this.tasks.set(task.id,task);
        this.changed.set(task.id,task);
        this._save();
        return task;

     }

     updateTaskOrder(taskId, newStatus, prevOrderId, nextOrderId) {
        const task = this.getTaskById(taskId);
        if (!task) return null;

        task.status = newStatus;

        const tasksInColumn = this.byStatus(newStatus)
            .filter(t => t.id !== taskId)
            .sort((a, b) => this._compareRank(a.order || "", b.order || ""));

        let insertIndex = tasksInColumn.length;
        if (nextOrderId) {
            const nextIndex = tasksInColumn.findIndex(t => t.id === nextOrderId);
            if (nextIndex !== -1) insertIndex = nextIndex;
        } else if (prevOrderId) {
            const prevIndex = tasksInColumn.findIndex(t => t.id === prevOrderId);
            if (prevIndex !== -1) insertIndex = prevIndex + 1;
        }

        tasksInColumn.splice(insertIndex, 0, task);

        let currentRank = "J"; 
        for (let i = 0; i < tasksInColumn.length; i++) {
            const t = tasksInColumn[i];
            if (t.order !== currentRank) {
                t.order = currentRank;
                this.tasks.set(t.id, t);
                this.changed.set(t.id, t);
            }
            currentRank = this._genOrderId(currentRank);
        }

        this.tasks.set(task.id, task);
        this.changed.set(task.id, task);
        this._save();
        return task;
     }

     clearTasks() {
        this.tasks.clear();
        this.changed.clear();
        this.dirtyIds.clear();
        this._save();
     }

     importDemoTasks(tasksArray) {
        this.clearTasks();
        if (Array.isArray(tasksArray)) {
            tasksArray.forEach(t => {
                this.getLatestOrderId(t);
                this.tasks.set(t.id, t);
            });
            this._save();
        }
     }


     /*
      Returns by assigned
    */

     byAssigned(assigned)
     {
        return this._filter("assigned",assigned);
     }

    

    getLatestOrderId(task)
    {
        const startingPoint = "J";
        const tasks = this.byStatus(task.status);
        if(tasks.length === 0)
        {
          task.order = startingPoint;  
        } else {
            const sorted = [...tasks].sort((a, b) => this._compareRank(a.order, b.order));              
            const lastTask = sorted.pop();
            task.order = this._genOrderId(lastTask.order || startingPoint);
            console.log(" task order: ",task.order)


        }
    }


    // powerOf = (base,num,i) =>  num * (base ** i) 
    _compareRank(a="", b="")
    {
        const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        if (a.length !== b.length) return a.length - b.length;

        for(let i = 0; i< a.length; i++)
            {
                const ai = i < a.length ? ALPHABET.indexOf(a[i]) : -1;
                const bi = i < b.length ? ALPHABET.indexOf(b[i]) : -1;
                if(ai !== bi) return ai - bi;

            }
            return 0;
    }

    getTasksByStatus(status) {
        return this.byStatus(status)
            .sort((a, b) => this._compareRank(a.order || "", b.order || ""));
    }




    moveTask(id,direction)
    {
        if(!id) return null;
        const task = this.getTaskById(id);
        if(!task) return null;

        const sameStatus = this.byStatus(task.status)
            .sort((a,b) => this._compareRank(a.order || "", b.order || ""));
        
        const index = sameStatus.findIndex(t => t.id === id);
        if (index === -1) return null;   
    
        const targetIndex = direction === "up" ? index - 1 : direction === "down" ? index + 1 : -1;
        if (targetIndex < 0 || targetIndex >= sameStatus.length) return task;
        const target = sameStatus[targetIndex];
        if (!target) return task;   



        const temp = task.order;
        task.order = target.order;
        target.order = temp;

        this.tasks.set(task.id,task);
        this.tasks.set(target.id,target);
        this.changed.set(task.id,task);
        this.changed.set(target.id,target);

        console.log(`Swapped order:
        - ${task.title} -> ${task.order}
        - ${target.title} -> ${target.order}`);
        this._save();
        return task;


    }

    _genOrderId(currentRank)
    {
        const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let letters = currentRank.split('');


        for (let i = letters.length - 1; i >= 0; i--)
        {
            let char = letters[i];
            let charI = ALPHABET.indexOf(char);


            if (charI < ALPHABET.length - 1)
            {
                letters[i] = ALPHABET[charI + 1];
                const result = letters.join('');
                return result;
            }
            else
            {
                letters[i] = ALPHABET[0];
            }
        }

            const result = ALPHABET[0] + letters.join('');
            console.log("RESULT:",result)
            return result;
        }
            // 1. måste kunna ta ut varje bokstav per index för värde
            // 2. måste mappa jämnförelsevis via status och index till index i lista
            // 3. måste hantera edge cases: om vi går förbi längd av alfabetet ska vi till ba,bb,bc osv 



    }