
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";
import LiveQueueTracker from "../components/LiveQueueTracker";
import BookAppointmentModal from "../components/BookAppointmentModal";

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
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
    setError("");

    try {
      const data = await apiFetch("/appointments/my-appointments");
      const appts = data.appointments || [];

      setAppointments(appts);

      const activeAppt =
        appts.find(
          (appointment) =>
            appointment.status === "waiting" ||
            appointment.status === "serving"
        ) || appts[0];

      setSelectedAppointmentId(activeAppt?._id || null);
    } catch (err) {
      setError(err.message || "Failed to load your appointments.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this appointment?"
      )
    ) {
      return;
    }

    try {
      await apiFetch(`/appointments/${id}/cancel`, {
        method: "PUT",
      });

      await fetchMyAppointments();
    } catch (err) {
      alert(err.message || "Could not cancel appointment.");
    }
  };

  const handleBookingComplete = () => {
    setShowBookingModal(false);
    fetchMyAppointments();
  };

  const getStatusLabel = (status) => {
    const labels = {
      waiting: "Waiting",
      serving: "Now Serving",
      completed: "Completed",
      cancelled: "Cancelled",
      no_show: "No Show",
    };

    return labels[status] || status || "Unknown";
  };

  const getStatusIcon = (status) => {
    const icons = {
      waiting: "⏳",
      serving: "🟢",
      completed: "✓",
      cancelled: "×",
      no_show: "!",
    };

    return icons[status] || "•";
  };

  const activeAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "waiting" ||
      appointment.status === "serving"
  ).length;

  return (
    <main className="mq-patient-dashboard">
      <div className="mq-patient-dashboard-inner">

        {/* Welcome */}
        <section className="mq-patient-welcome">
          <div className="mq-patient-welcome-content">
            <div className="mq-patient-eyebrow">
              <span className="mq-patient-eyebrow-dot" />
              PATIENT PORTAL
            </div>

            <h1>
              Welcome back,
              <span> {user?.name || "Patient"}!</span>
            </h1>

            <p>
              Your healthcare journey, organized in one place.
              Book appointments and follow your queue in real time.
            </p>

            <div className="mq-patient-welcome-actions">
              <button
                className="mq-patient-primary-btn"
                onClick={() => setShowBookingModal(true)}
              >
                <span>＋</span>
                Book Appointment
              </button>

              <Link
                to="/doctors"
                className="mq-patient-secondary-btn"
              >
                <span>♧</span>
                Find a Doctor
              </Link>
            </div>
          </div>

          <div className="mq-patient-welcome-visual">
            <div className="mq-patient-orbit mq-patient-orbit-one" />
            <div className="mq-patient-orbit mq-patient-orbit-two" />

            <div className="mq-patient-visual-glow" />

            <div className="mq-patient-health-icon">
              <span>✚</span>
            </div>

            <div className="mq-patient-floating-card">
              <span className="mq-patient-floating-icon">♥</span>
              <div>
                <strong>Your health</strong>
                <small>Always a priority</small>
              </div>
              <span className="mq-patient-floating-check">✓</span>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mq-patient-error">
            <span>⚠</span>
            <p>{error}</p>
            <button onClick={fetchMyAppointments}>
              Try again
            </button>
          </div>
        )}

        {/* Overview */}
        <section className="mq-patient-overview">
          <div className="mq-patient-overview-card">
            <div className="mq-patient-overview-icon purple">
              <span>▤</span>
            </div>
            <div>
              <span className="mq-patient-overview-label">
                Total appointments
              </span>
              <strong>{loading ? "—" : appointments.length}</strong>
              <small>All your bookings</small>
            </div>
          </div>

          <div className="mq-patient-overview-card">
            <div className="mq-patient-overview-icon blue">
              <span>◷</span>
            </div>
            <div>
              <span className="mq-patient-overview-label">
                Active appointments
              </span>
              <strong>{loading ? "—" : activeAppointments}</strong>
              <small>Waiting or serving</small>
            </div>
          </div>

          <div className="mq-patient-overview-card">
            <div className="mq-patient-overview-icon green">
              <span>✓</span>
            </div>
            <div>
              <span className="mq-patient-overview-label">
                Completed visits
              </span>
              <strong>
                {loading
                  ? "—"
                  : appointments.filter(
                      (appointment) =>
                        appointment.status === "completed"
                    ).length}
              </strong>
              <small>Your visit history</small>
            </div>
          </div>
        </section>

        {/* Main dashboard */}
        <section className="mq-patient-main-grid">

          {/* Queue */}
          <div className="mq-patient-panel mq-patient-queue-panel">
            <div className="mq-patient-panel-heading">
              <div>
                <div className="mq-patient-section-kicker">
                  LIVE MONITOR
                </div>
                <h2>Queue Tracking</h2>
                <p>Follow your appointment progress</p>
              </div>

              <div className="mq-patient-live-status">
                <span />
                LIVE
              </div>
            </div>

            <div className="mq-patient-queue-content">
              {loading ? (
                <div className="mq-patient-queue-loading">
                  <div className="mq-patient-loading-ring" />
                  <p>Preparing your queue tracker...</p>
                </div>
              ) : selectedAppointmentId ? (
                <LiveQueueTracker
                  appointmentId={selectedAppointmentId}
                />
              ) : (
                <div className="mq-patient-queue-empty">
                  <div className="mq-patient-empty-icon">
                    <span>◷</span>
                  </div>

                  <h3>No active queue</h3>

                  <p>
                    Your queue information will appear here
                    once you have an active appointment.
                  </p>

                  <button
                    className="mq-patient-primary-btn"
                    onClick={() => setShowBookingModal(true)}
                  >
                    Book your first visit
                  </button>
                </div>
              )}
            </div>

            <div className="mq-patient-queue-footer">
              <span className="mq-patient-footer-dot" />
              Queue status updates automatically
            </div>
          </div>

          {/* Appointment list */}
          <div className="mq-patient-panel mq-patient-appointments-panel">
            <div className="mq-patient-panel-heading">
              <div>
                <div className="mq-patient-section-kicker">
                  YOUR SCHEDULE
                </div>
                <h2>My Appointments</h2>
                <p>
                  {appointments.length} appointment
                  {appointments.length !== 1 ? "s" : ""} in your list
                </p>
              </div>

              <button
                className="mq-patient-refresh-btn"
                onClick={fetchMyAppointments}
                disabled={loading}
                title="Refresh appointments"
              >
                <span className={loading ? "is-refreshing" : ""}>
                  ↻
                </span>
              </button>
            </div>

            <div className="mq-patient-appointments-content">
              {loading ? (
                <div className="mq-patient-appointment-skeletons">
                  {[1, 2, 3].map((item) => (
                    <div
                      className="mq-patient-appointment-skeleton"
                      key={item}
                    >
                      <div />
                      <div />
                      <div />
                    </div>
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <div className="mq-patient-appointments-empty">
                  <div className="mq-patient-empty-calendar">
                    <span>▦</span>
                  </div>

                  <h3>No appointments yet</h3>

                  <p>
                    Your upcoming visits will show up here.
                    Start by booking your first appointment.
                  </p>

                  <button
                    className="mq-patient-primary-btn"
                    onClick={() => setShowBookingModal(true)}
                  >
                    + Book an appointment
                  </button>
                </div>
              ) : (
                <div className="mq-patient-appointment-list">
                  {appointments.map((appointment) => {
                    const isSelected =
                      appointment._id === selectedAppointmentId;

                    const doctorName =
                      appointment.doctor?.user?.name ||
                      "Specialist Doctor";

                    const specialization =
                      appointment.doctor?.specialization ||
                      "Medical Specialist";

                    const canCancel =
                      appointment.status === "waiting";

                    return (
                      <article
                        key={appointment._id}
                        className={`mq-patient-appointment-card ${
                          isSelected ? "is-selected" : ""
                        }`}
                        onClick={() =>
                          setSelectedAppointmentId(appointment._id)
                        }
                      >
                        <div className="mq-patient-appointment-top">
                          <div className="mq-patient-token">
                            <span> TOKEN </span>
                            <strong>
                              {appointment.tokenCode ||
                                `Q-${appointment.tokenNumber}`}
                            </strong>
                          </div>

                          <span
                            className={`mq-patient-status status-${appointment.status}`}
                          >
                            <span>
                              {getStatusIcon(appointment.status)}
                            </span>
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>

                        <div className="mq-patient-doctor-info">
                          <div className="mq-patient-doctor-avatar">
                            <span>✚</span>
                          </div>

                          <div>
                            <h3>{doctorName}</h3>
                            <p>{specialization}</p>
                          </div>
                        </div>

                        <div className="mq-patient-appointment-details">
                          <div>
                            <span className="mq-patient-detail-icon">
                              ◷
                            </span>
                            <span>
                              {appointment.appointmentDate
                                ? new Date(
                                    appointment.appointmentDate
                                  ).toLocaleDateString()
                                : "Date not available"}
                            </span>
                          </div>

                          <div>
                            <span className="mq-patient-detail-icon">
                              ⌂
                            </span>
                            <span>
                              {appointment.doctor?.roomNumber ||
                                "Room 101"}
                            </span>
                          </div>
                        </div>

                        <div className="mq-patient-appointment-reason">
                          <span>VISIT REASON</span>
                          <p>
                            {appointment.reason ||
                              "General Consultation"}
                          </p>
                        </div>

                        <div className="mq-patient-appointment-actions">
                          <button
                            className={`mq-patient-track-btn ${
                              isSelected ? "is-tracking" : ""
                            }`}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedAppointmentId(
                                appointment._id
                              );
                            }}
                          >
                            {isSelected
                              ? "✓ Tracking this appointment"
                              : "Track queue"}
                          </button>

                          {canCancel && (
                            <button
                              className="mq-patient-cancel-btn"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleCancelAppointment(
                                  appointment._id
                                );
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mq-patient-appointments-footer">
              <Link to="/doctors">
                Find another doctor
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Booking modal */}
        {showBookingModal && (
          <BookAppointmentModal
            onClose={() => setShowBookingModal(false)}
            onBooked={handleBookingComplete}
          />
        )}
      </div>
    </main>
  );
}

export default Dashboard;
