const router        = require('express').Router();
const {User}        = require('./../models/user');
const _             = require('lodash');
const {ObjectID}    = require('mongodb');
var {authenticate}  = require('./../middleware/authenticate');

// POST /users aka create a user
router.post('/',(req,res) => {
    var body = _.pick(req.body,['email', 'password','name','address','suburb','state','postcode', 'phone', 'mobile']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth',token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    })

});

router.get('/me', authenticate, (req, res) => {
    res.send(req.user);
});

// POST /users/login {email, password}
router.post('/login', (req, res) => {
    var body = _.pick(req.body,['email', 'password']);
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth',token).send(user);
        });
    }).catch((e) => {
        res.status(400).send(e);
    });
});

router.delete('/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.sendStatus(200);
    },() => {
       res.sendStatus(400); 
    });
});

module.exports = router;