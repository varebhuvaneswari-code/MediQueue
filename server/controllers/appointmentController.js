import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import QueueCounter from "../models/QueueCounter.js";
import User from "../models/User.js";

// @desc   Book an appointment and generate queue token automatically
// @route  POST /api/appointments/book
export const bookAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctorId, doctor: doctorAlias, appointmentDate, timeSlot, reason } = req.body;
    const selectedDoctorId = doctorId || doctorAlias;

    if (!selectedDoctorId || !appointmentDate) {
      return res.status(400).json({
        success: false,
        message: "Doctor and appointment date are required."
      });
    }

    const doctor = await Doctor.findOne({ _id: selectedDoctorId, isAvailable: true }).populate("user", "name");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found."
      });
    }

    const parsedDate = new Date(appointmentDate);
    if (isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid future appointment date and time."
      });
    }

    // Format date key (YYYY-MM-DD) for daily queue sequence per doctor
    const dateKey = [parsedDate.getFullYear(), String(parsedDate.getMonth() + 1).padStart(2, "0"), String(parsedDate.getDate()).padStart(2, "0")].join("-");

    // Atomically increment and fetch next queue token (Objective 4)
    let counter;
    try {
      counter = await QueueCounter.findOneAndUpdate(
        { doctor: doctor._id, dateKey }, { $inc: { lastToken: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } catch (error) {
      // Two first bookings for a new doctor/date can race to create the indexed counter.
      if (error.code !== 11000) throw error;
      counter = await QueueCounter.findOneAndUpdate(
        { doctor: doctor._id, dateKey }, { $inc: { lastToken: 1 } }, { new: true }
      );
    }

    const tokenNumber = counter.lastToken;
    const tokenCode = `Q-${tokenNumber < 10 ? "0" : ""}${tokenNumber}`;

    // Create secure appointment entry (Objective 3, 4, 8)
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctor._id,
      appointmentDate: parsedDate,
      timeSlot: timeSlot || "Regular Consultation Hours",
      reason: reason && reason.trim() ? reason.trim() : "General Consultation",
      tokenNumber,
      tokenCode,
      status: "waiting"
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "name")
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name" }
      });

    res.status(201).json({
      success: true,
      message: `Appointment booked successfully! Your Queue Token is ${tokenCode} (#${tokenNumber}).`,
      tokenNumber,
      tokenCode,
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      success: false,
      message: "Appointment booking failed.",
      error: error.message
    });
  }
};

// @desc   Get logged-in patient's appointments
// @route  GET /api/appointments/my-appointments
export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;

    const appointments = await Appointment.find({ patient: patientId })
      .populate("patient", "name")
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name" }
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
      message: "Unable to fetch your appointments.",
      error: error.message
    });
  }
};

// @desc   Get single appointment details
// @route  GET /api/appointments/:id
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name email phone")
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email phone" }
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found."
      });
    }

    // Access control: only owner patient, assigned doctor, or admin can view
    const isOwnerPatient = String(appointment.patient._id) === req.user.id;
    const isAssignedDoctor = appointment.doctor.user && String(appointment.doctor.user._id) === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwnerPatient && !isAssignedDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this appointment."
      });
    }

    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment.",
      error: error.message
    });
  }
};

// @desc   Cancel appointment
// @route  PUT /api/appointments/:id/cancel
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({
      path: "doctor",
      populate: { path: "user", select: "_id" }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found."
      });
    }

    // Authorization check
    const isOwnerPatient = String(appointment.patient) === req.user.id;
    const isAssignedDoctor = appointment.doctor?.user && String(appointment.doctor.user._id) === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwnerPatient && !isAssignedDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this appointment."
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully.",
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cancellation failed.",
      error: error.message
    });
  }
};

export const getAdminOverview = async (req, res) => {
  try {
    const [patients, doctors, appointments, recentAppointments] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Appointment.find().sort({ createdAt: -1 }).limit(12)
        .populate("patient", "name")
        .populate({ path: "doctor", populate: { path: "user", select: "name" } })
    ]);
    res.json({ patients, doctors, appointments, recentAppointments });
  } catch (error) {
    res.status(500).json({ message: "Unable to load management dashboard." });
  }
};
