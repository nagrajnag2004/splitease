const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    paidTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Please specify settlement amount'],
      min: [0.01, 'Amount must be greater than 0']
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: 'Settlement'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Settlement', settlementSchema);
