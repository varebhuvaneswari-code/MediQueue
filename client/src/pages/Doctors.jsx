import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import BookAppointmentModal from "../components/BookAppointmentModal";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  const fetchSpecializations = async () => {
    try {
      const data = await apiFetch("/doctors/meta/specializations");
      setSpecializations(data.specializations || []);
    } catch (err) {
      console.warn("Could not load specializations list:", err.message);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let endpoint = "/doctors?";
      if (selectedSpecialization && selectedSpecialization !== "All") {
        endpoint += `specialization=${encodeURIComponent(selectedSpecialization)}&`;
      }
      if (searchQuery.trim()) {
        endpoint += `search=${encodeURIComponent(searchQuery.trim())}&`;
      }

      const data = await apiFetch(endpoint);
      setDoctors(data.doctors || []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load doctors list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecializations();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialization, searchQuery]);

  return (
    <div className="doctors-directory-page">
      {/* Page Header */}
      <div className="directory-header">
        <h1>Doctor Directory & Specializations</h1>
        <p>
          Consult top healthcare specialists with transparent queue times and verified credentials.
        </p>

        {/* Search & Filter Bar */}
        <div className="directory-controls-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by doctor name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}
          </div>

          <div className="spec-filter-pills">
            <button
              className={`pill-btn ${selectedSpecialization === "All" ? "active" : ""}`}
              onClick={() => setSelectedSpecialization("All")}
            >
              All Specialties
            </button>
            {specializations.map((spec) => (
              <button
                key={spec}
                className={`pill-btn ${selectedSpecialization === spec ? "active" : ""}`}
                onClick={() => setSelectedSpecialization(spec)}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Doctors Grid */}
      <div className="doctors-container">
        {loading ? (
          <div className="loading-state-box">
            <div className="spinner"></div>
            <p>Loading available doctors...</p>
          </div>
        ) : error ? (
          <div className="alert-error">
            <p>{error}</p>
            <button className="primary-btn" onClick={fetchDoctors}>
              Try Again
            </button>
          </div>
        ) : doctors.length === 0 ? (
          <div className="empty-results-box">
            <span className="empty-icon">🩺</span>
            <h3>No Doctors Found</h3>
            <p>Try adjusting your search criteria or specialization filter.</p>
            <button
              className="secondary-btn"
              onClick={() => {
                setSelectedSpecialization("All");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="doctors-grid">
            {doctors.map((doctor) => {
              const doctorName = doctor.user?.name || "Specialist Doctor";
              return (
                <div key={doctor._id} className="doctor-card-modern">
                  <div className="doctor-card-header">
                    <div className="doctor-avatar">
                      {doctorName.replace("Dr. ", "").charAt(0)}
                    </div>
                    <div>
                      <h3 className="doctor-name">{doctorName}</h3>
                      <span className="specialization-tag">{doctor.specialization}</span>
                    </div>
                  </div>

                  <div className="doctor-meta-section">
                    <div className="meta-line">
                      <span className="meta-label">🎓 Qualifications:</span>
                      <span className="meta-value">{doctor.qualification}</span>
                    </div>
                    <div className="meta-line">
                      <span className="meta-label">⏳ Experience:</span>
                      <span className="meta-value">{doctor.experience} years</span>
                    </div>
                    <div className="meta-line">
                      <span className="meta-label">🏥 Department:</span>
                      <span className="meta-value">{doctor.department}</span>
                    </div>
                    <div className="meta-line">
                      <span className="meta-label">📍 Room:</span>
                      <span className="meta-value">{doctor.roomNumber}</span>
                    </div>
                    <div className="meta-line">
                      <span className="meta-label">⏰ Timings:</span>
                      <span className="meta-value">{doctor.availableTime}</span>
                    </div>
                  </div>

                  <div className="available-days-row">
                    <span className="days-label">Available Days:</span>
                    <div className="days-chips">
                      {doctor.availableDays && doctor.availableDays.length > 0 ? (
                        doctor.availableDays.map((d) => (
                          <span key={d} className="day-chip">
                            {d.slice(0, 3)}
                          </span>
                        ))
                      ) : (
                        <span className="day-chip">Mon - Fri</span>
                      )}
                    </div>
                  </div>

                  <div className="doctor-card-footer">
                    <div className="fee-display">
                      <span className="fee-label">Consultation Fee</span>
                      <span className="fee-amount">₹{doctor.consultationFee}</span>
                    </div>

                    <button
                      className="primary-btn book-btn"
                      onClick={() => setSelectedDoctorForBooking(doctor)}
                    >
                      📅 Book Appointment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Appointment Booking Modal */}
      {selectedDoctorForBooking && (
        <BookAppointmentModal
          doctor={selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onBooked={() => {
            fetchDoctors();
          }}
        />
      )}
    </div>
  );
}

export default Doctors;
