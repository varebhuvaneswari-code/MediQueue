import express from "express";
import {
  getAdminStats,
  getAllUsers,
  getAllDoctorsAdmin,
  createDoctorByAdmin,
  toggleDoctorStatus,
  getAllAppointmentsAdmin,
  deleteUser
} from "../controllers/adminController.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Enforce admin-only access on all routes in this router
router.use(authMiddleware, authorizeRoles("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/doctors", getAllDoctorsAdmin);
router.post("/doctors", createDoctorByAdmin);
router.patch("/doctors/:id/toggle-status", toggleDoctorStatus);
router.get("/appointments", getAllAppointmentsAdmin);

export default router;

