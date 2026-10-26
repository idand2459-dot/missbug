const { Link } = ReactRouterDOM

export function UserDetails({ loggedinUser }) {
    const [bugs, setBugs] = React.useState([])

    React.useEffect(() => {
        if (loggedinUser) {
            fetch('/api/bug')
                .then(res => {
                    if (!res.ok) throw new Error('Failed to load bugs')
                    return res.json()
                })
                .then(setBugs)
                .catch(err => console.error(err))
        }
    }, [loggedinUser])

    if (!loggedinUser) {
        return (
            <div>
                <h2>You are not logged in</h2>
                <Link to="/login">Go to Login</Link>
            </div>
        )
    }

    const myBugs = bugs.filter(bug =>
        bug.creator && bug.creator._id === loggedinUser._id
    )

    const totalBugs = myBugs.length

    const criticalBugs = myBugs.filter(bug =>
    bug.severity >= 4
    ).length

    const averageSeverity = myBugs.length > 0
    ? myBugs.reduce((sum, bug) => sum + bug.severity, 0) / myBugs.length
    : 0

    return (
        <section className="user-profile">
            <h2>My Profile</h2>
            <p>User ID: {loggedinUser._id}</p>
            <p>Username: {loggedinUser.username}</p>
            <p>Full Name: {loggedinUser.fullname}</p>
            <p>Admin: {loggedinUser.isAdmin ? 'Yes' : 'No'}</p>

            <section className="profile-bugs">
                <h2>My Bugs</h2>
                <ul>
                    {myBugs.map(bug => (
                        <li key={bug._id}>{bug.title}</li>
                    ))}
                </ul>
            </section>
            <section className="profile-stats">
                <h2>Bug Statistics</h2>
                <p>Total Bugs: {totalBugs}</p>
                <p>Critical Bugs: {criticalBugs}</p>
                <p>Average Severity: {averageSeverity.toFixed(2)}</p>
            </section>
        </section>
    )
}