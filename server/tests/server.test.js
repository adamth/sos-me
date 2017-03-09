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
/*
describe('POST /tags',() => {
    var objectID = new ObjectID();
    var tag = {
        contact:"test contact",
        phone:"123456543",
        _creator: objectID
    };

    it('should post a tag',(done) => {
        request(app)
        .post('/tags')
        .send(tag)
        .expect(200)      
        .expect((res) => {
            expect(res.body.contact).toBe(tag.contact);
            expect(res.body.phone).toBe(tag.phone);
            expect(res.body._creator).toBe(objectID.toString());
        })
        .end((err, res) => {
            if(err){
                return done(err);
            }

            Tag.find({contact: tag.contact}).then((res) => {
                expect(res.length).toBe(1);
                expect(res[0].contact).toBe(tag.contact);
                expect(res[0].phone).toBe(tag.phone);
                done();
            }).catch((e) => done(e));
        });
    });

    it('should not create a tag with an invalid contact', (done) => {
        tag.phone = "1"
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
            expect(res.body.tags.length).toBe(2);
        })
        .end(done);
    });
    
});*/