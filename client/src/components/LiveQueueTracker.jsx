import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";

function LiveQueueTracker({ appointmentId }) {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchQueueStatus = async () => {
    if (!appointmentId) return;

    try {
      const data = await apiFetch(`/queue/track/${appointmentId}`);
      setLiveData(data.liveQueue);
      setLastRefreshed(new Date());
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch live queue data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueStatus();

    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchQueueStatus();
    }, 10000); // refresh every 10s

    return () => clearInterval(interval);
  }, [appointmentId, autoRefresh]);

  if (!appointmentId) {
    return (
      <div className="tracker-empty-card">
        <p>Select an appointment above to track its live queue status.</p>
      </div>
    );
  }

  if (loading && !liveData) {
    return (
      <div className="tracker-loading-card">
        <div className="spinner"></div>
        <p>Loading real-time OPD queue status...</p>
      </div>
    );
  }

  if (error && !liveData) {
    return (
      <div className="alert-error">
        <p>{error}</p>
        <button className="primary-btn" onClick={fetchQueueStatus} style={{ marginTop: "10px" }}>
          Retry
        </button>
      </div>
    );
  }

  const {
    myToken,
    myTokenCode,
    myStatus,
    currentlyServingToken,
    currentlyServingCode,
    patientsAhead,
    estimatedWaitMinutes,
    isMyTurn,
    isCompleted,
    isCancelled,
    doctorName,
    doctorSpecialization,
    roomNumber
  } = liveData || {};

  return (
    <div className={`live-tracker-card ${isMyTurn ? "status-my-turn" : ""}`}>
      {/* Turn Alert Banner */}
      {isMyTurn && (
        <div className="turn-alert-banner">
          <span className="bell-icon">🔔</span>
          <div>
            <h3>IT IS YOUR TURN NOW!</h3>
            <p>
              Token #{myToken} ({myTokenCode}) is now being called. Please enter <strong>{roomNumber}</strong> to meet {doctorName}.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="tracker-header">
        <div>
          <div className="live-indicator">
            <span className="live-dot"></span> LIVE OPD QUEUE TRACKER
          </div>
          <h3 className="tracker-doctor-title">
            {doctorName} — <span className="spec-text">{doctorSpecialization}</span>
          </h3>
          <p className="tracker-room-tag">📍 {roomNumber}</p>
        </div>

        <div className="tracker-controls">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (10s)
          </label>
          <button className="refresh-icon-btn" onClick={fetchQueueStatus} title="Refresh Now">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="tracker-metrics-grid">
        <div className="metric-box my-token-box">
          <span className="metric-label">YOUR TOKEN</span>
          <div className="metric-number">{myTokenCode || `#${myToken}`}</div>
          <span className={`status-pill pill-${myStatus}`}>
            {myStatus?.toUpperCase()}
          </span>
        </div>

        <div className="metric-box serving-token-box">
          <span className="metric-label">NOW SERVING</span>
          <div className="metric-number">
            {currentlyServingToken ? currentlyServingCode || `#${currentlyServingToken}` : "Waiting"}
          </div>
          <span className="metric-subtext">
            {currentlyServingToken ? "In Consultation Room" : "Doctor preparing"}
          </span>
        </div>

        <div className="metric-box ahead-box">
          <span className="metric-label">PATIENTS AHEAD</span>
          <div className="metric-number">{isCompleted ? 0 : patientsAhead}</div>
          <span className="metric-subtext">
            {isMyTurn
              ? "You are inside!"
              : isCompleted
              ? "Visit finished"
              : patientsAhead === 0
              ? "You are next in line!"
              : `${patientsAhead} in queue before you`}
          </span>
        </div>

        <div className="metric-box wait-box">
          <span className="metric-label">ESTIMATED WAIT</span>
          <div className="metric-number">
            {isCompleted ? "0 min" : isMyTurn ? "0 min" : `~${estimatedWaitMinutes}m`}
          </div>
          <span className="metric-subtext">
            {isCompleted ? "Completed" : isMyTurn ? "Consultation in progress" : "Based on ~15m/patient"}
          </span>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="queue-stepper-container">
        <div className={`step-item ${myStatus !== "cancelled" ? "completed" : ""}`}>
          <div className="step-circle">1</div>
          <span>Token Booked</span>
        </div>
        <div className="step-line"></div>
        <div
          className={`step-item ${
            patientsAhead === 0 || isMyTurn || isCompleted ? "active" : ""
          }`}
        >
          <div className="step-circle">2</div>
          <span>Up Next</span>
        </div>
        <div className="step-line"></div>
        <div className={`step-item ${isMyTurn || isCompleted ? "active" : ""}`}>
          <div className="step-circle">3</div>
          <span>In Chamber</span>
        </div>
        <div className="step-line"></div>
        <div className={`step-item ${isCompleted ? "completed" : ""}`}>
          <div className="step-circle">4</div>
          <span>Completed</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="tracker-footer">
        <span>
          Last updated: {lastRefreshed ? lastRefreshed.toLocaleTimeString() : "Just now"}
        </span>
        <span>Doctor Availability: Active in Room</span>
      </div>
    </div>
  );
}

export default LiveQueueTracker;

