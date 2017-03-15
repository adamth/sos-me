require('./config/config');
const express       = require('express');
const bodyParser    = require('body-parser');
const _             = require('lodash');

const {mongoose}    = require('./db/mongoose');
const {ObjectID}    = require('mongodb');

var PORT = process.env.PORT;

var app = express();
app.use(bodyParser.json());

app.use('/tags',require('./routes/tags'));
app.use('/contacts',require('./routes/contacts'));
app.use('/users',require('./routes/users'));

app.listen(PORT,() => {
    console.log(`Server started on port ${PORT}`);
});

module.exports = {app};