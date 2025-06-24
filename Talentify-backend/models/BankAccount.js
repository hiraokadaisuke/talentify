const mongoose = require('mongoose');

const BankAccountSchema = new mongoose.Schema({
  bankName: { type: String, required: true, trim: true },
  branchName: { type: String, required: true, trim: true },
  accountType: {
    type: String,
    enum: ['普通', '当座'],
    default: '普通',
  },
  accountNumber: { type: String, required: true, trim: true },
  accountHolder: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BankAccount', BankAccountSchema);
