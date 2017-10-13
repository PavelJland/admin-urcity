var mongoose = require('mongoose');

var callSchema = mongoose.Schema({
    audioSrc: String,
    loc: [String],
    text: String,
    date: Number,
    type: String,
    status: String
});

module.exports = mongoose.model('Call', callSchema);