import express from "express";
import {
  getDoctors,
  getDoctorById,
  getSpecializations,
  createDoctor,
  getMyDoctorProfile,
  updateDoctorProfile
} from "../controllers/doctorController.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/meta/specializations", getSpecializations);
router.get("/me/profile", authMiddleware, authorizeRoles("doctor"), getMyDoctorProfile);
router.put("/me/profile", authMiddleware, authorizeRoles("doctor"), updateDoctorProfile);
router.get("/:id", getDoctorById);
router.get("/", getDoctors);
router.post("/", authMiddleware, authorizeRoles("doctor"), createDoctor);

export default router;
