

/**
 * This class is responsible for statemanagent.
 * It should only be used with service classes 
 * for all I/O logic.
 * The statestore gets a key passed down that is
 * then used for all CRUD functions
 */

export class StateStore 
{
  constructor(key)
  {
    this.key = key;
  }




  load() 
  {
    const raw = localStorage.getItem(this.key);
    try
    {
      return raw? JSON.parse(raw) : [];
    } catch(e)
    {
      console.error("Parsing failed", e);
      return [];
    }
  }

  save(data)
  {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  clear()
  {
    localStorage.removeItem(this.key);
  }



}