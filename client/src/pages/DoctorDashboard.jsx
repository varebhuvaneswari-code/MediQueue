
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

// Get today's date in local time (avoids UTC date mismatch)
const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function DoctorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [queueData, setQueueData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getLocalDate);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [notesInput, setNotesInput] = useState("");
  const [selectedApptForNotes, setSelectedApptForNotes] = useState(null);

  // Load queue data
  const fetchDoctorQueue = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const data = await apiFetch(`/queue?date=${selectedDate}`);

      setQueueData(data);
      setError("");

      return data;
    } catch (err) {
      setError(err.message || "Failed to load doctor queue.");
      return null;
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [selectedDate]);

  // Authentication and role protection
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
  }, [isAuthenticated, user?.role, navigate, fetchDoctorQueue]);

  // Refresh queue after an action
  const refreshQueue = async () => {
    await fetchDoctorQueue(false);
  };

  // Call next patient
  const handleCallNext = async () => {
    if (actionLoading || waitingPatients.length === 0) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await apiFetch(`/queue/next?date=${selectedDate}`, {
        method: "PUT"
      });

      if (res.appointment) {
        setSuccessMessage(
          `Now serving Token ${res.appointment.tokenCode || `#${res.appointment.tokenNumber}`}`
        );
      } else {
        setSuccessMessage(res.message || "No waiting patients in queue.");
      }

      await refreshQueue();
    } catch (err) {
      setError(err.message || "Could not call next patient.");
    } finally {
      setActionLoading(false);
    }
  };

  // Update appointment status
  const handleUpdateStatus = async (appointmentId, status) => {
    if (actionLoading) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await apiFetch(`/queue/${appointmentId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });

      const statusMessages = {
        serving: "Patient called into the chamber.",
        completed: "Consultation completed successfully.",
        "no-show": "Patient marked as no-show.",
        waiting: "Patient returned to waiting queue.",
        cancelled: "Appointment cancelled."
      };

      setSuccessMessage(statusMessages[status] || "Appointment status updated.");

      await refreshQueue();
    } catch (err) {
      setError(err.message || "Could not update appointment status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Open notes modal
  const openNotesModal = (appointment) => {
    setSelectedApptForNotes(appointment);
    setNotesInput(appointment.notes || "");
    setError("");
  };

  // Save clinical notes
  const handleSaveNotes = async () => {
    if (!selectedApptForNotes || notesLoading) {
      return;
    }

    setNotesLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await apiFetch(`/queue/${selectedApptForNotes._id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          notes: notesInput.trim()
        })
      });

      setSelectedApptForNotes(null);
      setNotesInput("");

      setSuccessMessage("Clinical notes saved successfully.");

      await refreshQueue();
    } catch (err) {
      setError(err.message || "Could not save clinical notes.");
    } finally {
      setNotesLoading(false);
    }
  };

  // Queue statistics
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
      {/* Dashboard Header */}
      <div className="doctor-header-banner">
        <div className="doctor-info-col">
          <div className="doctor-badge-tag">
            🩺 CLINICAL OPD PORTAL
          </div>

          <h1>
            {user?.name || "Doctor"} — OPD Queue Manager
          </h1>

          <p className="doctor-sub">
            Manage consultations, monitor patient queues, and
            track appointment progress.
          </p>
        </div>

        <div className="date-controls-box">
          <label htmlFor="opd-date">OPD Date:</label>

          <input
            id="opd-date"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setError("");
              setSuccessMessage("");
            }}
          />

          <button
            type="button"
            className="refresh-mini-btn"
            onClick={() => fetchDoctorQueue()}
            disabled={loading || actionLoading}
            title="Refresh queue"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div
          className="alert-success"
          role="status"
        >
          {successMessage}
        </div>
      )}

      {/* Dashboard Statistics */}
      <div className="doctor-stats-row">
        <div className="kpi-card">
          <span className="kpi-label">TOTAL APPOINTMENTS</span>

          <div className="kpi-value">
            {stats.total}
          </div>

          <span className="kpi-sub">
            Registered Tokens
          </span>
        </div>

        <div className="kpi-card highlight-serving">
          <span className="kpi-label">CURRENTLY SERVING</span>

          <div className="kpi-value">
            {currentlyServing
              ? currentlyServing.tokenCode ||
                `#${currentlyServing.tokenNumber}`
              : "None"}
          </div>

          <span className="kpi-sub">
            {currentlyServing?.patient?.name || "Chamber Free"}
          </span>
        </div>

        <div className="kpi-card highlight-waiting">
          <span className="kpi-label">WAITING IN QUEUE</span>

          <div className="kpi-value">
            {stats.waitingCount}
          </div>

          <span className="kpi-sub">
            Waiting Patients
          </span>
        </div>

        <div className="kpi-card highlight-completed">
          <span className="kpi-label">COMPLETED</span>

          <div className="kpi-value">
            {stats.completedCount}
          </div>

          <span className="kpi-sub">
            Consultations Done
          </span>
        </div>
      </div>

      {/* Call Next Patient */}
      <div className="call-next-hero-banner">
        <div className="call-next-info">
          <h2>Queue Call Action</h2>

          {waitingPatients.length > 0 ? (
            <p>
              Next in line:{" "}
              <strong>
                {waitingPatients[0].patient?.name || "Patient"}
              </strong>{" "}
              (Token{" "}
              {waitingPatients[0].tokenCode ||
                `#${waitingPatients[0].tokenNumber}`}
              )
            </p>
          ) : (
            <p>
              No waiting patients currently in queue for this date.
            </p>
          )}
        </div>

        <button
          type="button"
          className="call-next-btn"
          onClick={handleCallNext}
          disabled={
            actionLoading ||
            loading ||
            waitingPatients.length === 0
          }
        >
          {actionLoading
            ? "Processing..."
            : "📢 Call Next Patient"}
        </button>
      </div>

      {/* Currently Serving Patient */}
      {currentlyServing && (
        <div className="currently-serving-card">
          <div className="serving-card-header">
            <span className="live-dot-pulse"></span>

            <h3>Patient In Chamber Now</h3>

            <span className="token-pill-large">
              {currentlyServing.tokenCode ||
                `#${currentlyServing.tokenNumber}`}
            </span>
          </div>

          <div className="serving-card-body">
            <div className="patient-detail-group">
              <span className="detail-label">
                Patient Name:
              </span>

              <strong className="detail-value">
                {currentlyServing.patient?.name || "Patient"}
              </strong>
            </div>

            <div className="patient-detail-group">
              <span className="detail-label">
                Phone:
              </span>

              <strong className="detail-value">
                {currentlyServing.patient?.phone || "Not provided"}
              </strong>
            </div>

            <div className="patient-detail-group">
              <span className="detail-label">
                Chief Complaint / Reason:
              </span>

              <strong className="detail-value">
                {currentlyServing.reason || "General Consultation"}
              </strong>
            </div>

            <div className="patient-detail-group">
              <span className="detail-label">
                Appointment Time:
              </span>

              <strong className="detail-value">
                {currentlyServing.timeSlot || "Not specified"}
              </strong>
            </div>

            {currentlyServing.notes && (
              <div className="patient-detail-group">
                <span className="detail-label">
                  Clinical Notes:
                </span>

                <p className="detail-notes">
                  {currentlyServing.notes}
                </p>
              </div>
            )}
          </div>

          <div className="serving-card-actions">
            <button
              type="button"
              className="primary-btn complete-btn"
              onClick={() =>
                handleUpdateStatus(
                  currentlyServing._id,
                  "completed"
                )
              }
              disabled={actionLoading}
            >
              ✓ Complete Consultation
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => openNotesModal(currentlyServing)}
              disabled={notesLoading}
            >
              📝 Add Clinical Notes
            </button>

            <button
              type="button"
              className="outline-btn danger-btn"
              onClick={() =>
                handleUpdateStatus(
                  currentlyServing._id,
                  "no-show"
                )
              }
              disabled={actionLoading}
            >
              Mark No-Show
            </button>
          </div>
        </div>
      )}

      {/* Appointment Schedule */}
      <div className="queue-table-section">
        <div className="section-title-row">
          <h2>
            Appointments Schedule for {selectedDate} (
            {allAppointments.length})
          </h2>

          <Link
            to="/doctor-register"
            className="secondary-btn"
            style={{ fontSize: "14px" }}
          >
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
            <p>
              No appointments booked for {selectedDate}.
            </p>
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
                  <tr
                    key={appt._id}
                    className={`table-row-${appt.status}`}
                  >
                    <td>
                      <span className="table-token-badge">
                        {appt.tokenCode ||
                          `#${appt.tokenNumber}`}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {appt.patient?.name || "Patient"}
                      </strong>
                    </td>

                    <td>
                      {appt.patient?.phone || "N/A"}
                    </td>

                    <td>
                      {appt.timeSlot || "Not specified"}
                    </td>

                    <td>
                      {appt.reason || "General Consultation"}
                    </td>

                    <td>
                      <span
                        className={`status-pill pill-${appt.status}`}
                      >
                        {appt.status?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions-cell">
                        {appt.status === "waiting" && (
                          <>
                            <button
                              type="button"
                              className="action-btn-serve"
                              onClick={() =>
                                handleUpdateStatus(
                                  appt._id,
                                  "serving"
                                )
                              }
                              disabled={actionLoading}
                              title="Call patient into chamber"
                            >
                              Call In
                            </button>

                            <button
                              type="button"
                              className="action-btn-noshow"
                              onClick={() =>
                                handleUpdateStatus(
                                  appt._id,
                                  "no-show"
                                )
                              }
                              disabled={actionLoading}
                              title="Mark patient as no-show"
                            >
                              No-Show
                            </button>
                          </>
                        )}

                        {appt.status === "serving" && (
                          <button
                            type="button"
                            className="action-btn-complete"
                            onClick={() =>
                              handleUpdateStatus(
                                appt._id,
                                "completed"
                              )
                            }
                            disabled={actionLoading}
                          >
                            Complete
                          </button>
                        )}

                        <button
                          type="button"
                          className="action-btn-notes"
                          onClick={() => openNotesModal(appt)}
                          disabled={notesLoading}
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

      {/* Clinical Notes Modal */}
      {selectedApptForNotes && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!notesLoading) {
              setSelectedApptForNotes(null);
            }
          }}
        >
          <div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clinical-notes-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedApptForNotes(null)}
              disabled={notesLoading}
              aria-label="Close notes"
            >
              ✕
            </button>

            <h3 id="clinical-notes-title">
              Clinical Notes & Prescription
            </h3>

            <p className="form-subtitle">
              Token{" "}
              {selectedApptForNotes.tokenCode ||
                `#${selectedApptForNotes.tokenNumber}`}{" "}
              —{" "}
              {selectedApptForNotes.patient?.name || "Patient"}
            </p>

            <div
              className="form-group"
              style={{ marginTop: "15px" }}
            >
              <label htmlFor="clinical-notes">
                Doctor Notes / Recommendations
              </label>

              <textarea
                id="clinical-notes"
                rows="4"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Enter clinical notes, diagnoses, advice, or medication instructions..."
                disabled={notesLoading}
              />
            </div>

            <div className="modal-footer-buttons">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setSelectedApptForNotes(null)}
                disabled={notesLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-btn"
                onClick={handleSaveNotes}
                disabled={notesLoading}
              >
                {notesLoading ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;
