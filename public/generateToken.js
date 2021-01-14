const jwt = require('jsonwebtoken')
const keys =require('../keys/index')

function generateToken(user) {
    let u = {
        name: user.name,
        email: user.email,
        _id: user._id
    }
    return token = jwt.sign(u, "Pravate",{
    })
}

module.exports = generateToken