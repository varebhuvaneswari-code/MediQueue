
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";
import LiveQueueTracker from "../components/LiveQueueTracker";

function TrackQueuePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [appointmentId, setAppointmentId] = useState(
    searchParams.get("appointmentId") || ""
  );

  const [myAppointments, setMyAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  useEffect(() => {
    const qId = searchParams.get("appointmentId");

    if (qId) {
      setAppointmentId(qId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) {
      setMyAppointments([]);
      return;
    }

    let mounted = true;

    const loadAppointments = async () => {
      setAppointmentsLoading(true);

      try {
        const data = await apiFetch("/appointments/my-appointments");

        if (!mounted) return;

        const appointments = data.appointments || [];
        setMyAppointments(appointments);

        const currentId = searchParams.get("appointmentId");

        if (!currentId && appointments.length > 0) {
          const activeAppointment =
            appointments.find(
              (appt) =>
                appt.status === "waiting" ||
                appt.status === "serving"
            ) || appointments[0];

          setAppointmentId(activeAppointment._id);

          setSearchParams({
            appointmentId: activeAppointment._id,
          });
        }
      } catch (error) {
        if (mounted) {
          setMyAppointments([]);
        }
      } finally {
        if (mounted) {
          setAppointmentsLoading(false);
        }
      }
    };

    loadAppointments();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const handleSelectAppointment = (id) => {
    setAppointmentId(id);

    setSearchParams({
      appointmentId: id,
    });
  };

  const selectedAppointment = myAppointments.find(
    (appt) => appt._id === appointmentId
  );

  const getStatusLabel = (status) => {
    const labels = {
      waiting: "Waiting",
      serving: "Now Serving",
      completed: "Completed",
      cancelled: "Cancelled",
      "no-show": "No Show",
    };

    return labels[status] || status || "Scheduled";
  };

  const getStatusIcon = (status) => {
    if (status === "serving") return "●";
    if (status === "completed") return "✓";
    if (status === "cancelled") return "×";
    return "⌛";
  };

  return (
    <div className="queue-command-page">
      <div className="queue-background-glow queue-glow-one"></div>
      <div className="queue-background-glow queue-glow-two"></div>
      <div className="queue-background-grid"></div>

      <main className="queue-page-content">

        {/* HERO SECTION */}

        <section className="queue-hero">

          <div className="queue-hero-left">

            <div className="queue-live-label">
              <span className="queue-live-dot"></span>
              LIVE OPD MONITORING
              <span className="queue-live-pulse"></span>
            </div>

            <h1>
              Your Care.
              <br />
              <span>Your Queue.</span>
              <br />
              <span className="queue-hero-gradient">
                Your Time.
              </span>
            </h1>

            <p className="queue-hero-description">
              Stay informed while you wait. Follow your appointment
              progress, monitor queue movement, and get ready for
              your consultation without repeatedly checking at the
              hospital.
            </p>

            <div className="queue-hero-features">

              <div className="queue-feature-item">
                <span className="queue-feature-icon">◉</span>
                <span>Live queue updates</span>
              </div>

              <div className="queue-feature-item">
                <span className="queue-feature-icon">◷</span>
                <span>Wait-time tracking</span>
              </div>

              <div className="queue-feature-item">
                <span className="queue-feature-icon">✦</span>
                <span>Appointment overview</span>
              </div>

            </div>

          </div>

          {/* HERO VISUAL */}

          <div className="queue-hero-visual">

            <div className="queue-visual-orbit queue-orbit-one"></div>
            <div className="queue-visual-orbit queue-orbit-two"></div>

            <div className="queue-visual-center">

              <div className="queue-medical-symbol">
                <span>+</span>
              </div>

              <div className="queue-visual-caption">
                <span>MEDIQUEUE</span>
                <strong>Smart OPD</strong>
              </div>

            </div>

            <div className="queue-floating-card queue-floating-top">

              <div className="queue-floating-icon">
                <span>↗</span>
              </div>

              <div>
                <small>QUEUE STATUS</small>
                <strong>Live monitoring</strong>
              </div>

              <span className="queue-floating-live">LIVE</span>

            </div>

            <div className="queue-floating-card queue-floating-bottom">

              <div className="queue-floating-icon queue-floating-icon-blue">
                <span>✓</span>
              </div>

              <div>
                <small>YOUR APPOINTMENT</small>
                <strong>Track in real time</strong>
              </div>

            </div>

          </div>

        </section>

        {/* APPOINTMENT SELECTOR */}

        <section className="queue-appointments-section">

          <div className="queue-section-heading">

            <div>
              <span className="queue-section-eyebrow">
                PATIENT PORTAL
              </span>

              <h2>
                My <span>Appointments</span>
              </h2>

              <p>
                Select an appointment to view its queue progress.
              </p>
            </div>

            <div className="queue-appointment-count">
              <span className="queue-count-number">
                {myAppointments.length}
              </span>

              <span>
                {myAppointments.length === 1
                  ? "Appointment"
                  : "Appointments"}
              </span>
            </div>

          </div>

          {appointmentsLoading && (
            <div className="queue-appointments-loading">
              <span className="queue-small-spinner"></span>
              Loading your appointments...
            </div>
          )}

          {!appointmentsLoading &&
            isAuthenticated &&
            myAppointments.length > 0 && (

            <div className="queue-appointment-grid">

              {myAppointments.map((appt, index) => {

                const isSelected = appt._id === appointmentId;

                const doctorName =
                  appt.doctor?.user?.name || "Doctor";

                const token =
                  appt.tokenCode || `#${appt.tokenNumber}`;

                return (

                  <button
                    type="button"
                    key={appt._id}
                    className={`queue-appointment-card ${
                      isSelected ? "queue-card-selected" : ""
                    }`}
                    onClick={() =>
                      handleSelectAppointment(appt._id)
                    }
                    style={{
                      animationDelay: `${index * 70}ms`,
                    }}
                  >

                    <div className="queue-card-top">

                      <div className="queue-doctor-avatar">
                        <span>✚</span>
                      </div>

                      <span
                        className={`queue-card-status status-${appt.status}`}
                      >
                        <span className="queue-status-dot"></span>

                        {getStatusLabel(appt.status)}
                      </span>

                    </div>

                    <div className="queue-card-doctor">

                      <span className="queue-card-label">
                        CONSULTING DOCTOR
                      </span>

                      <h3>{doctorName}</h3>

                      <p>
                        {appt.doctor?.specialization ||
                          appt.doctor?.department ||
                          "Medical consultation"}
                      </p>

                    </div>

                    <div className="queue-card-divider"></div>

                    <div className="queue-card-bottom">

                      <div className="queue-token-info">

                        <span className="queue-card-label">
                          YOUR TOKEN
                        </span>

                        <strong>{token}</strong>

                      </div>

                      <div
                        className={`queue-card-select ${
                          isSelected ? "selected" : ""
                        }`}
                      >
                        {isSelected ? "✓" : "↗"}
                      </div>

                    </div>

                    {isSelected && (
                      <div className="queue-card-selected-bar"></div>
                    )}

                  </button>

                );
              })}

            </div>
          )}

          {!appointmentsLoading &&
            isAuthenticated &&
            myAppointments.length === 0 && (

            <div className="queue-no-appointments">

              <div className="queue-empty-icon">
                <span>＋</span>
              </div>

              <h3>No appointments yet</h3>

              <p>
                Your booked appointments will appear here.
                Find a doctor and book your first consultation
                to start tracking your queue.
              </p>

              <button
                type="button"
                className="queue-action-primary"
                onClick={() => navigate("/doctors")}
              >
                Explore Doctors
                <span>→</span>
              </button>

            </div>

          )}

          {!isAuthenticated && (

            <div className="queue-no-appointments">

              <div className="queue-empty-icon">
                <span>⌕</span>
              </div>

              <h3>Sign in to view your appointments</h3>

              <p>
                Log in to your patient account to access your
                appointment details and live queue tracking.
              </p>

              <button
                type="button"
                className="queue-action-primary"
                onClick={() => navigate("/login")}
              >
                Sign In
                <span>→</span>
              </button>

            </div>

          )}

        </section>

        {/* LIVE TRACKER */}

        <section className="queue-live-section">

          <div className="queue-section-heading queue-tracker-heading">

            <div>

              <span className="queue-section-eyebrow">
                REAL-TIME TRACKING
              </span>

              <h2>
                Queue <span>Dashboard</span>
              </h2>

              <p>
                Your consultation progress at a glance.
              </p>

            </div>

            {appointmentId && (

              <div className="queue-tracker-live-badge">
                <span className="queue-live-dot"></span>
                LIVE TRACKING
              </div>

            )}

          </div>

          {appointmentId ? (

            <div className="queue-tracker-panel">

              <div className="queue-tracker-panel-top">

                <div className="queue-tracker-panel-title">

                  <div className="queue-tracker-panel-icon">
                    <span>⌁</span>
                  </div>

                  <div>

                    <span className="queue-section-eyebrow">
                      SELECTED APPOINTMENT
                    </span>

                    <h3>
                      {selectedAppointment?.doctor?.user?.name
                        ? `Dr. ${selectedAppointment.doctor.user.name}`
                        : "Your Live Queue"}
                    </h3>

                  </div>

                </div>

                {selectedAppointment && (

                  <div
                    className={`queue-selected-status status-${selectedAppointment.status}`}
                  >
                    <span className="queue-status-dot"></span>

                    {getStatusLabel(selectedAppointment.status)}
                  </div>

                )}

              </div>

              <div className="queue-tracker-divider"></div>

              <div className="queue-tracker-content">

                <LiveQueueTracker
                  appointmentId={appointmentId}
                />

              </div>

            </div>

          ) : (

            <div className="queue-tracker-empty">

              <div className="queue-tracker-empty-visual">

                <div className="queue-empty-ring queue-ring-one"></div>
                <div className="queue-empty-ring queue-ring-two"></div>

                <div className="queue-empty-center">
                  <span>⌁</span>
                </div>

              </div>

              <span className="queue-section-eyebrow">
                WAITING FOR APPOINTMENT
              </span>

              <h3>Select your appointment</h3>

              <p>
                Choose one of your appointments above to activate
                your live queue dashboard and monitor your
                consultation progress.
              </p>

              <button
                type="button"
                className="queue-action-secondary"
                onClick={() => navigate("/doctors")}
              >
                Find a Doctor
                <span>→</span>
              </button>

            </div>

          )}

        </section>

        {/* FOOTER NOTE */}

        <div className="queue-page-footer">

          <div className="queue-footer-shield">
            <span>✓</span>
          </div>

          <div>
            <strong>Your care journey, made clearer.</strong>

            <p>
              MediQueue helps you stay informed about your
              consultation. Queue estimates may change as
              appointments progress.
            </p>
          </div>

        </div>

      </main>

    </div>
  );
}

export default TrackQueuePage;
