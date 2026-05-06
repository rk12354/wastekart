const express  = require('express');
const router   = express.Router();
const Collector = require('../models/Collector');

// ─── Static Material Catalogue ────────────────────────────────
const MATERIAL_CATALOGUE = [
  // Paper
  { id: 'newspaper',     name: 'Newspaper',           category: 'paper',   icon: '📰', basePrice: 12,  unit: 'kg' },
  { id: 'cardboard',     name: 'Cardboard',            category: 'paper',   icon: '📦', basePrice: 8,   unit: 'kg' },
  { id: 'books',         name: 'Books / Magazines',    category: 'paper',   icon: '📚', basePrice: 10,  unit: 'kg' },
  // Metal
  { id: 'iron',          name: 'Iron',                 category: 'metal',   icon: '🔩', basePrice: 30,  unit: 'kg' },
  { id: 'steel',         name: 'Stainless Steel',      category: 'metal',   icon: '🔧', basePrice: 40,  unit: 'kg' },
  { id: 'aluminium',     name: 'Aluminium',            category: 'metal',   icon: '🥤', basePrice: 80,  unit: 'kg' },
  { id: 'copper',        name: 'Copper',               category: 'metal',   icon: '🪙', basePrice: 450, unit: 'kg' },
  { id: 'brass',         name: 'Brass',                category: 'metal',   icon: '⚙️', basePrice: 250, unit: 'kg' },
  // Plastic
  { id: 'plastic_hard',  name: 'Hard Plastic',         category: 'plastic', icon: '🪣', basePrice: 15,  unit: 'kg' },
  { id: 'plastic_soft',  name: 'Soft Plastic / PET',   category: 'plastic', icon: '🧴', basePrice: 8,   unit: 'kg' },
  // Glass
  { id: 'glass',         name: 'Glass',                category: 'glass',   icon: '🫙', basePrice: 5,   unit: 'kg' },
  // E-waste
  { id: 'ewaste',        name: 'E-Waste (Electronics)', category: 'ewaste', icon: '💻', basePrice: 60,  unit: 'kg' },
  { id: 'battery',       name: 'Batteries',            category: 'ewaste',  icon: '🔋', basePrice: 120, unit: 'kg' },
  // Other
  { id: 'rubber',        name: 'Rubber / Tyres',       category: 'rubber',  icon: '⭕', basePrice: 10,  unit: 'kg' }
];

// ─── GET /api/materials ───────────────────────────────────────
router.get('/', (_req, res) => {
  res.json(MATERIAL_CATALOGUE);
});

// ─── GET /api/materials/prices?pincode=&category= ─────────────
router.get('/prices', async (req, res) => {
  try {
    const { pincode, category } = req.query;

    let filter = { isAvailable: true };
    if (pincode) filter.servicePincodes = { $in: [pincode] };

    const collectors = await Collector.find(filter)
      .select('name materials servicePincodes rating');

    // Build enriched price map
    const priceMap = {};
    MATERIAL_CATALOGUE.forEach(mat => {
      if (category && mat.category !== category) return;
      priceMap[mat.id] = {
        ...mat,
        collectorPrices: [],
        minPrice:   mat.basePrice,
        maxPrice:   mat.basePrice,
        bestPrice:  mat.basePrice,
        avgMarketPrice: mat.basePrice
      };
    });

    collectors.forEach(c => {
      c.materials.forEach(m => {
        if (!priceMap[m.material]) return;
        priceMap[m.material].collectorPrices.push({
          collectorId:   c._id,
          collectorName: c.name,
          price:         m.pricePerKg,
          rating:        c.rating
        });
        const p = priceMap[m.material];
        p.minPrice  = Math.min(p.minPrice,  m.pricePerKg);
        p.maxPrice  = Math.max(p.maxPrice,  m.pricePerKg);
        p.bestPrice = Math.max(p.bestPrice, m.pricePerKg);
      });
    });

    res.json(Object.values(priceMap));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
