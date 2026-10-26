import Cryptr from 'cryptr'

const crypter = new Cryptr(process.env.SECRET1 || 'secret123')

export const authService = {
    getLoginToken,
    validateToken
}

function getLoginToken(user) {
    const newUser = {
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
        isAdmin: user.isAdmin
    }

    return crypter.encrypt(JSON.stringify(newUser))
}

  function validateToken(loginToken) {
    try {
        const decrypted = crypter.decrypt(loginToken)
        return JSON.parse(decrypted)
    } catch (err) {
        console.error('Invalid login token', err)
        return null
    }
}