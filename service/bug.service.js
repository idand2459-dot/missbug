import fs from 'fs';
import { makeId } from './util.service.js';
export const bugService = {
    query,
    getById,
    save,
    remove,
}

async function query() {
    try {
        const data = await fs.promises.readFile('bugs.json', 'utf-8')
        const bugs = JSON.parse(data);
        return bugs;
    } catch (err) {
        console.error('Failed to read bugs.json', err);
        throw err;  
    }
}

async function save(bug) {
    try {
        const bugs = await query()

        if (bug._id) {
            const idx = bugs.findIndex(b => b._id === bug._id)

            if (idx === -1) {
                throw new Error('Bug not found')
            }

            bug = {
                ...bugs[idx],
                ...bug,
                _id: bugs[idx]._id,
                createdAt: bugs[idx].createdAt
            }

            bugs[idx] = bug

        } else {
            bug._id = makeId()
            bug.createdAt = Date.now()
            bugs.push(bug)
        }

        await fs.promises.writeFile(
            'bugs.json',
            JSON.stringify(bugs, null, 2)
        )

        return bug

    } catch (err) {
        console.error('Failed to save bug', err)
        throw err
    }
}

function getById(id) {
    return query().then(bugs => bugs.find(bug => bug._id === id));
}

async function remove(id) {
    try {
    const bugs=await query();
    const idx=bugs.findIndex(bug=>bug._id===id)
    if(idx=== -1) {
        throw new Error('Bug not found')
    }
    const updatedBugs = bugs.filter(bug => bug._id !== id)
    const removedBug = bugs[idx];
    await fs.promises.writeFile(
        'bugs.json',
        JSON.stringify(updatedBugs, null, 2)
    )
    return removedBug;
    } catch (err) {
        console.error('Failed to remove bug', err)
        throw err
    }
}