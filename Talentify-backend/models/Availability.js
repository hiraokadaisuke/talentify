const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  performerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Talent', required: true },
  date: { type: Date, required: true },
  startTime: String,
  endTime: String,
  area: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Availability', AvailabilitySchema);
