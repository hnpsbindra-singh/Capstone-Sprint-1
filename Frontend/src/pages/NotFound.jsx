import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
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

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    // Keyboard shortcut [ESC] to return home
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleReturnHome();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
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
              
              {/* Rotating Sweep Line (animated via CSS) */}
              <div className="radar-sweep-beam" />

              {/* Ping Marker for Missing Route */}
              <div className="radar-lost-target">
                <span className="ping-wave" />
                <span className="ping-dot" />
                <span className="ping-label">PAGE NOT FOUND</span>
              </div>

              {/* Coordinates Box */}
              <div className="radar-coords-tag">
                <MdSensors />
                <span>RESQFLOW ROUTER // STATUS 404</span>
              </div>
            </div>

            <div className="radar-caption">
              <div className="caption-code">HTTP 404 - RESOURCE NOT LOCATED</div>
              <p>The requested endpoint or dispatch corridor could not be verified in the routing registry.</p>
            </div>
          </div>

          {/* Right Column: Editorial Message & Navigation Fallbacks */}
          <div className="not-found-content-pane">
            <div className="not-found-kicker">
              <span>UNRESOLVED DESTINATION</span>
              <span className="error-pill">404</span>
            </div>

            <h1 className="not-found-title">
              Page or resource <br />
              not found.
            </h1>

            <div className="not-found-target-url">
              <span className="target-label">REQUESTED PATH:</span>
              <code className="target-value">{location.pathname}</code>
            </div>

            <p className="not-found-desc">
              The page you are trying to reach does not exist, has been moved, or requires different authentication privileges.
            </p>

            {/* Quick Action Matrix */}
            <div className="not-found-actions">
              <button 
                onClick={handleReturnHome}
                className="action-btn action-primary"
              >
                <MdHome className="btn-icon" />
                <span>{token ? 'Return to Dashboard' : 'Return to Home'}</span>
              </button>

              <button 
                onClick={() => navigate(-1)}
                className="action-btn action-secondary"
              >
                <MdArrowBack className="btn-icon" />
                <span>Go Back</span>
              </button>
            </div>

            {/* Tactical Safe Navigation Directory */}
            <div className="not-found-directory">
              <div className="dir-title">HELPFUL CORRIDORS:</div>
              <div className="dir-grid">
                <Link to="/victim/create-report" className="dir-card">
                  <div className="dir-icon danger">
                    <MdWarning />
                  </div>
                  <div>
                    <div className="dir-card-title">SOS Report</div>
                    <div className="dir-card-sub">Submit flood emergency</div>
                  </div>
                </Link>

                <Link to="/login" className="dir-card">
                  <div className="dir-icon neutral">
                    <MdShield />
                  </div>
                  <div>
                    <div className="dir-card-title">Sign In</div>
                    <div className="dir-card-sub">Access your account</div>
                  </div>
                </Link>

                <Link to="/" className="dir-card">
                  <div className="dir-icon accent">
                    <MdExplore />
                  </div>
                  <div>
                    <div className="dir-card-title">Home Overview</div>
                    <div className="dir-card-sub">Platform & emergency info</div>
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
