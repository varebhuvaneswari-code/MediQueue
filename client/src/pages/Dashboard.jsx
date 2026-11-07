import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";
import LiveQueueTracker from "../components/LiveQueueTracker";
import BookAppointmentModal from "../components/BookAppointmentModal";

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role === "doctor") {
      navigate("/doctor-dashboard");
      return;
    }

    if (user?.role === "admin") {
      navigate("/admin");
      return;
    }

    fetchMyAppointments();
  }, [isAuthenticated, user]);

  const fetchMyAppointments = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/appointments/my-appointments");
      const appts = data.appointments || [];
      setAppointments(appts);

      // Auto-select the first active (waiting or serving) appointment for the live tracker
      const activeAppt = appts.find((a) => a.status === "waiting" || a.status === "serving") || appts[0];
      if (activeAppt) {
        setSelectedAppointmentId(activeAppt._id);
      }
    } catch (err) {
      setError(err.message || "Failed to load your appointments.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      await apiFetch(`/appointments/${id}/cancel`, {
        method: "PUT"
      });
      fetchMyAppointments();
    } catch (err) {
      alert(err.message || "Could not cancel appointment.");
    }
  };

  return (
    <div className="dashboard-page-container">
      {/* Top Welcome Section */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, {user?.name || "Patient"}! 👋</h1>
          <p>
            MediQueue Outpatient Portal • Manage your clinic bookings and monitor queue status in real-time.
          </p>
        </div>

        <div className="welcome-actions">
          <button className="primary-btn" onClick={() => setShowBookingModal(true)}>
            📅 Book New Appointment
          </button>
          <Link to="/doctors" className="secondary-btn">
            🩺 Find Doctors
          </Link>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Main Grid: Live Queue on Left, Appointments on Right */}
      <div className="dashboard-content-grid">
        {/* Left Column: Live Queue Tracker */}
        <div className="dashboard-queue-col">
          <div className="section-title-row">
            <h2>📡 Real-Time OPD Queue Tracking</h2>
            <span className="live-badge">Live Updates</span>
          </div>

          {selectedAppointmentId ? (
            <LiveQueueTracker appointmentId={selectedAppointmentId} />
          ) : (
            <div className="empty-tracker-box">
              <span className="empty-tracker-icon">🕒</span>
              <h3>No Active Appointment Selected</h3>
              <p>Book an appointment or select one from your list below to track queue position.</p>
              <button
                className="primary-btn"
                style={{ marginTop: "12px" }}
                onClick={() => setShowBookingModal(true)}
              >
                Book Your First Appointment
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Appointments List */}
        <div className="dashboard-appointments-col">
          <div className="section-title-row">
            <h2>📋 My Appointments ({appointments.length})</h2>
            <button className="refresh-mini-btn" onClick={fetchMyAppointments} title="Refresh">
              🔄
            </button>
          </div>

          {loading ? (
            <div className="loading-state-box">
              <div className="spinner"></div>
              <p>Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="empty-appointments-box">
              <p>You have no scheduled appointments yet.</p>
              <button className="primary-btn" onClick={() => setShowBookingModal(true)}>
                Book An Appointment Now
              </button>
            </div>
          ) : (
            <div className="appointments-cards-list">
              {appointments.map((appt) => {
                const isSelected = appt._id === selectedAppointmentId;
                const doctorName = appt.doctor?.user?.name || "Specialist Doctor";
                const isWaiting = appt.status === "waiting";
                const isServing = appt.status === "serving";

                return (
                  <div
                    key={appt._id}
                    className={`appointment-card-compact ${isSelected ? "selected-card" : ""}`}
                    onClick={() => setSelectedAppointmentId(appt._id)}
                  >
                    <div className="card-top-row">
                      <div className="token-chip">
                        {appt.tokenCode || `Q-${appt.tokenNumber}`}
                      </div>
                      <span className={`status-pill pill-${appt.status}`}>
                        {appt.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="card-doctor-name">{doctorName}</h4>
                    <p className="card-doctor-spec">{appt.doctor?.specialization}</p>

                    <div className="card-meta-details">
                      <span>📅 {new Date(appt.appointmentDate).toLocaleDateString()}</span>
                      <span>📍 {appt.doctor?.roomNumber || "Room 101"}</span>
                    </div>

                    <p className="card-reason">Reason: {appt.reason || "General Consultation"}</p>

                    <div className="card-actions-row">
                      <button
                        className={`track-btn ${isSelected ? "active-track" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointmentId(appt._id);
                        }}
                      >
                        {isSelected ? "Currently Tracking" : "Track This Queue"}
                      </button>

                      {isWaiting && (
                        <button
                          className="cancel-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelAppointment(appt._id);
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showBookingModal && (
        <BookAppointmentModal
          onClose={() => setShowBookingModal(false)}
          onBooked={() => {
            fetchMyAppointments();
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;
