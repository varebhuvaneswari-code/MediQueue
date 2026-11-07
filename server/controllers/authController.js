import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// @desc   Register a new user (Patient or Doctor)
// @route  POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, password, and phone."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    // Hash password securely (Objective 8)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Patients and doctors can self-register; admin cannot self-register directly unless designated
    const assignedRole = role === "doctor" ? "doctor" : "patient";

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim(),
      role: assignedRole
    });

    const token = generateToken(user);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: `${assignedRole.charAt(0).toUpperCase() + assignedRole.slice(1)} account registered successfully!`,
      token,
      user: safeUser
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration.",
      error: error.message
    });
  }
};

// @desc   Log in user
// @route  POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // Verify hashed password (Objective 8)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = generateToken(user);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    };

    // If user is a doctor, find their doctor profile ID
    let doctorProfile = null;
    if (user.role === "doctor") {
      doctorProfile = await Doctor.findOne({ user: user._id });
      if (doctorProfile) {
        safeUser.doctorProfileId = doctorProfile._id;
        safeUser.specialization = doctorProfile.specialization;
      }
    }

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: safeUser,
      doctorProfile
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login.",
      error: error.message
    });
  }
};

// @desc   Get current user profile
// @route  GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    let doctorProfile = null;
    if (user.role === "doctor") {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      doctorProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve profile.",
      error: error.message
    });
  }
};
