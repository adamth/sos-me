const expect                = require('expect');
const request               = require('supertest');
const {ObjectID}            = require('mongodb');
const _                     = require('lodash');

const {app}                 = require('./../server');
const {Tag}                 = require('./../models/tag');
const {Contact}             = require('./../models/contact');
const {User}                = require('./../models/user');
const {tags, 
        users,
        contacts,
        populateTags,
        populateUsers,
        populateContacts}   = require('./seed/seed');
//const {User} = require('./../models/user');

beforeEach(populateTags);
beforeEach(populateUsers);
beforeEach(populateContacts);

describe('POST /tags',() => {
    var objectID = new ObjectID();
    var tag = {
        code: 564332343,
        pin: 4567
    };

    it('should post a tag',(done) => {
        request(app)
        .post('/tags')
        .send(tag)
        .expect(200)      
        .expect((res) => {
            expect(res.body.tag.code).toBe(tag.code);
            expect(res.body.tag.pin).toBe(tag.pin);
            expect(res.body.tag._user).toBe(null);
        })
        .end((err, res) => {
            if(err){
                return done(err);
            }

            Tag.find({code: tag.code}).then((res) => {
                expect(res.length).toBe(1);
                expect(res[0].code).toBe(tag.code);
                expect(res[0].pin).toBe(tag.pin);
                done();
            }).catch((e) => done(e));
        });
    });

    it('should not create a tag with an invalid code', (done) => {
        tag.code = "1"
        request(app)
        .post('/tags')
        .send(tag)
        .expect(400)
        .end((err, res) => {
            Tag.find().then((res) => {
                expect(res.length).toBe(4);
                done();
            }).catch((e) => done(e));
        });
    });
});


describe('PATCH /activate', () => {
    it('should activate a tag for authenticated user', (done) => {
        activateTag = _.pick(tags[2],['code', 'pin']);

        request(app)
        .patch('/tags/activate')
        .send(activateTag)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.tag._user).toBe(users[0]._id.toHexString());
        })
        .end((err,res) => {
            if(err)
            {
                return done(err);
            }

            Tag.findOne(activateTag).then((tag) => {
                expect(tag.active).toBe(true);
                done()
            }).catch((e) => done(e));
        });
    });

    it('should not activate a tag for unauthenticated user', (done) => {
        activateTag = _.pick(tags[2],['code', 'pin']);

        request(app)
        .patch('/tags/activate')
        .send(activateTag)
        .expect(401)
        .end(done);
    });

    it('should not activate a tag already activated', (done) => {
        activateTag = _.pick(tags[0],['code', 'pin']);

        request(app)
        .patch('/tags/activate')
        .set('x-auth', users[0].tokens[0].token)
        .send(activateTag)
        .expect(403)
        .end(done);
    });

    it('should not activate an invalid tag', (done) => {
        activateTag = {
            code: '123',
            pin: '123'
        }

        request(app)
        .patch('/tags/activate')
        .send(activateTag)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});

describe('GET /tags',() => {
        it('should get all tags for an authenticated user', (done) => {
        request(app)
        .get('/tags')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.tags.length).toBe(1);
        })
        .end(done);
    });

    it('should not get tags for an unauthenticated user', (done) => {
        request(app)
        .get('/tags')
        .expect(401)
        .end(done);
    });

});

