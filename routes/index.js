const {Router} = require('express');
const crypto = require('crypto')
const router = Router()
const generateToken = require('../public/generateToken')
const auth = require('../middleware/auth')
const fs = require('fs')
const bcrypt = require('bcryptjs')
const User = require('../models/users')
const Image = require('../models/image')
const multer = require("multer")
const upload = multer({dest: 'uploads/'})

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', {title: 'BackEnd'});
});

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body
        const candidate = await User.findOne({email})
        if (!candidate) {
            return res.status(404).json({
                error: true,
                message: "Неправильный email или пароль"
            })
        }
        bcrypt.compare(password, candidate.password, function (err, valid) {
            if (!valid) {
                return res.status(404).json({
                    error: true,
                    message: "Неправильный email или пароль"
                })
            }
        })
        const token = generateToken(candidate)
        res.json({
            user: candidate,
            token
        })

    } catch (e) {
        console.log(e)
    }
})

router.post('/logout', async (req, res) => {
})

router.post('/loadImage', auth, upload.array('image_save', 30), async function (req, res, next) {
    try {
        await req.files.forEach((i) => {
            console.log(i)
            const {originalname, path, filename,} = i
            const newImage = new Image({originalname, path, filename})
            newImage.save()
        })
        res.redirect('/')

    } catch (e) {
        console.log(e)
    }
})

router.delete('/deleteImage', auth, async (req, res) => {
    try {
        for (const item of req.body) {
            const image = await Image.findOne({filename: item})
            await fs.unlink(image.path, function (err) {
                if (err) throw err;
            })
            await Image.deleteOne({filename: item})
        }
        console.log('file deleted');
        res.redirect('/')


    } catch (e) {
        console.log(e)
    }

})

router.get('/getImage', async (req, res) => {
    try {
        console.log(req.body)
        const options = {
            page: req.body.page,
            limit: req.body.quanity,
            collation: {
                locale: 'en',
            },
        };
        Image.paginate({}, options, (err, result) => {
            if (err) {
                console.log(err)
            }
            res.send(result)
        })
    } catch (e) {
        console.log(e)
    }
})


router.post('/register', async (req, res,) => {
    try {
        const {name, email, password} = req.body
        const candidate = await User.findOne({email})
        if (candidate) {
            console.log('Пользователь найден:' + candidate)
            res.send('Пользователь с таким email уже существует')
        } else {
            const hashPassword = await bcrypt.hash(password, 10)
            const user = new User({name, email, password: hashPassword})

            await user.save()
            console.log(user)

            /*await sgMail.send(regEmail(email))
                .then(() => {
                }, error => {
                    console.error(error);

                    if (error.response) {
                        console.error(error.response.body)
                    }
                });*/
            console.log('Пользователь создан:')
            res.send('Пользователь создан')
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/reset', async (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
            }
            const token = buffer.toString('hex')
            const candidate = await User.findOne({email: req.body.email})
            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
                await candidate.save()
                /*await sgMail.send(resetEmail(candidate.email, token))*/
            } else {
                console.log('Такого email нет')
                req.send('Такого email нет')
            }
        })
    } catch (e) {
        console.log(e)
    }
})

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return
    }
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        })
        if (!user) {
            return
        } else {
            /*error: req.flash('error'),
                userId: user._id.toString(), //передаем параметры userId, token
                token: req.params.token*/
        }

    } catch (e) {
        console.log(e)
    }
})

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        })
        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
        } else {
            console.log('Время жизни токена истекло')
        }
    } catch (e) {
        console.log(e)
    }
})


module.exports = router;
