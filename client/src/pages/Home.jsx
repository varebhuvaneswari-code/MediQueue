
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BookAppointmentModal from "../components/BookAppointmentModal";

const features = [
  {
    icon: "🩺",
    number: "01",
    title: "Find Your Doctor",
    description:
      "Explore doctors by specialization, experience, consultation fee, and availability.",
    color: "mint",
  },
  {
    icon: "📅",
    number: "02",
    title: "Book Appointments",
    description:
      "Choose your doctor and appointment date with a simple, convenient booking process.",
    color: "blue",
  },
  {
    icon: "🎟️",
    number: "03",
    title: "Smart Token System",
    description:
      "Receive an automatically generated queue token and avoid unnecessary confusion.",
    color: "purple",
  },
  {
    icon: "📡",
    number: "04",
    title: "Live Queue Tracking",
    description:
      "Follow your queue progress and check the currently serving token.",
    color: "orange",
  },
  {
    icon: "👨‍⚕️",
    number: "05",
    title: "Doctor Dashboard",
    description:
      "Doctors can manage their queue, call patients, and update consultation status.",
    color: "pink",
  },
  {
    icon: "🛡️",
    number: "06",
    title: "Secure Access",
    description:
      "Role-based access keeps patient, doctor, and administrator workflows separated.",
    color: "mint",
  },
];

