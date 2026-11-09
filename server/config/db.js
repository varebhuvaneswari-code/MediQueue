import mongoose from "mongoose";

const connectDB = async () => {
  const urisToTry = [
    process.env.MONGO_URI,
    "mongodb://127.0.0.1:27017/mediqueue"
  ].filter(Boolean);

  let connected = false;

  for (const uri of urisToTry) {
    try {
      console.log(`Connecting to MongoDB at: ${uri.split("@").pop() || uri}...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000
      });
      console.log("✅ MongoDB Connected Successfully!");
      console.log("DATABASE NAME:", mongoose.connection.name);
      console.log("DATABASE HOST:", mongoose.connection.host);
      connected = true;
      break;
    } catch (err) {
      console.warn(`⚠️ MongoDB connection attempt failed for ${uri.split("@").pop() || uri}:`, err.message);
    }
  }

  if (!connected) {
    console.error("❌ Warning: Could not connect to any MongoDB instance. Ensure MongoDB is running locally at mongodb://127.0.0.1:27017/mediqueue or check your Atlas IP whitelist.");
  }

  return connected;
};

export default connectDB;
