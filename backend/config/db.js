import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(' WARNING: MONGODB_URI environment variable is not defined.');
    console.warn('Database operations will run on a local fail-safe context or throw errors until connected.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(` MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);
    // Do not crash the entire app; allow development server to run with warnings
    return null;
  }
};

export default connectDB;
