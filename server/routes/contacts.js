const router        = require('express').Router();
const {Contact}         = require('./../models/contact');
const _             = require('lodash');
const {ObjectID}    = require('mongodb');

// GET contacts/
router.get('/',(req,res) => {
    Contact.find().then((contacts) => {
        res.send({contacts});
    },(err) => {
        res.status(400).send(err);
    });
});

// POST contacts/
router.post('/',(req,res) => {
    var body = _.pick(req.body,['_id','name','phone','mobile','address','postCode','suburb','notes','_user']);
    var newContact = new Contact(body);

    newContact.save().then((contact) => {
        res.send({contact});
    },(err) => {
        res.status(400).send(err);
    });

});
// PATCH contacts/:id
router.patch('/:id',(req,res) => {
    var id = req.params.id;
    var body = _.pick(req.body,['name','phone','mobile','address','postCode','suburb','notes']);

    if(!ObjectID.isValid(id))
    {
        return res.sendStatus(404);
    }

    Contact.findByIdAndUpdate(id,{$set: body}, {runValidators: true, new: true}).then((contact) => {
        if(!contact)
        {
            res.sendStatus(404);
        }
        res.send({contact});
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// DELETE contacts/



module.exports = router;