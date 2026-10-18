import express from 'express';
import { bugService } from './service/bug.service.js';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.static('miss-bug-starter-react'))
app.use(cookieParser());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Hello there')
})

app.get('/api/bug', async (req, res) => {
    try {
        const bugs = await bugService.query();
        res.send(bugs);
    } catch (err) {
        res.status(500).send('Failed to fetch bugs');
    }
});

app.post('/api/bug', async (req, res) => {
   try{
    const bug=req.body;
    bug.severity = Number(bug.severity);
    const savedBug = await bugService.save(bug);
    res.send(savedBug);
   } catch (err) {
       res.status(500).send('Failed to save bug');
   }
});

app.put('/api/bug/:bugId', async (req, res) => {
    try{
        const bugId=req.params.bugId;
        const bug=req.body;
        bug.severity=Number(bug.severity);
        bug._id=bugId;
        const savedBug = await bugService.save(bug);
        res.send(savedBug);
    } catch (err) {
        res.status(500).send('Failed to update bug');
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

app.get('/api/bug/:bugId/remove', async (req, res) => {
    try{
        const removeBug=await bugService.remove(req.params.bugId);
        res.send(removeBug);
    } catch (err) {
        res.status(500).send('Failed to remove bug');
    }
});


const port=3030
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})