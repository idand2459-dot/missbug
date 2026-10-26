const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter
}

async function query(filterBy={}) {
   const response = await axios.get(BASE_URL, { params: filterBy })
   return response.data
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
    return { 
        txt: '',
     minSeverity: 0,
        labels: [],
        sortBy: 'createdAt',
        sortDir: 1,
        pageIdx: 0
     }
}