import express from 'express';
import { bugService } from './service/bug.service.js';
import cookieParser from 'cookie-parser';
import { authService } from './service/auth.service.js';
import { userService } from './service/user.service.js';


const app = express();
app.use(express.static('miss-bug-starter-react'))
app.use(cookieParser());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Hello there')
})

app.get('/api/bug', async (req, res) => {
    try {
        const { txt, minSeverity, labels, sortBy, sortDir, pageIdx } = req.query

        const bugs = await bugService.query({
            txt,
            minSeverity,
            labels: labels
                ? (Array.isArray(labels) ? labels : [labels])
                : undefined,
            sortBy,
            sortDir: sortDir !== undefined ? Number(sortDir) : 1,
            pageIdx: pageIdx !== undefined ? Number(pageIdx) : undefined
        })

        res.send(bugs)
    } catch (err) {
        console.error('Failed to fetch bugs:', err)
        res.status(500).send('Failed to fetch bugs')
    }
})

app.post('/api/bug', async (req, res) => {
    try {
        const loggedinUser = authService.validateToken(req.cookies.loginToken)

        if (!loggedinUser) {
            return res.status(401).send('Login required')
        }

        const bug = req.body

        bug.creator = {
            _id: loggedinUser._id,
            fullname: loggedinUser.fullname
        }

        const savedBug = await bugService.save(bug)

        res.send(savedBug)

    } catch (err) {
        console.error('Failed to save bug', err)
        res.status(500).send('Failed to save bug')
    }
})

app.put('/api/bug/:bugId', async (req, res) => {
    try{
        const loggedinUser = authService.validateToken(req.cookies.loginToken)

        if (!loggedinUser) {
            return res.status(401).send('Login required')
        }
        const bug = await bugService.getById(req.params.bugId)
        if (!bug) {
            return res.status(404).send('Bug not found')
        }
        if(!loggedinUser.isAdmin && loggedinUser._id !== bug.creator._id) {
            return res.status(403).send('Forbidden')
        }

        bug.title = req.body.title
        bug.description = req.body.description
        bug.severity = Number(req.body.severity)
        bug.labels = req.body.labels 

        const updatedBug = await bugService.save(bug)
        res.send(updatedBug)
        
    } catch (err) {
        console.error('Failed to update bug', err)
        res.status(500).send('Failed to update bug')
    }
});

app.get('/api/bug/:bugId', async (req, res) => {
    try {
        const bugId = req.params.bugId
        const bug = await bugService.getById(bugId)

        if (!bug) {
            return res.status(404).send('Bug not found')
        }

        const visitedBugs = req.cookies.visitedBugs
            ? JSON.parse(req.cookies.visitedBugs)
            : []

        if (visitedBugs.length >= 3 && !visitedBugs.includes(bugId)) {
            return res.status(401).send('Wait for a bit')
        }

        if (!visitedBugs.includes(bugId)) {
            visitedBugs.push(bugId)
        }

        res.cookie('visitedBugs', JSON.stringify(visitedBugs), {
            maxAge: 7000
        })

        res.send(bug)

    } catch (err) {
        res.status(500).send('Failed to fetch bug')
    }
})

app.delete('/api/bug/:bugId', async (req, res) => {
    try {
        const user = authService.validateToken(req.cookies.loginToken)

        if (!user) {
            return res.status(401).send('Unauthorized')
        }

        const bug = await bugService.getById(req.params.bugId)

        if (!bug) {
            return res.status(404).send('Bug not found')
        }


        if (!user.isAdmin && user._id !== bug.creator._id) {
            return res.status(403).send('Forbidden')
        }

        const removedBug = await bugService.remove(req.params.bugId)
        res.send(removedBug)

    } catch (err) {
        console.error('Failed to remove bug', err)
        res.status(500).send('Failed to remove bug')
    }
})

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password, fullname } = req.body

        const user = {
            username,
            password,
            fullname,
            isAdmin: false
        }

        const savedUser = await userService.save(user)

        const miniUser = {
            _id: savedUser._id,
            username: savedUser.username,
            fullname: savedUser.fullname,
            isAdmin: savedUser.isAdmin
        }

        res.status(201).send(miniUser)

    } catch (err) {
        console.error('Failed to sign up user', err)
        res.status(500).send('Failed to sign up user')
    }
})

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await userService.checkLogin(username, password);
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken, {
         httpOnly: true,
         sameSite: 'lax'
        })
        const miniUser = {
            _id: user._id,
            username: user.username,
            fullname: user.fullname,
            isAdmin: user.isAdmin
        }
        res.send(miniUser);
    } catch (err) {
        console.error('Failed to login user', err)
        res.status(500).send('Failed to login user');
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('Logged out successfully')
})

app.get('/api/user', async (req, res) => {
    try {
        const loggedinUser = authService.validateToken(
            req.cookies.loginToken
        )

        if (!loggedinUser) {
            return res.status(401).send('Login required')
        }

        if (!loggedinUser.isAdmin) {
            return res.status(403).send('Admin only')
        }

        const users = await userService.query()

        const safeUsers = users.map(user => ({
            _id: user._id,
            username: user.username,
            fullname: user.fullname,
            isAdmin: user.isAdmin
        }))

        res.send(safeUsers)

    } catch (err) {
        console.error('Failed to fetch users', err)
        res.status(500).send('Failed to fetch users')
    }
})

app.delete('/api/user/:userId', async (req, res) => {
    try {
        const loggedinUser = authService.validateToken(
            req.cookies.loginToken
        )

        if (!loggedinUser) {
            return res.status(401).send('Login required')
        }

        if (!loggedinUser.isAdmin) {
            return res.status(403).send('Admin only')
        }

        const userId = req.params.userId

        const user = await userService.getById(userId)

        if (!user) {
            return res.status(404).send('User not found')
        }

        const bugs = await bugService.query({})

        const hasBugs = bugs.some(bug =>
            bug.creator && bug.creator._id === userId
        )

        if (hasBugs) {
            return res.status(400).send(
                'Cannot delete a user who has bugs'
            )
        }

        const removedUser = await userService.remove(userId)

        res.send({
            _id: removedUser._id,
            username: removedUser.username,
            fullname: removedUser.fullname,
            isAdmin: removedUser.isAdmin
        })

    } catch (err) {
        console.error('Failed to remove user', err)
        res.status(500).send('Failed to remove user')
    }
})

const port=3030
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})