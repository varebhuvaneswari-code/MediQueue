import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BookAppointmentModal from "../components/BookAppointmentModal";

function Home() {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🏥 NEXT-GENERATION HEALTHCARE QUEUE</div>
          <h1 className="hero-title">
            No More Hospital Waiting Rooms. <br />
            <span className="text-teal">Track Your Queue Live.</span>
          </h1>
          <p className="hero-description">
            MediQueue revolutionizes outpatient healthcare with instant online registration,
            doctor scheduling, automatic queue token generation, and real-time live wait-time tracking.
          </p>

          <div className="hero-cta-group">
            <button
              className="primary-btn hero-btn"
              onClick={() => {
                if (isAuthenticated) {
                  setShowBookingModal(true);
                } else {
                  navigate("/login");
                }
              }}
            >
              📅 Book Appointment Now
            </button>
            <Link to="/doctors" className="secondary-btn hero-btn">
              🩺 Explore Doctors
            </Link>
            <Link to="/track-queue" className="outline-btn hero-btn">
              📡 Track Live Queue
            </Link>
          </div>

          {/* Quick Demo Credentials Banner */}
          <div className="demo-credentials-banner">
            <span className="demo-tag">⚡ Quick Demo Logins:</span>
            <div className="demo-chips-row">
              <Link to="/login?demo=patient" className="demo-chip">
                👤 Patient: <code>patient@mediqueue.com</code>
              </Link>
              <Link to="/login?demo=doctor" className="demo-chip">
                🩺 Doctor: <code>dr.sarah@mediqueue.com</code>
              </Link>
              <Link to="/login?demo=admin" className="demo-chip">
                🛡️ Admin: <code>admin@mediqueue.com</code>
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-graphic-card">
          <div className="queue-live-preview">
            <div className="preview-top-bar">
              <span className="live-dot-pulse"></span>
              <span>Central Hospital Live OPD</span>
            </div>
            <div className="preview-token-display">
              <span className="preview-label">CURRENT SERVING TOKEN</span>
              <div className="preview-token-number">Q-01</div>
              <p className="preview-doctor">Dr. Sarah Johnson (Cardiology)</p>
            </div>
            <div className="preview-stats-row">
              <div className="preview-stat">
                <strong>Q-02</strong>
                <span>Next In Line</span>
              </div>
              <div className="preview-stat">
                <strong>~15 mins</strong>
                <span>Avg Wait</span>
              </div>
              <div className="preview-stat">
                <strong>Room 101</strong>
                <span>OPD Cabin</span>
              </div>
            </div>
            <div className="preview-note">
              ✓ Automated sequential tokens • Zero queue jumping
            </div>
          </div>
        </div>
      </section>

      {/* Main Objectives Section */}
      <section className="features-grid-section">
        <div className="section-header">
          <h2>Core System Capabilities</h2>
          <p>Built end-to-end to fulfill all 8 core objectives of smart outpatient healthcare</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>1. Online Registration & Login</h3>
            <p>
              Seamless self-service account registration for patients and medical staff with
              bcrypt encrypted passwords and JWT token authentication.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🩺</div>
            <h3>2. Doctors & Specializations</h3>
            <p>
              Browse verified doctors across Cardiology, Pediatrics, Dermatology, Orthopedics,
              and check their qualification, experience, fee, and available hours.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>3. Appointment Booking</h3>
            <p>
              Schedule appointments for today or upcoming dates with preferred time slots and
              symptom notes in just a few clicks.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔢</div>
            <h3>4. Automatic Queue Numbers</h3>
            <p>
              Atomic sequence counters generate unique daily queue numbers (e.g. Q-01, Q-02) per doctor,
              preventing double booking and conflicts.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📡</div>
            <h3>5. Live Patient Queue Tracker</h3>
            <p>
              Track real-time queue status from home or mobile: see currently serving token,
              patients ahead, estimated wait time, and room alerts.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>6. Doctor Queue Management</h3>
            <p>
              Dedicated doctor portal to call next patient, manage consultation status,
              record clinical notes, and toggle practice availability.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>7. Administrator Dashboard</h3>
            <p>
              Comprehensive management console for hospital admins to monitor queue traffic,
              register doctors, manage patients, and oversee hospital operations.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>8. Secure Patient Data Storage</h3>
            <p>
              End-to-end data security with hashed credentials, role-based authorization,
              and encrypted MongoDB storage for sensitive medical consultations.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookAppointmentModal onClose={() => setShowBookingModal(false)} />
      )}
    </div>
  );
}

export default Home;

