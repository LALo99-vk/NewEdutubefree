const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  icon: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Category', CategorySchema);