function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleBooking = () => {
    if (isAuthenticated) {
      setShowBookingModal(true);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="mq-home">
      {/* HERO */}
      <section className="mq-home-hero">
        <div className="mq-home-orb mq-home-orb-one" />
        <div className="mq-home-orb mq-home-orb-two" />

        <div className="mq-home-container mq-home-hero-layout">
          <div className="mq-home-hero-content">
            <div className="mq-home-kicker">
              <span className="mq-home-kicker-icon">✦</span>
              SMARTER HEALTHCARE EXPERIENCE
            </div>

            <h1 className="mq-home-title">
              Your health matters.
              <br />
              <span>Waiting shouldn't.</span>
            </h1>

            <p className="mq-home-description">
              Meet MediQueue — a smarter way to book appointments,
              manage hospital queues, and follow your turn without
              spending hours in a waiting room.
            </p>

            <div className="mq-home-actions">
              <button
                type="button"
                className="mq-home-primary"
                onClick={handleBooking}
              >
                Book an Appointment
                <span>↗</span>
              </button>

              <Link to="/doctors" className="mq-home-secondary">
                <span className="mq-home-play">✚</span>
                Explore Doctors
              </Link>
            </div>

            <div className="mq-home-trust">
              <div className="mq-home-trust-icon">✓</div>
              <div>
                <strong>Designed for better patient experiences</strong>
                <span>Appointments · Queue · Doctor care</span>
              </div>
            </div>
          </div>

          {/* QUEUE PREVIEW */}
          <div className="mq-home-visual">
            <div className="mq-home-visual-label">
              <span className="mq-home-live-dot" />
              MEDIQUEUE EXPERIENCE PREVIEW
            </div>

            <div className="mq-home-queue-card">
              <div className="mq-home-queue-header">
                <div>
                  <span className="mq-home-small-label">
                    PATIENT QUEUE
                  </span>
                  <h2>Queue overview</h2>
                </div>
                <div className="mq-home-mini-icon">⌁</div>
              </div>

              <div className="mq-home-serving">
                <div className="mq-home-serving-top">
                  <span>NOW SERVING</span>
                  <span className="mq-home-status">● Demo</span>
                </div>

                <div className="mq-home-token">Q-01</div>

                <div className="mq-home-doctor">
                  <div className="mq-home-doctor-avatar">SJ</div>
                  <div>
                    <strong>Dr. Sarah Johnson</strong>
                    <span>Cardiology · Sample data</span>
                  </div>
                </div>
              </div>

              <div className="mq-home-queue-stats">
                <div>
                  <span className="mq-home-stat-icon">🎟️</span>
                  <strong>Q-02</strong>
                  <small>Next token</small>
                </div>
                <div>
                  <span className="mq-home-stat-icon">◷</span>
                  <strong>~15 min</strong>
                  <small>Sample wait</small>
                </div>
              </div>

              <div className="mq-home-progress">
                <div className="mq-home-progress-heading">
                  <span>Queue progress</span>
                  <span>Preview</span>
                </div>
                <div className="mq-home-progress-track">
                  <span />
                </div>
                <p>Illustrative queue preview — not live hospital data.</p>
              </div>
            </div>

            <div className="mq-home-floating-note">
              <span className="mq-home-floating-icon">✓</span>
              <div>
                <strong>Less waiting. More clarity.</strong>
                <span>Your care journey, organized.</span>
              </div>
            </div>
          </div>
        </div>

        {/* DEMO ACCESS */}
        <div className="mq-home-container">
          <div className="mq-home-demo">
            <div className="mq-home-demo-heading">
              <span>⚡</span>
              <div>
                <strong>Explore the demo</strong>
                <small>Choose a role to open the login page</small>
              </div>
            </div>

            <div className="mq-home-demo-links">
              <Link to="/login?demo=patient">
                <span>👤</span> Patient
                <small>→</small>
              </Link>
              <Link to="/login?demo=doctor">
                <span>🩺</span> Doctor
                <small>→</small>
              </Link>
              <Link to="/login?demo=admin">
                <span>🛡️</span> Admin
                <small>→</small>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO STRIP */}
      <section className="mq-home-intro">
        <div className="mq-home-container mq-home-intro-grid">
          <div>
            <span className="mq-home-section-tag">A BETTER WAY TO VISIT</span>
            <h2>
              Healthcare that works
              <br />
              <span>around you.</span>
            </h2>
          </div>

          <p>
            From finding the right doctor to tracking your turn,
            MediQueue brings essential outpatient services together
            in one organized digital experience.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mq-home-features">
        <div className="mq-home-container">
          <div className="mq-home-section-heading">
            <div>
              <span className="mq-home-section-tag">
                EVERYTHING IN ONE PLACE
              </span>
              <h2>
                Care coordination,
                <br />
                <span>made simpler.</span>
              </h2>
            </div>

            <p>
              Built to support patients, doctors, and hospital
              administrators throughout the appointment journey.
            </p>
          </div>

          <div className="mq-home-feature-grid">
            {features.map((feature) => (
              <article
                className={`mq-home-feature-card mq-home-${feature.color}`}
                key={feature.number}
              >
                <div className="mq-home-feature-top">
                  <div className="mq-home-feature-icon">
                    {feature.icon}
                  </div>
                  <span>{feature.number}</span>
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>

                <div className="mq-home-feature-line" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mq-home-workflow">
        <div className="mq-home-container">
          <div className="mq-home-workflow-heading">
            <span className="mq-home-section-tag">
              SIMPLE FROM START TO FINISH
            </span>
            <h2>
              Your care journey,
              <br />
              <span>in three steps.</span>
            </h2>
          </div>

          <div className="mq-home-steps">
            <article className="mq-home-step">
              <div className="mq-home-step-number">01</div>
              <div className="mq-home-step-icon">🔎</div>
              <h3>Choose your doctor</h3>
              <p>
                Browse doctors and explore their medical
                specializations before booking.
              </p>
            </article>

            <div className="mq-home-step-connector">→</div>

            <article className="mq-home-step">
              <div className="mq-home-step-number">02</div>
              <div className="mq-home-step-icon">📅</div>
              <h3>Book your visit</h3>
              <p>
                Select your appointment and receive your
                queue token through the system.
              </p>
            </article>

            <div className="mq-home-step-connector">→</div>

            <article className="mq-home-step">
              <div className="mq-home-step-number">03</div>
              <div className="mq-home-step-icon">📡</div>
              <h3>Track your turn</h3>
              <p>
                Follow the queue and check your progress
                before visiting the consultation room.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mq-home-final">
        <div className="mq-home-container">
          <div className="mq-home-final-card">
            <div className="mq-home-final-decoration">✦</div>

            <div className="mq-home-final-content">
              <span className="mq-home-final-tag">
                YOUR NEXT VISIT, SIMPLIFIED
              </span>

              <h2>
                Take control of
                <br />
                <span>your healthcare journey.</span>
              </h2>

              <p>
                Find a doctor, book an appointment, and make
                your hospital visit more organized with MediQueue.
              </p>

              <div className="mq-home-final-actions">
                <button
                  type="button"
                  className="mq-home-final-button"
                  onClick={handleBooking}
                >
                  Get Started <span>↗</span>
                </button>

                <Link to="/track-queue">
                  Track Queue <span>→</span>
                </Link>
              </div>
            </div>

            <div className="mq-home-final-symbol">✚</div>
          </div>
        </div>
      </section>

      {/* EXISTING BOOKING MODAL */}
      {showBookingModal && (
        <BookAppointmentModal
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
}

export default Home;
