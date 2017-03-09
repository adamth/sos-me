const expect                = require('expect');
const request               = require('supertest');
const {ObjectID}            = require('mongodb');
const _                     = require('lodash');

const {app}                 = require('./../server');
const {Tag}                 = require('./../models/tag');
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
});