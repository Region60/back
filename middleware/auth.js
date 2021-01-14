const key = require('../keys/index')
const jwt = require('jsonwebtoken')


function auth(req, res, next) {
    let token = req.headers['authorization']
    if (!token) {
        return next()
    }
    token = token.replace('Bearer', '')
    console.log(token)

    jwt.verify(token, "Pravate", function (err, decoded) {
        console.log(decoded.foo)
        if (err) {
            return res.status(401).json({
                success: false,
                message: "Зарегистрируйтесь пожалуйста, или выполните вход"u
            })
        } else {
            next()
        }
    })
}

module.exports = auth