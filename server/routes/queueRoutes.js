import express from "express";
import {
  getDoctorQueue,
  callNextPatient,
  updateQueueStatus,
  trackPatientQueue,
  getLiveDoctorQueue
} from "../controllers/queueController.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// View doctor's queue (doctors and admins)
router.get("/", authMiddleware, authorizeRoles("doctor", "admin"), getDoctorQueue);

// Call next patient (doctor)
router.put("/next", authMiddleware, authorizeRoles("doctor"), callNextPatient);

// Update appointment status (doctor and admin)
router.put("/:appointmentId/status", authMiddleware, authorizeRoles("doctor", "admin"), updateQueueStatus);

// Patient live queue tracking for their appointment
router.get("/track/:appointmentId", authMiddleware, trackPatientQueue);

// Public / general live queue board for a doctor
router.get("/live/:doctorId", getLiveDoctorQueue);

export default router;
