var mongoose = require('mongoose');

var Tag = mongoose.model('Tag', {
    code: {
        type: Number,
        requied: true,
        minLength: 8,
        trim: true
    },
    pin: {
        type: Number,
        requied: true,
        minLength: 4,
        trim: true
    },
    active:{
        type: Boolean,
        requied: true,
        default: false
    },  
     _user: {
         type: mongoose.Schema.ObjectId,
         requied: false
     },
     _contact: {
        type: mongoose.Schema.ObjectId,
        requied: false
    }
});

module.exports = {Tag};