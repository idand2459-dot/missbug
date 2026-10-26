export const userService = {
    login,
    signup,
    logout,
    getLoggedinUser
}

function login(credentials) {
    return fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    })
    .then(async res => {
        if (!res.ok) throw new Error(await res.text() || 'Login failed')
        return res.json()
    })
    .then(user => {
        sessionStorage.setItem('loggedinUser', JSON.stringify(user))
        return user
    })
}

function signup(credentials) {
    return fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    })
    .then(async res => {
        if (!res.ok) throw new Error(await res.text() || 'Signup failed')
        return res.json()
    })
    .then(() => {
        return login({
            username: credentials.username,
            password: credentials.password
        })
    })
}

function logout() {
    return fetch('/api/auth/logout', {
        method: 'POST'
    })
    .then(res => {
        if (!res.ok) throw new Error('Logout failed')

        sessionStorage.removeItem('loggedinUser')
    })
}

function getLoggedinUser() {
    return JSON.parse(sessionStorage.getItem('loggedinUser'))
}