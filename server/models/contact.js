var mongoose    = require('mongoose');
const _         = require('lodash');

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

ContactSchema.methods.findByTag = function() {
    var contact = this;
    var contactObject = contact.toObject();
    return _.pick(contactObject,['name','phone','mobile','address','postCode','suburb','notes']);
}

// Remove references to contact from tags when a contact is deleted
ContactSchema.pre('remove', function(next) {
    var id = this._id.toHexString();

    this.model('Tag').update({'_contact': id},{$set:{_contact: null}},{"multi": true}).then((res) => {
        console.log(res);
    });
    next();
});

var Contact = mongoose.model('Contact', ContactSchema);

module.exports = {Contact}