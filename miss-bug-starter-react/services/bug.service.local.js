const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter
}

async function query(filterBy={}) {
   const response = await axios.get(BASE_URL)
   let bugs = response.data

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
    const response = await axios.get(BASE_URL+bugId)
    const bug = response.data
    return bug
}

async function remove(bugId) {
    const response = await axios.delete(BASE_URL+bugId)
    const removedBug = response.data    
    return removedBug
}

async function save(bug) {
    const response = bug._id
        ? await axios.put(BASE_URL+bug._id, bug)
        : await axios.post(BASE_URL, bug)
    const savedBug = response.data
    return savedBug
}


function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}