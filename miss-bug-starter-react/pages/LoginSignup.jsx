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
        <div>
            <h1>Login / Signup</h1>

            <div>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />

                {isSignup && (
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                    />
                )}

                <button onClick={isSignup ? handleSignup : handleLogin}>
                    {isSignup ? 'Signup' : 'Login'}
                </button>

                <button onClick={() => setIsSignup(!isSignup)}>
                    {isSignup ? 'Switch to Login' : 'Switch to Signup'}
                </button>
            </div>
        </div>
    )
}

