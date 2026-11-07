import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

function DoctorRegister() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    specialization: "",
    qualification: "",
    experience: 5,
    consultationFee: 500,
    department: "",
    roomNumber: "Room 101",
    availableTime: "09:00 AM - 05:00 PM",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    isAvailable: true
  });

  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(false);
  const [error, setError] = useState("");

  const daysList = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Check if doctor profile already exists
    apiFetch("/doctors/me/profile")
      .then((data) => {
        if (data.doctor) {
          setExistingProfile(true);
          setForm({
            specialization: data.doctor.specialization || "",
            qualification: data.doctor.qualification || "",
            experience: data.doctor.experience || 0,
            consultationFee: data.doctor.consultationFee || 500,
            department: data.doctor.department || "",
            roomNumber: data.doctor.roomNumber || "Room 101",
            availableTime: data.doctor.availableTime || "09:00 AM - 05:00 PM",
            availableDays: data.doctor.availableDays || [],
            isAvailable: data.doctor.isAvailable ?? true
          });
        }
      })
      .catch(() => {
        // No existing doctor profile yet
      });
  }, [isAuthenticated]);

  const handleDayToggle = (day) => {
    setForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (existingProfile) {
        await apiFetch("/doctors/me/profile", {
          method: "PUT",
          body: JSON.stringify(form)
        });
        alert("Doctor profile updated successfully!");
      } else {
        await apiFetch("/doctors", {
          method: "POST",
          body: JSON.stringify({
            ...form,
            userId: user._id
          })
        });
        alert("Doctor profile created successfully!");
      }

      navigate("/doctor-dashboard");
    } catch (err) {
      setError(err.message || "Failed to save doctor profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-modern" style={{ maxWidth: "600px" }}>
        <div className="auth-header">
          <span className="auth-icon-badge">🩺</span>
          <h2>{existingProfile ? "Update Clinical Profile" : "Create Doctor Profile"}</h2>
          <p>Configure your clinical specialty, consultation fee, room, and timings</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row-2">
            <div className="form-group">
              <label>Specialization</label>
              <input
                type="text"
                required
                placeholder="e.g. Cardiology, Pediatrics"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Qualifications</label>
              <input
                type="text"
                required
                placeholder="e.g. MBBS, MD, MS"
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Experience (Years)</label>
              <input
                type="number"
                min="0"
                required
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Consultation Fee (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={form.consultationFee}
                onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>OPD Room / Cabin</label>
              <input
                type="text"
                value={form.roomNumber}
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Consultation Hours</label>
              <input
                type="text"
                value={form.availableTime}
                onChange={(e) => setForm({ ...form, availableTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Available Consultation Days</label>
            <div className="checkbox-pills-row">
              {daysList.map((day) => (
                <label key={day} className={`day-checkbox-label ${form.availableDays.includes(day) ? "selected" : ""}`}>
                  <input
                    type="checkbox"
                    checked={form.availableDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="toggle-switch-label">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
              />
              <span>Available for Consultations & Bookings</span>
            </label>
          </div>

          <div className="modal-footer-buttons" style={{ marginTop: "20px" }}>
            <button type="button" className="secondary-btn" onClick={() => navigate("/doctor-dashboard")}>
              Go to OPD Queue
            </button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Saving..." : existingProfile ? "Update Profile" : "Save Doctor Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DoctorRegister;
