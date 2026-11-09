import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer-container">
      {/* Background decoration */}
      <div className="footer-glow footer-glow-one"></div>
      <div className="footer-glow footer-glow-two"></div>

      <div className="footer-content">

        {/* Brand Section */}
        <div className="footer-column footer-brand-column">
          <Link to="/" className="footer-brand">
            <span className="footer-brand-icon">✚</span>
            <span>
              Medi<span>Queue</span>
            </span>
          </Link>

          <span className="footer-brand-tagline">
            SMART OPD & QUEUE MANAGEMENT
          </span>

          <p className="footer-description">
            Next-generation Smart Hospital Queue & OPD Appointment
            Management System. Eliminating physical waiting lines
            and delivering transparent, real-time healthcare tracking.
          </p>

          <div className="footer-contact-item">
            <span className="footer-contact-icon">☎</span>
            <div>
              <small>24/7 PATIENT SUPPORT</small>
              <strong>1800-MEDIQUEUE</strong>
            </div>
          </div>

          <div className="footer-contact-item">
            <span className="footer-contact-icon">⌖</span>
            <div>
              <small>HEALTHCARE LOCATION</small>
              <strong>Metro Healthcare Complex</strong>
              <span>Central OPD</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3 className="footer-heading">
            Quick Links
            <span className="footer-heading-line"></span>
          </h3>

          <ul className="footer-links">
            <li>
              <Link to="/doctors">
                <span>↗</span> Find Specialist Doctors
              </Link>
            </li>

            <li>
              <Link to="/track-queue">
                <span>↗</span> Track Live Queue
              </Link>
            </li>

            <li>
              <Link to="/register">
                <span>↗</span> Patient Registration
              </Link>
            </li>

            <li>
              <Link to="/login">
                <span>↗</span> Doctor & Staff Portal
              </Link>
            </li>
          </ul>

          <div className="footer-status">
            <span className="footer-status-dot"></span>
            Healthcare system
            <strong>Online</strong>
          </div>
        </div>

        {/* Features */}
        <div className="footer-column">
          <h3 className="footer-heading">
            Platform Features
            <span className="footer-heading-line"></span>
          </h3>

          <ul className="footer-feature-list">
            <li>
              <span>✓</span> Secure Patient Registration
            </li>
            <li>
              <span>✓</span> Doctor Directory
            </li>
            <li>
              <span>✓</span> Smart Appointment Booking
            </li>
            <li>
              <span>✓</span> Automated Queue Tokens
            </li>
            <li>
              <span>✓</span> Real-Time Queue Tracking
            </li>
            <li>
              <span>✓</span> Doctor Queue Management
            </li>
            <li>
              <span>✓</span> Admin Dashboard
            </li>
            <li>
              <span>✓</span> Role-Based Access
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>
          © 2026 <strong>MediQueue</strong>. Smart Healthcare Management System.
        </p>

        <div className="footer-bottom-right">
          <span className="footer-security-icon">◆</span>
          Secure Healthcare Experience
        </div>
      </div>
    </footer>
  );
}

export default Footer;