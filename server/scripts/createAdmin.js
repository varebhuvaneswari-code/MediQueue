import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

const required = ["MONGO_URI", "ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD", "ADMIN_PHONE"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing environment values: ${missing.join(", ")}`);
  process.exit(1);
}
if (process.env.ADMIN_PASSWORD.length < 12) {
  console.error("ADMIN_PASSWORD must be at least 12 characters.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  if (await User.exists({ email })) throw new Error("That email already belongs to an account; choose a new admin email.");
  await User.create({
    name: process.env.ADMIN_NAME.trim(),
    email,
    phone: process.env.ADMIN_PHONE.trim(),
    password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
    role: "admin",
  });
  console.log(`Administrator account created for ${email}.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
