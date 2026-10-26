const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState({
    ...filterBy,
    labels: ''
})

  useEffect(() => {
    onSetFilterBy({
        ...filterByToEdit,
        labels: (filterByToEdit.labels || '')
            .split(',')
            .map(label => label.trim())
            .filter(label => label !== ''),
        pageIdx: 0
      })
     }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value || ''
                break

            case 'checkbox':
                value = target.checked
                break

            default:
                break
        }

        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

    const { txt, minSeverity, labels } = filterByToEdit
    return (
        <section className="bug-filter">
            <h2>Filter</h2>
            <form onSubmit={onSubmitFilter}>
                <label htmlFor="txt">Text: </label>
                <input value={txt} onChange={handleChange} type="text" placeholder="By Text" id="txt" name="txt" />

                <label htmlFor="minSeverity">Min Severity: </label>
                <input value={minSeverity} onChange={handleChange} type="number" placeholder="By Min Severity" id="minSeverity" name="minSeverity" />
                
                <label htmlFor="labels">Labels: </label>
                <input value={labels} onChange={handleChange} type="text" placeholder="By Labels" id="labels" name="labels" />

                <label htmlFor="sortBy">Sort By: </label>
                <select value={filterByToEdit.sortBy} onChange={handleChange} id="sortBy" name="sortBy">
                    <option value="createdAt">Created At</option>
                    <option value="severity">Severity</option>
                </select>
                <label htmlFor="sortDir">Sort Direction: </label>
                <select value={filterByToEdit.sortDir} onChange={handleChange} id="sortDir" name="sortDir">
                    <option value="1">Ascending</option>
                    <option value="-1">Descending</option>
                </select>
                <button>Apply Filter</button>
            </form>
        </section>
    )
}