const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  longUrl: {
    type: String,
    required: true,
    unique: true,
  },
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Url', UrlSchema);
