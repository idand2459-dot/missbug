const { useState } = React
const { useNavigate } = ReactRouterDOM

import { userService } from '../services/user.service.js'

export function LoginSignup({ onLogin }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isSignup, setIsSignup] = useState(false)
    const [fullName, setFullName] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    async function handleLogin() {
        setError('')
        try {
            const user = await userService.login({
                username,
                password
            })

            onLogin(user)
            console.log('Logged in user:', user)
            navigate('/')
        } catch (err) {
            console.error(err)
            setError(getErrorMsg(err))
        }
    }

    async function handleSignup() {
        setError('')
        try {
            const user = await userService.signup({
                username,
                password,
                fullname: fullName
            })

            onLogin(user)
            console.log('Signed up user:', user)
            navigate('/')
        } catch (err) {
            console.error(err)
            setError(getErrorMsg(err))
        }
    }

    function getErrorMsg(err) {
        const msg = err && err.message
        if (!msg || msg === 'Failed to fetch') return 'Something went wrong. Please try again.'
        return msg
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

                {error && <p className="auth-error" role="alert">{error}</p>}

                <button className="btn-primary" onClick={isSignup ? handleSignup : handleLogin}>
                    {isSignup ? 'Signup' : 'Login'}
                </button>

                <button className="btn-secondary" onClick={() => { setIsSignup(!isSignup); setError('') }}>
                    {isSignup ? 'Switch to Login' : 'Switch to Signup'}
                </button>
            </div>
        </div>
    )
}

