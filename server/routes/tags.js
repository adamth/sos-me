const router            = require('express').Router();
const {Tag}             = require('./../models/tag');
const {Contact}         = require('./../models/contact');
const {User}            = require('./../models/user');
const _                 = require('lodash');
const {ObjectID}        = require('mongodb');
const {authenticate}    = require('./../middleware/authenticate');


// POST tags/
// REMOVE THIS BEFORE DEPLOYING
router.post('/', (req,res) => {
    var body = _.pick(req.body,['code','pin','active','_user','_contact']);
    var newTag = new Tag(body);

    newTag.save().then((tag) => {
        res.send({tag})
    },(err) => {
        res.status(400).send(err);
    });
});

// PATCH /activate
// User can enter a code and pin to activate a tag
router.patch('/activate', authenticate, (req,res) => {
    var body = _.pick(req.body,['code','pin']);
    // User must enter a valid code and pin to activate a tag
    Tag.findOne(body).then((tag) => {
        if(!tag)
        {
            return res.sendStatus(404);
        }
        if(tag.active)
        {
            return res.sendStatus(403);
        }

        tag.active = true;
        tag._user = req.user._id;

        tag.save().then((tag) => {
            res.send({tag});
        }).catch((e) => {
            res.status(400).send(e);
        })
    });
});

// PATCH assign/
// User can assign a contact to a tag
router.patch('/assign', authenticate, (req,res) => {
    var tagId = req.body.tag;
    var contactId = req.body.contact;

    if(!ObjectID.isValid(tagId) || !ObjectID.isValid(contactId))
    {
        return res.send(404);
    }

    //Find a tag and update it
    Contact.findOne({_id: contactId, _user: req.user._id}).then((contact) => {
        if(!contact)
        {
            return res.sendStatus(404);
        }
        Tag.findOneAndUpdate({_id: tagId, _user: req.user._id},{$set:{_contact: contact._id}},{new: true}).then((tag) => {
            if(!tag)
            {
                req.sendStatus(404);
            }
            res.send({tag});
        }).catch((e) => {         
            res.status(400).send(e);
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

// GET tags/
router.get('/', authenticate, (req, res) => {
    Tag.find({_user: req.user._id}).then((tags) => {
        res.send({tags})
    },(err) => {
        res.status(400).send(err);
    });
});

// GET tags/:id
router.get('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id))
    {
        return res.sendStatus(404);
    }

    Tag.findOne({_id: id, _user: req.user._id}).then((tag) => {
        if(!tag)
        {
            return res.sendStatus(404);
        }
        res.send({tag});
    }).catch((e) => {
        res.status(400).send(err);
    });
});

// POST find/
// Find a tag based on code and pin
router.post('/find',(req,res) => {
    var body = _.pick(req.body,['code','pin']);

    // Find the tag
    Tag.findOne({pin: body.pin, code: body.code, active: true}).then((tag) => {
        if(!tag)
        {
            return res.sendStatus(404);
        }
        
        // Find the user
        User.findById(tag._user).then((user) => {
            if(!user)
            {
                res.sendStatus(404);
            }
            // Find the contact
            Contact.findById(tag._contact).then((contact) => {
                user = user.findByTag();
                contact = contact.findByTag();
                res.send({
                    user,
                    contact
                });
            }).catch((e) => {
                res.status(400).send(e);
            })
        }).catch((e) => {
            res.status(400).send(e);
        });

    }, (err) => {
        res.status(400).send(err);
    });
});

// PATCH tags
// router.patch('/:id', authenticate,(req,res) => {
//     var id = req.params.id;
//     var body = _.pick(req.body,['_contact']);

//     if(!ObjectID.isValid(id))
//     {
//         return res.sendStatus(404);
//     }

//     Tag.findOneAndUpdate({_id: id, _user: req.user._id},{$set: body}, {runValidators: true, new: true}).then((tag) =>{
//         if(!tag)
//         {
//             res.sendStatus(404);
//         }
//         res.send({tag})
//     }).catch((e) => {
//         res.status(400).send(e);
//     });
// });

// DELETE tags
router.delete('/:id', authenticate, (req,res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id))
    {
        return res.sendStatus(404);
    }

    Tag.findOneAndRemove({_id: id, _user: req.user._id}).then((tag) => {
        if(!tag)
        {
            return res.sendStatus(404);
        }

        res.send({tag});
    }).catch((e) => {
        res.status(400),send(e);
    });

});

module.exports = router;