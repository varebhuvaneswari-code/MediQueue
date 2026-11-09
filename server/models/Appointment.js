
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },

    appointmentDate: {
      type: Date,
      required: true
    },

    timeSlot: {
      type: String,
      default: "09:00 AM - 10:00 AM"
    },

    // Unique key for an active doctor/date/time booking
    slotKey: {
      type: String,
      unique: true,
      sparse: true
    },

    reason: {
      type: String,
      default: "General Consultation"
    },

    tokenNumber: {
      type: Number,
      required: true
    },

    tokenCode: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "waiting",
        "serving",
        "completed",
        "cancelled",
        "no-show"
      ],
      default: "waiting"
    },

    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// Queue lookup
appointmentSchema.index({
  doctor: 1,
  appointmentDate: 1,
  status: 1
});

// Patient appointment lookup
appointmentSchema.index({
  patient: 1,
  appointmentDate: -1
});

const Appointment = mongoose.model(
  "Appointment",
  appointmentSchema
);

export default Appointment;
