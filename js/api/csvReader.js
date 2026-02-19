

const validateCSV = (file) => 
{
    if(!file) return false;
    if(file.type != "text/csv") return false;
    return true;
}

/*
    @returns string
*/

const normalize = (data) =>
{
    const removedLines = data.replace(/\r\n/g, "\n");
    const splitRows = removedLines.split("\n");
    const filter = splitRows.filter(row => row.trim() !== "");
    const fullTable = filter.map(i =>
        i.replace(/"/g, "").split(",")
    );
    return fullTable;
}









const readFile = (file) =>
{    
    return new Promise((resolve,reject) =>
    {
        const validity = validateCSV(file);
        if(!validity) return reject("File is missing or wrong type");

        const reader = new FileReader();
        reader.onload = () => 
        {
            const result = reader.result;
            resolve(result);
        }
        reader.onerror = () => reject("Failed to read the file");
        reader.readAsText(file);
    })
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
const compare = (table) => {
    
const taskHeader = [
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
    "dueDate"
];

    const headers = table[0].map(h => h.trim().toLowerCase());
    const indices = headers.map((header,index) => taskHeader.includes(header) ? index : -1).filter(index=>index !== -1);
    const filteredTable = table.map(row =>
    {
        return indices.map(index => row[index]);
    });
    
    console.table(filteredTable.slice(0, 10));
    return convert(filteredTable)
};


export const returnContents = async (file) => 
{
    const validity = validateCSV(file);
    if(!validity) return false; //TODO
    try
    {
        const data = await readFile(file);
        const f = normalize(data);
        return compare(f);;

    }
    catch(e)
    {
        console.error(e);
        return false;
    }
}



/*
const compare = (table) => {
    
const taskHeader = [
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
    "dueDate"
];

    const headers = table[0].map(h => h.trim().toLowerCase());
    const match = headers.filter(header => taskHeader.includes(header));
    console.log("MATCH: ", match)
    return match;
};


*/