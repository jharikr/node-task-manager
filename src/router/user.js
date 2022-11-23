const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancellationEmail } = require('../email/account')

const router = new express.Router();

// create a user; sign up
router.post('/users', async ({ body } = {}, res) => {
    const user = new User(body);
    try {
        await user.save();
        //sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

// login in a user 
router.post('/users/login/', async ({ body: { email, password } } = {}, res) => {
    try {
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send()
    }
});

// logout user from a session
router.post('/users/logout', auth, async ({ token: reqToken, user } = {}, res) => {
    try {
        user.tokens = user.tokens.filter(token => token.token !== reqToken );
        await user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// logout user from all sesssions
router.post('/users/logoutAll', auth, async ({ user } = {}, res) => {
    try {
        user.tokens = [];
        await user.save();
        res.send();
    }
    catch (e) {
        res.status(500).send();
    }
});

// fetch the logged in user
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

// update a user
router.patch('/users/me', auth, async ({ user, body } = {}, res) => {
    const updates = Object.keys(body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
       return res.status(400).send({ error: 'Invalid update!' });
    }
    try {
        updates.forEach(update => user[update] = body[update]);
        await user.save();
        
        res.send(user);
    } catch (e) {
        res.status(400).send(e);
    }
});

// delete a user
router.delete('/users/me', auth, async ({ user }, res) => {
    try {
        await user.remove();
        //sendCancellationEmail(user.email, user.name);
        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
});

const upload = multer({ 
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        if ( !file.originalname.match(/\.(jpg|jpeg|png)$/) ) {
            return callback(new Error('Please upload an image'));
        }
        callback(undefined, true);
    }
 });

 // create a user profile
router.post('/users/me/avatar', auth, upload.single('avatar'), async ({ user, file } = {}, res) => {
    try {
        const buffer = await sharp(file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
        user.avatar = buffer;
        await user.save();

        res.send();
   } catch (e) {
        res.status(500).send();
   } 
}, ({ message }, req, res, next) => {
    res.status(400).send({ error: message })
});

// get a user profile
router.get('/users/:id/avatar', async ({ params: { id } }, res) => {
    try {
        const user = await User.findById(id)
        if(!user || !user.avatar) {
            throw new Error();
        }
        res
            .set('Content-Type', 'image/png')
            .send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

// delete a user profile
router.delete('/users/me/avatar', auth, async ({ user }, res) => {
    try {
        user.avatar = undefined;
        await user.save();

        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;