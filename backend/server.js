const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} → ${req.method} ${req.path}`);
    next();
  });
}

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth',               require('./routes/auth'));
app.use('/api/materials',          require('./routes/materials'));
app.use('/api/collectors',         require('./routes/collectors'));
app.use('/api/bookings',           require('./routes/bookings'));
app.use('/api/dashboard',          require('./routes/dashboard'));
app.use('/api/transactions',       require('./routes/transactions'));
app.use('/api/collector',          require('./routes/collectorDashboard'));  // ← NEW

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'WasteKart API is running 🚀', timestamp: new Date().toISOString() });
});

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT     = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wastekart';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected:', MONGO_URI);
    app.listen(PORT, () => {
      console.log(`🚀 WasteKart API running on http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
