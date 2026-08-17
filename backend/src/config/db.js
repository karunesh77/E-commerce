import mongoose from "mongoose";

// Lambda "warm" rehte waqt is variable ko yaad rakhta hai —
// isliye har request pe dobara connect nahi karna padta
let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) return;

  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    bufferCommands: false, // Lambda mein connection ready na ho toh turant fail karo, hang mat karo
  });

  isConnected = true;
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;
