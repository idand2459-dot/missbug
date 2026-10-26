
const { useState, useEffect } = React

export function UserIndex({ loggedinUser }) {
    const [users, setUsers] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        if (!loggedinUser || !loggedinUser.isAdmin) return

        loadUsers()
    }, [loggedinUser])

    async function loadUsers() {
        try {
            const res = await fetch('/api/user')

            if (!res.ok) {
                throw new Error('Failed to load users')
            }

            const users = await res.json()
            setUsers(users)
        } catch (err) {
            setError(err.message)
        }
    }

    async function onRemoveUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return
        }

        try {
            setError('')

            const res = await fetch(`/api/user/${userId}`, {
                method: 'DELETE'
            })

            if (!res.ok) {
                const message = await res.text()
                throw new Error(message)
            }

            setUsers(prevUsers =>
                prevUsers.filter(user => user._id !== userId)
            )
        } catch (err) {
            setError(err.message)
        }
    }

    if (!loggedinUser || !loggedinUser.isAdmin) {
        return <h2>Admin access only</h2>
    }

    return (
        <section className="user-index">
            <h1>User Management</h1>

            {error && <p className="user-error">{error}</p>}

            <ul>
                {users.map(user => (
                    <li key={user._id}>
                        <span className="user-info">
                            {user.fullname} ({user.username})
                            {user.isAdmin && ' - Admin'}
                        </span>

                        <button
                            className="btn-danger"
                            onClick={() => onRemoveUser(user._id)}
                            disabled={user._id === loggedinUser._id}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    )
}
