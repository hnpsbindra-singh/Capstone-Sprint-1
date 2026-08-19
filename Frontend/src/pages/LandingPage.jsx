import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdWaterDrop,
  MdWarning,
  MdVolunteerActivism,
  MdLocationOn,
  MdCheckCircle,
  MdArrowForward,
  MdShield,
  MdMap,
  MdPhoneInTalk,
  MdDirectionsRun,
  MdLocalShipping,
  MdAnalytics,
  MdTranslate,
  MdLogin,
  MdPersonAdd,
  MdLayers,
  MdAccessTime,
  MdFiberManualRecord,
  MdInventory,
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const handleDashboardRedirect = () => {
    if (user?.role) navigate(`/${user.role.toLowerCase()}`);
    else navigate('/login');
  };

  return (
    <div className="landing-page-wrapper">

      {/* Emergency Top Banner */}
      <div className="emergency-banner">
        <div className="banner-content">
          <span className="emergency-badge">
            <MdWarning className="pulse-icon" /> EMERGENCY ALERT NETWORK
          </span>
          <span className="banner-text">
            Active Flood Monitoring & Real-time Relief Dispatching — live 24/7.
          </span>
          <a href="tel:112" className="emergency-phone">
            <MdPhoneInTalk /> Call 112 / 108
          </a>
        </div>
      </div>

      {/* Navbar */}
      <header className="landing-navbar">
        <div className="landing-nav-container">
          <div className="landing-logo">
            <span className="logo-text-grd">ResQFlow</span>
            <span className="logo-subtext">Emergency Rescue & Relief</span>
          </div>
          <nav className="landing-nav-links">
            <a href="#overview">Overview</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Capabilities</a>
          </nav>
          <div className="landing-nav-actions">
            {token ? (
              <button onClick={handleDashboardRedirect} className="btn btn-primary btn-sm">
                <MdShield /> Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  <MdLogin /> Sign In
                </Link>
                <Link to="/register?role=VICTIM" className="btn btn-primary btn-sm">
                  <MdDirectionsRun /> SOS Report
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══ SPLIT HERO ═══ */}
      <section className="split-hero" id="overview">
        {/* LEFT — tagline + CTAs + stats */}
        <div className="split-hero-left">
          <div className="hero-badge">
            <MdWaterDrop style={{ color: '#0284c7' }} /> Real-Time Disaster Response Platform
          </div>

          <p className="split-tagline">
            Connecting <strong>flood victims</strong>, <strong>generous donors</strong>, and
            <strong> verified NGOs</strong> — with live GIS dispatch, direct relief pledges,
            and end-to-end status tracking.
          </p>

          <div className="split-cta-group">
            <Link to="/register?role=VICTIM" className="split-btn split-btn-sos">
              <MdDirectionsRun size={20} />
              <div>
                <div className="split-btn-label">I Need Help</div>
                <div className="split-btn-sub">Submit SOS flood report</div>
              </div>
              <MdArrowForward style={{ marginLeft: 'auto', opacity: 0.7 }} />
            </Link>
            <Link to="/register?role=DONOR" className="split-btn split-btn-donate">
              <MdVolunteerActivism size={20} />
              <div>
                <div className="split-btn-label">I Want to Donate</div>
                <div className="split-btn-sub">Pledge relief supplies to NGOs</div>
              </div>
              <MdArrowForward style={{ marginLeft: 'auto', opacity: 0.7 }} />
            </Link>
          </div>

          <div className="split-stats">
            <div className="split-stat">
              <span className="split-stat-val">&lt; 3 min</span>
              <span className="split-stat-lbl">Alert Dispatch</span>
            </div>
            <div className="split-stat-sep" />
            <div className="split-stat">
              <span className="split-stat-val">Live GIS</span>
              <span className="split-stat-lbl">Heatmap Tracking</span>
            </div>
            <div className="split-stat-sep" />
            <div className="split-stat">
              <span className="split-stat-val">100%</span>
              <span className="split-stat-lbl">Transparent Relief</span>
            </div>
            <div className="split-stat-sep" />
            <div className="split-stat">
              <span className="split-stat-val">4 Lang</span>
              <span className="split-stat-lbl">EN / ES / HI / FR</span>
            </div>
          </div>
        </div>

        {/* RIGHT — App preview mockup */}
        <div className="split-hero-right">
          <div className="app-preview-shell">
            <div className="app-preview-bar">
              <span className="preview-dot" style={{ background: '#ef4444' }} />
              <span className="preview-dot" style={{ background: '#f59e0b' }} />
              <span className="preview-dot" style={{ background: '#22c55e' }} />
              <span className="preview-bar-title">ResQFlow — Victim Dashboard</span>
            </div>

            <div className="app-preview-body">
              {/* Live Incidents mini-list */}
              <div className="preview-section-label">
                <MdFiberManualRecord style={{ color: '#e11d48', fontSize: '0.6rem' }} />
                Live Flood Incidents
              </div>
              {[
                { id: '#F-0041', title: 'Waterlogging — Sector 12', sev: 8, status: 'IN PROGRESS', statusColor: '#ea580c', statusBg: 'rgba(234,88,12,0.1)' },
                { id: '#F-0039', title: 'Rescue Needed — River Rd', sev: 9, status: 'REPORTED', statusColor: '#0284c7', statusBg: 'rgba(2,132,199,0.1)' },
                { id: '#F-0036', title: 'Road Flash Flood — NH7', sev: 5, status: 'RESOLVED', statusColor: '#059669', statusBg: 'rgba(5,150,105,0.1)' },
              ].map(r => (
                <div key={r.id} className="preview-row">
                  <div>
                    <div className="preview-row-title">{r.title}</div>
                    <div className="preview-row-id">{r.id} · Severity {r.sev}/10</div>
                  </div>
                  <span className="preview-badge" style={{ color: r.statusColor, background: r.statusBg }}>
                    {r.status}
                  </span>
                </div>
              ))}

              {/* Donation progress mini-card */}
              <div className="preview-section-label" style={{ marginTop: '0.875rem' }}>
                <MdFiberManualRecord style={{ color: '#0284c7', fontSize: '0.6rem' }} />
                NGO Relief Request Progress
              </div>
              <div className="preview-progress-card">
                <div className="preview-progress-info">
                  <span className="preview-progress-title">Emergency Food Packets</span>
                  <span className="preview-progress-pct">74%</span>
                </div>
                <div className="preview-progress-bar">
                  <div className="preview-progress-fill" style={{ width: '74%' }} />
                </div>
                <div className="preview-progress-sub">740 of 1,000 units fulfilled · 260 still needed</div>
              </div>

              {/* Donor action row */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
                <div className="preview-action-pill active-pill">
                  <MdInventory size={11} /> Browse 12 Open Requests
                </div>
                <div className="preview-action-pill">
                  <MdCheckCircle size={11} /> My Donations (5)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SIDE-BY-SIDE FLOWS ═══ */}
      <section className="dual-flow-section" id="how-it-works">
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <div className="section-pill">Interactive User Journeys</div>
          <h2 className="section-title">How ResQFlow Works For You</h2>
          <p className="section-subtitle">Two parallel journeys — both operating simultaneously on the same platform.</p>
        </div>

        <div className="dual-flow-grid">
          {/* VICTIM COLUMN */}
          <div className="dual-col" id="victim-flow">
            <div className="dual-col-header victim-bg">
              <div className="dual-col-header-icon"><MdDirectionsRun /></div>
              <div>
                <div className="dual-col-header-title">🆘 Victim Journey</div>
                <div className="dual-col-header-sub">Need rescue or relief supplies?</div>
              </div>
              <Link to="/register?role=VICTIM" className="btn btn-light-custom" style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                <MdPersonAdd size={14} /> Register
              </Link>
            </div>

            <div className="dual-steps">
              <div className="dual-step">
                <div className="dual-step-num victim-accent-bg">01</div>
                <div className="dual-step-body">
                  <div className="dual-step-icon victim-accent"><MdLocationOn /></div>
                  <div>
                    <h4>Submit Flood Report</h4>
                    <p>One-tap GPS capture, incident description, auto severity score (1–10).</p>
                    <span className="step-tag">Auto Severity Calculation</span>
                  </div>
                </div>
              </div>
              <div className="dual-step-connector" />
              <div className="dual-step">
                <div className="dual-step-num victim-accent-bg">02</div>
                <div className="dual-step-body">
                  <div className="dual-step-icon victim-accent"><MdMap /></div>
                  <div>
                    <h4>Live GIS Triage</h4>
                    <p>Pinned on the heatmap — nearby NGOs and admins receive instant severity alerts.</p>
                    <span className="step-tag">Real-Time GIS Alert</span>
                  </div>
                </div>
              </div>
              <div className="dual-step-connector" />
              <div className="dual-step">
                <div className="dual-step-num victim-accent-bg">03</div>
                <div className="dual-step-body">
                  <div className="dual-step-icon victim-accent"><MdCheckCircle /></div>
                  <div>
                    <h4>Track Status</h4>
                    <p>Monitor progress on My Reports — <em>Reported → In Progress → Rescued</em>.</p>
                    <span className="step-tag">End-to-End Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DONOR COLUMN */}
          <div className="dual-col" id="donor-flow">
            <div className="dual-col-header donor-bg">
              <div className="dual-col-header-icon"><MdVolunteerActivism /></div>
              <div>
                <div className="dual-col-header-title">📦 Donor Journey</div>
                <div className="dual-col-header-sub">Want to donate relief supplies?</div>
              </div>
              <Link to="/register?role=DONOR" className="btn btn-light-custom" style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                <MdPersonAdd size={14} /> Register
              </Link>
            </div>

            <div className="dual-steps">
              <div className="dual-step">
                <div className="dual-step-num donor-accent-bg">01</div>
                <div className="dual-step-body">
                  <div className="dual-step-icon donor-accent"><MdAnalytics /></div>
                  <div>
                    <h4>Browse NGO Needs</h4>
                    <p>Filter verified field requests — food packets, water, blankets, first-aid kits.</p>
                    <span className="step-tag">Verified Requirements</span>
                  </div>
                </div>
              </div>
              <div className="dual-step-connector" />
              <div className="dual-step">
                <div className="dual-step-num donor-accent-bg">02</div>
                <div className="dual-step-body">
                  <div className="dual-step-icon donor-accent"><MdVolunteerActivism /></div>
                  <div>
                    <h4>Pledge Quantities</h4>
                    <p>Select an open request, enter exact item & quantity, confirm with instant feedback.</p>
                    <span className="step-tag">Targeted Pledges</span>
                  </div>
                </div>
              </div>
              <div className="dual-step-connector" />
              <div className="dual-step">
                <div className="dual-step-num donor-accent-bg">03</div>
                <div className="dual-step-body">
                  <div className="dual-step-icon donor-accent"><MdLocalShipping /></div>
                  <div>
                    <h4>Track & Export</h4>
                    <p>Monitor <em>Pending → Accepted → Delivered</em>. Export CSV receipts anytime.</p>
                    <span className="step-tag">CSV Export & Badges</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-header">
          <div className="section-pill">Built for Emergency Readiness</div>
          <h2 className="section-title">Key System Capabilities</h2>
        </div>
        <div className="features-grid">
          {[
            { icon: <MdMap size={26} />, color: '#0284c7', bg: 'rgba(2,132,199,0.1)', title: 'Live GIS Heatmap', desc: 'Interactive cluster map with real-time incident density, severity markers, and GPS coordinates.' },
            { icon: <MdWarning size={26} />, color: '#ea580c', bg: 'rgba(234,88,12,0.1)', title: 'Severity Scoring', desc: 'Intelligent priority scoring (1–10 scale) ensuring high-risk victims get dispatched first.' },
            { icon: <MdVolunteerActivism size={26} />, color: '#059669', bg: 'rgba(5,150,105,0.1)', title: 'Direct Resource Matching', desc: 'Donors fulfill exact NGO shortages — zero wastage, maximum impact on the ground.' },
            { icon: <MdTranslate size={26} />, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', title: 'Multi-Language Support', desc: 'Zero-dependency i18n for English, Spanish, Hindi, and French language interfaces.' },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-card-icon" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="landing-cta-banner">
        <div className="cta-banner-content">
          <h2>Ready to Make an Impact?</h2>
          <p>Join rescue teams, donors, and NGOs building a faster, more transparent disaster response network.</p>
          <div className="banner-buttons">
            <Link to="/register?role=VICTIM" className="btn btn-light-custom btn-lg">
              <MdDirectionsRun /> Report SOS Emergency
            </Link>
            <Link to="/register?role=DONOR" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              <MdVolunteerActivism /> Join as Donor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-col brand-col">
            <div className="landing-logo">
              <span className="logo-text-grd">ResQFlow</span>
            </div>
            <p>ResQFlow — Empowering emergency responders, victims, and donors with real-time disaster relief technology.</p>
            <div className="footer-copyright">
              © {new Date().getFullYear()} ResQFlow. All rights reserved.
            </div>
          </div>
          <div className="footer-col">
            <h4>Victim Resources</h4>
            <ul>
              <li><Link to="/register?role=VICTIM">Submit SOS Report</Link></li>
              <li><Link to="/login">Victim Login</Link></li>
              <li><a href="tel:112">Emergency Helpline (112)</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Donor Portal</h4>
            <ul>
              <li><Link to="/register?role=DONOR">Register as Donor</Link></li>
              <li><Link to="/login">Donor Login</Link></li>
              <li><a href="#donor-flow">How Donations Work</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>NGO & Responders</h4>
            <ul>
              <li><Link to="/register?role=NGO">NGO Sign Up</Link></li>
              <li><Link to="/login">NGO Portal</Link></li>
              <li><Link to="/login">Admin Login</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
