const express     = require('express');
const router      = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Booking     = require('../models/Booking');
const Collector   = require('../models/Collector');
const Transaction = require('../models/Transaction');

// ── Guard: collector-only middleware ──────────────────────────
const collectorOnly = (req, res, next) => {
  if (req.user?.role !== 'collector' || !req.user?.collectorId)
    return res.status(403).json({ message: 'Collector access only' });
  next();
};

// ─── GET /api/collector/stats ─────────────────────────────────
router.get('/stats', protect, collectorOnly, async (req, res) => {
  try {
    const cId      = req.user.collectorId;
    const collector = await Collector.findById(cId);
    if (!collector) return res.status(404).json({ message: 'Collector profile not found' });

    const bookings = await Booking.find({ collector: cId }).sort({ createdAt: -1 });

    const totalPickups    = bookings.filter(b => b.status === 'completed').length;
    const pendingPickups  = bookings.filter(b => ['pending','confirmed'].includes(b.status)).length;
    const inProgress      = bookings.filter(b => b.status === 'in_progress').length;

    const totalPaid = bookings
      .filter(b => b.status === 'completed')
      .reduce((s, b) => s + b.totalAmount, 0);

    const totalWeightCollected = bookings
      .filter(b => b.status === 'completed')
      .reduce((s, b) => s + b.totalWeight, 0);

    // Monthly data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d     = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const mb    = bookings.filter(b => {
        const bd = new Date(b.createdAt);
        return bd >= start && bd <= end && b.status === 'completed';
      });
      monthlyData.push({
        month:   d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear(),
        pickups: mb.length,
        weight:  parseFloat(mb.reduce((s, b) => s + b.totalWeight, 0).toFixed(1)),
        paid:    parseFloat(mb.reduce((s, b) => s + b.totalAmount, 0).toFixed(2)),
      });
    }

    const recentBookings = bookings.slice(0, 5);

    res.json({
      collector,
      totalPickups,
      pendingPickups,
      inProgress,
      totalPaid:             parseFloat(totalPaid.toFixed(2)),
      totalWeightCollected:  parseFloat(totalWeightCollected.toFixed(1)),
      totalBookings:         bookings.length,
      monthlyData,
      recentBookings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/collector/bookings ──────────────────────────────
router.get('/bookings', protect, collectorOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { collector: req.user.collectorId };
    if (status) filter.status = status;

    const total    = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('user', 'name phone address')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ bookings, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/collector/booking/:id/status ────────────────────
// Collector updates booking status (confirm / in_progress / complete)
router.put('/booking/:id/status', protect, collectorOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['confirmed', 'in_progress', 'completed'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const booking = await Booking.findOne({ _id: req.params.id, collector: req.user.collectorId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    await booking.save();
    res.json({ message: 'Status updated', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/collector/prices ────────────────────────────────
router.get('/prices', protect, collectorOnly, async (req, res) => {
  try {
    const collector = await Collector.findById(req.user.collectorId);
    if (!collector) return res.status(404).json({ message: 'Collector not found' });
    res.json({ materials: collector.materials, collector });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/collector/prices ────────────────────────────────
// Collector sets/updates their material prices
router.put('/prices', protect, collectorOnly, async (req, res) => {
  try {
    const { materials } = req.body; // array of { material, pricePerKg }
    if (!Array.isArray(materials))
      return res.status(400).json({ message: 'materials must be an array' });

    const collector = await Collector.findById(req.user.collectorId);
    if (!collector) return res.status(404).json({ message: 'Collector not found' });

    collector.materials = materials.map(m => ({
      material:   m.material,
      pricePerKg: parseFloat(m.pricePerKg) || 0,
      unit:       'kg'
    }));
    await collector.save();
    res.json({ message: 'Prices updated successfully', materials: collector.materials });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/collector/profile ───────────────────────────────
router.put('/profile', protect, collectorOnly, async (req, res) => {
  try {
    const { description, servicePincodes, vehicleTypes, workingHours, isAvailable } = req.body;
    const collector = await Collector.findById(req.user.collectorId);
    if (!collector) return res.status(404).json({ message: 'Collector not found' });

    if (description !== undefined)    collector.description    = description;
    if (servicePincodes !== undefined) collector.servicePincodes = servicePincodes;
    if (vehicleTypes !== undefined)   collector.vehicleTypes   = vehicleTypes;
    if (workingHours !== undefined)   collector.workingHours   = workingHours;
    if (isAvailable !== undefined)    collector.isAvailable    = isAvailable;

    await collector.save();
    res.json({ message: 'Profile updated', collector });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
