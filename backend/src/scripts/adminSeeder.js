const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/photo-marathon', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Username: admin');
      console.log('Password: admin@123');
      process.exit(0);
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('admin@123', saltRounds);

    // Create admin user
    const admin = new Admin({
      username: 'admin',
      passwordHash: passwordHash,
      createdAt: new Date()
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin@123');
    console.log('Admin ID:', admin_id);

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeder
seedAdmin();
