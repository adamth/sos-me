const router        = require('express').Router();
const {Contact}     = require('./../models/contact');
const _             = require('lodash');
const {ObjectID}    = require('mongodb');
var {authenticate}  = require('./../middleware/authenticate');

// GET contacts/
router.get('/',  authenticate, (req,res) => {
    Contact.find({_user: req.user._id}).then((contacts) => {
        res.send({contacts});
    },(err) => {
        res.status(400).send(err);
    });
});

// GET contacts/:id
router.get('/:id', authenticate, (req,res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id))
    {
       return res.sendStatus(404); 
    }
    Contact.findOne({_id: id, _user: req.user._id}).then((contact) => {
        if(!contact)
        {
            res.sendStatus(404);
        }
        res.send({contact})
    }).catch((e) => {
        res.status(400).send(e);
    });
})

// POST contacts/
router.post('/', authenticate, (req,res) => {
    var body = _.pick(req.body,['_id','name','phone','mobile','address','postCode','suburb','notes','_user']);
    body._user = req.user._id;

    var newContact = new Contact(body);

    newContact.save().then((contact) => {
        res.send({contact});
    },(err) => {
        res.status(400).send(err);
    });

});
// PATCH contacts/:id
router.patch('/:id', authenticate, (req,res) => {
    var id = req.params.id;
    var body = _.pick(req.body,['name','phone','mobile','address','postCode','suburb','notes']);
    body._user = req.user._id;

    if(!ObjectID.isValid(id))
    {
        return res.sendStatus(404);
    }

    Contact.findOneAndUpdate({_id:id, _user: req.user._id},{$set: body}, {runValidators: true, new: true}).then((contact) => {
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
router.delete('/:id', authenticate, (req,res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id))
    {
        return res.sendStatus(404);
    }
    
    Contact.findOne({_id: id, _user: req.user._id}).then((contact) => {
        if(!contact)
        {
           return res.sendStatus(404);
        }
        contact.remove();

        res.send({contact});
    }).catch((e) => {
        res.status(400).send(e);
    });
})


module.exports = router;