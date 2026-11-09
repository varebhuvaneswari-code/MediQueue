import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Doctors from "./pages/Doctors";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorRegister from "./pages/DoctorRegister";
import AdminDashboard from "./pages/AdminDashboard";
import TrackQueuePage from "./pages/TrackQueuePage";
import DoctorProfile from "./pages/DoctorProfile";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="main-content-area">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor-register" element={<DoctorRegister />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/track-queue" element={<TrackQueuePage />} />
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
