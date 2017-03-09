require('./config/config');
const express       = require('express');
const bodyParser    = require('body-parser');
const _             = require('lodash');

const {mongoose}    = require('./db/mongoose');
const {ObjectID}    = require('mongodb');
const {Tag}         = require('./models/tag');

var PORT = process.env.PORT;

var app = express();
app.use(bodyParser.json());

// POST tags
app.post('/tags', (req,res) => {
    var tag = new Tag({
        code: req.body.code,
        pin: req.body.pin,
        active: req.body.active,
        _user: req.body._user,
        _contact: req.body._contact
    });

    tag.save().then((tag) => {
        res.send(tag)
    },(err) => {
        res.status(400).send(err);
    });
});

// GET tags
app.get('/tags', (req, res) => {
    Tag.find().then((tags) => {
        res.send({tags})
    },(err) => {
        res.status(400).send(err);
    });
});

// GET tag
app.get('/tags/:id',(req, res) => {
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
app.patch('/tags/:id', (req,res) => {
    var id = req.params.id;
    var body = _.pick(req.body,['_contact','active','_user']);

    if(!ObjectID.isValid(id))
    {
        return res.sendStatus(404);
    }

    Tag.findOneAndUpdate({_id: id},{$set: body}, {new: true}).then((tag) =>{
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


app.listen(PORT,() => {
    console.log(`Server started on port ${PORT}`);
});

module.exports = {app};