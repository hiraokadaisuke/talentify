const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  displayName: { type: String, required: true },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
