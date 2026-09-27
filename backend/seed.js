const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Group = require('./models/Group');
const Expense = require('./models/Expense');
const Settlement = require('./models/Settlement');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[SEED] Cleaning existing database collection...');
    await User.deleteMany({});
    await Group.deleteMany({});
    await Expense.deleteMany({});
    await Settlement.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    console.log('[SEED] Creating sample users...');
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

    console.log('[SEED] Creating sample groups...');
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

    console.log('[SEED] Creating sample expenses...');
    // Expense 1: Airbnb Resort (Alex paid $1200, split equal among 4 = $300 each)
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

    // Expense 2: Seafood Feast (Sarah paid $240, split percentage: Alex 40%, Sarah 30%, Michael 30%)
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

    // Expense 3: Jet Skiing (Michael paid $300, split exact: Alex $150, Michael $150)
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

    // Expense 4: Apartment Groceries (Sarah paid $150, split equal among 3 = $50 each)
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

    // Expense 5: 1-on-1 expense (Alex paid $80 for concert ticket with Emma)
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

    console.log('[SEED] Creating sample settlement...');
    // Settlement: Emma settled $100 to Alex for Goa Trip
    await Settlement.create({
      group: goaTrip._id,
      paidBy: emma._id,
      paidTo: alex._id,
      amount: 100,
      notes: 'Partial settlement via UPI',
      date: new Date(Date.now() - 1 * 86400000)
    });

    console.log('[SEED] Database seeded successfully!');
    console.log('\n--- DEMO USER CREDENTIALS ---');
    console.log('Email: alex@splitease.dev | Password: password123');
    console.log('Email: sarah@splitease.dev | Password: password123');
    console.log('Email: michael@splitease.dev | Password: password123');
    console.log('Email: emma@splitease.dev | Password: password123');
    console.log('-----------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('[SEED] Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
