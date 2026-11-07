import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

const getDayRange = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { start, end, date: d };
};

// @desc   Get doctor's queue for a particular date (Objective 6)
// @route  GET /api/queue/doctor-queue
export const getDoctorQueue = async (req, res) => {
  try {
    let doctorId = req.user.role === "admin" ? req.query.doctorId : null;

    // Doctors can only inspect their own queue, even if a doctorId query parameter is supplied.
    if (req.user.role === "doctor" || !doctorId) {
      const doc = await Doctor.findOne({ user: req.user.id });
      if (!doc) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found for this user."
        });
      }
      doctorId = doc._id;
    }

    const { start, end, date } = getDayRange(req.query.date);

    const appointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: start, $lte: end }
    })
      .populate("patient", "name")
      .sort({ tokenNumber: 1 });

    const currentlyServing = appointments.find((a) => a.status === "serving") || null;
    const waiting = appointments.filter((a) => a.status === "waiting");
    const completed = appointments.filter((a) => a.status === "completed");
    const cancelled = appointments.filter(
      (a) => a.status === "cancelled" || a.status === "no-show"
    );

    res.status(200).json({
      success: true,
      date: date.toISOString().split("T")[0],
      stats: {
        total: appointments.length,
        waitingCount: waiting.length,
        completedCount: completed.length,
        cancelledCount: cancelled.length,
        isServing: Boolean(currentlyServing)
      },
      currentlyServing,
      waiting,
      completed,
      cancelled,
      allAppointments: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch doctor queue.",
      error: error.message
    });
  }
};

// @desc   Doctor calls next patient in queue (Objective 6)
// @route  PUT /api/queue/call-next
export const callNextPatient = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found."
      });
    }

    const { start, end } = getDayRange(req.query.date);

    // If an appointment is currently 'serving', automatically complete it
    await Appointment.updateMany(
      {
        doctor: doctor._id,
        appointmentDate: { $gte: start, $lte: end },
        status: "serving"
      },
      { status: "completed" }
    );

    // Find next patient in waiting queue
    const nextPatient = await Appointment.findOneAndUpdate(
      {
        doctor: doctor._id,
        appointmentDate: { $gte: start, $lte: end },
        status: "waiting"
      },
      { status: "serving" },
      { new: true, sort: { tokenNumber: 1 } }
    ).populate("patient", "name email phone");

    if (!nextPatient) {
      return res.status(200).json({
        success: true,
        message: "No more waiting patients in queue for today.",
        appointment: null
      });
    }

    res.status(200).json({
      success: true,
      message: `Now serving Token #${nextPatient.tokenNumber} (${nextPatient.patient?.name})`,
      appointment: nextPatient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not call next patient.",
      error: error.message
    });
  }
};

// @desc   Doctor updates status or notes for an appointment (Objective 6)
// @route  PUT /api/queue/:appointmentId/status
export const updateQueueStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const allowedStatuses = ["waiting", "serving", "completed", "cancelled", "no-show"];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status."
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const doctor = req.user.role === "doctor" ? await Doctor.findOne({ user: req.user.id }) : null;
    if (req.user.role === "doctor" && !doctor) return res.status(404).json({ message: "Doctor profile not found." });
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.appointmentId, ...(doctor ? { doctor: doctor._id } : {}) },
      updateData,
      { new: true }
    )
      .populate("patient", "name email phone")
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name" }
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found."
      });
    }

    if (req.user.role !== "admin" && String(appointment.doctor?.user?._id || "") !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only update your own patients." });
    }

    res.status(200).json({
      success: true,
      message: `Appointment updated to '${status || appointment.status}'.`,
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not update queue status.",
      error: error.message
    });
  }
};

