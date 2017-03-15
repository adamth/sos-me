const router        = require('express').Router();
const {Tag}         = require('./../models/tag');
const _             = require('lodash');
const {ObjectID}    = require('mongodb');

// POST tags/
router.post('/', (req,res) => {
    var body = _.pick(req.body,['code','pin','active','_user','_contact']);
    var newTag = new Tag(body);

    newTag.save().then((tag) => {
        res.send(tag)
    },(err) => {
        res.status(400).send(err);
    });
});

// GET tags/
router.get('/', (req, res) => {
    Tag.find().then((tags) => {
        res.send({tags})
    },(err) => {
        res.status(400).send(err);
    });
});

// GET tags/:id
router.get('/:id',(req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id))
    {
        return res.sendStatus(404);
    }

    Tag.findById(id).then((tag) => {
        if(!tag)
        {
            return res.sendStatus(404);
        }
        res.send({tag});
    }).catch((e) => {
        res.status(400).send(err);
    });
});

// PATCH tags
router.patch('/:id', (req,res) => {
    var id = req.params.id;
    var body = _.pick(req.body,['_contact','active','_user']);

    if(!ObjectID.isValid(id))
    {
        return res.sendStatus(404);
    }

    Tag.findByIdAndUpdate(id,{$set: body}, {runValidators: true, new: true}).then((tag) =>{
        if(!tag)
        {
            res.sendStatus(404);
        }
        res.send({tag})
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// DELETE tags
router.delete('/:id', (req,res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id))
    {
        return res.sendStatus(404);
    }

    Tag.findByIdAndRemove(id).then((tag) => {
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