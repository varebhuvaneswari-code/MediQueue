import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

// @desc   Get all doctors (with optional search and specialization filters)
// @route  GET /api/doctors
export const getDoctors = async (req, res) => {
  try {
    const { specialization, search, day, all } = req.query;

    const filter = {};
    if (all !== "true") {
      filter.isAvailable = true;
    }

    if (specialization && specialization !== "All") {
      filter.specialization = { $regex: new RegExp(`^${specialization}$`, "i") };
    }

    if (day) {
      filter.availableDays = { $in: [day] };
    }

    let doctors = await Doctor.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 });

    // In case search query applies to user name
    if (search) {
      const searchRegex = new RegExp(search, "i");
      doctors = doctors.filter(
        (doc) =>
          (doc.user && searchRegex.test(doc.user.name)) ||
          searchRegex.test(doc.specialization) ||
          searchRegex.test(doc.department)
      );
    }

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

// @desc   Get single doctor by ID
// @route  GET /api/doctors/:id
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "user",
      "name"
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found."
      });
    }

    res.status(200).json({
      success: true,
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor details.",
      error: error.message
    });
  }
};

// @desc   Get list of all unique specializations
// @route  GET /api/doctors/meta/specializations
export const getSpecializations = async (req, res) => {
  try {
    const specializations = await Doctor.distinct("specialization");
    res.status(200).json({
      success: true,
      specializations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch specializations.",
      error: error.message
    });
  }
};

// @desc   Create doctor profile
// @route  POST /api/doctors
export const createDoctor = async (req, res) => {
  try {
    const {
      specialization,
      qualification,
      experience,
      consultationFee,
      availableDays,
      availableTime,
      department,
      roomNumber
    } = req.body;

    const targetUserId = req.user.id;

    if (
      !targetUserId ||
      !specialization ||
      !qualification ||
      experience === undefined ||
      consultationFee === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required doctor profile fields."
      });
    }

    // A doctor's profile can only be attached to the authenticated doctor account.
    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found."
      });
    }

    if (user.role !== "doctor") return res.status(403).json({ success: false, message: "A doctor account is required." });

    const existingDoctor = await Doctor.findOne({ user: targetUserId });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor profile already exists for this user."
      });
    }

    const doctor = await Doctor.create({
      user: targetUserId,
      specialization: specialization.trim(),
      qualification: qualification.trim(),
      experience: Number(experience),
      consultationFee: Number(consultationFee),
      availableDays: availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      availableTime: availableTime || "09:00 AM - 05:00 PM",
      department: department || `${specialization.trim()} Department`,
      roomNumber: roomNumber || "Room 101",
      isAvailable: true
    });

    res.status(201).json({
      success: true,
      message: "Doctor profile created successfully!",
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create doctor profile.",
      error: error.message
    });
  }
};

// @desc   Get doctor profile of currently logged-in doctor
// @route  GET /api/doctors/me/profile
export const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id }).populate(
      "user",
      "name email phone role"
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found for this account."
      });
    }

    res.status(200).json({
      success: true,
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve doctor profile.",
      error: error.message
    });
  }
};

// @desc   Update doctor profile / availability toggle
// @route  PUT /api/doctors/me/profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found."
      });
    }

    const {
      specialization,
      qualification,
      experience,
      consultationFee,
      availableDays,
      availableTime,
      department,
      roomNumber,
      isAvailable
    } = req.body;

    if (specialization) doctor.specialization = specialization;
    if (qualification) doctor.qualification = qualification;
    if (experience !== undefined) doctor.experience = Number(experience);
    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
    if (availableDays) doctor.availableDays = availableDays;
    if (availableTime) doctor.availableTime = availableTime;
    if (department) doctor.department = department;
    if (roomNumber) doctor.roomNumber = roomNumber;
    if (isAvailable !== undefined) doctor.isAvailable = Boolean(isAvailable);

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully!",
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update doctor profile.",
      error: error.message
    });
  }
};
