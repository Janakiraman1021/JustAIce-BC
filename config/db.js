// config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,       // Not required in Mongoose 7+, but safe to keep
      useUnifiedTopology: true     // Also deprecated in 7+, safe to ignore
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`📡 Using DB: ${conn.connection.name}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log(err.stack);
    console.log('Please check your MongoDB URI in .env file');
    process.exit(1); // Stop server if DB fails
  }
};

export default connectDB;
