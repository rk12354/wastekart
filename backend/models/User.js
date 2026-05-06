const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  street:  { type: String, default: '' },
  city:    { type: String, default: 'Lucknow' },
  pincode: { type: String, default: '' },
  state:   { type: String, default: 'Uttar Pradesh' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  address: { type: addressSchema, default: () => ({}) },

  // ── Role: 'user' | 'collector' ────────────────────────────
  role:        { type: String, enum: ['user', 'collector'], default: 'user' },
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector', default: null },

  // User-only impact stats
  totalScrapKg:   { type: Number, default: 0, min: 0 },
  treesPlanted:   { type: Number, default: 0, min: 0 },
  totalEarnings:  { type: Number, default: 0, min: 0 },
  co2Saved:       { type: Number, default: 0, min: 0 },

  avatar:      { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  lastLoginAt: { type: Date }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
