const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema({
  name: String,
  village: String,
  district: String,
  state: String,
  area: String,
  cropType: String,
  mobileNumber: { type: String, unique: true },
  pinHash: String,
  farmerId: { type: String, unique: true },
  carbonCredits: {
    totalEarned: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    currentValue: { type: String, default: '₹0' },
    lastUpdate: { type: String, default: new Date().toLocaleDateString() }
  },
  farmData: {
    soilCarbon: { type: Number, default: 3 },
    moisture: { type: Number, default: 20 },
    temperature: { type: Number, default: 32 },
    carbonCredits: { type: Number, default: 10 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Farmer', FarmerSchema);
