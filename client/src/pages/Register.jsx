import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "patient"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });

      // Auto login user
      login(data.token, data.user);

      if (data.user.role === "doctor") {
        navigate("/doctor-register");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-modern">
        <div className="auth-header">
          <span className="auth-icon-badge">📋</span>
          <h2>Create Account</h2>
          <p>Join MediQueue Smart Healthcare Portal</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. name@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="e.g. +91 98765 43210"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div className="label-with-action">
              <label>Password</label>
              <button
                type="button"
                className="text-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Register As</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="patient">👤 Patient (Book & Track Appointments)</option>
              <option value="doctor">🩺 Doctor / Medical Practitioner</option>
            </select>
          </div>

          <button type="submit" className="primary-btn auth-submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Register Account"}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <p>
            Already registered?{" "}
            <Link to="/login" className="auth-link">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
