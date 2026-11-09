import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import seedInitialData from "./seed.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/admin", adminRoutes);

// Health check / welcome route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    name: "MediQueue API",
    version: "1.0.0",
    message: "Welcome to MediQueue Smart Healthcare Management System!",
    endpoints: {
      auth: "/api/auth",
      doctors: "/api/doctors",
      appointments: "/api/appointments",
      queue: "/api/queue",
      admin: "/api/admin"
    }
  });
});

// Central 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handling middleware (Objective 8)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

// Server initialization
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const isConnected = await connectDB();

    if (isConnected) {
      await seedInitialData();
    }

   const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 MediQueue server running on port ${PORT}`);
});
  } catch (error) {
    console.error("Startup error:", error.message);
  }
};

startServer();
