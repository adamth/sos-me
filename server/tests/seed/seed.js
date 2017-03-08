const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Tag}      = require('./../../models/tag');
const {User}      = require('./../../models/user');

var userOneId = new ObjectID();
var userTwoId = new ObjectID();

const users = [{
    _id: userOneId,
    email: "adam@adamth.com",
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'},process.env.JWT_SECRET).toString()
    }]
},{
    _id: userTwoId,
    email: "userTwo@hotmail.com",
    password: 'userTwoPass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'},process.env.JWT_SECRET).toString()
    }]
}
]

const tags = [{
    contact: "Adam Thompson",
    phone: "12345678",
    _creator: userOneId
},{
    contact: "Peter Laws",
    phone: "12345678",
    _creator: userTwoId
}];

const populateTags = (done) => {
    Tag.remove({}).then(()=>{
        var tagOne = new Tag(tags[0]).save();
        var tagTwo = new Tag(tags[1]).save();

        return Promise.all([tagOne, tagTwo]);
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo])
    }).then(() => done());
};

module.exports = {tags, populateTags, users, populateUsers}