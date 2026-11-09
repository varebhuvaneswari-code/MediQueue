
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import QueueCounter from "../models/QueueCounter.js";

// ======================================================
// AVAILABLE APPOINTMENT SLOTS
// ======================================================

const appointmentSlots = [
  "09:00 AM - 11:00 AM (Morning OPD)",
  "11:00 AM - 01:00 PM (Mid-day OPD)",
  "02:00 PM - 04:00 PM (Afternoon OPD)",
  "04:00 PM - 06:00 PM (Evening OPD)"
];

// ======================================================
// HELPER: GET DATE RANGE
// ======================================================

const getDateRange = (date) => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate
  };
};

// ======================================================
// 1. GET AVAILABLE APPOINTMENT SLOTS
// ======================================================

export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        message: "Doctor ID and appointment date are required"
      });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    const selectedDate = new Date(date);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid appointment date"
      });
    }

    const { startDate, endDate } = getDateRange(selectedDate);

    const appointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: {
        $gte: startDate,
        $lte: endDate
      },
      status: {
        $ne: "cancelled"
      }
    });

    const bookedSlots = appointments.map(
      (appointment) => appointment.timeSlot
    );

    const availableSlots = appointmentSlots.map((slot) => ({
      timeSlot: slot,
      available: !bookedSlots.includes(slot)
    }));

    return res.status(200).json({
      message: "Available slots fetched successfully",
      availableSlots
    });

  } catch (error) {
    console.error("Get available slots error:", error);

    return res.status(500).json({
      message: "Failed to fetch available slots",
      error: error.message
    });
  }
};

// ======================================================
// 2. BOOK APPOINTMENT
// ======================================================

export const bookAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;

    const {
      doctorId,
      doctor,
      appointmentDate,
      timeSlot,
      reason
    } = req.body;

    const selectedDoctorId = doctorId || doctor;

    // Validate required fields
    if (!selectedDoctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        message: "Doctor, appointment date and time slot are required"
      });
    }

    // Validate appointment slot
    if (!appointmentSlots.includes(timeSlot)) {
      return res.status(400).json({
        message: "Invalid appointment time slot"
      });
    }

    // Check doctor
    const doctorExists = await Doctor.findById(selectedDoctorId);

    if (!doctorExists) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    // Validate appointment date
    const selectedDate = new Date(appointmentDate);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid appointment date"
      });
    }

    if (selectedDate <= new Date()) {
      return res.status(400).json({
        message: "Please select a future appointment date"
      });
    }

    const { startDate, endDate } = getDateRange(selectedDate);

    // Check whether this doctor and slot are already booked
    const existingAppointment = await Appointment.findOne({
      doctor: selectedDoctorId,
      appointmentDate: {
        $gte: startDate,
        $lte: endDate
      },
      timeSlot,
      status: {
        $ne: "cancelled"
      }
    });

    if (existingAppointment) {
      return res.status(409).json({
        message:
          "This appointment slot is already booked. Please select another slot."
      });
    }

    // ==================================================
    // GENERATE QUEUE TOKEN
    // ==================================================

    const dateKey = selectedDate.toISOString().split("T")[0];

    let counter;

    try {
      counter = await QueueCounter.findOneAndUpdate(
        {
          doctor: selectedDoctorId,

          // IMPORTANT:
          // QueueCounter schema uses dateKey, NOT date
          dateKey: dateKey
        },
        {
          $inc: {
            lastToken: 1
          }
        },
        {
          new: true,
          upsert: true
        }
      );

    } catch (counterError) {
      if (counterError.code === 11000) {
        return res.status(409).json({
          message: "Please try booking again"
        });
      }

      throw counterError;
    }

    const tokenNumber = counter.lastToken;

    const tokenCode = `Q-${String(tokenNumber).padStart(2, "0")}`;

    // ==================================================
    // CREATE APPOINTMENT
    // ==================================================

    const newAppointment = await Appointment.create({
      patient: patientId,
      doctor: selectedDoctorId,
      appointmentDate: selectedDate,
      timeSlot,
      reason: reason || "General Consultation",
      tokenNumber,
      tokenCode,
      status: "waiting"
    });

    // Populate patient and doctor details
    const populatedAppointment = await Appointment.findById(
      newAppointment._id
    )
      .populate("patient", "name email")
      .populate("doctor");

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment: populatedAppointment
    });

  } catch (error) {
    console.error("Book appointment error:", error);

    return res.status(500).json({
      message: "Failed to book appointment",
      error: error.message
    });
  }
};

// ======================================================
// 3. GET MY APPOINTMENTS
// ======================================================

export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;

    const appointments = await Appointment.find({
      patient: patientId
    })
      .populate("doctor")
      .sort({
        appointmentDate: -1,
        createdAt: -1
      });

    return res.status(200).json({
      message: "Appointments fetched successfully",
      appointments
    });

  } catch (error) {
    console.error("Get my appointments error:", error);

    return res.status(500).json({
      message: "Failed to fetch appointments",
      error: error.message
    });
  }
};

// ======================================================
// 4. GET APPOINTMENT BY ID
// ======================================================

export const getAppointmentById = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate("patient", "name email")
      .populate("doctor");

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    // Patient can access only their own appointment
    if (
      req.user.role === "patient" &&
      appointment.patient._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You are not authorized to view this appointment"
      });
    }

    return res.status(200).json({
      message: "Appointment fetched successfully",
      appointment
    });

  } catch (error) {
    console.error("Get appointment error:", error);

    return res.status(500).json({
      message: "Failed to fetch appointment",
      error: error.message
    });
  }
};

// ======================================================
// 5. CANCEL APPOINTMENT
// ======================================================

export const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    // Patient can cancel only their own appointment
    if (
      req.user.role === "patient" &&
      appointment.patient.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You are not authorized to cancel this appointment"
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        message: "Appointment is already cancelled"
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        message: "Completed appointments cannot be cancelled"
      });
    }

    appointment.status = "cancelled";

    await appointment.save();

    return res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment
    });

  } catch (error) {
    console.error("Cancel appointment error:", error);

    return res.status(500).json({
      message: "Failed to cancel appointment",
      error: error.message
    });
  }
};

// ======================================================
// 6. ADMIN OVERVIEW
// ======================================================

export const getAdminOverview = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({
      role: "patient"
    });

    const totalDoctors = await Doctor.countDocuments();

    const totalAppointments = await Appointment.countDocuments();

    const recentAppointments = await Appointment.find()
      .populate("patient", "name email")
      .populate("doctor")
      .sort({
        createdAt: -1
      })
      .limit(12);

    return res.status(200).json({
      message: "Admin overview fetched successfully",
      overview: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        recentAppointments
      }
    });

  } catch (error) {
    console.error("Admin overview error:", error);

    return res.status(500).json({
      message: "Failed to fetch admin overview",
      error: error.message
    });
  }
};
