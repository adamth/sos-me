require('./config/config');
const express       = require('express');
const bodyParser    = require('body-parser');
const _             = require('lodash');

const {mongoose}    = require('./db/mongoose');
const {ObjectID}    = require('mongodb');
const {Tag}         = require('./models/tag');
const {Contact}     = require('./models/contact');

var PORT = process.env.PORT;

var app = express();
app.use(bodyParser.json());

// POST tags/
app.post('/tags', (req,res) => {
    var body = _.pick(req.body,['code','pin','active','_user','_contact']);
    var newTag = new Tag(body);

    newTag.save().then((tag) => {
        res.send(tag)
    },(err) => {
        res.status(400).send(err);
    });
});

// GET tags/
app.get('/tags', (req, res) => {
    Tag.find().then((tags) => {
        res.send({tags})
    },(err) => {
        res.status(400).send(err);
    });
});

// GET tags/:id
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
app.delete('/tags/:id', (req,res) => {
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

// GET contacts/
app.get('/contacts',(req,res) => {
    Contact.find().then((contacts) => {
        res.send({contacts});
    },(err) => {
        res.status(400).send(err);
    });
});

// POST contacts/
app.post('/contacts',(req,res) => {
    var body = _.pick(req.body,['_id','name','phone','mobile','address','postCode','suburb','notes','_user']);
    var newContact = new Contact(body);

    newContact.save().then((contact) => {
        res.send({contact});
    },(err) => {
        res.status(400).send(err);
    });

});
// PATCH contacts/:id
app.patch('/contacts/:id',(req,res) => {
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

app.listen(PORT,() => {
    console.log(`Server started on port ${PORT}`);
});

module.exports = {app};