export function BugPreview({bug}) {
    return <article className="bug-preview">
        <p className="title">{bug.title}</p>
        <p className="severity">Severity: <span data-severity={bug.severity}>{bug.severity}</span></p>
        <p className="labels">Labels: <span>{bug.labels ? bug.labels.join(', ') : ''}</span></p>
    </article>
}