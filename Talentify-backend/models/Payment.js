const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  eventDate: {
    type: Date,
    required: true,
  },
  venue: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['未払い', '支払済', '振込手続中'],
    default: '未払い',
  },
  transferDate: Date,
  invoiceUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', PaymentSchema);
