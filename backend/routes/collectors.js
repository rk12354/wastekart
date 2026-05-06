const express   = require('express');
const router    = express.Router();
const Collector = require('../models/Collector');

// ─── GET /api/collectors?pincode=&material= ───────────────────
router.get('/', async (req, res) => {
  try {
    const { pincode, material, city } = req.query;
    const filter = { isAvailable: true };

    if (pincode)  filter.servicePincodes      = { $in: [pincode] };
    if (city)     filter['address.city']      = new RegExp(city, 'i');
    if (material) filter['materials.material'] = material;

    const collectors = await Collector.find(filter)
      .sort({ rating: -1, totalPickups: -1 })
      .select('-__v');

    res.json(collectors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/collectors/:id ──────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.id).select('-__v');
    if (!collector) return res.status(404).json({ message: 'Collector not found' });
    res.json(collector);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
