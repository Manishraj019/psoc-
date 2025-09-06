const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
require('dotenv').config();

const testAdminLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/photo-marathon', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');

    // Find admin user
    const admin = await Admin.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('❌ Admin user not found. Run: npm run seed:admin');
      process.exit(1);
    }

    console.log('✅ Admin user found');
    console.log('Username:', admin.username);
    console.log('Created at:', admin.createdAt);

    // Test password verification
    const testPassword = 'admin@123';
    const isValidPassword = await bcrypt.compare(testPassword, admin.passwordHash);
    
    if (isValidPassword) {
      console.log('✅ Password verification successful');
      console.log('Login credentials work correctly!');
    } else {
      console.log('❌ Password verification failed');
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the test
testAdminLogin();
