var mongoose = require('mongoose');

var TagSchema = new mongoose.Schema({
    code: {
        type: Number,
        requied: true,
        min: [10000000, 'Code should be 8 digits'],
        unique: true
    },
    pin: {
        type: Number,
        requied: true,
        min: [1000, 'PIN should be 4 digits'],
        trim: true
    },
    active:{
        type: Boolean,
        requied: true,
        default: false
    },  
     _user: {
         type: mongoose.Schema.ObjectId,
         requied: false,
         default: null
     },
     _contact: {
        type: mongoose.Schema.ObjectId,
        requied: false,
        default: null
    }
});

var Tag = mongoose.model('Tag', TagSchema);

module.exports = {Tag};