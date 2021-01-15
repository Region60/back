const jwt = require('jsonwebtoken')
const keys =require('../keys/index')

function generateToken(user) {
    let u = {
        name: user.name,
        email: user.email,
        _id: user._id
    }
    console.log(u)
    return token = jwt.sign(u, "Pravate",{
        expiresIn: 60
    })
}

module.exports = generateToken