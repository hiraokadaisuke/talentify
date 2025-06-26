const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);
