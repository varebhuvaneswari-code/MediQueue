import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = user?.role;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="nav-brand">
        <Link to="/" className="logo">
          <span className="logo-icon">🏥</span> MediQueue
        </Link>
        <span className="logo-badge">Smart OPD & Queue</span>
      </div>

      <nav className="nav-links">
        <Link to="/" className={isActive("/") ? "active" : ""}>
          Home
        </Link>
        <Link to="/doctors" className={isActive("/doctors") ? "active" : ""}>
          Doctors
        </Link>

        {isAuthenticated && role === "patient" && (
          <>
            <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
              My Appointments
            </Link>
            <Link to="/track-queue" className={isActive("/track-queue") ? "active" : ""}>
              Track Queue
            </Link>
          </>
        )}

        {isAuthenticated && role === "doctor" && (
          <>
            <Link to="/doctor-dashboard" className={isActive("/doctor-dashboard") ? "active" : ""}>
              Doctor OPD Queue
            </Link>
            <Link to="/doctor-register" className={isActive("/doctor-register") ? "active" : ""}>
              Doctor Profile
            </Link>
          </>
        )}

        {isAuthenticated && role === "admin" && (
          <Link to="/admin" className={isActive("/admin") ? "active" : ""}>
            Admin Dashboard
          </Link>
        )}
      </nav>

      <div className="nav-buttons">
        {isAuthenticated ? (
          <div className="user-profile-menu">
            <span className={`role-pill role-${role}`}>
              {role === "admin" ? "🛡️ Admin" : role === "doctor" ? "🩺 Doctor" : "👤 Patient"}
            </span>
            <span className="user-greeting">Hi, {user.name?.split(" ")[0]}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="login-btn">
              Sign In
            </Link>
            <Link to="/register" className="register-btn">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;

