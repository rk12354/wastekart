/**
 * WasteKart Seed Script
 * Run: node seed/seedData.js
 * Seeds the database with sample collectors across Lucknow pincodes.
 */
require('dotenv').config({ path: '../.env' });
const mongoose  = require('mongoose');
const Collector = require('../models/Collector');
const User      = require('../models/User');

const LUCKNOW_COLLECTORS = [
  {
    name: 'GreenCycle Scrap Hub',
    ownerName: 'Ramesh Gupta',
    phone: '9876543210',
    email: 'greencycle@wastekart.in',
    address: { street: 'Hazratganj Market', city: 'Lucknow', pincode: '226001', state: 'Uttar Pradesh' },
    servicePincodes: ['226001', '226002', '226003', '226010'],
    vehicleTypes: ['cycle', 'bike', 'auto', 'mini_truck'],
    rating: 4.7,
    totalPickups: 342,
    description: 'Lucknow\'s trusted scrap collector since 2010. Specialising in metals and e-waste.',
    materials: [
      { material: 'newspaper',    pricePerKg: 14 },
      { material: 'cardboard',    pricePerKg: 9  },
      { material: 'books',        pricePerKg: 11 },
      { material: 'iron',         pricePerKg: 32 },
      { material: 'steel',        pricePerKg: 42 },
      { material: 'aluminium',    pricePerKg: 85 },
      { material: 'copper',       pricePerKg: 460 },
      { material: 'brass',        pricePerKg: 255 },
      { material: 'plastic_hard', pricePerKg: 16 },
      { material: 'plastic_soft', pricePerKg: 9  },
      { material: 'glass',        pricePerKg: 6  },
      { material: 'ewaste',       pricePerKg: 65 },
      { material: 'battery',      pricePerKg: 125 },
      { material: 'rubber',       pricePerKg: 11 }
    ]
  },
  {
    name: 'EcoMart Recyclers',
    ownerName: 'Suresh Verma',
    phone: '9988776655',
    email: 'ecomart@wastekart.in',
    address: { street: 'Aminabad Chowk', city: 'Lucknow', pincode: '226018', state: 'Uttar Pradesh' },
    servicePincodes: ['226018', '226020', '226021', '226022'],
    vehicleTypes: ['bike', 'auto', 'mini_truck', 'truck'],
    rating: 4.5,
    totalPickups: 218,
    description: 'Bulk scrap buyers for residential and commercial clients.',
    materials: [
      { material: 'newspaper',    pricePerKg: 13 },
      { material: 'cardboard',    pricePerKg: 8  },
      { material: 'books',        pricePerKg: 10 },
      { material: 'iron',         pricePerKg: 33 },
      { material: 'aluminium',    pricePerKg: 82 },
      { material: 'copper',       pricePerKg: 455 },
      { material: 'plastic_hard', pricePerKg: 15 },
      { material: 'plastic_soft', pricePerKg: 8  },
      { material: 'glass',        pricePerKg: 5  },
      { material: 'ewaste',       pricePerKg: 62 },
      { material: 'rubber',       pricePerKg: 10 }
    ]
  },
  {
    name: 'PaperTech Waste Solutions',
    ownerName: 'Ajay Mishra',
    phone: '9123456789',
    email: 'papertech@wastekart.in',
    address: { street: 'Indira Nagar Sector 12', city: 'Lucknow', pincode: '226016', state: 'Uttar Pradesh' },
    servicePincodes: ['226016', '226012', '226013', '226014'],
    vehicleTypes: ['cycle', 'bike', 'auto'],
    rating: 4.3,
    totalPickups: 175,
    description: 'Paper and plastic specialists with same-day pickup.',
    materials: [
      { material: 'newspaper',    pricePerKg: 15 },
      { material: 'cardboard',    pricePerKg: 10 },
      { material: 'books',        pricePerKg: 12 },
      { material: 'plastic_hard', pricePerKg: 17 },
      { material: 'plastic_soft', pricePerKg: 10 },
      { material: 'glass',        pricePerKg: 7  }
    ]
  },
  {
    name: 'MetalKing Scrap Dealers',
    ownerName: 'Vijay Kumar',
    phone: '9765432109',
    email: 'metalking@wastekart.in',
    address: { street: 'Alambagh Industrial Area', city: 'Lucknow', pincode: '226005', state: 'Uttar Pradesh' },
    servicePincodes: ['226005', '226006', '226007', '226008'],
    vehicleTypes: ['auto', 'mini_truck', 'truck'],
    rating: 4.6,
    totalPickups: 489,
    description: 'Heavy metal and bulk industrial scrap. Best prices guaranteed.',
    materials: [
      { material: 'iron',         pricePerKg: 34 },
      { material: 'steel',        pricePerKg: 44 },
      { material: 'aluminium',    pricePerKg: 88 },
      { material: 'copper',       pricePerKg: 465 },
      { material: 'brass',        pricePerKg: 260 },
      { material: 'battery',      pricePerKg: 130 },
      { material: 'rubber',       pricePerKg: 12  }
    ]
  },
  {
    name: 'TechWaste E-Recycle',
    ownerName: 'Priya Sharma',
    phone: '9654321098',
    email: 'techwaste@wastekart.in',
    address: { street: 'Vibhuti Khand, Gomti Nagar', city: 'Lucknow', pincode: '226010', state: 'Uttar Pradesh' },
    servicePincodes: ['226010', '226011', '226015', '226016'],
    vehicleTypes: ['bike', 'auto', 'mini_truck'],
    rating: 4.8,
    totalPickups: 156,
    description: 'Certified e-waste recycler. Safe disposal of electronics and batteries.',
    materials: [
      { material: 'ewaste',    pricePerKg: 70  },
      { material: 'battery',   pricePerKg: 135 },
      { material: 'copper',    pricePerKg: 460 },
      { material: 'aluminium', pricePerKg: 83  },
      { material: 'plastic_hard', pricePerKg: 14 }
    ]
  }
];

