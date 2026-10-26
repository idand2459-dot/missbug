
const { useState } = React
const { HashRouter, Routes, Route } = ReactRouterDOM

import { userService } from './services/user.service.js'

import { UserMsg } from './cmps/UserMsg.jsx'
import { AppHeader } from './cmps/AppHeader.jsx'
import { AppFooter } from './cmps/AppFooter.jsx'

import { Home } from './pages/Home.jsx'
import { BugIndex } from './pages/BugIndex.jsx'
import { BugDetails } from './pages/BugDetails.jsx'
import { AboutUs } from './pages/AboutUs.jsx'
import { LoginSignup } from './pages/LoginSignup.jsx'
import { UserDetails } from './pages/UserDetails.jsx'
import { UserIndex } from './pages/UserIndex.jsx'

export function App() {
    const [loggedinUser, setLoggedinUser] = useState(
        userService.getLoggedinUser()
    )

    async function onLogout() {
        try {
            await userService.logout()
            setLoggedinUser(null)
            console.log('Logged out successfully')
        } catch (err) {
            console.error('Logout failed:', err)
        }
    }

    return (
        <HashRouter>
            <div className="app-wrapper">
                <UserMsg />

                <AppHeader
                    loggedinUser={loggedinUser}
                    onLogout={onLogout}
                />

                <main className="container">
                    <Routes>
                        <Route
                            path="/"
                            element={<Home />}
                        />

                        <Route
                            path="/bug"
                            element={
                                <BugIndex loggedinUser={loggedinUser} />
                            }
                        />

                        <Route
                            path="/bug/:bugId"
                            element={<BugDetails />}
                        />

                        <Route
                            path="/about"
                            element={<AboutUs />}
                        />

                        <Route
                            path="/login"
                            element={
                                <LoginSignup onLogin={setLoggedinUser} />
                            }
                        />

                        <Route
                            path="/user"
                            element={
                                <UserDetails loggedinUser={loggedinUser} />
                            }
                        />
                        <Route
                            path="/user/list"
                            element={
                                <UserIndex loggedinUser={loggedinUser} />
                            }
                        />
                    </Routes>
                </main>

                <AppFooter />
            </div>
        </HashRouter>
    )
}
