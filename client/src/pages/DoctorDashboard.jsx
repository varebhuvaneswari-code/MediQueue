import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

function DoctorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [queueData, setQueueData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [selectedApptForNotes, setSelectedApptForNotes] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "doctor" && user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchDoctorQueue();
  }, [isAuthenticated, user, selectedDate]);

  const fetchDoctorQueue = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/queue?date=${selectedDate}`);
      setQueueData(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load doctor queue.");
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    setActionLoading(true);
    try {
      const res = await apiFetch(`/queue/next?date=${selectedDate}`, {
        method: "PUT"
      });
      if (res.appointment) {
        alert(`Now serving: Token #${res.appointment.tokenNumber} (${res.appointment.patient?.name})`);
      } else {
        alert(res.message || "No more waiting patients in queue.");
      }
      fetchDoctorQueue();
    } catch (err) {
      alert(err.message || "Could not call next patient.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    setActionLoading(true);
    try {
      await apiFetch(`/queue/${appointmentId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      fetchDoctorQueue();
    } catch (err) {
      alert(err.message || "Could not update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApptForNotes) return;
    try {
      await apiFetch(`/queue/${selectedApptForNotes._id}/status`, {
        method: "PUT",
        body: JSON.stringify({ notes: notesInput })
      });
      setSelectedApptForNotes(null);
      setNotesInput("");
      fetchDoctorQueue();
    } catch (err) {
      alert(err.message || "Could not save notes.");
    }
  };

  const stats = queueData?.stats || {
    total: 0,
    waitingCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    isServing: false
  };

  const currentlyServing = queueData?.currentlyServing;
  const waitingPatients = queueData?.waiting || [];
  const completedPatients = queueData?.completed || [];
  const allAppointments = queueData?.allAppointments || [];

  return (
    <div className="doctor-dashboard-container">
      {/* Header Banner */}
      <div className="doctor-header-banner">
        <div className="doctor-info-col">
          <div className="doctor-badge-tag">🩺 CLINICAL OPD PORTAL</div>
          <h1>{user?.name || "Doctor"} — OPD Queue Manager</h1>
          <p className="doctor-sub">
            Real-time consultation queue management and patient appointment tracking
          </p>
        </div>

        <div className="date-controls-box">
          <label>OPD Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button className="refresh-mini-btn" onClick={fetchDoctorQueue} title="Refresh">
            🔄
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* KPI Stats Row */}
      <div className="doctor-stats-row">
        <div className="kpi-card">
          <span className="kpi-label">TOTAL TODAY</span>
          <div className="kpi-value">{stats.total}</div>
          <span className="kpi-sub">Registered Tokens</span>
        </div>

        <div className="kpi-card highlight-serving">
          <span className="kpi-label">CURRENTLY SERVING</span>
          <div className="kpi-value">
            {currentlyServing ? currentlyServing.tokenCode || `#${currentlyServing.tokenNumber}` : "None"}
          </div>
          <span className="kpi-sub">
            {currentlyServing ? currentlyServing.patient?.name : "Chamber Free"}
          </span>
        </div>

        <div className="kpi-card highlight-waiting">
          <span className="kpi-label">WAITING IN QUEUE</span>
          <div className="kpi-value">{stats.waitingCount}</div>
          <span className="kpi-sub">In Waiting Lounge</span>
        </div>

        <div className="kpi-card highlight-completed">
          <span className="kpi-label">COMPLETED</span>
          <div className="kpi-value">{stats.completedCount}</div>
          <span className="kpi-sub">Consultations Done</span>
        </div>
      </div>

      {/* Hero Call Next Action Card */}
      <div className="call-next-hero-banner">
        <div className="call-next-info">
          <h2>Queue Call Action</h2>
          {waitingPatients.length > 0 ? (
            <p>
              Next in line: <strong>{waitingPatients[0].patient?.name}</strong> (Token #
              {waitingPatients[0].tokenNumber} - {waitingPatients[0].tokenCode})
            </p>
          ) : (
            <p>No waiting patients currently in queue for this date.</p>
          )}
        </div>

        <button
          className="call-next-btn"
          onClick={handleCallNext}
          disabled={actionLoading || waitingPatients.length === 0}
        >
          {actionLoading ? "Processing..." : "📢 Call Next Patient"}
        </button>
      </div>

      {/* Currently Serving Section */}
      {currentlyServing && (
        <div className="currently-serving-card">
          <div className="serving-card-header">
            <span className="live-dot-pulse"></span>
            <h3>Patient In Chamber Now</h3>
            <span className="token-pill-large">
              {currentlyServing.tokenCode || `#${currentlyServing.tokenNumber}`}
            </span>
          </div>

          <div className="serving-card-body">
            <div className="patient-detail-group">
              <span className="detail-label">Patient Name:</span>
              <strong className="detail-value">{currentlyServing.patient?.name}</strong>
            </div>
            <div className="patient-detail-group">
              <span className="detail-label">Phone:</span>
              <strong className="detail-value">{currentlyServing.patient?.phone}</strong>
            </div>
            <div className="patient-detail-group">
              <span className="detail-label">Chief Complaint / Reason:</span>
              <strong className="detail-value">{currentlyServing.reason || "General Consultation"}</strong>
            </div>
            {currentlyServing.notes && (
              <div className="patient-detail-group">
                <span className="detail-label">Prescription / Notes:</span>
                <p className="detail-notes">{currentlyServing.notes}</p>
              </div>
            )}
          </div>

          <div className="serving-card-actions">
            <button
              className="primary-btn complete-btn"
              onClick={() => handleUpdateStatus(currentlyServing._id, "completed")}
              disabled={actionLoading}
            >
              ✓ Complete Consultation
            </button>
            <button
              className="secondary-btn"
              onClick={() => {
                setSelectedApptForNotes(currentlyServing);
                setNotesInput(currentlyServing.notes || "");
              }}
            >
              📝 Add Clinical Notes
            </button>
            <button
              className="outline-btn danger-btn"
              onClick={() => handleUpdateStatus(currentlyServing._id, "no-show")}
              disabled={actionLoading}
            >
              Mark No-Show
            </button>
          </div>
        </div>
      )}

      {/* All Queue Appointments Table */}
      <div className="queue-table-section">
        <div className="section-title-row">
          <h2>Appointments Schedule for {selectedDate} ({allAppointments.length})</h2>
          <Link to="/doctor-register" className="secondary-btn" style={{ fontSize: "14px" }}>
            ⚙️ Edit Profile / Availability
          </Link>
        </div>

        {loading ? (
          <div className="loading-state-box">
            <div className="spinner"></div>
            <p>Loading queue data...</p>
          </div>
        ) : allAppointments.length === 0 ? (
          <div className="empty-appointments-box">
            <p>No appointments booked for {selectedDate}.</p>
          </div>
        ) : (
          <div className="table-responsive-box">
            <table className="queue-table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Patient Name</th>
                  <th>Contact</th>
                  <th>Time Slot</th>
                  <th>Symptoms / Reason</th>
                  <th>Status</th>
                  <th>Manage Actions</th>
                </tr>
              </thead>
              <tbody>
                {allAppointments.map((appt) => (
                  <tr key={appt._id} className={`table-row-${appt.status}`}>
                    <td>
                      <span className="table-token-badge">
                        {appt.tokenCode || `#${appt.tokenNumber}`}
                      </span>
                    </td>
                    <td>
                      <strong>{appt.patient?.name || "Patient"}</strong>
                    </td>
                    <td>{appt.patient?.phone || "N/A"}</td>
                    <td>{appt.timeSlot?.split(" ")[0]}</td>
                    <td>{appt.reason || "General"}</td>
                    <td>
                      <span className={`status-pill pill-${appt.status}`}>
                        {appt.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        {appt.status === "waiting" && (
                          <>
                            <button
                              className="action-btn-serve"
                              onClick={() => handleUpdateStatus(appt._id, "serving")}
                              title="Call to Chamber"
                            >
                              Call In
                            </button>
                            <button
                              className="action-btn-noshow"
                              onClick={() => handleUpdateStatus(appt._id, "no-show")}
                              title="Mark No-Show"
                            >
                              No-Show
                            </button>
                          </>
                        )}
                        {appt.status === "serving" && (
                          <button
                            className="action-btn-complete"
                            onClick={() => handleUpdateStatus(appt._id, "completed")}
                          >
                            Complete
                          </button>
                        )}
                        <button
                          className="action-btn-notes"
                          onClick={() => {
                            setSelectedApptForNotes(appt);
                            setNotesInput(appt.notes || "");
                          }}
                        >
                          Notes
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {selectedApptForNotes && (
        <div className="modal-overlay" onClick={() => setSelectedApptForNotes(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedApptForNotes(null)}>
              ✕
            </button>
            <h3>Clinical Notes & Prescription</h3>
            <p className="form-subtitle">
              Token #{selectedApptForNotes.tokenNumber} — {selectedApptForNotes.patient?.name}
            </p>

            <div className="form-group" style={{ marginTop: "15px" }}>
              <label>Doctor Notes / Recommendations</label>
              <textarea
                rows="4"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Enter clinical notes, diagnoses, advice, or medication instructions..."
              />
            </div>

            <div className="modal-footer-buttons">
              <button
                className="secondary-btn"
                onClick={() => setSelectedApptForNotes(null)}
              >
                Cancel
              </button>
              <button className="primary-btn" onClick={handleSaveNotes}>
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;

