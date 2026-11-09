
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import BookAppointmentModal from "../components/BookAppointmentModal";

function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      setError("");

      try {
        // Use the existing doctors list API
        const data = await apiFetch("/doctors");
        const doctors = data.doctors || [];

        const foundDoctor = doctors.find(
          (item) => item._id === id
        );

        if (!foundDoctor) {
          setError("Doctor profile not found.");
          return;
        }

        setDoctor(foundDoctor);
      } catch (err) {
        setError(err.message || "Unable to load doctor profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const getDoctorName = () => {
    return doctor?.user?.name || "Specialist Doctor";
  };

  const getDoctorInitials = () => {
    const name = getDoctorName()
      .replace(/^Dr\.?\s*/i, "")
      .trim();

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  if (loading) {
    return (
      <div className="mq-profile-page">
        <div className="mq-profile-loading">
          <div className="mq-profile-spinner" />
          <h2>Loading Doctor Profile</h2>
          <p>Please wait while we get the details.</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="mq-profile-page">
        <div className="mq-profile-error">
          <div className="mq-profile-error-icon">!</div>
          <h2>Profile Unavailable</h2>
          <p>{error || "Doctor profile could not be found."}</p>

          <Link to="/doctors" className="mq-profile-back-button">
            Back to Doctors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mq-profile-page">
      <div className="mq-profile-glow mq-profile-glow-one" />
      <div className="mq-profile-glow mq-profile-glow-two" />

      <div className="mq-profile-content">
        {/* Breadcrumb */}
        <div className="mq-profile-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/doctors">Doctors</Link>
          <span>/</span>
          <span>Doctor Profile</span>
        </div>

        {/* Profile Hero */}
        <section className="mq-profile-hero">
          <div className="mq-profile-hero-top">
            <div className="mq-profile-avatar">
              {getDoctorInitials()}
              <span className="mq-profile-avatar-status" />
            </div>

            <div className="mq-profile-identity">
              <span className="mq-profile-specialization">
                {doctor.specialization || "General Specialist"}
              </span>

              <h1>{getDoctorName()}</h1>

              <p>
                {doctor.qualification || "Medical Professional"}
              </p>

              <div className="mq-profile-tags">
                <span>
                  {doctor.department || "Medical Department"}
                </span>

                <span>
                  {doctor.experience ?? 0} Years Experience
                </span>
              </div>
            </div>
          </div>

          <div className="mq-profile-hero-footer">
            <div className="mq-profile-availability">
              <span className="mq-profile-status-dot" />
              {doctor.isAvailable === false
                ? "Currently Unavailable"
                : "Available for Consultation"}
            </div>

            <button
              type="button"
              className="mq-profile-book-button"
              disabled={doctor.isAvailable === false}
              onClick={() => setShowBookingModal(true)}
            >
              Book Appointment
              <span>↗</span>
            </button>
          </div>
        </section>

        {/* Profile Information */}
        <section className="mq-profile-information">
          <div className="mq-profile-section-heading">
            <span>CLINICAL INFORMATION</span>
            <h2>Doctor <span>Overview</span></h2>
            <p>Everything you need to know before your consultation.</p>
          </div>

          <div className="mq-profile-info-grid">
            <article className="mq-profile-info-card">
              <div className="mq-profile-info-icon">✦</div>
              <span>Specialization</span>
              <h3>
                {doctor.specialization || "General Specialist"}
              </h3>
              <p>Area of medical expertise</p>
            </article>

            <article className="mq-profile-info-card">
              <div className="mq-profile-info-icon">♧</div>
              <span>Qualification</span>
              <h3>
                {doctor.qualification || "Not specified"}
              </h3>
              <p>Professional qualification</p>
            </article>

            <article className="mq-profile-info-card">
              <div className="mq-profile-info-icon">◷</div>
              <span>Experience</span>
              <h3>{doctor.experience ?? 0} Years</h3>
              <p>Clinical experience</p>
            </article>

            <article className="mq-profile-info-card">
              <div className="mq-profile-info-icon">₹</div>
              <span>Consultation Fee</span>
              <h3>₹{doctor.consultationFee ?? 0}</h3>
              <p>Per consultation</p>
            </article>
          </div>
        </section>

        {/* Consultation Details */}
        <section className="mq-profile-consultation">
          <div className="mq-profile-section-heading">
            <span>VISIT INFORMATION</span>
            <h2>Consultation <span>Details</span></h2>
            <p>Plan your visit with the information below.</p>
          </div>

          <div className="mq-profile-consultation-grid">
            <div className="mq-profile-consultation-card">
              <div className="mq-profile-consultation-icon">⌖</div>
              <div>
                <span>OPD Room / Cabin</span>
                <h3>{doctor.roomNumber || "Not assigned"}</h3>
              </div>
            </div>

            <div className="mq-profile-consultation-card">
              <div className="mq-profile-consultation-icon">◷</div>
              <div>
                <span>Consultation Hours</span>
                <h3>
                  {doctor.availableTime || "Contact hospital"}
                </h3>
              </div>
            </div>

            <div className="mq-profile-consultation-card">
              <div className="mq-profile-consultation-icon">▦</div>
              <div>
                <span>Department</span>
                <h3>
                  {doctor.department || "Medical Department"}
                </h3>
              </div>
            </div>
          </div>
        </section>

        {/* Available Days */}
        <section className="mq-profile-days-section">
          <div className="mq-profile-section-heading">
            <span>WEEKLY SCHEDULE</span>
            <h2>Available <span>Consultation Days</span></h2>
          </div>

          <div className="mq-profile-days">
            {doctor.availableDays &&
            doctor.availableDays.length > 0 ? (
              doctor.availableDays.map((day) => (
                <div className="mq-profile-day" key={day}>
                  <span className="mq-profile-day-dot" />
                  {day}
                </div>
              ))
            ) : (
              <p className="mq-profile-no-days">
                Consultation days have not been specified.
              </p>
            )}
          </div>
        </section>

        {/* Bottom Booking */}
        <section className="mq-profile-booking-banner">
          <div>
            <span>YOUR HEALTH MATTERS</span>
            <h2>Ready to book your consultation?</h2>
            <p>
              Schedule your appointment and get started with your
              healthcare journey.
            </p>
          </div>

          <button
            type="button"
            className="mq-profile-book-button"
            disabled={doctor.isAvailable === false}
            onClick={() => setShowBookingModal(true)}
          >
            Book Appointment <span>↗</span>
          </button>
        </section>

        <button
          type="button"
          className="mq-profile-back-link"
          onClick={() => navigate("/doctors")}
        >
          ← Back to Doctors
        </button>
      </div>

      {showBookingModal && (
        <BookAppointmentModal
          doctor={doctor}
          onClose={() => setShowBookingModal(false)}
          onBooked={() => {
            setShowBookingModal(false);
          }}
        />
      )}
    </div>
  );
}

export default DoctorProfile;
