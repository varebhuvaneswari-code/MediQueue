import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";

// @desc   Get comprehensive system stats for admin dashboard (Objective 7)
// @route  GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      waitingCount,
      servingCount,
      completedCount,
      cancelledCount
    ] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: { $gte: todayStart, $lte: todayEnd }
      }),
      Appointment.countDocuments({ status: "waiting" }),
      Appointment.countDocuments({ status: "serving" }),
      Appointment.countDocuments({ status: "completed" }),
      Appointment.countDocuments({
        status: { $in: ["cancelled", "no-show"] }
      })
    ]);

    // Calculate department counts
    const doctors = await Doctor.find().select("specialization department consultationFee");
    const specializationsCount = {};
    doctors.forEach((d) => {
      const spec = d.specialization || "General";
      specializationsCount[spec] = (specializationsCount[spec] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        todayAppointments,
        statusBreakdown: {
          waiting: waitingCount,
          serving: servingCount,
          completed: completedCount,
          cancelled: cancelledCount
        },
        specializationsCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate admin statistics.",
      error: error.message
    });
  }
};

// @desc   Get all registered users with filter
// @route  GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role && role !== "all") {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message
    });
  }
};

// @desc   Get all doctors for management
// @route  GET /api/admin/doctors
export const getAllDoctorsAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("user", "name email phone role createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors list.",
      error: error.message
    });
  }
};

// @desc   Admin creates a doctor (creates User + Doctor profile simultaneously)
// @route  POST /api/admin/doctors
export const createDoctorByAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      qualification,
      experience,
      consultationFee,
      availableDays,
      availableTime,
      department,
      roomNumber
    } = req.body;

    if (!name || !email || !password || !phone || !specialization || !qualification) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required user and doctor details."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim(),
      role: "doctor"
    });

    const doctor = await Doctor.create({
      user: user._id,
      specialization: specialization.trim(),
      qualification: qualification.trim(),
      experience: Number(experience) || 1,
      consultationFee: Number(consultationFee) || 500,
      availableDays: availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      availableTime: availableTime || "09:00 AM - 05:00 PM",
      department: department || `${specialization.trim()} Department`,
      roomNumber: roomNumber || "Room 101",
      isAvailable: true
    });

    const populatedDoctor = await Doctor.findById(doctor._id).populate(
      "user",
      "name email phone role"
    );

    res.status(201).json({
      success: true,
      message: "Doctor created successfully!",
      doctor: populatedDoctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create doctor.",
      error: error.message
    });
  }
};

// @desc   Admin toggles doctor availability status
// @route  PATCH /api/admin/doctors/:id/toggle-status
export const toggleDoctorStatus = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found."
      });
    }

    doctor.isAvailable = !doctor.isAvailable;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor status updated to ${doctor.isAvailable ? "Available" : "Unavailable"}.`,
      isAvailable: doctor.isAvailable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle doctor status.",
      error: error.message
    });
  }
};

// @desc   Get all appointments across hospital with filters
// @route  GET /api/admin/appointments
export const getAllAppointmentsAdmin = async (req, res) => {
  try {
    const { doctorId, status, date } = req.query;
    const filter = {};

    if (doctorId && doctorId !== "all") {
      filter.doctor = doctorId;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (date) {
      const d = new Date(date);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      filter.appointmentDate = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(filter)
      .populate("patient", "name email phone")
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email phone" }
      })
      .sort({ appointmentDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments.",
      error: error.message
    });
  }
};

// @desc   Delete a user
// @route  DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account."
      });
    }

    await Doctor.deleteMany({ user: userId });
    await Appointment.deleteMany({ patient: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User and associated records removed successfully."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user.",
      error: error.message
    });
  }
};

