const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');

const router = express.Router();

// ---------------------- REGISTER ----------------------
router.post('/register', async (req, res) => {
  try {
    const { name, village, district, state, area, cropType, mobileNumber, pin } = req.body;

    // 1. Check if mobile is already registered
    const exists = await Farmer.findOne({ mobileNumber });
    if (exists) {
      return res.status(400).json({ message: 'Mobile number already registered' });
    }

    // 2. Hash PIN & generate Farmer ID
    const pinHash = await bcrypt.hash(pin, 10);
    const farmerId = '#GC' + Math.floor(1000000 + Math.random() * 9000000);

    // 3. Create new Farmer
    const farmer = await Farmer.create({
      name,
      village,
      district,
      state,
      area,
      cropType,
      mobileNumber,
      pinHash,
      farmerId
    });

    // 4. Generate JWT token (same style as /login)
    const token = jwt.sign({ id: farmer._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // 5. Send uniform response
    res.json({
      success: true,
      token,
      user: farmer
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------- LOGIN ----------------------
router.post('/login', async (req, res) => {
  try {
    const { mobileNumber, pin } = req.body;

    // 1. Find farmer by mobile number
    const farmer = await Farmer.findOne({ mobileNumber });
    if (!farmer) {
      return res.status(400).json({ message: 'Invalid mobile or pin' });
    }

    // 2. Compare PIN
    const isMatch = await bcrypt.compare(pin, farmer.pinHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid mobile or pin' });
    }

    // 3. Generate token
    const token = jwt.sign({ id: farmer._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // 4. Send response
    res.json({
      success: true,
      token,
      user: farmer
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
