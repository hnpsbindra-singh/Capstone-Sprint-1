import React from 'react';
import { Link } from 'react-router-dom';
import { MdShield, MdArrowBack } from 'react-icons/md';

const AuthLayout = ({ children, wide = false }) => {
  return (
    <div className="auth-ambient-root">
      {/* Clean Top Navigation Bar */}
      <header className="auth-ambient-topbar">
        <div className="ambient-topbar-inner">
          <Link to="/" className="ambient-brand-link">
            <span className="brand-title">ResQFlow</span>
          </Link>

          <div className="ambient-top-right">
            <a href="tel:112" className="ambient-hotline-tag" title="National Police & Rescue">
              Police 112
            </a>
            <a href="tel:108" className="ambient-hotline-tag" title="Emergency Ambulance">
              Ambulance 108
            </a>
            <Link to="/" className="ambient-back-btn">
              <MdArrowBack size={15} />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Atmospheric Subtle Background (Clean & Calm, Zero Jargon) */}
      <div className="auth-ambient-canvas" aria-hidden="true">
        <div className="ambient-grid-overlay" />
        <div className="ambient-soft-gradient" />
      </div>

      {/* Centered Form */}
      <main className="auth-ambient-main">
        <div className={`auth-card-anchor ${wide ? 'anchor-wide' : ''}`}>
          {children}
        </div>
      </main>

      {/* Clean Trust Footer */}
      <footer className="auth-ambient-footer">
        <div className="ambient-footer-inner">
          <div className="footer-security-tag">
            <span>ResQFlow Disaster Response Network • 24/7 Citizen & NGO Support</span>
          </div>
          <div className="footer-help-tag">
            <span>In immediate danger? Call <strong>112</strong> immediately</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
