
const { NavLink } = ReactRouterDOM

export function AppHeader({ loggedinUser, onLogout }) {
    return (
        <header className="app-header main-content single-row">
            <h1>Miss Bug</h1>

            <nav>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/bug">Bugs</NavLink>
                <NavLink to="/about">About</NavLink>

                {loggedinUser ? (
                    <span>
                        Welcome, {loggedinUser.username}

                        <NavLink to="/user">
                            My Profile
                        </NavLink>

                        {loggedinUser.isAdmin && (
                            <NavLink to="/user/list">
                                Manage Users
                            </NavLink>
                        )}

                        <button onClick={onLogout}>
                            Logout
                        </button>
                    </span>
                ) : (
                    <NavLink to="/login">Login</NavLink>
                )}
            </nav>
        </header>
    )
}
