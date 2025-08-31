const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  type: { type: String, enum: ['earn', 'sell', 'buy'], required: true },
  amount: { type: Number, required: true }, // number of credits
  price: { type: Number, default: 0 }, // if selling/buying
  timestamp: { type: Date, default: Date.now },
  txHash: { type: String } // blockchain transaction hash
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
