
/**
  Validates a File before processing

  Centralizes our error handling. This makes it easier and
  safer to change the rules of our file functions.
  Primarily used in {@link fileToText} 
 
  Current checks: 
  - null check
  - file size 
  - extension validation (csv, json)
  - instance check (needs to be File)

  @param {File} file
  @returns {void}
  @throws {Error} if any check fails
 */
const _fileGuard = (file) =>
{

    if(!file) throw new Error("No file provided");

    const ext = file.name.split(".").pop().toLowerCase(); 
    const maxMB = 10;
    const maxBytes = (maxMB * 1024 * 1024); // we use bytes to compare with file.size that also returns bytes
    const acceptedExtensions = ["csv", "json"];
    
    if(!(file instanceof File)) throw new Error("Wrong file object");   
    if(!acceptedExtensions.includes(ext)) throw new Error("Invald file types. Only .csv or .json allowed!");
    if(file.size > maxBytes) throw new Error(`File is too large for upload. Max size is ${maxMB} MB`);
}


const _csvGuard = (table) =>
{
    if(!table.length) throw new Error("No data written?!");
    if(!table[0]?.length) throw new Error("No headers written?!");

}

/**
  @async
  @param {File} file
  @returns {string}
 */
export const fileToText = async (file) => 
{
    _fileGuard(file);
    return await file.text();
}





// CSV


/**
  Parses and normalises csv file to human-readable text
  @param {string} data
  @returns {Array<Array<string>>}
 */
const _normalizeCSV = (data) =>
{
    const removedLines = data.replace(/\r\n/g, "\n");
    const splitRows = removedLines.split("\n");
    const filter = splitRows.filter(row => row.trim() !== "");
    const fullTable = filter.map(i =>
        i.replace(/"/g, "").split(",")
    );
    return fullTable;
}


const convert = (table) => 
{
    const headers = table[0].map(h => h.trim().toLowerCase());
    const rows = table.slice(1);
    return rows.map(r => {
        const obj = {};
        headers.forEach((header,index) =>
        {
            obj[header.trim()] = r[index]?.trim();
        });
        return obj;
    });

}

/**
/**
  Maps the result of {@link _normalizeCSV} with {@constant _objectHeaders}. 
  Used after {@link _normalizeCSV} to create task objects.

  @param {Array<Array<string>>} table
  @returns {Array<Array<string>>}
 */

const _compare = (table) => {
    
    const _objectHeaders = 
    [
        "id",
        "title",
        "description",
        "status",
        "assignee",
        "created",
        "updated",
        "started",
        "completed",
        "canceled",
        "duedate"
    ]

    const headers = table[0].map(h => h.trim().toLowerCase());
    const indices = headers.map((header,index) => _objectHeaders.includes(header) ? index : -1).filter(index=>index !== -1);
    const filteredTable = table.map(row =>
    {
        return indices.map(index => row[index]);
    });
    
    console.table(filteredTable.slice(0, 10));
    return convert(filteredTable)
};


/**
 * returns the objects mapped from CSV file
 * @async
 * @param {File} file - Description
 * @returns {<Array<object>>} Description of return value
 * @throws {error}
 */
export const readCsv = async (file = "/seed-tasks.csv") =>
{
    _fileGuard(file);
    const data = await fileToText(file);
    const normData = _normalizeCSV(data);
    _csvGuard(normData);
    return _compare(normData);
}

export const readLocalCsv = async (path = "/team3.csv") =>
{
    const res = await fetch(path);
    if(!res.ok) throw new Error(`Could not load ${path}`);
    const text = await res.text();
    const file = new File([text], "team3.csv", { type:"text/csv"});
    return readCsv(file);
}