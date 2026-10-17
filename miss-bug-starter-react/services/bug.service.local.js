const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter
}

async function query(filterBy={}) {
   const response = await fetch(BASE_URL)
   if (!response.ok) throw new Error('Failed to fetch bugs')
   let bugs = await response.json()

        if (filterBy.txt) {
            const regExp = new RegExp(filterBy.txt, 'i')
            bugs = bugs.filter(bug => regExp.test(bug.title))
        }

        if (filterBy.minSeverity) {
            bugs = bugs.filter(bug => bug.severity >= filterBy.minSeverity)
        }

        return bugs
}

async function getById(bugId) {
    const response = await fetch(BASE_URL+bugId)
    if (!response.ok) throw new Error('Failed to fetch bug')
    const bug = await response.json()
    return bug
}

async function remove(bugId) {
    const response = await fetch(BASE_URL+bugId+'/remove')
    if (!response.ok) throw new Error('Failed to remove bug')
    const removedBug = await response.json()
    return removedBug
}

async function save(bug) {
    const queryString = new URLSearchParams(bug).toString()
    const response = await fetch(BASE_URL+'save?'+queryString)
    if (!response.ok) throw new Error('Failed to save bug')
    const savedBug = await response.json()
    return savedBug
}


function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}