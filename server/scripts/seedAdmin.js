/**
 * Seed script — creates the initial admin user.
 * Run once: node scripts/seedAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'changeme123';

    const existing = await Admin.findOne({ username });
    if (existing) {
      console.log(`Admin "${username}" already exists. Skipping.`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    await Admin.create({ username, passwordHash });
    console.log(`✅ Admin user "${username}" created successfully!`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`\n⚠️  Change the password in production via ADMIN_PASSWORD in .env`);
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedAdmin();
