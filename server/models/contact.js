var mongoose = require('mongoose');

var ContactSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Contact name is required'],
        minlength: 2,
        trim: true
    },
    phone:{
        type: String,
        required: false,
        minlength: 8
    },
    mobile: {
        type: String,
        required: false,
        minlength:10
    },
    address:{
        type: String,
        required: false,
        minlength: 3,
        trim: true
    },
    postCode:{
        type: Number,
        required: false,
        minlength: 4
    },
    suburb:{
        type: String,
        required: false,
        minlength: 2,
        trim: true
    },
    notes:{
        type: String,
        required: false,
        minlength: 1,
        trim: true
    },
    _user: {
        type: mongoose.Schema.ObjectId,
        requied: true
     }
});

var Contact = mongoose.model('Contact', ContactSchema);

module.exports = {Contact}