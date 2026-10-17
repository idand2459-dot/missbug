const { useState, useEffect } = React
const { Link, useParams } = ReactRouterDOM

import { bugService } from '../services/bug.service.local.js'
import { showErrorMsg } from '../services/event-bus.service.js'

export function BugDetails() {

    const [bug, setBug] = useState(null)
    const [error, setError] = useState(null)
    const { bugId } = useParams()

    useEffect(() => {
        setBug(null)
         setError(null)
        bugService.getById(bugId)
            .then(bug => setBug(bug))
            .catch(err => {
                setError(`Cannot load bug: ${err}`)
                showErrorMsg(`Cannot load bug`, err)
            })
    }, [bugId])

    return <div className="bug-details">
        <h3>Bug Details</h3>
        {!bug && !error && <p className="loading">Loading....</p>}
        {error && <p className="error">{error}</p>}
        {
            bug && 
            <div>
                <h4>{bug.title}</h4>
                <h5>Severity: <span>{bug.severity}</span></h5>
                <p>{bug.description}</p>
                <p>Created At: <span>{new Date(bug.createdAt).toLocaleString()}</span></p>
            </div>
        }
        <hr />
        <Link to="/bug">Back to List</Link>
    </div>

}