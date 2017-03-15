const expect                = require('expect');
const request               = require('supertest');
const {ObjectID}            = require('mongodb');
const _                     = require('lodash');

const {app}                 = require('./../server');
const {Tag}                 = require('./../models/tag');
const {Contact}             = require('./../models/contact');
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
            expect(res.body.code).toBe(tag.code);
            expect(res.body.pin).toBe(tag.pin);
            expect(res.body._user).toBe(null);
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
                expect(res.length).toBe(3);
                done();
            }).catch((e) => done(e));
        });
    });
});


describe('GET /tags',() => {
        it('should get all tags', (done) => {
        request(app)
        .get('/tags')
        .expect(200)
        .expect((res) => {
            expect(res.body.tags.length).toBe(3);
        })
        .end(done);
    });

});

describe('GET /tags/:id', () => {
    it('should get a single tag by id', (done) => {
        request(app)
        .get(`/tags/${tags[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.tag.code).toBe(tags[0].code);
            expect(res.body.tag.pin).toBe(tags[0].pin);
        })
        .end(done);
    });

    it('should return 404 for tag with invalid id', (done) => {
        var id = new ObjectID();
        request(app)
        .get(`/tags/${id.toHexString()}`)
        .expect(404)
        .end(done);
    });
});

describe('PATCH /tags/:id', () => {
        it('should assign a user and activate a tag',(done) => {
        var body = {
            active: true,
            _user: users[0]._id
        }
        request(app)
        .patch(`/tags/${tags[2]._id.toHexString()}`)
        .send(body)
        .expect(200)
        .expect((res) => {
            expect(res.body.tag.active).toBe(true);
            expect(res.body.tag._user).toBe(users[0]._id.toHexString());
            done();
        })
        .end((err, res) => {
            if(err)
            {
                return done(err);
            }
        });
    });

    it('should assign a contact to a tag',(done) => {
        var body = {
            _contact: contacts[0]._id
        }
        request(app)
        .patch(`/tags/${tags[2]._id.toHexString()}`)
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

    it('should not update a tag with invalid data', (done) => {
        var invalidTag = {
            _contact: 'hello'
        };
        request(app)
        .patch(`/tags/${tags[2]._id.toHexString()}`)
        .send(invalidTag)
        .expect(400)
        .end(done);
    });
    //TODO: it should not make a change to a tag that the user does not own
});

describe('DELETE /tags/:id', () => {
    it('should remove a tag', (done) => {
        request(app)
        .delete(`/tags/${tags[2]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.tag.code).toBe(tags[2].code)
        })
        .end((err,res) => {
            if(err)
            {
                return done(err);
            }
            Tag.findById(tags[2]._id).then((tag) => {
                expect(tag).toNotExist();
                done();
            }).catch((e) => done(e));
        })
    });

    it('should not remove a tag with an invalid id', (done) => {
        var id = new ObjectID();

        request(app)
        .delete(`/tags/${id}`)
        .expect(404)
        .end(done);
    });
});

describe('GET /contacts', () => {
    it('should return a list of contacts', (done) => {
        request(app)
        .get('/contacts')
        .expect(200)
        .expect((res) => {
            expect(res.body.contacts.length).toBe(2);
        })
        .end(done);
    });
});

describe('GET /contacts/:id', () => {
    var hexId = contacts[0]._id.toHexString();

    it('should return a single contact', (done) => {
        request(app)
        .get(`/contacts/${hexId}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.contact.name).toBe(contacts[0].name);
        })
        .end(done);
    });

    it('should return 404 for contact with invalid id',(done) => {
        request(app)
        .get(`/contacts/${hexId + 1}`)
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

    it('should create a new contact',(done) => {
        request(app)
        .post('/contacts')
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

    it('should not create an invalid contact', (done) => {
        testContact.name = '';
        request(app)
        .post('/contacts')
        .send(testContact)
        .expect(400)
        .end(done);
    });
});

describe('PATCH /contacts', () => {
    
    it('should update a cotnact',(done) => {
        var patchContact = {
            phone: '12345678',
            mobile: '0412345678',
            address: '123 Fake St'
        }
        var hexId = contacts[0]._id.toHexString();
        request(app)
        .patch(`/contacts/${hexId}`)
        .send(patchContact)
        .expect(200)
        .expect((res) => {
            expect(res.body.contact.phone).toBe(patchContact.phone);
            expect(res.body.contact.mobile).toBe(patchContact.mobile);
            expect(res.body.contact.address).toBe(patchContact.address);
        })
        .end(done)
    });

    it('should not update a contact with invalid details', (done) => {
        var patchContact = {
            phone: '1',
            mobile: '0412345678',
            address: '123 Fake St'
        }
        var hexId = contacts[1]._id.toHexString();

        request(app)
        .patch(`/contacts/${hexId}`)
        .send(patchContact)
        .expect(400)
        .end(done);
    });
});

describe('DELETE /contacts/:id',() => {
    var hexId = contacts[0]._id.toHexString();

    it('should delete a contact',(done) => {
        request(app)
        .delete(`/contacts/${hexId}`)
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

    it('should not delete a contact with invalid id',(done) => {
        request(app)
        .delete(`/contacts/${hexId + 1}`)
        .expect(404)
        .end(done);
    });
});