const DEMO_USER = {
  name: 'Demo User',
  email: 'demo@wastekart.in',
  password: 'demo1234',
  phone: '9000000001',
  role: 'user',
  address: { street: '12 MG Road', city: 'Lucknow', pincode: '226001', state: 'Uttar Pradesh' }
}

// Demo collector account — linked to GreenCycle Scrap Hub
const DEMO_COLLECTOR_USER = {
  name: 'Ramesh Gupta',
  email: 'collector@wastekart.in',
  password: 'collector1234',
  phone: '9876543210',
  role: 'collector',
  address: { street: 'Hazratganj Market', city: 'Lucknow', pincode: '226001', state: 'Uttar Pradesh' }
};

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wastekart';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Collector.deleteMany({});
    console.log('🗑️  Cleared collectors');

    // Insert collectors
    const inserted = await Collector.insertMany(LUCKNOW_COLLECTORS);
    console.log(`✅ Inserted ${inserted.length} collectors`);

    // Create demo user (skip if exists)
    const existing = await User.findOne({ email: DEMO_USER.email })
    if (!existing) {
      await User.create(DEMO_USER)
      console.log('✅ Demo user created  →  email: demo@wastekart.in  |  password: demo1234')
    } else {
      console.log('ℹ️  Demo user already exists')
    }

    // Create demo collector user linked to GreenCycle
    const existingColl = await User.findOne({ email: DEMO_COLLECTOR_USER.email })
    if (!existingColl) {
      const greenCycle = await Collector.findOne({ name: 'GreenCycle Scrap Hub' })
      if (greenCycle) {
        await User.create({ ...DEMO_COLLECTOR_USER, collectorId: greenCycle._id })
        console.log('✅ Demo collector created  →  email: collector@wastekart.in  |  password: collector1234')
      }
    } else {
      console.log('ℹ️  Demo collector already exists')
    }

    console.log('\n🎉 Seed complete! You can now start the server.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
