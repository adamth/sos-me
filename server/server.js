require('./config/config');
const express       = require('express');
const bodyParser    = require('body-parser');
const _             = require('lodash');

const {mongoose}    = require('./db/mongoose');
const {Tag}         = require('./models/tag');

var PORT = process.env.PORT;

var app = express();
app.use(bodyParser.json());

// POST tags
app.post('/tags', (req,res) => {
    var tag = new Tag({
        contact: req.body.contact,
        phone: req.body.phone,
        _creator: req.body._creator
    });

    tag.save().then((tag) => {
        res.send(tag)
    },(err) => {
        res.send(err).sendStatus(400);
    });
});

// GET tags
app.get('/tags', (req, res) => {
    Tag.find().then((tags) => {
        res.send({tags})
    },(err) => {
        res.send(err).sendStatus(400);
    });
});

// GET tag
app.get('/tags/:id',(req, res) => {
    res.send('GET tags/:id');
});



// PATCH tags

// DELETE tags


app.listen(PORT,() => {
    console.log(`Server started on port ${PORT}`);
});

module.exports = {app};