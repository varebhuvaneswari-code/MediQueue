import express from "express";
import {
  bookAppointment,
  getAvailableSlots,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  getAdminOverview
} from "../controllers/appointmentController.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Book an appointment (login required)
router.post("/book", authMiddleware, authorizeRoles("patient"), bookAppointment);

// View logged-in patient's appointments
router.get("/my-appointments", authMiddleware, authorizeRoles("patient"), getMyAppointments);
router.get("/admin/overview", authMiddleware, authorizeRoles("admin"), getAdminOverview);

// Get specific appointment
router.get("/:id", authMiddleware, getAppointmentById);
router.get(
  "/available-slots",
  authMiddleware,
  authorizeRoles("patient"),
  getAvailableSlots
);

// Cancel appointment
router.put("/:id/cancel", authMiddleware, cancelAppointment);

export default router;
