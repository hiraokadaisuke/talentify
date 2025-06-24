const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  performerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Talent', required: true },
  title: { type: String, required: true },
  storeName: String,
  location: String,
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  status: { type: String, default: 'confirmed' },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
