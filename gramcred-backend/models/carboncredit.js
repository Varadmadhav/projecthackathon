const mongoose = require('mongoose');

const CarbonCreditSchema = new mongoose.Schema({
  creditId: { type: String, unique: true }, // UUID or blockchain ID
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  value: { type: Number, default: 1 }, // existing field (can be kept)
  status: { type: String, enum: ['active', 'sold'], default: 'active' },
  
  // 👇 New fields from ML model
  pred_coef_tCha_year: { type: Number },   // 0.571
  annual_rate_tCO2e: { type: Number },     // 4.19

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CarbonCredit', CarbonCreditSchema);