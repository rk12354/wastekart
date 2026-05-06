const express     = require('express');
const router      = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Booking     = require('../models/Booking');
const User        = require('../models/User');

// ─── GET /api/dashboard/stats ─────────────────────────────────
router.get('/stats', protect, async (req, res) => {
  try {
    const user     = await User.findById(req.user._id);
    const bookings = await Booking.find({ user: req.user._id })
      .populate('collector', 'name phone rating');

    const completed  = bookings.filter(b => b.status === 'completed').length;
    const pending    = bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length;
    const inProgress = bookings.filter(b => b.status === 'in_progress').length;
    const cancelled  = bookings.filter(b => b.status === 'cancelled').length;

    // Recent bookings (last 5)
    const recentBookings = [...bookings]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    // ── Monthly chart data (last 6 months) ────────────────────
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d     = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthBks = bookings.filter(b => {
        const bd = new Date(b.createdAt);
        return bd >= start && bd <= end;
      });

      monthlyData.push({
        month:    d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear(),
        scrapKg:  parseFloat(monthBks.reduce((s, b) => s + b.totalWeight, 0).toFixed(1)),
        earnings: parseFloat(monthBks.reduce((s, b) => s + b.totalAmount, 0).toFixed(2)),
        pickups:  monthBks.length
      });
    }

    // ── Category breakdown ────────────────────────────────────
    const categoryBreakdown = {};
    bookings.forEach(b => {
      b.items.forEach(item => {
        categoryBreakdown[item.category] =
          (categoryBreakdown[item.category] || 0) + item.weight;
      });
    });

    const categoryChartData = Object.entries(categoryBreakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: parseFloat(value.toFixed(1))
    }));

    // ── Collector leaderboard (top 3 by amount) ───────────────
    const collectorEarnings = {};
    bookings.filter(b => b.collector).forEach(b => {
      const key  = b.collector._id.toString();
      const name = b.collector.name || 'Unknown';
      if (!collectorEarnings[key]) collectorEarnings[key] = { name, amount: 0, pickups: 0 };
      collectorEarnings[key].amount  += b.totalAmount;
      collectorEarnings[key].pickups += 1;
    });

    const topCollectors = Object.values(collectorEarnings)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    res.json({
      // Cumulative user stats
      totalScrapKg:   parseFloat((user.totalScrapKg  || 0).toFixed(1)),
      treesPlanted:   user.treesPlanted  || 0,
      totalEarnings:  parseFloat((user.totalEarnings || 0).toFixed(2)),
      co2Saved:       parseFloat((user.co2Saved      || 0).toFixed(1)),

      // Booking counts
      totalBookings: bookings.length,
      completedPickups: completed,
      pendingPickups:   pending,
      inProgressPickups: inProgress,
      cancelledPickups: cancelled,

      // Chart data
      recentBookings,
      monthlyData,
      categoryChartData,
      topCollectors
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
