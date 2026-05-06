const express     = require('express');
const router      = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');

// ─── GET /api/transactions ────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;

    const filter = { user: req.user._id };
    const total  = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
      .populate('booking',   'bookingId totalWeight items scheduledDate vehicleType status')
      .populate('collector', 'name phone rating')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      transactions,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/transactions/:id ────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const txn = await Transaction.findById(req.params.id)
      .populate('booking',   'bookingId totalWeight items scheduledDate vehicleType status pickupAddress')
      .populate('collector', 'name phone rating address');

    if (!txn || txn.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(txn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
