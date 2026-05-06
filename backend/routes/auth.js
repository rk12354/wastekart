const express   = require('express');
const router    = express.Router();
const jwt       = require('jsonwebtoken');
const User      = require('../models/User');
const Collector = require('../models/Collector');
const { protect } = require('../middleware/authMiddleware');

// ─── Helpers ──────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const userResponse = (user, token) => ({
  _id:          user._id,
  name:         user.name,
  email:        user.email,
  phone:        user.phone,
  address:      user.address,
  role:         user.role || 'user',
  collectorId:  user.collectorId || null,
  totalScrapKg: user.totalScrapKg,
  treesPlanted: user.treesPlanted,
  totalEarnings:user.totalEarnings,
  co2Saved:     user.co2Saved,
  createdAt:    user.createdAt,
  token
});

// ─── POST /api/auth/register (user) ───────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password || !phone)
      return res.status(400).json({ message: 'Please fill all required fields' });

    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'An account with this email already exists' });

    const user = await User.create({ name, email, password, phone, address, role: 'user' });
    res.status(201).json(userResponse(user, generateToken(user._id)));
  } catch (err) {
    if (err.name === 'ValidationError')
      return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/auth/register-collector ────────────────────────
// Creates a User (role=collector) + a Collector business profile atomically
router.post('/register-collector', async (req, res) => {
  try {
    const {
      name, email, password, phone,
      businessName, ownerName,
      street, city, pincode, state,
      servicePincodes,        // comma-separated string or array
      workStart, workEnd
    } = req.body;

    if (!name || !email || !password || !phone || !businessName)
      return res.status(400).json({ message: 'Please fill all required fields' });

    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'An account with this email already exists' });

    // Parse pincodes — accept comma string or array
    const pincodeArr = Array.isArray(servicePincodes)
      ? servicePincodes
      : (servicePincodes || '').split(',').map(p => p.trim()).filter(Boolean);

    // Create Collector business document first
    const collector = await Collector.create({
      name:            businessName,
      ownerName:       ownerName || name,
      phone,
      email,
      address:         { street: street || '', city: city || 'Lucknow', pincode: pincode || '', state: state || 'Uttar Pradesh' },
      servicePincodes: pincodeArr.length ? pincodeArr : [pincode].filter(Boolean),
      vehicleTypes:    ['bike', 'auto'],
      materials:       [],          // collector adds prices from their dashboard
      rating:          4.0,
      isAvailable:     true,
      workingHours:    { start: workStart || '09:00', end: workEnd || '18:00' }
    });

    // Create User account linked to the Collector
    const user = await User.create({
      name, email, password, phone,
      address: { street: street || '', city: city || 'Lucknow', pincode: pincode || '', state: state || 'Uttar Pradesh' },
      role:        'collector',
      collectorId: collector._id
    });

    res.status(201).json(userResponse(user, generateToken(user._id)));
  } catch (err) {
    if (err.name === 'ValidationError')
      return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.json(userResponse(user, generateToken(user._id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/auth/profile ────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(userResponse(user, generateToken(user._id)));
});

// ─── PUT /api/auth/profile ────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { name, phone, address, password } = req.body;
    if (name)     user.name    = name;
    if (phone)    user.phone   = phone;
    if (address)  user.address = { ...user.address.toObject(), ...address };
    if (password) user.password = password;
    const updated = await user.save();
    res.json(userResponse(updated, generateToken(updated._id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
