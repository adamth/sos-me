var mongoose = require('mongoose');

var Contact = mongoose.model('Contact',{
    name:{
        type: String,
        required: [true, 'Contact name is required'],
        minLength: 2,
        trim: true
    },
    phone:{
        type: String,
        required: false,
        minLength: 8
    },
    mobile: {
        type: String,
        required: false,
        minLength:10
    },
    address:{
        type: String,
        required: false,
        minLength: 3,
        trim: true
    },
    postCode:{
        type: Number,
        required: false,
        minLength: 4
    },
    suburb:{
        type: String,
        required: false,
        minLength: 2,
        trim: true
    },
    notes:{
        type: String,
        required: false,
        minLength: 1,
        trim: true
    },
    _user: {
        type: mongoose.Schema.ObjectId,
        requied: true
     }
});

module.exports = {Contact}