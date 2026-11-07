import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const demoParam = searchParams.get("demo");
    if (demoParam === "admin") {
      setEmail("admin@mediqueue.com");
      setPassword("Admin@123");
    } else if (demoParam === "doctor") {
      setEmail("dr.sarah@mediqueue.com");
      setPassword("Doctor@123");
    } else if (demoParam === "patient") {
      setEmail("patient@mediqueue.com");
      setPassword("Patient@123");
    }
  }, [searchParams]);

  const handleFillDemo = (type) => {
    setError("");
    if (type === "admin") {
      setEmail("admin@mediqueue.com");
      setPassword("Admin@123");
    } else if (type === "doctor") {
      setEmail("dr.sarah@mediqueue.com");
      setPassword("Doctor@123");
    } else if (type === "patient") {
      setEmail("patient@mediqueue.com");
      setPassword("Patient@123");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      login(data.token, data.user);

      // Role-based redirection
      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-modern">
        <div className="auth-header">
          <span className="auth-icon-badge">🔐</span>
          <h2>Sign In to MediQueue</h2>
          <p>Access your outpatient queue and medical appointments</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {/* 1-Click Quick Demo Switchers */}
        <div className="demo-fill-card">
          <span className="demo-fill-label">⚡ Quick Demo Autofill:</span>
          <div className="demo-fill-buttons">
            <button
              type="button"
              className="demo-btn-chip"
              onClick={() => handleFillDemo("patient")}
            >
              👤 Patient
            </button>
            <button
              type="button"
              className="demo-btn-chip"
              onClick={() => handleFillDemo("doctor")}
            >
              🩺 Doctor
            </button>
            <button
              type="button"
              className="demo-btn-chip"
              onClick={() => handleFillDemo("admin")}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="primary-btn auth-submit-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <p>
            New to MediQueue?{" "}
            <Link to="/register" className="auth-link">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
