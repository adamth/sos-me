var mongoose = require('mongoose');

var Tag = mongoose.model('Tag', {
    contact: {
        type: String,
        requied: true,
        minLength: 1,
        trim: true
    },
    phone: {
        type: String,
        requied: true,
        minLength: 8,
        trim: true
    },
     _creator: {
         type: mongoose.Schema.ObjectId,
         requied: true
     }
});

module.exports = {Tag};