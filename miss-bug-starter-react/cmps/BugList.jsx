const { Link } = ReactRouterDOM

import { BugPreview } from './BugPreview.jsx'

export function BugList({
    bugs,
    loggedinUser,
    onRemoveBug,
    onEditBug,
    onNextPage,
    onPrevPage,
    pageIdx
}) {

    if (!bugs) return <div>Loading...</div>

    return (
        <div>
            <ul className="bug-list">
                {bugs.map(bug => {
                    const canEdit = loggedinUser && (
                        loggedinUser.isAdmin ||
                        (bug.creator && loggedinUser._id === bug.creator._id)
                    )

                    return (
                        <li key={bug._id}>
                            <BugPreview bug={bug} />

                            <section className="actions">
                                <button>
                                    <Link to={`/bug/${bug._id}`}>Details</Link>
                                </button>

                                {canEdit && (
                                    <React.Fragment>
                                        <button onClick={() => onEditBug(bug)}>
                                            Edit
                                        </button>

                                        <button onClick={() => onRemoveBug(bug._id)}>
                                            x
                                        </button>
                                    </React.Fragment>
                                )}
                            </section>
                        </li>
                    )
                })}
            </ul>

            <section className="pagination">
                <button onClick={onPrevPage} disabled={pageIdx === 0}>
                    Previous Page
                </button>

                <span>Page {pageIdx + 1}</span>

                <button onClick={onNextPage}>
                    Next Page
                </button>
            </section>
        </div>
    )
}