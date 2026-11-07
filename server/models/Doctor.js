import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    specialization: {
      type: String,
      required: true,
      trim: true
    },
    qualification: {
      type: String,
      required: true,
      trim: true
    },
    experience: {
      type: Number,
      required: true,
      min: 0
    },
    consultationFee: {
      type: Number,
      required: true,
      min: 0
    },
    availableDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    },
    availableTime: {
      type: String,
      default: "09:00 AM - 05:00 PM"
    },
    department: {
      type: String,
      default: "General OPD"
    },
    roomNumber: {
      type: String,
      default: "Room 101"
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
