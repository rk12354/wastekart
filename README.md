# ♻️ WasteKart — Smart Scrap Collection Aggregator

**B.Tech Final Year Project | Full-Stack Web Application**

> WasteKart is an AI-driven scrap collection aggregator platform that connects households with verified scrap collectors, providing intelligent material detection, live pricing, and seamless doorstep pickup booking.

---

## 🎯 Project Overview

| Attribute       | Detail                                       |
|----------------|----------------------------------------------|
| Project Type   | B.Tech Final Year Project (FYP)              |
| Stack          | React.js + Node.js + Express.js + MongoDB    |
| AI Modules     | TensorFlow.js, OpenCV.js, Gemini AI Chatbot  |
| Domain         | Waste Management / GreenTech / Circular Economy |
| Target Region  | Lucknow, Uttar Pradesh (scalable to PAN India)|

---

## 🚀 Features

### 🧠 AI Modules
| Module | Technology | Purpose |
|--------|-----------|---------|
| Material Detection | TensorFlow.js + OpenCV.js | Identify scrap type from uploaded photo |
| Chatbot | Gemini 1.5 Flash API | 24/7 scrap assistance + smart fallbacks |
| Vehicle Allocation | Rule Engine (Backend) | Auto-assign optimal vehicle for pickup |
| Collector Matching | MongoDB Geosearch | Find best collector by pincode + rating |

### 👤 User Features
- **Registration/Login** with JWT authentication
- **AI Scrap Detection** — upload photo → get material type + confidence %
- **Live Prices** — real-time rates from local collector network
- **Smart Booking** — 3-step pickup wizard with AI material suggestions
- **Auto Vehicle Allocation** — cycle → bike → auto → mini-truck → truck
- **Environmental Dashboard** — CO₂ saved, trees planted, scrap recycled
- **Transaction History** — complete payment records
- **Profile Management** — update personal info + address

### 📊 Dashboard
- Monthly scrap & earnings charts (Recharts)
- Category breakdown pie chart
- Recent bookings with status tracking
- Top collectors leaderboard
- Real-time environmental impact stats

---

## 🏗️ Architecture

```
wastekart/
├── backend/                 # Node.js + Express REST API
│   ├── server.js            # Entry point
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Collector.js
│   │   ├── Booking.js
│   │   └── Transaction.js
│   ├── routes/              # API route handlers
│   │   ├── auth.js          # Register, Login, Profile
│   │   ├── materials.js     # Price catalogue
│   │   ├── collectors.js    # Collector directory
│   │   ├── bookings.js      # Pickup bookings + vehicle allocation
│   │   ├── dashboard.js     # Stats + charts data
│   │   └── transactions.js  # Transaction history
│   ├── middleware/
│   │   └── authMiddleware.js # JWT protection
│   └── seed/
│       └── seedData.js      # Sample collectors + demo user
│
└── frontend/                # React.js + Vite SPA
    └── src/
        ├── pages/
        │   ├── LandingPage   # Homepage with hero, features, CTA
        │   ├── LoginPage     # Auth
        │   ├── RegisterPage  # Multi-step registration
        │   ├── DashboardPage # Stats + charts
        │   ├── BookingPage   # 3-step booking wizard + AI detection
        │   ├── BookingsPage  # Booking history
        │   ├── PricesPage    # Live material prices
        │   ├── CollectorsPage# Collector directory
        │   ├── TransactionsPage # Payment history
        │   └── ProfilePage   # User settings
        ├── components/
        │   ├── Navbar.jsx    # Responsive navigation
        │   ├── Footer.jsx    # Site footer
        │   └── Chatbot.jsx   # Gemini AI floating chatbot
        └── context/
            ├── AuthContext   # Global auth + JWT management
            └── ToastContext  # Notification system
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js ≥ 18.x
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone / Extract the project

```bash
cd wastekart
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment config
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET

# Seed the database (adds 5 collectors + demo user)
node seed/seedData.js

# Start the server
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Copy environment config
cp .env.example .env
# Add your Gemini API key (optional but recommended for chatbot)
# VITE_GEMINI_API_KEY=your_key_here

