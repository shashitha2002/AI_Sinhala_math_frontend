const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from server/.env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://IreshDB:IreshDB@cluster01.s0ull8e.mongodb.net/ol_math_platform';
    
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  Warning: MONGODB_URI not set in .env file, using default local connection');
    }
    
    console.log('🔄 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(mongoURI);

    console.log('\n✅ ====================================');
    console.log(`   MongoDB Connected Successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log('=====================================\n');
    
    return conn;
  } catch (error) {
    console.error('\n❌ ====================================');
    console.error('   MongoDB Connection Error!');
    console.error(`   Error: ${error.message}`);
    console.error('=====================================\n');
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;

