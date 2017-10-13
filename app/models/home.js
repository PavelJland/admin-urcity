const mongoose = require('mongoose');
var homeSchema = new mongoose.Schema({
  pos: {type: [Number], index: '2dsphere'},
  photo: String,
  photoAfter: String,
  name: String,
  description: String,
  created_at: Number,
  created_by: String,
  status: String
}, {strict: false});

module.exports = mongoose.model('Home', homeSchema)