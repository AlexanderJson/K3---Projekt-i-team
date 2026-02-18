import {returnContents} from '../api/csvReader.js';




export const testBtn = () =>
{

    const div = document.createElement('div');
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";

    const btn = document.createElement("button");
    btn.innerHTML = "READ CSSSV"; 
    btn.addEventListener("click", async () =>
    {
        const file = input.files[0];
        if(!file) return;
        const contents = await returnContents(file);
        console.log("CSV contents:", contents);

    });

    div.append(input, btn);
    return div;
}