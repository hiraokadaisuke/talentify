const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  threadId: { type: String, required: true },
  from: { type: String, required: true },
  text: { type: String, default: '' },
  attachments: { type: [String], default: [] },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
