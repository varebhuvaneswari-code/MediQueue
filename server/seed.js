import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Doctor from "./models/Doctor.js";
import Appointment from "./models/Appointment.js";
import QueueCounter from "./models/QueueCounter.js";

export const seedInitialData = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      return; // Already initialized
    }

    console.log("🌱 Seeding initial MediQueue system data (Admin, Doctors, Patients)...");

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash("Admin@123", salt);
    const doctorPassword = await bcrypt.hash("Doctor@123", salt);
    const patientPassword = await bcrypt.hash("Patient@123", salt);

    // 1. Create Default Admin
    const admin = await User.create({
      name: "MediQueue Administrator",
      email: "admin@mediqueue.com",
      password: adminPassword,
      phone: "+91 98765 43210",
      role: "admin"
    });

    // 2. Create Doctors
    const doctorsData = [
      {
        name: "Dr. Sarah Johnson",
        email: "dr.sarah@mediqueue.com",
        phone: "+91 98765 00001",
        specialization: "Cardiology",
        qualification: "MBBS, MD, FACC",
        experience: 14,
        consultationFee: 700,
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        availableTime: "09:00 AM - 02:00 PM",
        department: "Cardiology & Vascular Care",
        roomNumber: "Room 101"
      },
      {
        name: "Dr. Rajesh Kumar",
        email: "dr.rajesh@mediqueue.com",
        phone: "+91 98765 00002",
        specialization: "Pediatrics",
        qualification: "MBBS, DCH, MD (Pediatrics)",
        experience: 9,
        consultationFee: 500,
        availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
        availableTime: "10:00 AM - 04:00 PM",
        department: "Child Health & Pediatrics",
        roomNumber: "Room 105"
      },
      {
        name: "Dr. Emily Chen",
        email: "dr.emily@mediqueue.com",
        phone: "+91 98765 00003",
        specialization: "Dermatology",
        qualification: "MBBS, MD (Dermatology)",
        experience: 11,
        consultationFee: 600,
        availableDays: ["Tuesday", "Thursday", "Saturday"],
        availableTime: "11:00 AM - 05:00 PM",
        department: "Dermatology & Skin Center",
        roomNumber: "Room 203"
      },
      {
        name: "Dr. Michael Adams",
        email: "dr.michael@mediqueue.com",
        phone: "+91 98765 00004",
        specialization: "Orthopedics",
        qualification: "MBBS, MS (Ortho), M.Ch",
        experience: 16,
        consultationFee: 750,
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        availableTime: "09:30 AM - 03:30 PM",
        department: "Orthopedics & Joint Replacement",
        roomNumber: "Room 302"
      }
    ];

    const createdDoctors = [];
    for (const doc of doctorsData) {
      const user = await User.create({
        name: doc.name,
        email: doc.email,
        password: doctorPassword,
        phone: doc.phone,
        role: "doctor"
      });

      const doctor = await Doctor.create({
        user: user._id,
        specialization: doc.specialization,
        qualification: doc.qualification,
        experience: doc.experience,
        consultationFee: doc.consultationFee,
        availableDays: doc.availableDays,
        availableTime: doc.availableTime,
        department: doc.department,
        roomNumber: doc.roomNumber,
        isAvailable: true
      });

      createdDoctors.push({ user, doctor });
    }

    // 3. Create Sample Patient
    const patientUser = await User.create({
      name: "John Doe",
      email: "patient@mediqueue.com",
      password: patientPassword,
      phone: "+91 98765 99999",
      role: "patient"
    });

    // 4. Create Sample Appointments & Queues for Today
    const today = new Date();
    const dateKey = today.toISOString().split("T")[0];

    // Sarah Johnson Queue
    const sarahDoctor = createdDoctors[0].doctor;
    await QueueCounter.create({
      doctor: sarahDoctor._id,
      dateKey,
      lastToken: 3
    });

    // Appointment 1: Serving
    await Appointment.create({
      patient: patientUser._id,
      doctor: sarahDoctor._id,
      appointmentDate: today,
      timeSlot: "09:00 AM - 10:00 AM",
      reason: "Routine cardiac checkup & ECG review",
      tokenNumber: 1,
      tokenCode: "Q-01",
      status: "serving"
    });

    // Appointment 2 & 3: Waiting
    const patient2 = await User.create({
      name: "Ananya Sharma",
      email: "ananya@example.com",
      password: patientPassword,
      phone: "+91 98765 88888",
      role: "patient"
    });

    await Appointment.create({
      patient: patient2._id,
      doctor: sarahDoctor._id,
      appointmentDate: today,
      timeSlot: "10:00 AM - 11:00 AM",
      reason: "High blood pressure monitoring",
      tokenNumber: 2,
      tokenCode: "Q-02",
      status: "waiting"
    });

    console.log("✅ Seed complete! Default accounts created:");
    console.log("   Admin:   admin@mediqueue.com   / Admin@123");
    console.log("   Doctor:  dr.sarah@mediqueue.com / Doctor@123");
    console.log("   Patient: patient@mediqueue.com  / Patient@123");
  } catch (error) {
    console.warn("Seeding notice (might already be seeded or Mongo offline):", error.message);
  }
};

export default seedInitialData;

