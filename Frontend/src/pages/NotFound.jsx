import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MdRadar, 
  MdSensors, 
  MdArrowBack, 
  MdHome, 
  MdMap, 
  MdWarning, 
  MdShield,
  MdExplore
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [timeUtc, setTimeUtc] = useState('');
  const [radarDegree, setRadarDegree] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    const radarTimer = setInterval(() => {
      setRadarDegree((prev) => (prev + 2) % 360);
    }, 16);

    // Keyboard shortcut [ESC] to return home
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleReturnHome();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      clearInterval(radarTimer);
      removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getHomeRoute = () => {
    if (!token || !user?.role) return '/';
    const role = String(user.role).toLowerCase();
    return `/${role}`;
  };

  const handleReturnHome = () => {
    navigate(getHomeRoute());
  };

  return (
    <div className="not-found-page">
      {/* ─── Top Telemetry Strip ─── */}
      <div className="not-found-status-bar">
        <div className="not-found-bar-inner">
          <div className="not-found-chip">
            <span className="not-found-pulsar" />
            <span>DISASTER GRID TELEMETRY // INCIDENT ROUTE UNRESOLVED</span>
          </div>
          <div className="not-found-meta">
            <span>TIMESTAMP: {timeUtc || 'SYNCING...'}</span>
            <span className="divider-sep">|</span>
            <span>STATUS: 404 NOT_FOUND</span>
          </div>
        </div>
      </div>

      {/* ─── Main Content Canvas ─── */}
      <div className="not-found-container">
        <div className="not-found-grid">
          {/* Left Column: Visual Radar & Sector Scan */}
          <div className="not-found-radar-pane">
            <div className="radar-display-frame">
              <div className="radar-circle ring-3" />
              <div className="radar-circle ring-2" />
              <div className="radar-circle ring-1" />
              <div className="radar-crosshair-h" />
              <div className="radar-crosshair-v" />
              
              {/* Rotating Sweep Line */}
              <div 
                className="radar-sweep-beam"
                style={{ transform: `rotate(${radarDegree}deg)` }}
              />

              {/* Ping Marker for Missing Route */}
              <div className="radar-lost-target">
                <span className="ping-wave" />
                <span className="ping-dot" />
                <span className="ping-label">WAYPOINT NULL</span>
              </div>

              {/* Coordinates Box */}
              <div className="radar-coords-tag">
                <MdSensors />
                <span>GRID: 28.6139° N, 77.2090° E // SECTOR Ø</span>
              </div>
            </div>

            <div className="radar-caption">
              <div className="caption-code">PROTOCOL ERR_ROUTE_NOT_FOUND</div>
              <p>Scanning active relief sectors and node endpoints. Target URI unresolved.</p>
            </div>
          </div>

          {/* Right Column: Editorial Message & Navigation Fallbacks */}
          <div className="not-found-content-pane">
            <div className="not-found-kicker">
              <span>WAYPOINT DISCONNECTED</span>
              <span className="error-pill">HTTP 404</span>
            </div>

            <h1 className="not-found-title">
              Sector coordinates <br />
              unreachable.
            </h1>

            <div className="not-found-target-url">
              <span className="target-label">REQUESTED PATH:</span>
              <code className="target-value">{location.pathname}</code>
            </div>

            <p className="not-found-desc">
              The disaster grid node or dispatch view you attempted to access does not exist, 
              has been rerouted to a secure cluster, or was retired following incident triage.
            </p>

            {/* Quick Action Matrix */}
            <div className="not-found-actions">
              <button 
                onClick={handleReturnHome}
                className="action-btn action-primary"
              >
                <MdHome className="btn-icon" />
                <span>{token ? 'Return to Command Dashboard' : 'Return to Operations Base'}</span>
              </button>

              <button 
                onClick={() => navigate(-1)}
                className="action-btn action-secondary"
              >
                <MdArrowBack className="btn-icon" />
                <span>Previous Sector</span>
              </button>
            </div>

            {/* Tactical Safe Navigation Directory */}
            <div className="not-found-directory">
              <div className="dir-title">VERIFIED ACTIVE CORRIDORS:</div>
              <div className="dir-grid">
                <Link to="/victim/create-report" className="dir-card">
                  <div className="dir-icon danger">
                    <MdWarning />
                  </div>
                  <div>
                    <div className="dir-card-title">SOS Report</div>
                    <div className="dir-card-sub">Broadcast flood emergency</div>
                  </div>
                </Link>

                <Link to="/login" className="dir-card">
                  <div className="dir-icon neutral">
                    <MdShield />
                  </div>
                  <div>
                    <div className="dir-card-title">Grid Auth</div>
                    <div className="dir-card-sub">Access verified roles</div>
                  </div>
                </Link>

                <Link to="/" className="dir-card">
                  <div className="dir-icon accent">
                    <MdExplore />
                  </div>
                  <div>
                    <div className="dir-card-title">Telemetry Overview</div>
                    <div className="dir-card-sub">System architecture & specs</div>
                  </div>
                </Link>
              </div>
            </div>

            <div className="not-found-footer-hint">
              <span>Press <kbd>ESC</kbd> to return to base immediately.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
