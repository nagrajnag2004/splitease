const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/balances', require('./routes/balanceRoutes'));
app.use('/api/settlements', require('./routes/settlementRoutes'));
app.use('/api/friends', require('./routes/friendRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SplitEase Backend Server is running smoothly!' });
});

// Seed endpoint for quick demo setup from frontend
app.post('/api/seed', async (req, res) => {
  try {
    const User = require('./models/User');
    const Group = require('./models/Group');
    const Expense = require('./models/Expense');
    const Settlement = require('./models/Settlement');
    const bcrypt = require('bcryptjs');

    await User.deleteMany({});
    await Group.deleteMany({});
    await Expense.deleteMany({});
    await Settlement.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const alex = await User.create({
      name: 'Alex Rivera',
      email: 'alex@splitease.dev',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex'
    });

    const sarah = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@splitease.dev',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah'
    });

    const michael = await User.create({
      name: 'Michael Scott',
      email: 'michael@splitease.dev',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Michael'
    });

    const emma = await User.create({
      name: 'Emma Watson',
      email: 'emma@splitease.dev',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Emma'
    });

    const goaTrip = await Group.create({
      name: 'Goa Beach Vacation 🏖️',
      description: 'Sun, sand, Airbnb and seafood expenses!',
      category: 'Trip',
      createdBy: alex._id,
      members: [alex._id, sarah._id, michael._id, emma._id]
    });

    const apartment = await Group.create({
      name: 'Penthouse Apartment 🏢',
      description: 'Monthly rent, groceries, electricity and Wi-Fi',
      category: 'Home',
      createdBy: sarah._id,
      members: [alex._id, sarah._id, michael._id]
    });

    await Expense.create({
      group: goaTrip._id,
      description: 'Luxury Beach Airbnb Villa (3 Nights)',
      amount: 1200,
      paidBy: alex._id,
      splitType: 'equal',
      splits: [
        { user: alex._id, amount: 300, percentage: 25 },
        { user: sarah._id, amount: 300, percentage: 25 },
        { user: michael._id, amount: 300, percentage: 25 },
        { user: emma._id, amount: 300, percentage: 25 }
      ],
      category: 'Travel',
      date: new Date(Date.now() - 5 * 86400000),
      notes: 'Confirmation #AB-99214'
    });

    await Expense.create({
      group: goaTrip._id,
      description: 'Seafood Shack Dinner & Cocktails 🦞',
      amount: 240,
      paidBy: sarah._id,
      splitType: 'percentage',
      splits: [
        { user: alex._id, amount: 96, percentage: 40 },
        { user: sarah._id, amount: 72, percentage: 30 },
        { user: michael._id, amount: 72, percentage: 30 }
      ],
      category: 'Food & Dining',
      date: new Date(Date.now() - 3 * 86400000),
      notes: 'Included tip'
    });

    await Expense.create({
      group: goaTrip._id,
      description: 'Jet Skiing & Water Sports 🚤',
      amount: 300,
      paidBy: michael._id,
      splitType: 'exact',
      splits: [
        { user: alex._id, amount: 150, percentage: 50 },
        { user: michael._id, amount: 150, percentage: 50 }
      ],
      category: 'Entertainment',
      date: new Date(Date.now() - 2 * 86400000)
    });

    await Expense.create({
      group: apartment._id,
      description: 'Weekly Organic Groceries 🛒',
      amount: 150,
      paidBy: sarah._id,
      splitType: 'equal',
      splits: [
        { user: alex._id, amount: 50, percentage: 33.33 },
        { user: sarah._id, amount: 50, percentage: 33.33 },
        { user: michael._id, amount: 50, percentage: 33.34 }
      ],
      category: 'Rent & Utilities',
      date: new Date(Date.now() - 1 * 86400000)
    });

    await Expense.create({
      group: null,
      description: 'Coldplay Concert Ticket 🎸',
      amount: 160,
      paidBy: alex._id,
      splitType: 'equal',
      splits: [
        { user: alex._id, amount: 80, percentage: 50 },
        { user: emma._id, amount: 80, percentage: 50 }
      ],
      category: 'Entertainment',
      date: new Date(Date.now() - 4 * 86400000)
    });

    await Settlement.create({
      group: goaTrip._id,
      paidBy: emma._id,
      paidTo: alex._id,
      amount: 100,
      notes: 'Partial settlement via UPI',
      date: new Date(Date.now() - 1 * 86400000)
    });

    res.json({
      message: 'Demo database seeded successfully!',
      demoUser: { email: 'alex@splitease.dev', password: 'password123' }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SERVER] SplitEase backend running on port ${PORT}`);
});
