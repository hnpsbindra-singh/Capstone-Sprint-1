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
  MdPhoneInTalk,
  MdLock
} from 'react-icons/md';

const AuthLayout = ({ 
  children, 
  badge = 'AUTHENTICATION PROTOCOL',
  title = 'Decentralized flood rescue. Distress beacon to verified delivery.',
  description = 'An open disaster logistics grid uniting stranded citizens, autonomous computer vision severity scoring, and registered relief NGOs on a real-time GIS tactical map.',
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
    <div className="auth-split-wrapper">
      {/* ─── 1. LEFT COLUMN: TACTICAL MISSION COMMAND DECK ─── */}
      <aside className="auth-sidebar-deck">
        {/* Subtle Ambient Tactical Grid Marking */}
        <div className="sidebar-ambient-grid" />

        {/* Top Telemetry Strip */}
        <div className="sidebar-top-bar">
          <div className="sidebar-status-tag">
            <span className="sidebar-live-pulsar" />
            <span className="sidebar-status-text">DISASTER GRID ONLINE // LATENCY &lt;2MS</span>
          </div>
          <div className="sidebar-utc-clock">{liveUtc || 'SYNCING UTC...'}</div>
        </div>

        {/* Main Brand & Editorial Section */}
        <div className="sidebar-hero-content">
          <Link to="/" className="sidebar-brand-lockup">
            <div className="sidebar-brand-icon">
              <MdShield />
            </div>
            <div className="sidebar-brand-titles">
              <span className="sidebar-brand-main">ResQFlow</span>
              <span className="sidebar-brand-sub">// CRISIS DISPATCH GRID</span>
            </div>
          </Link>

          <div className="sidebar-protocol-kicker">
            <span>PROTOCOL v2.4</span>
            <span className="kicker-sep">/</span>
            <span>{badge}</span>
          </div>

          <h2 className="sidebar-hero-title">{title}</h2>
          <p className="sidebar-hero-desc">{description}</p>

          {/* 3 Real Capability Telemetry Cells */}
          <div className="sidebar-capability-matrix">
            <div className="sidebar-cap-card">
              <div className="cap-icon-box">
                <MdSensors />
              </div>
              <div className="cap-body">
                <div className="cap-title">
                  <span>1-Tap Geolocation Beacon</span>
                  <span className="cap-tag">&lt; 2s BROADCAST</span>
                </div>
                <p className="cap-desc">
                  WGS84 high-precision GPS lock transmitted instantly without typing manual addresses.
                </p>
              </div>
            </div>

            <div className="sidebar-cap-card">
              <div className="cap-icon-box">
                <MdAutoAwesome />
              </div>
              <div className="cap-body">
                <div className="cap-title">
                  <span>AI Computer Vision Triage</span>
                  <span className="cap-tag">1.0 – 10.0 SCORE</span>
                </div>
                <p className="cap-desc">
                  Deep learning assesses flood depth, structural collapse risk, and rooftop refuge.
                </p>
              </div>
            </div>

            <div className="sidebar-cap-card">
              <div className="cap-icon-box">
                <MdVpnKey />
              </div>
              <div className="cap-body">
                <div className="cap-title">
                  <span>Physical 6-Digit Handshake</span>
                  <span className="cap-tag">CHAIN OF CUSTODY</span>
                </div>
                <p className="cap-desc">
                  Parcels cannot mark delivered without the receiving NGO matching the donor's security PIN.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Infrastructure Telemetry Footer */}
        <div className="sidebar-footer-ticker">
          <div className="ticker-label">CLUSTER TELEMETRY:</div>
          <div className="ticker-badges">
            <span className="ticker-pill">API GATEWAY: 100% UP</span>
            <span className="ticker-pill">VICTIM NODE: UP</span>
            <span className="ticker-pill">AI VISION: UP</span>
            <span className="ticker-pill">NGO DISPATCH: UP</span>
            <span className="ticker-pill">DONOR LEDGER: UP</span>
          </div>
        </div>
      </aside>

      {/* ─── 2. RIGHT COLUMN: INTERACTIVE AUTHENTICATION CANVAS ─── */}
      <main className={`auth-form-canvas ${wide ? 'canvas-wide' : ''}`}>
        {/* Top Action Header */}
        <div className="canvas-header-bar">
          <Link to="/" className="canvas-back-link">
            <MdArrowBack size={16} />
            <span>Return to Operations Base</span>
          </Link>

          <div className="canvas-emergency-links">
            <span className="hotline-kicker">EMERGENCY LINES:</span>
            <a href="tel:112" className="canvas-hotline-tag" title="National Police & Rescue">
              POLICE 112
            </a>
            <a href="tel:108" className="canvas-hotline-tag" title="Emergency Ambulance">
              AMBULANCE 108
            </a>
          </div>
        </div>

        {/* Form Container */}
        <div className="canvas-form-wrapper">
          {children}
        </div>

        {/* Security Footer */}
        <div className="canvas-security-footer">
          <div className="security-tag">
            <MdLock size={13} style={{ color: '#16a34a' }} />
            <span>End-to-End Encrypted Session // SHA-256 JWT Architecture</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
