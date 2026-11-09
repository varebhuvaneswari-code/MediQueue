
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import BookAppointmentModal from "../components/BookAppointmentModal";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] =
    useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] =
    useState(null);

  // Load specializations
  const fetchSpecializations = async () => {
    try {
      const data = await apiFetch("/doctors/meta/specializations");
      setSpecializations(data.specializations || []);
    } catch (err) {
      console.warn(
        "Could not load specializations list:",
        err.message
      );
    }
  };

  // Load doctors using existing backend API
  const fetchDoctors = async () => {
    setLoading(true);
    setError("");

    try {
      let endpoint = "/doctors?";

      if (
        selectedSpecialization &&
        selectedSpecialization !== "All"
      ) {
        endpoint += `specialization=${encodeURIComponent(
          selectedSpecialization
        )}&`;
      }

      if (searchQuery.trim()) {
        endpoint += `search=${encodeURIComponent(
          searchQuery.trim()
        )}&`;
      }

      const data = await apiFetch(endpoint);

      setDoctors(data.doctors || []);
    } catch (err) {
      setError(err.message || "Failed to load doctors list.");
    } finally {
      setLoading(false);
    }
  };

  // Load specializations once
  useEffect(() => {
    fetchSpecializations();
  }, []);

  // Reload doctors when filters change
  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialization, searchQuery]);

  // Reset filters
  const resetFilters = () => {
    setSelectedSpecialization("All");
    setSearchQuery("");
  };

  // Doctor name
  const getDoctorName = (doctor) => {
    return doctor.user?.name || "Specialist Doctor";
  };

  // Doctor initials
  const getDoctorInitials = (doctor) => {
    const name = getDoctorName(doctor)
      .replace(/^Dr\.?\s*/i, "")
      .trim();

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <div className="mq-doctors-page">
      {/* Background Decorations */}
      <div className="mq-doctors-glow mq-doctors-glow-one" />
      <div className="mq-doctors-glow mq-doctors-glow-two" />

      <div className="mq-doctors-content">
        {/* Header */}
        <section className="mq-doctors-header">
          <div className="mq-doctors-heading-content">
            <div className="mq-doctors-eyebrow">
              <span className="mq-doctors-eyebrow-dot" />
              MEDIQUEUE HEALTHCARE
            </div>

            <h1>
              Find Your <span>Specialist</span>
            </h1>

            <p>
              Connect with experienced healthcare professionals,
              explore their availability, and book your consultation
              with confidence.
            </p>
          </div>

          <div className="mq-doctors-header-card">
            <div className="mq-doctors-header-icon">
              <span>✚</span>
            </div>

            <div>
              <strong>Find the right care</strong>
              <span>Quality healthcare, made accessible.</span>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="mq-doctors-filter-panel">
          <div className="mq-doctors-filter-top">
            <div>
              <span className="mq-section-label">
                DOCTOR DIRECTORY
              </span>

              <h2>Explore Doctors</h2>

              <p>
                Search specialists and find the right doctor for you.
              </p>
            </div>

            <div className="mq-doctors-result-badge">
              <span className="mq-result-indicator" />

              {loading
                ? "Searching..."
                : `${doctors.length} ${
                    doctors.length === 1 ? "Doctor" : "Doctors"
                  }`}
            </div>
          </div>

          {/* Search */}
          <div className="mq-doctors-search">
            <span className="mq-search-symbol">⌕</span>

            <input
              type="text"
              placeholder="Search doctor, specialization or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search doctors"
            />

            {searchQuery && (
              <button
                type="button"
                className="mq-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Specialization Filters */}
          <div className="mq-specialization-section">
            <div className="mq-specialization-heading">
              <span>Specialization</span>

              <button
                type="button"
                className="mq-reset-filters"
                onClick={resetFilters}
              >
                Reset filters ↺
              </button>
            </div>

            <div className="mq-specialization-list">
              <button
                type="button"
                className={`mq-specialization-chip ${
                  selectedSpecialization === "All" ? "active" : ""
                }`}
                onClick={() => setSelectedSpecialization("All")}
              >
                <span className="mq-chip-icon">✦</span>
                All Specialties
              </button>

              {specializations.map((spec) => (
                <button
                  type="button"
                  key={spec}
                  className={`mq-specialization-chip ${
                    selectedSpecialization === spec ? "active" : ""
                  }`}
                  onClick={() => setSelectedSpecialization(spec)}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Doctors Results */}
        <section className="mq-doctors-results">
          <div className="mq-doctors-results-heading">
            <div>
              <span className="mq-section-label">
                OUR MEDICAL TEAM
              </span>

              <h2>
                Available <span>Specialists</span>
              </h2>
            </div>

            {!loading && !error && (
              <span className="mq-doctors-count">
                {doctors.length} results
              </span>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="mq-doctors-grid">
              {[1, 2, 3].map((item) => (
                <div
                  className="mq-doctor-skeleton"
                  key={item}
                >
                  <div className="mq-skeleton-header">
                    <div className="mq-skeleton-avatar" />

                    <div className="mq-skeleton-text">
                      <div className="mq-skeleton-line wide" />
                      <div className="mq-skeleton-line short" />
                    </div>
                  </div>

                  <div className="mq-skeleton-line" />
                  <div className="mq-skeleton-line" />
                  <div className="mq-skeleton-line" />
                  <div className="mq-skeleton-button" />
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error */
            <div className="mq-doctors-state">
              <div className="mq-state-icon error">!</div>

              <h3>Unable to load doctors</h3>

              <p>{error}</p>

              <button
                type="button"
                className="mq-doctors-primary-button"
                onClick={fetchDoctors}
              >
                Try Again
              </button>
            </div>
          ) : doctors.length === 0 ? (
            /* Empty */
            <div className="mq-doctors-state">
              <div className="mq-state-icon">⌕</div>

              <h3>No doctors found</h3>

              <p>
                We couldn't find any specialists matching your
                search. Try another name or specialization.
              </p>

              <button
                type="button"
                className="mq-doctors-primary-button"
                onClick={resetFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* Doctor Cards */
            <div className="mq-doctors-grid">
              {doctors.map((doctor) => {
                const doctorName = getDoctorName(doctor);

                return (
                  <article
                    key={doctor._id}
                    className="mq-doctor-card"
                  >
                    {/* Card Header */}
                    <div className="mq-doctor-card-top">
                      <div className="mq-doctor-avatar">
                        <span>
                          {getDoctorInitials(doctor)}
                        </span>

                        <span className="mq-doctor-avatar-status" />
                      </div>

                      <div className="mq-doctor-card-heading">
                        <span className="mq-doctor-specialty">
                          {doctor.specialization ||
                            "General Specialist"}
                        </span>

                        <h3>{doctorName}</h3>

                        <span className="mq-doctor-department">
                          {doctor.department ||
                            "Medical Department"}
                        </span>
                      </div>
                    </div>

                    {/* Doctor Details */}
                    <div className="mq-doctor-details">
                      <div className="mq-doctor-detail-row">
                        <span className="mq-detail-icon">✧</span>

                        <div>
                          <span className="mq-detail-label">
                            Qualification
                          </span>

                          <strong>
                            {doctor.qualification ||
                              "Not specified"}
                          </strong>
                        </div>
                      </div>

                      <div className="mq-doctor-detail-row">
                        <span className="mq-detail-icon">◷</span>

                        <div>
                          <span className="mq-detail-label">
                            Experience
                          </span>

                          <strong>
                            {doctor.experience ?? 0} years
                          </strong>
                        </div>
                      </div>

                      <div className="mq-doctor-detail-row">
                        <span className="mq-detail-icon">⌖</span>

                        <div>
                          <span className="mq-detail-label">
                            Consultation Room
                          </span>

                          <strong>
                            {doctor.roomNumber || "Not assigned"}
                          </strong>
                        </div>
                      </div>

                      <div className="mq-doctor-detail-row">
                        <span className="mq-detail-icon">◴</span>

                        <div>
                          <span className="mq-detail-label">
                            Consultation Hours
                          </span>

                          <strong>
                            {doctor.availableTime ||
                              "Contact hospital"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Available Days */}
                    <div className="mq-doctor-availability">
                      <span className="mq-availability-label">
                        AVAILABLE DAYS
                      </span>

                      <div className="mq-doctor-days">
                        {doctor.availableDays &&
                        doctor.availableDays.length > 0 ? (
                          doctor.availableDays.map((day) => (
                            <span
                              className="mq-doctor-day"
                              key={day}
                            >
                              {day.slice(0, 3)}
                            </span>
                          ))
                        ) : (
                          <span className="mq-doctor-day">
                            Mon - Fri
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mq-doctor-card-footer">
                      <div className="mq-doctor-fee">
                        <span>Consultation Fee</span>

                        <strong>
                          ₹{doctor.consultationFee ?? 0}
                        </strong>
                      </div>

                      <div className="mq-doctor-card-actions">
                        <Link
                          to={`/doctors/${doctor._id}`}
                          className="mq-doctor-profile-button"
                        >
                          View Profile
                        </Link>

                        <button
                          type="button"
                          className="mq-doctor-book-button"
                          disabled={doctor.isAvailable === false}
                          onClick={() =>
                            setSelectedDoctorForBooking(doctor)
                          }
                        >
                          <span>Book</span>
                          <span className="mq-book-arrow">↗</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Appointment Booking Modal */}
        {selectedDoctorForBooking && (
          <BookAppointmentModal
            doctor={selectedDoctorForBooking}
            onClose={() =>
              setSelectedDoctorForBooking(null)
            }
            onBooked={() => {
              setSelectedDoctorForBooking(null);
              fetchDoctors();
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Doctors;
