import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-column">
          <h2 className="footer-brand">🏥 MediQueue</h2>
          <p>
            Next-generation Smart Hospital Queue & OPD Appointment Management System.
            Eliminating physical waiting lines and delivering transparent, real-time healthcare tracking.
          </p>
          <div className="footer-contact-item">
            <span>📞 24/7 Helpline: 1800-MEDIQUEUE</span>
          </div>
          <div className="footer-contact-item">
            <span>📍 Main Campus: Metro Healthcare Complex, Central OPD</span>
          </div>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/doctors">Find Specialist Doctors</Link></li>
            <li><Link to="/track-queue">Track Live Queue Status</Link></li>
            <li><Link to="/register">Patient Registration</Link></li>
            <li><Link to="/login">Doctor & Staff Portal</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>System Objectives</h3>
          <ul className="footer-objectives-list">
            <li>✓ Online Patient Registration & Secure Auth</li>
            <li>✓ Doctor Directory & Specializations</li>
            <li>✓ Smart Appointment Booking</li>
            <li>✓ Automated Queue Token Generation</li>
            <li>✓ Real-Time Queue Tracker for Patients</li>
            <li>✓ Doctor Appointment & Queue Management</li>
            <li>✓ Centralized Administrator Dashboard</li>
            <li>✓ Secure Encrypted Records & Role Access</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 MediQueue Smart Healthcare Management System. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;

