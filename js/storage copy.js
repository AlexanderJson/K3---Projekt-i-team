import { notify } from "./observer.js";


class StorageRepository
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
      console.error("Couldn't parse storage", e);
      return [];
    }
  }

  _write(data)
  {
    localStorage.setItem(this.key, JSON.stringify(data));
  }
  

  getAll() 
  {
    return this._read();
  }



  add(data) 
  {
    const data = this._read();

    data.push(item);

    this._write(data);
    return item;
  }

  clear()
  {
    localStorage.removeItem(this.key);
  }

}

