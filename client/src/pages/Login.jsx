
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

    const demoAccounts = {
      patient: {
        email: "patient@mediqueue.com",
        password: "Patient@123",
      },
      doctor: {
        email: "dr.sarah@mediqueue.com",
        password: "Doctor@123",
      },
      admin: {
        email: "admin@mediqueue.com",
        password: "Admin@123",
      },
    };

    const account = demoAccounts[type];

    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      login(data.token, data.user);

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
      <div className="auth-background-glow auth-glow-one"></div>
      <div className="auth-background-glow auth-glow-two"></div>

      <div className="auth-card-modern">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <span>✚</span>
          </div>

          <div>
            <h1>MediQueue</h1>
            <span>SMART HEALTHCARE</span>
          </div>
        </div>

        <div className="auth-header">
          <div className="auth-icon-badge">
            <span>↗</span>
          </div>

          <h2>Welcome back</h2>

          <p>
            Sign in to manage your appointments
            <br />
            and stay connected with your care.
          </p>
        </div>

        {error && (
          <div className="alert-error">
            <span>!</span>
            {error}
          </div>
        )}

        <div className="demo-fill-card">
          <div className="demo-fill-label">
            <span>⚡</span>
            Try a demo account
          </div>

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
            <label htmlFor="login-email">Email Address</label>

            <div className="auth-input-wrapper">
              <span className="auth-input-icon">✉</span>

              <input
                id="login-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-with-action">
              <label htmlFor="login-password">Password</label>

              <button
                type="button"
                className="text-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>

              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="primary-btn auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-loading-spinner"></span>
                Authenticating...
              </>
            ) : (
              <>
                Sign In
                <span className="auth-submit-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <p>
            New to MediQueue?{" "}
            <Link to="/register" className="auth-link">
              Create an Account →
            </Link>
          </p>
        </div>

        <div className="auth-security-note">
          <span>🔐</span>
          Secure access to your healthcare account
        </div>
      </div>
    </div>
  );
}

export default Login;
