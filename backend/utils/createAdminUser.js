import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Admin user configuration
const ADMIN_USER = {
  name: 'Sanjay Admin',
  email: 'sanjay@admin.com',
  password: 'Ss@1234q',
  phone: '9123456789',
  role: 'admin',
  isEmailVerified: true,
  isPhoneVerified: true
};

const createAdminUser = async () => {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: ADMIN_USER.email });
    
    if (existingAdmin) {
      console.log(`⚠️  Admin user with email ${ADMIN_USER.email} already exists`);
      
      // Update existing admin user with new password
      existingAdmin.password = ADMIN_USER.password; // Will be hashed by pre-save middleware
      existingAdmin.name = ADMIN_USER.name;
      existingAdmin.role = ADMIN_USER.role;
      existingAdmin.isEmailVerified = ADMIN_USER.isEmailVerified;
      existingAdmin.isPhoneVerified = ADMIN_USER.isPhoneVerified;
      
      await existingAdmin.save();
      console.log('✅ Existing admin user updated successfully!');
    } else {
      // Create new admin user
      const adminUser = await User.create(ADMIN_USER);
      console.log('✅ New admin user created successfully!');
      console.log(`📧 Email: ${adminUser.email}`);
      console.log(`👤 Name: ${adminUser.name}`);
      console.log(`🔑 Role: ${adminUser.role}`);
      console.log(`🆔 User ID: ${adminUser._id}`);
    }

    // Display login credentials
    console.log('\n🎯 Admin Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${ADMIN_USER.email}`);
    console.log(`🔐 Password: ${ADMIN_USER.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // List all admin users
    const allAdmins = await User.find({ role: 'admin' }).select('name email createdAt');
    console.log('\n📋 All Admin Users:');
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email}) - Created: ${admin.createdAt.toLocaleDateString()}`);
    });

    console.log('\n🚀 Admin user setup completed successfully!');
    console.log('You can now login to the admin panel with the credentials above.');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.error('💡 This error usually means a user with this email or phone already exists.');
    }
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
};

// Run the script
createAdminUser();
