import fs from 'fs'
import {makeId} from './util.service.js'


export const userService = {
    query,
    getById,
    save,
    checkLogin,
    remove
}

async function query() {
    const data = await fs.promises.readFile('user.json', 'utf-8')
    return JSON.parse(data) 
}

async function getById(id) {
    const users = await query()
    return users.find(user => user._id === id)
}

async function save(user) {
    const users = await query()
    const existingUser = users.find(u=>u.username === user.username)
    if (existingUser) throw new Error('Username already exists')
    user._id=makeId()
    users.push(user)
    await fs.promises.writeFile('user.json', JSON.stringify(users, null, 2))
    return user
}

async function checkLogin(username, password) {
    const users = await query()
    const user = users.find(u => u.username === username && u.password === password)
    if (!user) throw new Error('Invalid username or password')
    return user
}

async function remove(id) {
    const users = await query()
    const idx = users.findIndex(u => u._id === id)
    if (idx === -1) throw new Error('User not found')
    const removedUser = users.splice(idx, 1)[0]
    await fs.promises.writeFile('user.json', JSON.stringify(users, null, 2))
    return removedUser
}