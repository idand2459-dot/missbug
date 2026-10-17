import express from 'express';

const app = express();

app.get('/',(req,res)=>{
    res.send('Hello there')
})

const port=3030
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})