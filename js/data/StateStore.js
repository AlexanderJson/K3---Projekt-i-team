
const task = {
  id,
  title,
  completed,
  assigned,
  status
}



/**
 * This class is responsible for statemanagent.
 * It should only be used with service classes 
 * for all I/O logic.
 * The statestore gets a key passed down that is
 * then used for all CRUD functions
 */

class StateStore 
{
  constructor(key)
  {
    this.key = key;
  }

  _read()
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

  _write(data)
  {
    localStorage.setItem(this.key, JSON.stringify(data));
  }


  add(data)
  {
    const data = this.read();
    data.push(item);
    this._write(data);
    return item;
  }

  clear()
  {
    localStorage.removeItem(this.key);
  }



}