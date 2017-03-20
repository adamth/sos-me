const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Tag}      = require('./../../models/tag');
const {User}      = require('./../../models/user');
const {Contact}      = require('./../../models/contact');

var userOneId = new ObjectID();
var userTwoId = new ObjectID();

var contactOneId = new ObjectID();
var contactTwoId = new ObjectID();

var tagOneId = new ObjectID();
var tagTwoId = new ObjectID();
var tagThreeId = new ObjectID();
var tagFourId = new ObjectID();

const users = [{
    _id: userOneId,
    email: "adam@adamth.com",
    password: 'userOnePass',
    name: "Adam Thompson",
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'},process.env.JWT_SECRET).toString()
    }]
},{
    _id: userTwoId,
    email: "userTwo@hotmail.com",
    password: 'userTwoPass',
    name:"User Two",
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'},process.env.JWT_SECRET).toString()
    }]
}
]

const contacts = [
    {
        _id: contactOneId,
        name:"Contact One",
        _user: userOneId
    },
    {
        _id: contactTwoId,
        name:"Contact Two",
        _user: userTwoId
    }
]

const tags = [{
    _id: tagOneId,
    code: 12345678,
    pin: 1234,
    _contact: contactOneId,
    _user: userOneId,
    active: true
},{
    _id: tagTwoId,
    code: 87654321,
    pin: 4321,
    _contact: contactTwoId,
    _user: userTwoId,
    active: true
},{
    _id: tagThreeId,
    code: 12357912,
    pin: 5678
},{
    _id: tagFourId,
    code: 58493098,
    pin: 4321,
    _user: userTwoId,
    active: true
}];

const populateTags = (done) => {
    Tag.remove({}).then(()=>{
        var tagOne = new Tag(tags[0]).save();
        var tagTwo = new Tag(tags[1]).save();
        var tagThree = new Tag(tags[2]).save();
        var tagFour = new Tag(tags[3]).save();

        return Promise.all([tagOne, tagTwo, tagThree, tagFour]);
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo])
    }).then(() => done());
};

const populateContacts = (done) => {
    Contact.remove({}).then(() => {
        var contactOne = new Contact(contacts[0]).save();
        var contactTwo = new Contact(contacts[1]).save();

        return Promise.all([contactOne, contactTwo]);
    }).then(() => done());
};

module.exports = {tags, populateTags, users, populateUsers, contacts, populateContacts}