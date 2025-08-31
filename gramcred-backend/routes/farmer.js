const express = require('express');
const Farmer = require('../models/Farmer');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Get profile
router.get('/:id', auth, async (req, res) => {
  if (req.farmer.id !== req.params.id) return res.status(403).json({ message: 'Forbidden' });
  const farmer = await Farmer.findById(req.params.id);
  res.json(farmer);
});

// Update profile
router.put('/:id', auth, async (req, res) => {
  if (req.farmer.id !== req.params.id) return res.status(403).json({ message: 'Forbidden' });
  const farmer = await Farmer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(farmer);
});

// Farm Data
router.get('/:id/farm-data', auth, async (req, res) => {
  if (req.farmer.id !== req.params.id) return res.status(403).json({ message: 'Forbidden' });
  const { farmData } = await Farmer.findById(req.params.id);
  res.json(farmData);
});

// Credits
router.get('/:id/credits', auth, async (req, res) => {
  if (req.farmer.id !== req.params.id) return res.status(403).json({ message: 'Forbidden' });
  const { carbonCredits } = await Farmer.findById(req.params.id);
  res.json(carbonCredits);
});

// Sell credits
router.post('/:id/sell', auth, async (req, res) => {
  if (req.farmer.id !== req.params.id) return res.status(403).json({ message: 'Forbidden' });

  const { amount } = req.body;
  const farmer = await Farmer.findById(req.params.id);

  if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

  if (farmer.carbonCredits.totalEarned - farmer.carbonCredits.sold < amount) {
    return res.status(400).json({ message: 'Not enough credits to sell' });
  }

  // Deduct and record
  farmer.carbonCredits.sold += amount;
  farmer.carbonCredits.currentValue = `₹${(farmer.carbonCredits.totalEarned - farmer.carbonCredits.sold) * 10}`; // e.g. ₹10 per credit
  farmer.carbonCredits.lastUpdate = new Date().toLocaleDateString();

  await farmer.save();

  // Save transaction
  await Transaction.create({
    farmerId: farmer._id,
    type: 'sell',
    amount,
    price: amount * 10, // optional, if you want to store price too
  });

  res.json({ success: true, message: 'Credits sold successfully', credits: farmer.carbonCredits });
});

// Transactions history
router.get('/:id/transactions', auth, async (req, res) => {
  if (req.farmer.id !== req.params.id) return res.status(403).json({ message: 'Forbidden' });

  const transactions = await Transaction.find({ farmerId: req.params.id }).sort({ createdAt: -1 });
  res.json(transactions);
});

module.exports = router; // <-- moved here
