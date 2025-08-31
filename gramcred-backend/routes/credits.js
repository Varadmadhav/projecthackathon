const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');
const CarbonCredit = require('../models/carboncredit');

// ✅ Get user credits (latest ML value)
router.get('/:userId', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.userId);
    if (!farmer) return res.status(404).json({ msg: 'Farmer not found' });

    // Find the latest carbon credit record for this farmer
    const latestCredit = await CarbonCredit.findOne({ farmerId: farmer._id })
                                           .sort({ createdAt: -1 });

    res.json({
      credits: latestCredit ? latestCredit.pred_coef_tCha_year : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ Sell credits (deduct from Farmer model for now)
router.post('/sell/:userId', async (req, res) => {
  try {
    const { amount } = req.body;
    const farmer = await Farmer.findById(req.params.userId);

    if (!farmer) return res.status(404).json({ msg: 'Farmer not found' });
    if (farmer.credits < amount) {
      return res.status(400).json({ msg: 'Not enough credits to sell' });
    }

    farmer.credits -= amount;
    await farmer.save();

    res.json({
      msg: `Successfully sold ${amount} credits`,
      remainingCredits: farmer.credits
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
