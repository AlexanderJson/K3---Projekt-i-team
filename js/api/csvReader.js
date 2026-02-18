
const validateCSV = (file) => 
{
    if(!file) return false;
    if(file.type != "text/csv") return false;
    return true;
}

/*
    @returns string
*/

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

export const returnContents = async (file) => 
{
    const validity = validateCSV(file);
    if(!validity) return false; //TODO
    try
    {
        return await readFile(file);
    }
    catch(e)
    {
        console.error(e);
        return false;
    }
}