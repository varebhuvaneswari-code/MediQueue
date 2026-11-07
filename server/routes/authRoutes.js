import express from "express";
import {
  registerUser,
  loginUser,
  getMe
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Patient, doctor, and user registration
router.post("/register", registerUser);

// User login
router.post("/login", loginUser);

// Get current logged in user
router.get("/me", authMiddleware, getMe);

export default router;
