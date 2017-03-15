const router        = require('express').Router();
const {User}     = require('./../models/user');
const _             = require('lodash');
const {ObjectID}    = require('mongodb');

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

module.exports = router;