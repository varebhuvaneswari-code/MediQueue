
import mongoose from "mongoose";

const queueCounterSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    dateKey: {
      type: String,
      required: true
    },
    lastToken: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Each doctor gets a separate counter for each date
queueCounterSchema.index(
  { doctor: 1, dateKey: 1 },
  { unique: true }
);

const QueueCounter = mongoose.model(
  "QueueCounter",
  queueCounterSchema
);

export default QueueCounter;
