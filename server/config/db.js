
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is missing from environment variables");
    }

    await mongoose.connect(mongoURI);

    console.log("✅ MongoDB Atlas Connected Successfully!");
    console.log("DATABASE NAME:", mongoose.connection.name);
    console.log("DATABASE HOST:", mongoose.connection.host);

    return true;
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    return false;
  }
};

export default connectDB;
