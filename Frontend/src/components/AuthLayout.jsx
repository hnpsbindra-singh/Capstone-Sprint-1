import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MdShield, 
  MdSensors, 
  MdAutoAwesome, 
  MdVpnKey, 
  MdArrowBack,
  MdLocationOn,
  MdCheckCircle,
  MdLock
} from 'react-icons/md';

const AuthLayout = ({ 
  children, 
  badge = 'AUTHENTICATION PROTOCOL',
  wide = false 
}) => {
  const [liveUtc, setLiveUtc] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveUtc(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="auth-ambient-root">
      {/* ─── 1. TOP OPERATIONAL TELEMETRY BAR ─── */}
      <header className="auth-ambient-topbar">
        <div className="ambient-topbar-inner">
          <div className="ambient-top-left">
            <Link to="/" className="ambient-brand-link">
              <div className="ambient-brand-icon">
                <MdShield />
              </div>
              <div className="ambient-brand-text">
                <span className="brand-title">ResQFlow</span>
                <span className="brand-sub">// DISASTER GRID</span>
              </div>
            </Link>

            <div className="ambient-status-chip">
              <span className="ambient-live-dot" />
              <span>GRID ONLINE // LATENCY &lt;2MS</span>
            </div>
          </div>

          <div className="ambient-top-center">
            <span className="ambient-utc-clock">{liveUtc || 'SYNCING UTC...'}</span>
          </div>

          <div className="ambient-top-right">
            <a href="tel:112" className="ambient-hotline-tag" title="National Police & Rescue">
              POLICE 112
            </a>
            <a href="tel:108" className="ambient-hotline-tag" title="Emergency Ambulance">
              AMBULANCE 108
            </a>
            <Link to="/" className="ambient-back-btn">
              <MdArrowBack size={15} />
              <span>Base</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 2. ATMOSPHERIC DISASTER TOPOGRAPHY & TELEMETRY BACKGROUND ─── */}
      <div className="auth-ambient-canvas" aria-hidden="true">
        {/* Architectural Coordinate Hairline Grid */}
        <div className="ambient-grid-overlay" />

        {/* Topographic Bathymetry / Inundation Contour Lines */}
        <svg 
          className="ambient-topo-svg" 
          viewBox="0 0 1440 900" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Contour Depth Level 1 (+5.0m) */}
          <path 
            d="M-50 250 C 200 180, 450 320, 720 220 C 990 120, 1200 280, 1500 200" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeDasharray="6 6"
            className="topo-line-1"
          />
          {/* Contour Depth Level 2 (+3.5m) */}
          <path 
            d="M-50 400 C 180 320, 420 480, 720 380 C 1020 280, 1250 460, 1500 360" 
            stroke="currentColor" 
            strokeWidth="1" 
            className="topo-line-2"
          />
          {/* Contour Depth Level 3 (+2.0m) */}
          <path 
            d="M-50 560 C 220 490, 480 620, 720 540 C 960 460, 1220 610, 1500 520" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeDasharray="4 4"
            className="topo-line-3"
          />
          {/* Contour Depth Level 4 (+1.0m Basin) */}
          <path 
            d="M-50 720 C 260 650, 500 780, 720 700 C 940 620, 1200 750, 1500 680" 
            stroke="currentColor" 
            strokeWidth="1" 
            className="topo-line-4"
          />

          {/* Focal Depth Concentric Rings (Centered behind card) */}
          <circle cx="720" cy="460" r="280" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" className="topo-ring" />
          <circle cx="720" cy="460" r="440" stroke="currentColor" strokeWidth="1" className="topo-ring" />
          <circle cx="720" cy="460" r="620" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" className="topo-ring" />

          {/* Crosshair Coordinates Axis */}
          <line x1="720" y1="60" x2="720" y2="860" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" className="topo-axis" />
          <line x1="120" y1="460" x2="1320" y2="460" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" className="topo-axis" />
        </svg>

        {/* Large Brutalist Typographic Watermark */}
        <div className="ambient-watermark">
          <div className="watermark-line">RESQFLOW // CRISIS DISPATCH</div>
          <div className="watermark-sub">WGS84 28.6139° N, 77.2090° E // ZERO SUPPLY LEAKAGE</div>
        </div>

        {/* Technical Corner Crosshairs & Coordinate Tags */}
        <div className="ambient-corner top-left">
          <span className="corner-bracket">+</span>
          <span className="corner-meta">LAT 28°38'42" N // SECTOR 04</span>
        </div>
        <div className="ambient-corner top-right">
          <span className="corner-bracket">+</span>
          <span className="corner-meta">LON 77°13'08" E // ELEV +18M</span>
        </div>
        <div className="ambient-corner bottom-left">
          <span className="corner-bracket">+</span>
          <span className="corner-meta">AI VISION // REST API v2.4</span>
        </div>
        <div className="ambient-corner bottom-right">
          <span className="corner-bracket">+</span>
          <span className="corner-meta">SHA-256 JWT // 6-DIGIT PIN</span>
        </div>

        {/* Perimeter Telemetry Chips (Floating in negative space) */}
        <div className="ambient-perimeter-chip chip-left-1">
          <div className="chip-indicator" />
          <div>
            <div className="chip-title">HOTSPOT 04 // YAMUNA BASIN</div>
            <div className="chip-sub">Depth +5.4ft • Severity 8.7 (Critical)</div>
          </div>
        </div>

        <div className="ambient-perimeter-chip chip-left-2">
          <div className="chip-indicator blue" />
          <div>
            <div className="chip-title">RELIEF DEPOT ALPHA // IN TRANSIT</div>
            <div className="chip-sub">DTDC Cargo #DT-948102 • 40 Vests</div>
          </div>
        </div>

        <div className="ambient-perimeter-chip chip-right-1">
          <div className="chip-indicator green" />
          <div>
            <div className="chip-title">HANDSHAKE PIN VALIDATED</div>
            <div className="chip-sub">Depot Handshake PIN: 482-910</div>
          </div>
        </div>

        <div className="ambient-perimeter-chip chip-right-2">
          <div className="chip-indicator" />
          <div>
            <div className="chip-title">AI VISION TRIAGE ACTIVE</div>
            <div className="chip-sub">Structural Risk Evaluated in &lt;1.8s</div>
          </div>
        </div>
      </div>

      {/* ─── 3. CENTERED FORM CONTAINER ─── */}
      <main className="auth-ambient-main">
        <div className={`auth-card-anchor ${wide ? 'anchor-wide' : ''}`}>
          {children}
        </div>
      </main>

      {/* ─── 4. BOTTOM SECURITY TELEMETRY FOOTER ─── */}
      <footer className="auth-ambient-footer">
        <div className="ambient-footer-inner">
          <div className="footer-security-tag">
            <MdLock size={13} style={{ color: '#16a34a' }} />
            <span>256-Bit Encrypted Session // SHA-256 JWT Protocol</span>
          </div>

          <div className="footer-cluster-pills">
            <span className="cluster-pill">GATEWAY: 100% UP</span>
            <span className="cluster-pill">AI MODEL: UP</span>
            <span className="cluster-pill">NGO NODE: UP</span>
            <span className="cluster-pill">DONOR NODE: UP</span>
            <span className="cluster-pill">VICTIM NODE: UP</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
