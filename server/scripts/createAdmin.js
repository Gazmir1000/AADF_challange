const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import the User model
const User = require('../models/userModel');

// Admin credentials from environment variables
const adminCredentials = {
  name:  'Administrator',
  NUIS: process.env.ADMIN_NUIS || 'A12345678X',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  phone: process.env.ADMIN_PHONE || '+355123456789',
  address:  'Central Administration',
  password: process.env.ADMIN_PASSWORD || 'Admin123!',
  role: 'staff'
};

// Connect to MongoDB - using 127.0.0.1 instead of localhost
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tender-management';

async function createAdmin() {
  console.log('Creating admin user...');
  console.log(`Using MongoDB URI: ${MONGODB_URI}`);
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminCredentials.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
    } else {
      // Create admin user
      const admin = await User.create(adminCredentials);
      
      console.log('Admin user created successfully!');
      console.log(`Name: ${admin.name}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Role: ${admin.role}`);
    }
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    
    // Additional information for validation errors
    if (error.name === 'ValidationError') {
      for (const field in error.errors) {
        console.error(`- ${field}: ${error.errors[field].message}`);
      }
    }
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Execute the function
createAdmin(); 