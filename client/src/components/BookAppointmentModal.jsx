import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

function BookAppointmentModal({ doctor, onClose, onBooked }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctor?._id || "");
  const [appointmentDate, setAppointmentDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [timeSlot, setTimeSlot] = useState("09:00 AM - 11:00 AM (Morning OPD)");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    if (!doctor) {
      apiFetch("/doctors")
        .then((data) => {
          setDoctorsList(data.doctors || []);
          if (data.doctors?.length > 0 && !selectedDoctorId) {
            setSelectedDoctorId(data.doctors[0]._id);
          }
        })
        .catch((err) => {
          console.error("Failed to load doctors:", err);
        });
    }
  }, [doctor]);

  const activeDoctor = doctor || doctorsList.find((d) => d._id === selectedDoctorId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("Please log in to book an appointment.");
      navigate("/login");
      return;
    }

    if (!selectedDoctorId) {
      setError("Please select a doctor.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/appointments/book", {
        method: "POST",
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          appointmentDate,
          timeSlot,
          reason
        })
      });

      setBookingResult(data);
      if (onBooked) {
        onBooked(data.appointment);
      }
    } catch (err) {
      setError(err.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {bookingResult ? (
          <div className="booking-success-view">
            <div className="success-icon-badge">🎉</div>
            <h2>Appointment Confirmed!</h2>
            <p className="success-subtitle">
              Your appointment has been registered and queued successfully.
            </p>

            <div className="token-reveal-card">
              <span className="token-label">YOUR AUTOMATIC QUEUE NUMBER</span>
              <div className="token-big-code">
                {bookingResult.tokenCode || `Q-${bookingResult.tokenNumber}`}
              </div>
              <span className="token-number-tag">
                Queue Position: #{bookingResult.tokenNumber}
              </span>
            </div>

            <div className="booking-details-summary">
              <div className="summary-row">
                <span>Doctor:</span>
                <strong>
                  {bookingResult.appointment?.doctor?.user?.name || activeDoctor?.user?.name || "Specialist Doctor"}
                </strong>
              </div>
              <div className="summary-row">
                <span>Specialization:</span>
                <strong>
                  {bookingResult.appointment?.doctor?.specialization || activeDoctor?.specialization}
                </strong>
              </div>
              <div className="summary-row">
                <span>Date & Slot:</span>
                <strong>
                  {new Date(appointmentDate).toLocaleDateString()} ({timeSlot.split(" ")[0]})
                </strong>
              </div>
              <div className="summary-row">
                <span>Room / OPD:</span>
                <strong>
                  {bookingResult.appointment?.doctor?.roomNumber || activeDoctor?.roomNumber || "OPD Room 101"}
                </strong>
              </div>
              <div className="summary-row">
                <span>Consultation Fee:</span>
                <strong>₹{activeDoctor?.consultationFee || 500}</strong>
              </div>
            </div>

            <div className="modal-actions-grid">
              <button
                className="primary-btn"
                onClick={() => {
                  onClose();
                  navigate(`/track-queue?appointmentId=${bookingResult.appointment?._id}`);
                }}
              >
                📡 Track Live Queue Now
              </button>
              <button
                className="secondary-btn"
                onClick={() => {
                  onClose();
                  navigate("/dashboard");
                }}
              >
                View in My Appointments
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="booking-form">
            <h2>Book OPD Appointment</h2>
            <p className="form-subtitle">
              Secure online scheduling with automatic queue token allocation.
            </p>

            {error && <div className="alert-error">{error}</div>}

            {!doctor && (
              <div className="form-group">
                <label>Select Specialist Doctor</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctorsList.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.user?.name || "Doctor"} — {doc.specialization} (Fee: ₹{doc.consultationFee})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeDoctor && (
              <div className="selected-doctor-info-card">
                <div className="doctor-avatar-small">🩺</div>
                <div>
                  <h4>{activeDoctor.user?.name || "Specialist Doctor"}</h4>
                  <p className="doctor-meta-sub">
                    {activeDoctor.specialization} • {activeDoctor.department}
                  </p>
                  <p className="doctor-meta-sub">
                    📍 {activeDoctor.roomNumber} | Fee: ₹{activeDoctor.consultationFee}
                  </p>
                </div>
              </div>
            )}

            <div className="form-row-2">
              <div className="form-group">
                <label>Appointment Date</label>
                <input
                  type="date"
                  min={todayStr}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Preferred Time Slot</label>
                <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                  <option value="09:00 AM - 11:00 AM (Morning OPD)">09:00 AM - 11:00 AM (Morning)</option>
                  <option value="11:00 AM - 01:00 PM (Mid-day OPD)">11:00 AM - 01:00 PM (Mid-day)</option>
                  <option value="02:00 PM - 04:00 PM (Afternoon OPD)">02:00 PM - 04:00 PM (Afternoon)</option>
                  <option value="04:00 PM - 06:00 PM (Evening OPD)">04:00 PM - 06:00 PM (Evening)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Reason for Visit / Symptoms</label>
              <textarea
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe your symptoms (e.g. Chest discomfort, cough, routine follow-up)..."
                required
              />
            </div>

            <div className="booking-notice-box">
              <span>💡</span>
              <p>
                A real-time Queue Number (Token) will be assigned immediately upon booking.
                You can monitor live doctor queue progress directly from your phone.
              </p>
            </div>

            <div className="modal-footer-buttons">
              <button type="button" className="secondary-btn" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Generating Queue Token..." : "Confirm & Get Queue Token"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default BookAppointmentModal;