# Start the frontend
npm run dev
# App runs on http://localhost:5173
```

### 4. Demo Account
After seeding, use these credentials to explore:
```
Email:    demo@wastekart.in
Password: demo1234
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wastekart
JWT_SECRET=your_very_secret_key_here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Get a free Gemini API key:** https://aistudio.google.com/

---

## 🤖 AI Implementation Details

### 1. Material Detection (TensorFlow.js + OpenCV.js)
- Located in: `frontend/src/pages/BookingPage.jsx`
- In production: Uses TensorFlow.js MobileNet model for image classification
- In this implementation: Demonstrates the full UI/UX flow with simulated AI detection
- **To upgrade to real TensorFlow.js model:**

```bash
npm install @tensorflow/tfjs @tensorflow-models/mobilenet
```

```javascript
// In BookingPage.jsx, replace simulateAIPrediction with:
import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'

const model = await mobilenet.load()
const predictions = await model.classify(imgElement)
```

### 2. Gemini AI Chatbot
- Located in: `frontend/src/components/Chatbot.jsx`
- Uses Gemini 1.5 Flash model for real-time responses
- Smart fallback responses when no API key is provided
- Maintains conversation history for context-aware replies
- System prompt pre-configured with WasteKart knowledge

### 3. Vehicle Allocation Engine (Backend)
```
≤ 5 kg      → 🚲 Cycle
≤ 20 kg     → 🏍️ Motorcycle
≤ 50 kg     → 🛺 Auto Rickshaw
≤ 300 kg    → 🚛 Mini Truck
> 300 kg    → 🚚 Truck
E-waste     → Minimum Auto (safety requirement)
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login + get JWT | ❌ |
| GET | `/api/auth/profile` | Get user profile | ✅ |
| PUT | `/api/auth/profile` | Update profile | ✅ |
| GET | `/api/materials` | All material types | ❌ |
| GET | `/api/materials/prices` | Live prices by pincode | ❌ |
| GET | `/api/collectors` | List collectors | ❌ |
| GET | `/api/collectors/:id` | Single collector | ❌ |
| POST | `/api/bookings` | Create booking | ✅ |
| GET | `/api/bookings/my` | User's bookings | ✅ |
| GET | `/api/bookings/:id` | Booking detail | ✅ |
| PUT | `/api/bookings/:id/cancel` | Cancel booking | ✅ |
| GET | `/api/dashboard/stats` | Dashboard data | ✅ |
| GET | `/api/transactions` | Transaction history | ✅ |

---

## 🌍 Environmental Impact Algorithm

```javascript
// Per booking (in backend/models/Booking.js)
treesPlanted = Math.floor(totalWeight / 50)  // 1 tree per 50 kg
co2Saved     = totalWeight * 2.5              // 2.5 kg CO₂ per kg scrap
```

---

## 🗄️ Database Schema

### Collections
- **users** — Profile, address, cumulative impact stats
- **collectors** — Collector profile, material prices, service pincodes, vehicle types
- **bookings** — Pickup bookings with item breakdown, vehicle type, eco-metrics
- **transactions** — Payment records linked to bookings

---

## 🎨 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Charts | Recharts |
| Fonts | Syne (display) + DM Sans (body) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI (Detection) | TensorFlow.js + OpenCV.js (simulated) |
| AI (Chatbot) | Google Gemini 1.5 Flash |
| HTTP Client | Axios |

---

## 👨‍💻 Team
- **Project Guide:** Er. Sarika Singh
- Material adapted from: DermaCare PPR structure (ICAIDISS 2026 accepted)

---

## 📝 Project Objectives Mapping

| Objective | Implementation |
|-----------|---------------|
| AI-driven material analysis | TensorFlow.js + OpenCV.js detection on BookingPage |
| Product/collector recommendations | Price comparison engine + collector matching by pincode |
| Chatbot-based guidance | Gemini AI WasteBot (Chatbot.jsx) |
| Personalized care plans → Pickup plans | 3-step booking wizard with smart vehicle allocation |
| Progress tracking | Dashboard with monthly charts, eco-metrics |
| Freemium platform | Public price viewing + authenticated booking |

---

*♻️ WasteKart — Recycle Today. Breathe Tomorrow.*
