import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error('Please define the MONGODB_URL environment variable inside .env.local');
}

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Connection Error:", error);
    throw error; // Re-throw the error so calling functions know connection failed
  }
};
