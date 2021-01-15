const key = require('../keys/index')
const jwt = require('jsonwebtoken')


function auth(req, res, next) {
    let token = req.headers['authorization']
    if (!token) {
        return res.send('где токен')
    }
    token = token.replace('Bearer ', '')

    jwt.verify(token, "Pravate", function (err, decoded) {
        console.log(decoded._id)
        if (err) {
            return res.status(401).json({
                success: false,
                message: "Зарегистрируйтесь пожалуйста, или выполните вход"
            })
        } else {
            next()
        }
    })
}

module.exports = auth