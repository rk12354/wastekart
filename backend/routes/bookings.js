const express     = require('express');
const router      = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Booking     = require('../models/Booking');
const Transaction = require('../models/Transaction');
const Collector   = require('../models/Collector');
const User        = require('../models/User');

// ─── Smart Vehicle Allocation ─────────────────────────────────
// Rules:
//   ≤ 5 kg         → cycle
//   ≤ 20 kg        → bike
//   ≤ 50 kg        → auto
//   ≤ 300 kg       → mini_truck
//   > 300 kg       → truck
//   E-waste always → at least auto (safety)
const allocateVehicle = (totalWeight, categories = []) => {
  const hasEwaste = categories.includes('ewaste');
  const minWeight = hasEwaste ? 21 : 0;     // e-waste needs enclosed vehicle
  const effectiveWeight = Math.max(totalWeight, minWeight);

  if (effectiveWeight <= 5)   return 'cycle';
  if (effectiveWeight <= 20)  return 'bike';
  if (effectiveWeight <= 50)  return 'auto';
  if (effectiveWeight <= 300) return 'mini_truck';
  return 'truck';
};

const VEHICLE_LABELS = {
  cycle:      '🚲 Cycle',
  bike:       '🏍️ Motorcycle',
  auto:       '🛺 Auto Rickshaw',
  mini_truck: '🚛 Mini Truck',
  truck:      '🚚 Truck'
};

// ─── POST /api/bookings ───────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { items, pickupAddress, scheduledDate, scheduledTimeSlot, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'At least one scrap item is required' });
    }
    if (!scheduledDate || !scheduledTimeSlot) {
      return res.status(400).json({ message: 'Please select a pickup date and time slot' });
    }

    // Calculate totals
    const totalWeight  = items.reduce((s, i) => s + parseFloat(i.weight || 0), 0);
    const totalAmount  = items.reduce((s, i) => s + parseFloat(i.subtotal || 0), 0);
    const categories   = [...new Set(items.map(i => i.category))];
    const vehicleType  = allocateVehicle(totalWeight, categories);

    // Find best available collector for the pincode
    let collectorId = null;
    const pincode   = pickupAddress?.pincode;

    if (pincode) {
      const best = await Collector.findOne({
        isAvailable: true,
        servicePincodes: { $in: [pincode] }
      }).sort({ rating: -1 });

      if (best) collectorId = best._id;
    }

    // Fallback: any available collector
    if (!collectorId) {
      const fallback = await Collector.findOne({ isAvailable: true }).sort({ rating: -1 });
      if (fallback) collectorId = fallback._id;
    }

    // Create booking
    const booking = await Booking.create({
      user:              req.user._id,
      collector:         collectorId,
      items,
      totalWeight,
      totalAmount,
      vehicleType,
      pickupAddress:     pickupAddress || req.user.address,
      scheduledDate:     new Date(scheduledDate),
      scheduledTimeSlot,
      notes
    });

    // Update user cumulative stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalScrapKg:  totalWeight,
        treesPlanted:  booking.treesPlanted,
        totalEarnings: totalAmount,
        co2Saved:      booking.co2Saved
      }
    });

    // Create financial transaction record
    await Transaction.create({
      user:         req.user._id,
      booking:      booking._id,
      collector:    collectorId,
      amount:       totalAmount,
      treesPlanted: booking.treesPlanted,
      co2Saved:     booking.co2Saved
    });

    const populated = await Booking.findById(booking._id)
      .populate('collector', 'name phone rating address');

    res.status(201).json({
      ...populated.toObject(),
      vehicleLabel: VEHICLE_LABELS[vehicleType]
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/bookings/my ─────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const total    = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('collector', 'name phone rating')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ bookings, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/bookings/:id ────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('collector', 'name phone rating address workingHours');

    if (!booking || booking.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/bookings/:id/cancel ────────────────────────────
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || booking.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (['completed', 'in_progress'].includes(booking.status)) {
      return res.status(400).json({ message: `Cannot cancel a booking in "${booking.status}" state` });
    }
    booking.status = 'cancelled';
    await booking.save();

    // Reverse user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalScrapKg:  -booking.totalWeight,
        treesPlanted:  -booking.treesPlanted,
        totalEarnings: -booking.totalAmount,
        co2Saved:      -booking.co2Saved
      }
    });

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