// @desc   Patient tracks live queue status for their appointment (Objective 5)
// @route  GET /api/queue/track/:appointmentId
export const trackPatientQueue = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate("patient", "name")
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name" }
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found."
      });
    }

    const ownsAppointment = String(appointment.patient?._id || "") === req.user.id;
    const isAssignedDoctor = String(appointment.doctor?.user?._id || "") === req.user.id;
    if (!ownsAppointment && !isAssignedDoctor && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied to this queue." });
    }

    const { start, end } = getDayRange(appointment.appointmentDate);

    // Find currently serving token for this doctor on this day
    const currentlyServing = await Appointment.findOne({
      doctor: appointment.doctor._id,
      appointmentDate: { $gte: start, $lte: end },
      status: "serving"
    }).select("tokenNumber tokenCode patient status");

    // Count waiting patients ahead of this patient
    const patientsAhead = await Appointment.countDocuments({
      doctor: appointment.doctor._id,
      appointmentDate: { $gte: start, $lte: end },
      status: "waiting",
      tokenNumber: { $lt: appointment.tokenNumber }
    });

    // Total waiting queue size
    const totalWaiting = await Appointment.countDocuments({
      doctor: appointment.doctor._id,
      appointmentDate: { $gte: start, $lte: end },
      status: "waiting"
    });

    const isServingNow = appointment.status === "serving";
    const isCompleted = appointment.status === "completed";
    const isCancelled = appointment.status === "cancelled" || appointment.status === "no-show";

    // Estimated wait time (approx 15 mins per patient ahead)
    let estimatedWaitMinutes = 0;
    if (appointment.status === "waiting") {
      estimatedWaitMinutes = (patientsAhead + (currentlyServing ? 1 : 0)) * 15;
    }

    res.status(200).json({
      success: true,
      appointment,
      liveQueue: {
        myToken: appointment.tokenNumber,
        myTokenCode: appointment.tokenCode || `Q-${appointment.tokenNumber}`,
        myStatus: appointment.status,
        currentlyServingToken: currentlyServing ? currentlyServing.tokenNumber : null,
        currentlyServingCode: currentlyServing ? currentlyServing.tokenCode || `Q-${currentlyServing.tokenNumber}` : "None yet",
        patientsAhead,
        totalWaiting,
        estimatedWaitMinutes,
        isMyTurn: isServingNow,
        isCompleted,
        isCancelled,
        doctorName: appointment.doctor.user?.name || "Doctor",
        doctorSpecialization: appointment.doctor.specialization,
        roomNumber: appointment.doctor.roomNumber || "Room 101",
        lastChecked: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not track queue status.",
      error: error.message
    });
  }
};

// @desc   Public live queue board for a doctor
// @route  GET /api/queue/live/:doctorId
export const getLiveDoctorQueue = async (req, res) => {
  try {
    const { start, end } = getDayRange(req.query.date);

    const doctor = await Doctor.findById(req.params.doctorId).populate(
      "user",
      "name email phone"
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found."
      });
    }

    const currentlyServing = await Appointment.findOne({
      doctor: doctor._id,
      appointmentDate: { $gte: start, $lte: end },
      status: "serving"
    }).select("tokenNumber tokenCode");

    const totalWaiting = await Appointment.countDocuments({
      doctor: doctor._id,
      appointmentDate: { $gte: start, $lte: end },
      status: "waiting"
    });

    const totalCompleted = await Appointment.countDocuments({
      doctor: doctor._id,
      appointmentDate: { $gte: start, $lte: end },
      status: "completed"
    });

    res.status(200).json({
      success: true,
      doctor: {
        id: doctor._id,
        name: doctor.user?.name,
        specialization: doctor.specialization,
        department: doctor.department,
        roomNumber: doctor.roomNumber,
        isAvailable: doctor.isAvailable
      },
      currentlyServingToken: currentlyServing ? currentlyServing.tokenNumber : null,
      currentlyServingCode: currentlyServing ? currentlyServing.tokenCode : "None yet",
      totalWaiting,
      totalCompleted,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not load live queue display.",
      error: error.message
    });
  }
};
