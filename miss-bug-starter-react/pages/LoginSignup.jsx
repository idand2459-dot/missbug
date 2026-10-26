const { useState } = React

import { userService } from '../services/user.service.js'

export function LoginSignup({ onLogin }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isSignup, setIsSignup] = useState(false)
    const [fullName, setFullName] = useState('')

    async function handleLogin() {
        try {
            const user = await userService.login({
                username,
                password
            })

            onLogin(user)
            console.log('Logged in user:', user)
        } catch (err) {
            console.error(err)
        }
    }

    async function handleSignup() {
        try {
            const user = await userService.signup({
                username,
                password,
                fullname: fullName
            })

            onLogin(user)
            console.log('Signed up user:', user)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="auth-page">
            <h1>Login / Signup</h1>

            <div className="auth-card">
                <div className="field">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </div>

                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>

                {isSignup && (
                    <div className="field">
                        <label htmlFor="fullname">Full Name</label>
                        <input
                            id="fullname"
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                        />
                    </div>
                )}

                <button className="btn-primary" onClick={isSignup ? handleSignup : handleLogin}>
                    {isSignup ? 'Signup' : 'Login'}
                </button>

                <button className="btn-secondary" onClick={() => setIsSignup(!isSignup)}>
                    {isSignup ? 'Switch to Login' : 'Switch to Signup'}
                </button>
            </div>
        </div>
    )
}

