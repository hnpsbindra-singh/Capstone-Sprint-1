import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';
import {
  MdLocationOn,
  MdCheckCircle,
  MdArrowForward,
  MdMap,
  MdDirectionsRun,
  MdVolunteerActivism,
  MdAutoAwesome,
  MdVpnKey,
  MdLocalShipping,
  MdCheck,
  MdPhone,
  MdMenu,
  MdClose
} from 'react-icons/md';

const SECTOR_HOTSPOTS = [
  {
    id: 'SEC-01',
    name: 'Yamuna Basin, Delhi',
    depth: '5.4 ft',
    severity: '8.7',
    level: 'Critical',
    trapped: 18,
    status: 'Rescue Squad En Route'
  },
  {
    id: 'SEC-02',
    name: 'Kaziranga Buffer, Assam',
    depth: '7.8 ft',
    severity: '9.4',
    level: 'Catastrophic',
    trapped: 42,
    status: 'Air-boat Evacuation Underway'
  },
  {
    id: 'SEC-03',
    name: 'Wayanad Slopes, Kerala',
    depth: '3.9 ft',
    severity: '7.2',
    level: 'High',
    trapped: 9,
    status: 'Medical Kits Dispatched'
  }
];

const LandingPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [activeFrameTab, setActiveFrameTab] = useState('sos'); // 'sos' | 'map' | 'pin'
  const [selectedHotspot, setSelectedHotspot] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key or window resize to desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDashboardRedirect = () => {
    if (user?.role) navigate(`/${user.role.toLowerCase()}`);
    else navigate('/login');
  };

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="rp-landing">
      {/* ─── 1. TOP UTILITY HELPLINE STRIP ─── */}
      <div className="rp-utility-strip">
        <div className="rp-container rp-utility-inner">
          <div className="rp-utility-helpline">
            <span className="rp-utility-dot" />
            <span>24/7 National Emergency Hotlines: Police & Rescue <strong>112</strong> • Ambulance <strong>108</strong> • Disaster <strong>1078</strong></span>
          </div>
          <div className="rp-utility-links">
            <a href="tel:112" className="rp-helpline-tag">POLICE 112</a>
            <a href="tel:108" className="rp-helpline-tag">AMBULANCE 108</a>
          </div>
        </div>
      </div>

      {/* ─── 2. CLEAN NAVBAR ─── */}
      <header className="rp-navbar">
        <div className="rp-container rp-nav-inner">
          <Link to="/" className="rp-brand">
            <span className="rp-brand-text">ResQFlow</span>
            <span className="rp-brand-tag">RELIEF</span>
          </Link>

          <nav className="rp-nav-links" aria-label="Landing Page Navigation">
            <a href="#features" className="rp-nav-link" onClick={(e) => scrollToSection(e, 'features')}>Features</a>
            <a href="#workflow" className="rp-nav-link" onClick={(e) => scrollToSection(e, 'workflow')}>How It Works</a>
            <a href="#roles" className="rp-nav-link" onClick={(e) => scrollToSection(e, 'roles')}>Who It's For</a>
            <a href="#helplines" className="rp-nav-link" onClick={(e) => scrollToSection(e, 'helplines')}>Emergency Contacts</a>
          </nav>

          <div className="rp-nav-actions">
            {token ? (
              <button onClick={handleDashboardRedirect} className="rp-btn rp-btn-primary">
                Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="rp-btn rp-btn-outline">
                  Sign In
                </Link>
                <Link to="/register?role=VICTIM" className="rp-btn rp-btn-danger">
                  Report SOS
                </Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="rp-mobile-trigger"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <MdClose size={20} /> : <MdMenu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── PORTAL-MOUNTED LANDING MOBILE DRAWER ─── */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="rp-mobile-drawer-overlay"
          onClick={() => setMobileMenuOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Landing Mobile Menu"
        >
          <div 
            className="rp-mobile-drawer-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rp-drawer-top">
              <Link to="/" className="rp-brand" onClick={() => setMobileMenuOpen(false)}>
                <span className="rp-brand-text">ResQFlow</span>
                <span className="rp-brand-tag">RELIEF</span>
              </Link>
              <button
                type="button"
                className="app-drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <MdClose size={20} />
              </button>
            </div>

            <nav className="rp-drawer-nav" aria-label="Mobile Navigation">
              <a 
                href="#features" 
                className="rp-drawer-link"
                onClick={(e) => scrollToSection(e, 'features')}
              >
                <span>Features</span>
                <MdArrowForward size={16} style={{ opacity: 0.6 }} />
              </a>
              <a 
                href="#workflow" 
                className="rp-drawer-link"
                onClick={(e) => scrollToSection(e, 'workflow')}
              >
                <span>How It Works</span>
                <MdArrowForward size={16} style={{ opacity: 0.6 }} />
              </a>
              <a 
                href="#roles" 
                className="rp-drawer-link"
                onClick={(e) => scrollToSection(e, 'roles')}
              >
                <span>Who It's For</span>
                <MdArrowForward size={16} style={{ opacity: 0.6 }} />
              </a>
              <a 
                href="#helplines" 
                className="rp-drawer-link"
                onClick={(e) => scrollToSection(e, 'helplines')}
              >
                <span>Emergency Contacts</span>
                <MdArrowForward size={16} style={{ opacity: 0.6 }} />
              </a>
            </nav>

            <div className="rp-drawer-helplines">
              <a href="tel:112" className="rp-drawer-helpline-tag">
                <MdPhone size={14} />
                <span>POLICE 112</span>
              </a>
              <a href="tel:108" className="rp-drawer-helpline-tag">
                <MdPhone size={14} />
                <span>AMBULANCE 108</span>
              </a>
            </div>

            <div className="rp-drawer-actions">
              {token ? (
                <button 
                  onClick={() => { setMobileMenuOpen(false); handleDashboardRedirect(); }} 
                  className="rp-btn rp-btn-primary"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <Link 
                    to="/register?role=VICTIM" 
                    className="rp-btn rp-btn-danger"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Report Emergency (SOS)
                  </Link>
                  <Link 
                    to="/login" 
                    className="rp-btn rp-btn-outline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In to ResQFlow
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─── 3. PRODUCT-LED HERO SECTION ─── */}
      <section className="rp-hero">
        <div className="rp-container">
          <div className="rp-hero-badge">
            <span>Disaster Response & Relief Coordination</span>
          </div>

          <h1 className="rp-hero-title">
            Software for real-time flood response.
          </h1>

          <p className="rp-hero-subtitle">
            ResQFlow coordinates emergency rescue signals, live flood heatmaps, and verified supply delivery between stranded citizens, certified relief NGOs, and donors.
          </p>

          <div className="rp-hero-actions">
            <Link to="/register?role=VICTIM" className="rp-btn rp-btn-danger rp-btn-lg">
              <MdDirectionsRun size={18} /> Report Emergency (SOS)
            </Link>
            <Link to="/register?role=DONOR" className="rp-btn rp-btn-primary rp-btn-lg">
              <MdVolunteerActivism size={18} /> Donate Relief Supplies
            </Link>
            <Link to="/login" className="rp-btn rp-btn-outline rp-btn-lg">
              <MdMap size={18} /> View Live Flood Map
            </Link>
          </div>

          {/* ── Interactive Software Preview (Hero Artifact) ── */}
          <div className="rp-product-frame">
            <div className="rp-frame-header">
              <div className="rp-frame-tabs">
                <button
                  type="button"
                  className={`rp-frame-tab-btn ${activeFrameTab === 'sos' ? 'active' : ''}`}
                  onClick={() => setActiveFrameTab('sos')}
                >
                  Citizen SOS Signal
                </button>
                <button
                  type="button"
                  className={`rp-frame-tab-btn ${activeFrameTab === 'map' ? 'active' : ''}`}
                  onClick={() => setActiveFrameTab('map')}
                >
                  Live Incident Map
                </button>
                <button
                  type="button"
                  className={`rp-frame-tab-btn ${activeFrameTab === 'pin' ? 'active' : ''}`}
                  onClick={() => setActiveFrameTab('pin')}
                >
                  Delivery PIN Verification
                </button>
              </div>

              <div className="rp-frame-meta">
                <span>Interactive Software Preview</span>
              </div>
            </div>

            <div className="rp-frame-body">
              {/* Tab 1: Citizen SOS View */}
              {activeFrameTab === 'sos' && (
                <div className="rp-sos-preview-grid">
                  <div className="rp-preview-card">
                    <div className="rp-preview-label">GPS Location Capture</div>
                    <div className="rp-preview-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MdLocationOn style={{ color: '#0284c7' }} /> 28.6712° N, 77.2341° E (Auto-detected)
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#52525b', marginTop: '0.35rem' }}>
                      Sector 01: Yamuna Lowlands, North Delhi. 1-tap capture without typing an address.
                    </p>
                  </div>

                  <div className="rp-preview-card">
                    <div className="rp-preview-label">AI Water Level Analysis</div>
                    <div className="rp-preview-value">5.4 ft • Ground Floor Submerged</div>
                    <div className="rp-ai-badge">
                      <MdAutoAwesome /> Severity 8.7 (Critical Structural Risk)
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#52525b', marginTop: '0.35rem' }}>
                      4 elderly residents stranded on balcony. Priority evacuation flagged.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Live Heatmap Sector View */}
              {activeFrameTab === 'map' && (
                <div className="rp-heatmap-preview-grid">
                  <div className="rp-sector-list">
                    {SECTOR_HOTSPOTS.map((sec, idx) => (
                      <div
                        key={sec.id}
                        className={`rp-sector-item ${selectedHotspot === idx ? 'active' : ''}`}
                        onClick={() => setSelectedHotspot(idx)}
                      >
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#09090b' }}>{sec.name}</strong>
                          <div style={{ fontSize: '0.78rem', color: '#71717a', marginTop: '2px' }}>
                            Depth: {sec.depth} • {sec.trapped} citizens stranded
                          </div>
                        </div>
                        <span className={`rp-sector-badge ${sec.level === 'Critical' || sec.level === 'Catastrophic' ? 'critical' : 'high'}`}>
                          {sec.level} ({sec.severity})
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rp-preview-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="rp-preview-label">Dispatch Status</div>
                    <div className="rp-preview-value" style={{ color: '#0284c7', marginBottom: '0.5rem' }}>
                      {SECTOR_HOTSPOTS[selectedHotspot].status}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#52525b' }}>
                      Teams route straight to density hotspots on the live GIS map, avoiding isolated pockets.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Supply Handshake PIN */}
              {activeFrameTab === 'pin' && (
                <div className="rp-pin-preview-box">
                  <div>
                    <div className="rp-preview-label">Consignment Receipt Protection</div>
                    <div className="rp-preview-value" style={{ marginBottom: '0.25rem' }}>
                      DTDC Consignment #DT-948102 (40x Life Vests, 120x Water Tablets)
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#52525b' }}>
                      Receiving relief camp must physically enter this 6-digit PIN to mark items delivered into inventory.
                    </p>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', marginBottom: '0.35rem' }}>
                      DONOR VERIFICATION PIN
                    </div>
                    <div className="rp-pin-digits">
                      {['4', '8', '2', '9', '1', '0'].map((digit, i) => (
                        <div key={i} className="rp-pin-digit">{digit}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. CORE PLATFORM CAPABILITIES ─── */}
      <section className="rp-features-section" id="features">
        <div className="rp-container">
          <div className="rp-section-header">
            <div className="rp-section-kicker">Core Capabilities</div>
            <h2 className="rp-section-title">Built for fast, accountable flood relief.</h2>
            <p className="rp-section-desc">
              Every tool is engineered to speed up rescue response and guarantee that supplies directly reach affected families.
            </p>
          </div>

          <div className="rp-grid-4">
            <div className="rp-feature-card">
              <div>
                <div className="rp-feature-icon red">
                  <MdDirectionsRun />
                </div>
                <h3 className="rp-feature-title">1-Tap GPS Location</h3>
                <p className="rp-feature-desc">
                  Stranded citizens transmit exact device coordinates instantly. No typing addresses or landmarks while standing in water.
                </p>
              </div>
            </div>

            <div className="rp-feature-card">
              <div>
                <div className="rp-feature-icon blue">
                  <MdAutoAwesome />
                </div>
                <h3 className="rp-feature-title">AI Water Level Triage</h3>
                <p className="rp-feature-desc">
                  Computer vision estimates flood depth and structural hazard from uploaded photos to prioritize urgent evacuations first.
                </p>
              </div>
            </div>

            <div className="rp-feature-card">
              <div>
                <div className="rp-feature-icon green">
                  <MdVpnKey />
                </div>
                <h3 className="rp-feature-title">6-Digit Delivery PIN</h3>
                <p className="rp-feature-desc">
                  Donors hold a secret 6-digit PIN. Relief consignments can only be marked delivered when the receiving camp enters this code.
                </p>
              </div>
            </div>

            <div className="rp-feature-card">
              <div>
                <div className="rp-feature-icon purple">
                  <MdMap />
                </div>
                <h3 className="rp-feature-title">Live GIS Flood Map</h3>
                <p className="rp-feature-desc">
                  Aggregates distress signals into density clusters, directing rescue boats to critical zones without duplicate sweeps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. STEP-BY-STEP WORKFLOW ─── */}
      <section className="rp-workflow-section" id="workflow">
        <div className="rp-container">
          <div className="rp-section-header">
            <div className="rp-section-kicker">How It Works</div>
            <h2 className="rp-section-title">From emergency report to verified handoff.</h2>
            <p className="rp-section-desc">
              A transparent, closed-loop coordination chain connecting victims, responders, and donors.
            </p>
          </div>

          <div className="rp-steps-grid">
            <div className="rp-step-card">
              <div className="rp-step-number">01</div>
              <h3 className="rp-step-title">SOS Signal Reported</h3>
              <p className="rp-step-desc">
                Citizen submits location and optional photo. Coordinates immediately appear on the live relief map.
              </p>
            </div>

            <div className="rp-step-card">
              <div className="rp-step-number">02</div>
              <h3 className="rp-step-title">AI Severity Assessment</h3>
              <p className="rp-step-desc">
                Uploaded flood imagery is analyzed to score water depth and flag rooftop evacuations or structural risks.
              </p>
            </div>

            <div className="rp-step-card">
              <div className="rp-step-number">03</div>
              <h3 className="rp-step-title">NGO Deploys Rescue</h3>
              <p className="rp-step-desc">
                Ground relief teams and boat squads inspect live cluster hotspots and dispatch directly to stranded families.
              </p>
            </div>

            <div className="rp-step-card">
              <div className="rp-step-number">04</div>
              <h3 className="rp-step-title">PIN Delivery Verification</h3>
              <p className="rp-step-desc">
                Donors dispatch supplies with courier tracking. Receiving camps enter the 6-digit PIN upon physical arrival.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. ROLE BREAKDOWN ─── */}
      <section className="rp-roles-section" id="roles">
        <div className="rp-container">
          <div className="rp-section-header">
            <div className="rp-section-kicker">User Roles</div>
            <h2 className="rp-section-title">Designed for every stakeholder in the crisis.</h2>
            <p className="rp-section-desc">
              Dedicated workflows for stranded citizens, on-ground relief NGOs, and supportive donors.
            </p>
          </div>

          <div className="rp-roles-grid">
            {/* Role: Victims */}
            <div className="rp-role-card">
              <div>
                <span className="rp-role-badge victim">Stranded Citizens</span>
                <h3 className="rp-role-title">Get rescued faster</h3>
                <p className="rp-role-desc">
                  Report your exact location in one tap with automatic GPS detection and direct emergency helpline integration.
                </p>
                <ul className="rp-role-features">
                  <li><MdCheck className="rp-check-icon" /> 1-tap GPS location reporting</li>
                  <li><MdCheck className="rp-check-icon" /> AI photo water level scoring</li>
                  <li><MdCheck className="rp-check-icon" /> Track your report's rescue status</li>
                  <li><MdCheck className="rp-check-icon" /> Direct dial to Police (112) & Ambulance (108)</li>
                </ul>
              </div>
              <Link to="/register?role=VICTIM" className="rp-btn rp-btn-danger">
                Report Emergency SOS <MdArrowForward />
              </Link>
            </div>

            {/* Role: Donors */}
            <div className="rp-role-card">
              <div>
                <span className="rp-role-badge donor">Relief Donors</span>
                <h3 className="rp-role-title">Zero-loss donations</h3>
                <p className="rp-role-desc">
                  Pledge items requested by verified relief camps and track courier packages with 6-digit delivery confirmation.
                </p>
                <ul className="rp-role-features">
                  <li><MdCheck className="rp-check-icon" /> Browse real shortage requests by sector</li>
                  <li><MdCheck className="rp-check-icon" /> Attach courier tracking (DTDC, BlueDart)</li>
                  <li><MdCheck className="rp-check-icon" /> Secret 6-digit PIN confirms arrival</li>
                  <li><MdCheck className="rp-check-icon" /> Guaranteed direct receipt into camp inventory</li>
                </ul>
              </div>
              <Link to="/register?role=DONOR" className="rp-btn rp-btn-primary">
                Join as Relief Donor <MdArrowForward />
              </Link>
            </div>

            {/* Role: NGOs */}
            <div className="rp-role-card">
              <div>
                <span className="rp-role-badge ngo">Relief NGOs</span>
                <h3 className="rp-role-title">Coordinate rescue teams</h3>
                <p className="rp-role-desc">
                  Inspect the live GIS cluster map, request needed supplies, and accept inbound consignments via PIN validation.
                </p>
                <ul className="rp-role-features">
                  <li><MdCheck className="rp-check-icon" /> Real-time geographic flood heatmap</li>
                  <li><MdCheck className="rp-check-icon" /> Post specific supply shortages</li>
                  <li><MdCheck className="rp-check-icon" /> Validate incoming parcels with PIN entry</li>
                  <li><MdCheck className="rp-check-icon" /> Avoid duplicate rescue boat operations</li>
                </ul>
              </div>
              <Link to="/register?role=NGO" className="rp-btn rp-btn-outline">
                Register Relief NGO <MdArrowForward />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. EMERGENCY HELPLINE CALLOUT ─── */}
      <section className="rp-helpline-section" id="helplines">
        <div className="rp-container">
          <div className="rp-helpline-card">
            <div>
              <h3 className="rp-helpline-title">In immediate danger or trapped?</h3>
              <p className="rp-helpline-desc">
                Call national emergency rescue services immediately if water is rapidly rising.
              </p>
            </div>
            <div className="rp-helpline-buttons">
              <a href="tel:112" className="rp-call-btn">
                <MdPhone /> Police & Rescue (112)
              </a>
              <a href="tel:108" className="rp-call-btn">
                <MdPhone /> Ambulance Service (108)
              </a>
              <a href="tel:1078" className="rp-call-btn">
                <MdPhone /> Disaster Helpline (1078)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. CLEAN MODERN FOOTER ─── */}
      <footer className="rp-footer">
        <div className="rp-container">
          <div className="rp-footer-grid">
            <div className="rp-footer-col">
              <span className="rp-brand-text" style={{ display: 'block', marginBottom: '0.75rem' }}>ResQFlow</span>
              <p style={{ color: '#71717a', fontSize: '0.845rem', lineHeight: 1.6, maxWidth: '320px' }}>
                Open flood disaster response platform. Real-time rescue mapping, AI damage assessment, and verified 6-digit supply delivery.
              </p>
            </div>

            <div className="rp-footer-col">
              <h4>Stranded Citizens</h4>
              <ul>
                <li><Link to="/register?role=VICTIM">Submit Emergency SOS</Link></li>
                <li><Link to="/login">Citizen Login</Link></li>
                <li><a href="tel:112">National Police & Rescue (112)</a></li>
                <li><a href="tel:108">Ambulance Service (108)</a></li>
              </ul>
            </div>

            <div className="rp-footer-col">
              <h4>Relief Donors</h4>
              <ul>
                <li><Link to="/register?role=DONOR">Pledge Relief Supplies</Link></li>
                <li><Link to="/login">Donor Portal Login</Link></li>
                <li><a href="#features">6-Digit PIN Security</a></li>
              </ul>
            </div>

            <div className="rp-footer-col">
              <h4>Relief NGOs</h4>
              <ul>
                <li><Link to="/register?role=NGO">Register Relief NGO</Link></li>
                <li><Link to="/login">NGO Incident Command</Link></li>
                <li><Link to="/login">Flood Heatmap Portal</Link></li>
              </ul>
            </div>
          </div>

          <div className="rp-footer-bottom">
            <div>
              © {new Date().getFullYear()} ResQFlow • Disaster Response & Relief Coordination.
            </div>
            <div>
              Open Humanitarian Coordination
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
