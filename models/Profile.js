const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  avatar: { type: String },
  bio: { type: String },
  college: { type: String },
  // Add more student details as needed
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema); 