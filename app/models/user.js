var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');


var userSchema = mongoose.Schema({

    local            : {
        new          : Boolean,
        updated      : { type: Date, default: Date.now },
        created      : Date,
        email        : String,
        password     : String,
        admin        : Boolean,
        gender       : String,
        phone : String,
        post : String,
        address: String,
        phone: String,
        viber: String,
        skype: String
    },
    profile: {
        fname: String,
        sname: String,
        jobtitle: String,
        phone : String,
        bday: String,
        category: String,
        status: Boolean,
        comment: String
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};


userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);

