const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
      min: [0.01, 'Amount must be greater than 0']
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    splitType: {
      type: String,
      enum: ['equal', 'exact', 'percentage'],
      default: 'equal'
    },
    splits: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        amount: {
          type: Number,
          required: true,
          default: 0
        },
        percentage: {
          type: Number,
          default: 0
        }
      }
    ],
    category: {
      type: String,
      enum: ['Food & Dining', 'Rent & Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Travel', 'General'],
      default: 'General'
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Expense', expenseSchema);
