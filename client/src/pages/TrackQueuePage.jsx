import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";
import LiveQueueTracker from "../components/LiveQueueTracker";

function TrackQueuePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [appointmentId, setAppointmentId] = useState(searchParams.get("appointmentId") || "");
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qId = searchParams.get("appointmentId");
    if (qId) {
      setAppointmentId(qId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      apiFetch("/appointments/my-appointments")
        .then((data) => {
          const appts = data.appointments || [];
          setMyAppointments(appts);
          if (!appointmentId && appts.length > 0) {
            const active = appts.find((a) => a.status === "waiting" || a.status === "serving") || appts[0];
            setAppointmentId(active._id);
            setSearchParams({ appointmentId: active._id });
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleSelectAppointment = (id) => {
    setAppointmentId(id);
    setSearchParams({ appointmentId: id });
  };

  return (
    <div className="track-queue-page-container">
      <div className="track-header-section">
        <span className="live-badge-glow">📡 REAL-TIME OPD MONITOR</span>
        <h1>Track Your Live Queue Status</h1>
        <p>Monitor real-time patient queue movement, currently called tokens, and estimated consultation wait times.</p>
      </div>

      {isAuthenticated && myAppointments.length > 0 && (
        <div className="select-appointment-bar">
          <label>Select Your Appointment to Track:</label>
          <div className="appointment-chips-selector">
            {myAppointments.map((appt) => {
              const isSelected = appt._id === appointmentId;
              return (
                <button
                  key={appt._id}
                  className={`appt-selector-chip ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelectAppointment(appt._id)}
                >
                  <span className="chip-token">{appt.tokenCode || `#${appt.tokenNumber}`}</span>
                  <span className="chip-doc">{appt.doctor?.user?.name || "Doctor"}</span>
                  <span className={`status-pill pill-${appt.status}`}>{appt.status}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="tracker-wrapper-main">
        {appointmentId ? (
          <LiveQueueTracker appointmentId={appointmentId} />
        ) : (
          <div className="empty-tracker-prompt">
            <span className="prompt-icon">🔍</span>
            <h3>No Queue Selected</h3>
            <p>Please log in or book an appointment to track your live queue status.</p>
            <div style={{ marginTop: "15px", display: "flex", gap: "10px", justifyContent: "center" }}>
              <button className="primary-btn" onClick={() => navigate("/doctors")}>
                Find Doctor & Book
              </button>
              <button className="secondary-btn" onClick={() => navigate("/login")}>
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackQueuePage;

