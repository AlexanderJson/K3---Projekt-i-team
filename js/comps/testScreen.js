import {createTaskItem} from '../data/project.js';
import {returnContents} from '../api/csvReader.js';

export const testScreen = () => 
{

    const listDiv = document.createElement('div');
    const cardDiv = document.createElement('div');
    listDiv.classList.add('listDiv');
    cardDiv.classList.add('cardDiv');

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
        for(const row of contents)        
        {
            const task = createTaskItem(row);
            const title = document.createElement('p');
            const description = document.createElement('p');
            const status = document.createElement('p');
            status.textContent = `status: ${task.status}`;
            title.textContent = `title: ${task.title}`;
            description.textContent = `description: ${task.description}`;
            cardDiv.append(title, description, status);
        }
    });

    listDiv.append(cardDiv);
    div.append(input, btn, listDiv);


    return div;
}