describe('GET /tags/:id', () => {
    it('should get a single tag by id for an authenticated user', (done) => {
        request(app)
        .get(`/tags/${tags[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.tag.code).toBe(tags[0].code);
            expect(res.body.tag.pin).toBe(tags[0].pin);
        })
        .end(done);

    });

    it('should not get a single tag by id for an unauthenticated user', (done) => {
        request(app)
        .get(`/tags/${tags[0]._id.toHexString()}`)
        .expect(401)
        .end(done);
    });

    it('should return 404 for tag with invalid id', (done) => {
        var id = new ObjectID();
        request(app)
        .get(`/tags/${id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});

describe('PATCH /assign', ()=> {
    it('should assign a contact to a tag for authenticatd user', (done) => {
        var tagId = tags[3]._id.toHexString();
        var contactId = contacts[1]._id.toHexString();
        request(app)
        .patch('/tags/assign')
        .set('x-auth', users[1].tokens[0].token)
        .send({tag: tagId, contact: contactId})
        .expect(200)
        .expect((res) => {
            expect(res.body.tag._contact).toBe(contactId);
        })
        .end((err,res) => {
            if(err)
            {
                return done(err);
            }

            Tag.findById(tags[3]._id).then((tag) => {
                expect(tag._contact).toEqual(contacts[1]._id);
                done()
            }).catch((e) => done(e));
        });
    });

    it('should not assign an invalid contact to a tag for authenticated user', (done) => {
        var tagId = tags[3]._id.toHexString();
        var contactId = contacts[0]._id.toHexString();
        request(app)
        .patch('/tags/assign')
        .set('x-auth', users[1].tokens[0].token)
        .send({tag: tagId, contact: contactId})
        .expect(404)
        .end(done);
    });

    it('should not assign a tag for unauthenticated user', (done) => {
        var tagId = tags[3]._id.toHexString();
        var contactId = contacts[1]._id.toHexString();
        request(app)
        .patch('/tags/assign')
        .send({tag: tagId, contact: contactId})
        .expect(401)
        .end(done);
    });
});

describe('PATCH /tags/:id', () => {

    it('should assign a contact to a tag for authenticated user',(done) => {
        var body = {
            _contact: contacts[0]._id
        }
        request(app)
        .patch(`/tags/${tags[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .send(body)
        .expect(200)
        .expect((res) => {
            expect(res.body.tag._contact).toBe(contacts[0]._id.toHexString());
            done();
        })
        .end((err, res) => {
            if(err)
            {
                return done(err);
            }
        });
    });

    it('should not assign a contact to a tag for unauthenticated user',(done) => {
        var body = {
            _contact: contacts[0]._id
        }
        request(app)
        .patch(`/tags/${tags[0]._id.toHexString()}`)
        .send(body)
        .expect(401)
        .end(done);
    });

    it('should not update a tag with invalid data', (done) => {
        var invalidTag = {
            _contact: 'hello'
        };
        request(app)
        .patch(`/tags/${tags[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .send(invalidTag)
        .expect(400)
        .end(done);
    });
    //TODO: it should not make a change to a tag that the user does not own
});

describe('DELETE /tags/:id', () => {
    it('should remove a tag for authenticated user', (done) => {
        request(app)
        .delete(`/tags/${tags[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.tag.code).toBe(tags[0].code)
        })
        .end((err,res) => {
            if(err)
            {
                return done(err);
            }
            Tag.findById(tags[0]._id).then((tag) => {
                expect(tag).toNotExist();
                done();
            }).catch((e) => done(e));
        })
    });

    it('should not remove a tag for unauthenticated user', (done) => {
        request(app)
        .delete(`/tags/${tags[0]._id.toHexString()}`)
        .expect(401)
        .end(done);
    });

    it('should not remove a tag with an invalid id', (done) => {
        var id = new ObjectID();

        request(app)
        .delete(`/tags/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});

describe('GET /contacts', () => {
    it('should return a list of contacts for an authenticated user', (done) => {
        request(app)
        .get('/contacts')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.contacts.length).toBe(1);
        })
        .end(done);
    });

    it('should not return a list of contacts for unauthenticated user', (done) => {
        request(app)
        .get('/contacts')
        .expect(401)
        .end(done);
    });
});

describe('GET /contacts/:id', () => {
    var hexId = contacts[0]._id.toHexString();

    it('should return a single contact for an authenticated user', (done) => {
        request(app)
        .get(`/contacts/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.contact.name).toBe(contacts[0].name);
        })
        .end(done);
    });

    it('should not return a single contact for unauthenticated user', (done) => {
        request(app)
        .get(`/contacts/${hexId}`)
        .expect(401)
        .end(done);
    });

    it('should return 404 for contact with invalid id',(done) => {
        request(app)
        .get(`/contacts/${hexId + 1}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});

describe('POST /contacts',() => {
    var testContact = {
            _id: new ObjectID(),
            name:"Jenna Thompson",
            phone:"98655986",
            mobile:"0412345678",
            address:"123 Fake St",
            postCode:"1234",
            suburb:"Faketown",
            notes:"Known to crack it for no reason",
            _user: users[0]._id
        }

    it('should create a new contact for authenticated user',(done) => {
        request(app)
        .post('/contacts')
        .set('x-auth', users[0].tokens[0].token)
        .send(testContact)
        .expect(200)
        .expect((res) => {
            expect(res.body.contact.name).toBe(testContact.name);
            expect(res.body.contact._user).toBe(users[0]._id.toHexString());
        })
        .end((err,res) => {
            if(err)
            {
                return done(err);
            }
            
            Contact.find({_id: testContact._id}).then((contact) => {
                expect(contact[0].name).toBe(testContact.name);
                expect(contact[0]._user).toEqual(users[0]._id);
                done();
            }).catch((e) => done(e));
        });
    });

    it('should not create a new contact for unauthenticated user',(done) => {
        request(app)
        .post('/contacts')
        .send(testContact)
        .expect(401)
        .end(done);
    });

    it('should not create an invalid contact for authenticated user', (done) => {
        testContact.name = '';
        request(app)
        .post('/contacts')
        .set('x-auth', users[0].tokens[0].token)
        .send(testContact)
        .expect(400)
        .end(done);
    });
});

describe('PATCH /contacts', () => {
    
    it('should update a cotnact for authenticated user',(done) => {
        var patchContact = {
            phone: '12345678',
            mobile: '0412345678',
            address: '123 Fake St'
        }
        var hexId = contacts[0]._id.toHexString();
        request(app)
        .patch(`/contacts/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
        .send(patchContact)
        .expect(200)
        .expect((res) => {
            expect(res.body.contact.phone).toBe(patchContact.phone);
            expect(res.body.contact.mobile).toBe(patchContact.mobile);
            expect(res.body.contact.address).toBe(patchContact.address);
        })
        .end(done);
    });

    it('should not update a cotnact for unauthenticated user',(done) => {
        var patchContact = {
            phone: '12345678',
            mobile: '0412345678',
            address: '123 Fake St'
        }
        var hexId = contacts[0]._id.toHexString();
        request(app)
        .patch(`/contacts/${hexId}`)
        .send(patchContact)
        .expect(401)
        .end(done);
    });

    it('should not update a contact with invalid details for authenticated user', (done) => {
        var patchContact = {
            phone: '1',
            mobile: '0412345678',
            address: '123 Fake St'
        }
        var hexId = contacts[1]._id.toHexString();

        request(app)
        .patch(`/contacts/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
        .send(patchContact)
        .expect(400)
        .end(done);
    });
});

describe('DELETE /contacts/:id',() => {
    var hexId = contacts[0]._id.toHexString();

    it('should delete a contact for authenticated user',(done) => {
        request(app)
        .delete(`/contacts/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.contact._id).toBe(hexId);
        })
        .end((err,res) => {
            if(err)
            {
                return done(err);
            }

            Contact.findById(contacts[0]._id).then((contact) => {
                expect(contact).toNotExist();
                done();
            }).catch((e) => done(e));
        });
    });

    it('should not delete a contact for unauthenticated user',(done) => {
        request(app)
        .delete(`/contacts/${hexId}`)
        .expect(401)
        .end(done);
    });

    it('should not delete a contact with invalid id for authenticated user',(done) => {
        request(app)
        .delete(`/contacts/${hexId + 1}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticatd', (done) => {
        request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });

    it('should return a 401 if not authenticated', (done) => {
        request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
            expect(res.body).toEqual({});
        })
        .end(done);
    })
});

describe('POST /users',() => {
    it('should create a new user',(done) => {
        var email = 'passing@adamth.com'
        var password = 'P@ssw0rd'
        var name = 'New user'

        request(app)
        .post('/users')
        .send({email, password, name})
        .expect(200)
        .expect((res) => {
            expect(res.body.email).toBe(email);
            expect(res.headers['x-auth']).toExist();
            expect(res.body._id).toExist();
        })
        .end((err) => {
            if(err){
                return done(err);
            }

            User.findOne({email}).then((user) =>{
                expect(user).toExist();
                expect(user.password).toNotBe(password);
                done();
            }).catch((e) => done(e));
        });
    });

    it('should reutrn validation errors if request invalid', (done) => {
        request(app)
        .post('/users')
        .send({email:'test', password:'12'})
        .expect(400)
        .end(done);
    });

    it('should not create user if email is in use', (done) => {
        request(app)
        .post('/users')
        .send({email: users[0].email, password: users[0].password})
        .expect(400)
        .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
        .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
        .end((err, res) => {
            if(err){
                return done(err);
            }
            User.findById(users[1]._id).then((user) => {
                expect(user.tokens[1]).toInclude({
                    access: 'auth',
                    token: res.headers['x-auth']
                });
                done();
            }).catch((e) => done(e));
        });
    });

    it('should reject invalid login', (done) => {
        request(app)
        .post('/users/login')
        .send({email: users[1].email + '1', password: users[1].password})
        .expect(400)
        .expect((res) =>{
            expect(res.headers['x-auth']).toNotExist();
        })
        .end((err) => {
            if(err){
                return done(err);
            }
            User.findById(users[1]._id).then((user) => {
                expect(user.tokens.length).toEqual(1);
                done();
            }).catch((e) => done(e));
        });
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on log out',(done) => {
        request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end((err) => {
            if(err){
                return done(err);
            }
            User.findById(users[0]._id).then((user) => {
                expect(user.tokens.length).toEqual(0);
                done();
            }).catch((e) => done(e));
        });
    });
});