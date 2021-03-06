const router = require('express').Router();
const jwt = require('jsonwebtoken');
const hashPassword = require('../../utils/hashPassword');

module.exports = (db2) => {

    const User = require('../../db/user')(db2);

    // POST /users/login
    router.post('/login', async (req, res) => {
        try {
            const {username, password} = req.body;
            const result = await User.get(username);
            // TODO fix throws and catches
            const error = new Error();
            if (!(username && password)) {
                error.message = 'Invalid request';
                error.code = 'MissingCredentials';
                throw error;
            }

            if (result === null) {
                error.message = 'Invalid username or password';
                error.code = 'UserDoesntExist';
                throw error;
            }

            if (result.password.hash === hashPassword(password, result.password.salt, result.password.iterations)) {
                const payload = {
                    user: {
                        username,
                        eventId: result.eventId
                    }
                };
                const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRATION_TIME});
                res.status(200).json({token});
            }
            else {
                error.message = 'Invalid username or password';
                error.code = 'InvalidCredentials';
                throw error;
            }
        } catch (e) {
            console.log(e);
            if (e.code === 'MissingCredentials') {
                res.status(400);
            }
            else if (e.code in ['UserDoesntExist', 'InvalidCredentials']) {
                res.status(401);
            }
            else {
                res.status(500);
            }
            res.json({message: e.message});
        }
    });

    return router;

};