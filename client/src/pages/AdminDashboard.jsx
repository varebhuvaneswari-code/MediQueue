import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview"); // overview, doctors, patients, appointments
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters for appointments
  const [apptStatusFilter, setApptStatusFilter] = useState("all");
  const [apptDoctorFilter, setApptDoctorFilter] = useState("all");

  // Search for patients
  const [patientSearch, setPatientSearch] = useState("");

  // Modal for Adding Doctor
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "General Medicine",
    qualification: "MBBS, MD",
    experience: 5,
    consultationFee: 500,
    department: "General Medicine OPD",
    roomNumber: "Room 101",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableTime: "09:00 AM - 04:00 PM"
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "admin") {
      alert("Access denied. Admin authorization required.");
      navigate("/dashboard");
      return;
    }

    fetchInitialAdminData();
  }, [isAuthenticated, user]);

  const fetchInitialAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, docsData, usersData, apptsData] = await Promise.all([
        apiFetch("/admin/stats"),
        apiFetch("/admin/doctors"),
        apiFetch("/admin/users"),
        apiFetch("/admin/appointments")
      ]);

      setStats(statsData.stats);
      setDoctors(docsData.doctors || []);
      setUsers(usersData.users || []);
      setAppointments(apptsData.appointments || []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load administrative data.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDoctorStatus = async (doctorId) => {
    try {
      await apiFetch(`/admin/doctors/${doctorId}/toggle-status`, {
        method: "PATCH"
      });
      // Refresh doctors
      const docsData = await apiFetch("/admin/doctors");
      setDoctors(docsData.doctors || []);
    } catch (err) {
      alert(err.message || "Failed to toggle status.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user and all their records?")) {
      return;
    }

    try {
      await apiFetch(`/admin/users/${userId}`, {
        method: "DELETE"
      });
      fetchInitialAdminData();
    } catch (err) {
      alert(err.message || "Could not delete user.");
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/admin/doctors", {
        method: "POST",
        body: JSON.stringify(newDoctorForm)
      });
      alert("Doctor created and registered successfully!");
      setShowAddDoctorModal(false);
      fetchInitialAdminData();
    } catch (err) {
      alert(err.message || "Could not create doctor.");
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (apptStatusFilter !== "all" && a.status !== apptStatusFilter) return false;
    if (apptDoctorFilter !== "all" && a.doctor?._id !== apptDoctorFilter) return false;
    return true;
  });

  const filteredPatients = users.filter((u) => {
    if (u.role !== "patient") return false;
    if (patientSearch.trim()) {
      const q = patientSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
    }
    return true;
  });

  return (
    <div className="admin-dashboard-container">
      {/* Top Header */}
      <div className="admin-header-banner">
        <div>
          <div className="admin-badge-tag">🛡️ HOSPITAL EXECUTIVE MANAGEMENT</div>
          <h1>MediQueue Administration Portal</h1>
          <p className="admin-sub">Centralized overview of patients, doctors, OPD queues, and hospital metrics</p>
        </div>

        <button className="refresh-mini-btn" onClick={fetchInitialAdminData} title="Refresh All Data">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* KPI Cards Row */}
      <div className="admin-kpis-grid">
        <div className="admin-kpi-card">
          <div className="kpi-icon">👥</div>
          <div>
            <span className="kpi-title">TOTAL PATIENTS</span>
            <div className="kpi-value">{stats?.totalPatients || 0}</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon">🩺</div>
          <div>
            <span className="kpi-title">TOTAL DOCTORS</span>
            <div className="kpi-value">{stats?.totalDoctors || 0}</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon">📅</div>
          <div>
            <span className="kpi-title">TOTAL APPOINTMENTS</span>
            <div className="kpi-value">{stats?.totalAppointments || 0}</div>
          </div>
        </div>

        <div className="admin-kpi-card highlight-today">
          <div className="kpi-icon">🕒</div>
          <div>
            <span className="kpi-title">TODAY'S APPOINTMENTS</span>
            <div className="kpi-value">{stats?.todayAppointments || 0}</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="admin-tabs-nav">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview & Breakdown
        </button>
        <button
          className={`tab-btn ${activeTab === "doctors" ? "active" : ""}`}
          onClick={() => setActiveTab("doctors")}
        >
          🩺 Manage Doctors ({doctors.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "patients" ? "active" : ""}`}
          onClick={() => setActiveTab("patients")}
        >
          👤 Patient Directory ({filteredPatients.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveTab("appointments")}
        >
          📋 Hospital Appointments ({appointments.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & BREAKDOWN */}
      {activeTab === "overview" && (
        <div className="tab-pane-content">
          <div className="overview-cards-grid">
            <div className="analytics-box">
              <h3>Appointment Status Distribution</h3>
              <div className="status-bars-list">
                <div className="status-bar-row">
                  <span>Waiting in Queue</span>
                  <strong>{stats?.statusBreakdown?.waiting || 0}</strong>
                </div>
                <div className="status-bar-row">
                  <span>Currently Serving</span>
                  <strong>{stats?.statusBreakdown?.serving || 0}</strong>
                </div>
                <div className="status-bar-row">
                  <span>Completed Consultations</span>
                  <strong>{stats?.statusBreakdown?.completed || 0}</strong>
                </div>
                <div className="status-bar-row">
                  <span>Cancelled / No-Show</span>
                  <strong>{stats?.statusBreakdown?.cancelled || 0}</strong>
                </div>
              </div>
            </div>

            <div className="analytics-box">
              <h3>Clinical Specializations</h3>
              <div className="specs-list">
                {stats?.specializationsCount && Object.keys(stats.specializationsCount).length > 0 ? (
                  Object.entries(stats.specializationsCount).map(([spec, count]) => (
                    <div key={spec} className="spec-count-row">
                      <span>{spec}</span>
                      <span className="count-pill">{count} Doctors</span>
                    </div>
                  ))
                ) : (
                  <p>No specialties configured.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR MANAGEMENT */}
      {activeTab === "doctors" && (
        <div className="tab-pane-content">
          <div className="tab-actions-header">
            <h3>Registered Doctors & Consultants</h3>
            <button className="primary-btn" onClick={() => setShowAddDoctorModal(true)}>
              ➕ Add New Doctor
            </button>
          </div>

          <div className="table-responsive-box">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Specialization & Dept</th>
                  <th>Contact Info</th>
                  <th>Room</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <strong>{doc.user?.name || "Doctor"}</strong>
                      <div className="sub-text">{doc.qualification}</div>
                    </td>
                    <td>
                      <span className="specialization-tag">{doc.specialization}</span>
                      <div className="sub-text">{doc.department}</div>
                    </td>
                    <td>
                      <div>{doc.user?.email}</div>
                      <div className="sub-text">{doc.user?.phone}</div>
                    </td>
                    <td>{doc.roomNumber}</td>
                    <td>₹{doc.consultationFee}</td>
                    <td>
                      <span className={`status-pill ${doc.isAvailable ? "pill-completed" : "pill-cancelled"}`}>
                        {doc.isAvailable ? "Available" : "Off-Duty"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="secondary-btn"
                        style={{ padding: "6px 12px", fontSize: "13px" }}
                        onClick={() => handleToggleDoctorStatus(doc._id)}
                      >
                        {doc.isAvailable ? "Mark Inactive" : "Mark Active"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PATIENT DIRECTORY */}
      {activeTab === "patients" && (
        <div className="tab-pane-content">
          <div className="tab-actions-header">
            <div className="search-input-wrapper" style={{ maxWidth: "350px" }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search patient name, email, phone..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
            </div>
            <span>Showing {filteredPatients.length} registered patients</span>
          </div>

          <div className="table-responsive-box">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>{p.email}</td>
                    <td>{p.phone}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="danger-btn"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
                        onClick={() => handleDeleteUser(p._id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ALL APPOINTMENTS */}
      {activeTab === "appointments" && (
        <div className="tab-pane-content">
          <div className="tab-actions-header">
            <div className="filters-group-row">
              <label>Filter Status:</label>
              <select value={apptStatusFilter} onChange={(e) => setApptStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="waiting">Waiting</option>
                <option value="serving">Serving</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled / No-show</option>
              </select>

              <label>Filter Doctor:</label>
              <select value={apptDoctorFilter} onChange={(e) => setApptDoctorFilter(e.target.value)}>
                <option value="all">All Doctors</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.user?.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            <span>{filteredAppointments.length} Appointments Found</span>
          </div>

          <div className="table-responsive-box">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Slot</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <span className="table-token-badge">{a.tokenCode || `#${a.tokenNumber}`}</span>
                    </td>
                    <td>
                      <strong>{a.patient?.name || "Patient"}</strong>
                      <div className="sub-text">{a.patient?.phone}</div>
                    </td>
                    <td>
                      <strong>{a.doctor?.user?.name || "Doctor"}</strong>
                      <div className="sub-text">{a.doctor?.specialization}</div>
                    </td>
                    <td>
                      <div>{new Date(a.appointmentDate).toLocaleDateString()}</div>
                      <div className="sub-text">{a.timeSlot?.split(" ")[0]}</div>
                    </td>
                    <td>{a.reason || "General"}</td>
                    <td>
                      <span className={`status-pill pill-${a.status}`}>
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Doctor */}
      {showAddDoctorModal && (
        <div className="modal-overlay" onClick={() => setShowAddDoctorModal(false)}>
          <div className="modal-box modal-box-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAddDoctorModal(false)}>
              ✕
            </button>
            <h2>Add & Register New Doctor</h2>
            <p className="form-subtitle">Create user credentials and clinical doctor profile</p>

            <form onSubmit={handleCreateDoctor} style={{ marginTop: "15px" }}>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Doctor Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Arthur Conan"
                    value={newDoctorForm.name}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Login Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. dr.arthur@mediqueue.com"
                    value={newDoctorForm.email}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Account Password</label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    placeholder="Password (min 6 chars)"
                    value={newDoctorForm.password}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    value={newDoctorForm.phone}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Neurology, Cardiology"
                    value={newDoctorForm.specialization}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, specialization: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Qualifications</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MBBS, MD (Neuro), DM"
                    value={newDoctorForm.qualification}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, qualification: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newDoctorForm.experience}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, experience: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Consultation Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newDoctorForm.consultationFee}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, consultationFee: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={newDoctorForm.department}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, department: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>OPD Room Number</label>
                  <input
                    type="text"
                    value={newDoctorForm.roomNumber}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, roomNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer-buttons">
                <button type="button" className="secondary-btn" onClick={() => setShowAddDoctorModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Register Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

