import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';
import {
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
  MdVpnKey,
  MdClose,
  MdCheck,
  MdLogin,
  MdInventory,
} from 'react-icons/md';

const LandingPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [activeRoleTab, setActiveRoleTab] = useState('VICTIM');

  const handleDashboardRedirect = () => {
    if (user?.role) navigate(`/${user.role.toLowerCase()}`);
    else navigate('/login');
  };

  return (
    <div className="cmd-landing">
      {/* ─── 1. TOP CRITICAL STRIP ─── */}
      <div className="cmd-emergency-strip">
        <div className="cmd-strip-inner">
          <div className="cmd-strip-status">
            <span className="cmd-live-dot" />
            <span>DISASTER OPERATIONS ACTIVE • 24/7 SATELLITE & GIS GRID</span>
          </div>
          <div className="cmd-strip-hotlines">
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Direct Helplines:</span>
            <a href="tel:112" className="cmd-hotline-pill">
              <span className="cmd-hotline-tag">POLICE & RESCUE</span> 112
            </a>
            <a href="tel:108" className="cmd-hotline-pill">
              <span className="cmd-hotline-tag">MEDICAL / AMBULANCE</span> 108
            </a>
          </div>
        </div>
      </div>

      {/* ─── 2. STICKY NAVBAR ─── */}
      <header className="cmd-navbar">
        <div className="cmd-container cmd-nav-container">
          <Link to="/" className="cmd-nav-brand">
            <div className="cmd-brand-icon-wrap">
              <MdShield />
            </div>
            <div>
              <div className="cmd-brand-text">ResQFlow</div>
              <div className="cmd-brand-sub">Emergency Flood Coordination</div>
            </div>
          </Link>

          <nav className="cmd-nav-links">
            <a href="#overview" className="cmd-nav-link">Overview</a>
            <a href="#telemetry" className="cmd-nav-link">GIS Heatmap</a>
            <a href="#capabilities" className="cmd-nav-link">Capabilities</a>
            <a href="#workflow" className="cmd-nav-link">Operations</a>
          </nav>

          <div className="cmd-nav-actions">
            {token ? (
              <button onClick={handleDashboardRedirect} className="cmd-btn cmd-btn-primary">
                <MdShield /> Command Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="cmd-btn cmd-btn-outline">
                  <MdLogin /> Sign In
                </Link>
                <Link to="/register?role=VICTIM" className="cmd-btn cmd-btn-emergency">
                  <MdDirectionsRun /> Report SOS
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── 3. HERO COMMAND SECTION ─── */}
      <section className="cmd-hero cmd-landing-mesh" id="overview">
        <div className="cmd-container">
          {/* Incident Protocol Badge */}
          <div className="cmd-hero-badge">
            <MdWarning style={{ color: '#dc2626' }} />
            <span>CRITICAL INCIDENT PROTOCOL • DECENTRALIZED RELIEF PIPELINE</span>
          </div>

          {/* Clean, Authoritative Headline */}
          <h1 className="cmd-hero-title">
            Real-Time Flood Coordination.<br />
            From <span className="accent">Distress Signal</span> to Verified Delivery.
          </h1>

          {/* Subheading */}
          <p className="cmd-hero-subhead">
            Uniting stranded citizens, verified on-ground NGOs, and relief donors on an active 
            GIS incident grid — secured by cryptographic 6-digit physical delivery verification.
          </p>

          {/* Hero Actions */}
          <div className="cmd-hero-actions">
            <Link to="/register?role=VICTIM" className="cmd-btn cmd-btn-emergency cmd-btn-lg">
              <MdDirectionsRun /> Report SOS Emergency
            </Link>
            <Link to="/register?role=DONOR" className="cmd-btn cmd-btn-primary cmd-btn-lg">
              <MdVolunteerActivism /> Pledge Relief Supplies
            </Link>
            <Link to="/login" className="cmd-btn cmd-btn-outline cmd-btn-lg">
              <MdMap /> Live Incident Heatmap
            </Link>
          </div>

          {/* System Guarantees & Telemetry */}
          <div className="cmd-hero-trust">
            <div className="cmd-trust-item">
              <MdCheckCircle style={{ color: '#059669' }} />
              <span>100% Cryptographic PIN Delivery Audit</span>
            </div>
            <div className="cmd-trust-item">
              <MdCheckCircle style={{ color: '#059669' }} />
              <span>&lt; 2s Distress Ingestion Latency</span>
            </div>
            <div className="cmd-trust-item">
              <MdCheckCircle style={{ color: '#059669' }} />
              <span>Direct Carrier & Relief Hub Dispatch</span>
            </div>
          </div>

          {/* ─── 4. TACTICAL COMMAND CENTER MOCKUP ─── */}
          <div className="cmd-mockup-wrapper" id="telemetry">
            <div className="cmd-mockup-chrome">
              <div className="cmd-chrome-dots">
                <span className="cmd-chrome-dot" style={{ background: '#f87171' }} />
                <span className="cmd-chrome-dot" style={{ background: '#facc15' }} />
                <span className="cmd-chrome-dot" style={{ background: '#4ade80' }} />
              </div>
              <div className="cmd-chrome-title">
                LIVE RELIEF GRID • TELEMETRY FEED (SECTOR 4 HOTSPOT)
              </div>
              <div className="cmd-chrome-badge">
                STATUS: ACTIVE INCIDENT
              </div>
            </div>

            <div className="cmd-mockup-body">
              {/* Left Tactical Map Simulation */}
              <div className="cmd-tactical-map">
                <div className="cmd-map-header">
                  <div className="cmd-map-title">
                    <MdLocationOn style={{ color: '#38bdf8' }} /> Sector 4 Flood Hotspot
                  </div>
                  <div className="cmd-map-risk-badge">
                    SEVERITY: 8.4 / 10 • CRITICAL
                  </div>
                </div>

                <div className="cmd-radar-canvas">
                  <div className="cmd-radar-grid-lines" />
                  <div className="cmd-radar-target">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.875rem' }}>
                      <span className="cmd-live-dot" style={{ background: '#ef4444' }} />
                      Active Cluster: 14 Distress Signals
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      Water Level: +4.2 ft (Rising) • 32 Individuals Stranded
                    </div>
                  </div>
                </div>

                <div className="cmd-map-footer">
                  <span>GPS: 28.7041° N, 77.1025° E</span>
                  <span>ASSIGNED HUB: Regional Relief Depot A</span>
                </div>
              </div>

              {/* Right Pipeline Custody Feed */}
              <div className="cmd-pipeline-feed">
                <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', color: '#94a3b8', textTransform: 'uppercase' }}>
                  Chain of Custody & Delivery Pipeline
                </div>

                {/* Pipeline Step 1 */}
                <div className="cmd-pipeline-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="cmd-pipeline-tag cmd-tag-blue">1. Distress Signal</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>14:22:04</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Family of 5 stranded on rooftop</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Immediate need: Life jackets & clean water</div>
                </div>

                {/* Pipeline Step 2 */}
                <div className="cmd-pipeline-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="cmd-pipeline-tag cmd-tag-purple">2. Carrier Dispatched</span>
                    <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 700 }}>In Transit</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>50x Inflatable Life Jackets</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>BlueDart Express • Consignment #BD-89234821</div>
                </div>

                {/* Pipeline Step 3: Verified Handoff */}
                <div className="cmd-pipeline-item active">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="cmd-pipeline-tag cmd-tag-green">3. Physical Delivery</span>
                    <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 800 }}>VERIFIED</span>
                  </div>
                  <div className="cmd-pin-display">
                    <span style={{ color: '#cbd5e1' }}>
                      <MdVpnKey style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Handoff PIN:
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#4ade80', letterSpacing: '2px', fontSize: '0.95rem' }}>
                      849201
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#86efac', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MdCheckCircle /> Confirmed on-site by Red Cross Field Director
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. CORE CAPABILITIES (BENTO GRID) ─── */}
      <section className="cmd-bento-section" id="capabilities">
        <div className="cmd-container">
          <div className="cmd-section-header">
            <div className="cmd-section-kicker">Engine Architecture</div>
            <h2 className="cmd-section-title">Built for Mission-Critical Incident Response</h2>
            <p className="cmd-section-desc">
              Every microservice is architected to eliminate supply leakage, reduce response lag, 
              and route relief items directly where flood impact is highest.
            </p>
          </div>

          <div className="cmd-bento-grid">
            {/* Card 1: Precision Distress (Span 8) */}
            <div className="cmd-bento-card cmd-card-span-8">
              <div>
                <div className="cmd-card-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                  <MdDirectionsRun />
                </div>
                <h3 className="cmd-card-title">Zero-Friction Emergency SOS Beacon</h3>
                <p className="cmd-card-desc">
                  Victims in rising waters capture precision GPS coordinates in 1 tap without typing addresses 
                  or installing mobile apps. Captures water depth severity, stranded family headcounts, 
                  and medical priority flags to triage life-threatening situations first.
                </p>
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--cmd-border)', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--cmd-text-muted)' }}>
                  Operates over degraded 2G/3G mobile networks
                </span>
                <Link to="/register?role=VICTIM" className="cmd-btn cmd-btn-outline" style={{ fontSize: '0.8125rem' }}>
                  Report Emergency <MdArrowForward />
                </Link>
              </div>
            </div>

            {/* Card 2: GIS Heatmap (Span 4) */}
            <div className="cmd-bento-card cmd-card-span-4">
              <div>
                <div className="cmd-card-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  <MdMap />
                </div>
                <h3 className="cmd-card-title">Real-Time GIS Heatmap</h3>
                <p className="cmd-card-desc">
                  Autonomous spatial clustering aggregates individual reports into color-coded flood risk zones (1 to 10 scale). 
                  NGOs and authorities view distress density before mobilizing physical rescue boats.
                </p>
              </div>
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--cmd-border)', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0284c7' }}>
                  Live incident density & flood radius calculation
                </span>
              </div>
            </div>

            {/* Card 3: Cryptographic PIN (Span 4) */}
            <div className="cmd-bento-card cmd-card-span-4">
              <div>
                <div className="cmd-card-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                  <MdVpnKey />
                </div>
                <h3 className="cmd-card-title">Cryptographic Delivery PIN</h3>
                <p className="cmd-card-desc">
                  Eliminates missing relief shipments. When a donor dispatches supplies, a private 6-digit PIN is generated. 
                  The receiving NGO must enter this code upon physical receipt to verify arrival.
                </p>
              </div>
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--cmd-border)', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7c3aed' }}>
                  100% Chain-of-custody verification
                </span>
              </div>
            </div>

            {/* Card 4: Direct Hub Matching (Span 8) */}
            <div className="cmd-bento-card cmd-card-span-8">
              <div>
                <div className="cmd-card-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <MdLocalShipping />
                </div>
                <h3 className="cmd-card-title">Direct P2P Logistics & Hub Drop-off</h3>
                <p className="cmd-card-desc">
                  NGOs publish verified item shortages linked directly to active flood zones. Donors pledge exact supplies 
                  (life jackets, water purification, blankets) and dispatch via courier (BlueDart, DTDC, FedEx) or personal drop-off 
                  with full consignment tracking.
                </p>
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--cmd-border)', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--cmd-text-muted)' }}>
                  Zero central warehouse hoarding or administrative leakage
                </span>
                <Link to="/register?role=DONOR" className="cmd-btn cmd-btn-outline" style={{ fontSize: '0.8125rem' }}>
                  Browse Shortages <MdArrowForward />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. ROLE OPERATIONS MATRIX ─── */}
      <section className="cmd-roles-section" id="workflow">
        <div className="cmd-container">
          <div className="cmd-section-header">
            <div className="cmd-section-kicker">Operational Workflows</div>
            <h2 className="cmd-section-title">Designed for Fast Coordination Across All Actors</h2>
            <p className="cmd-section-desc">
              Select your role to view the exact step-by-step dispatch workflow.
            </p>
          </div>

          <div className="cmd-tabs-header">
            <button
              className={`cmd-tab-button ${activeRoleTab === 'VICTIM' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('VICTIM')}
            >
              Stranded Citizens
            </button>
            <button
              className={`cmd-tab-button ${activeRoleTab === 'DONOR' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('DONOR')}
            >
              Relief Donors
            </button>
            <button
              className={`cmd-tab-button ${activeRoleTab === 'NGO' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('NGO')}
            >
              Certified NGOs
            </button>
          </div>

          <div className="cmd-tab-view">
            <div>
              {activeRoleTab === 'VICTIM' && (
                <>
                  <div className="cmd-step-row">
                    <div className="cmd-step-number">1</div>
                    <div className="cmd-step-body">
                      <h4>Trigger 1-Tap Geolocation Beacon</h4>
                      <p>Open the app and grant location permission. Your precision GPS coordinates are auto-filled in seconds.</p>
                    </div>
                  </div>
                  <div className="cmd-step-row">
                    <div className="cmd-step-number">2</div>
                    <div className="cmd-step-body">
                      <h4>Specify Severity & Stranded Count</h4>
                      <p>Select current water level (Knee, Waist, Roof) and number of dependents needing evacuation or emergency food.</p>
                    </div>
                  </div>
                  <div className="cmd-step-row">
                    <div className="cmd-step-number">3</div>
                    <div className="cmd-step-body">
                      <h4>Direct Integration into Rescue Dispatch</h4>
                      <p>Your signal immediately turns into a live distress pin on the regional disaster heatmap for ground rescue crews.</p>
                    </div>
                  </div>
                  <Link to="/register?role=VICTIM" className="cmd-btn cmd-btn-emergency" style={{ marginTop: '1rem' }}>
                    Report Emergency SOS <MdArrowForward />
                  </Link>
                </>
              )}

              {activeRoleTab === 'DONOR' && (
                <>
                  <div className="cmd-step-row">
                    <div className="cmd-step-number">1</div>
                    <div className="cmd-step-body">
                      <h4>Browse Shortages by Flood Zone</h4>
                      <p>View verified NGO requests sorted by flood hotspot proximity. Choose items currently needed on the ground.</p>
                    </div>
                  </div>
                  <div className="cmd-step-row">
                    <div className="cmd-step-number">2</div>
                    <div className="cmd-step-body">
                      <h4>Attach Courier Tracking & Receive Security PIN</h4>
                      <p>Pledge item quantities and input carrier tracking ID (or Self Drop-off). A private 6-digit verification PIN is issued.</p>
                    </div>
                  </div>
                  <div className="cmd-step-row">
                    <div className="cmd-step-number">3</div>
                    <div className="cmd-step-body">
                      <h4>Verified Delivery Confirmation</h4>
                      <p>When the shipment reaches the NGO relief camp, the team enters your PIN to verify physical receipt.</p>
                    </div>
                  </div>
                  <Link to="/register?role=DONOR" className="cmd-btn cmd-btn-primary" style={{ marginTop: '1rem' }}>
                    Join as Relief Donor <MdArrowForward />
                  </Link>
                </>
              )}

              {activeRoleTab === 'NGO' && (
                <>
                  <div className="cmd-step-row">
                    <div className="cmd-step-number">1</div>
                    <div className="cmd-step-body">
                      <h4>Inspect Incident Heatmap Sectors</h4>
                      <p>Analyze distress severity clusters on the live GIS map to identify sectors requiring urgent supply mobilization.</p>
                    </div>
                  </div>
                  <div className="cmd-step-row">
                    <div className="cmd-step-number">2</div>
                    <div className="cmd-step-body">
                      <h4>Issue Targeted Resource Requests</h4>
                      <p>Request specific relief quantities (food, medical kits, blankets) with designated regional drop-off hub addresses.</p>
                    </div>
                  </div>
                  <div className="cmd-step-row">
                    <div className="cmd-step-number">3</div>
                    <div className="cmd-step-body">
                      <h4>Validate Inbound Physical Shipments</h4>
                      <p>Receive incoming courier boxes and input donor verification PINs to confirm delivery into relief inventory.</p>
                    </div>
                  </div>
                  <Link to="/register?role=NGO" className="cmd-btn cmd-btn-primary" style={{ marginTop: '1rem' }}>
                    Register NGO Portal <MdArrowForward />
                  </Link>
                </>
              )}
            </div>

            {/* Visual Preview Box */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--cmd-border)', borderRadius: '12px', padding: '1.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--cmd-text-muted)', marginBottom: '0.75rem' }}>
                System Audit Spec • Live Verification
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid var(--cmd-border)', borderRadius: '8px', padding: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800 }}>
                    <span>Consignment Security</span>
                    <span style={{ color: '#059669' }}>VALIDATED</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cmd-text-muted)', marginTop: '4px' }}>
                    Recipient NGO must physically match the donor's 6-digit OTP code before database status marks DELIVERED.
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid var(--cmd-border)', borderRadius: '8px', padding: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800 }}>
                    <span>Spatial Precision</span>
                    <span style={{ color: '#0284c7' }}>GPS VERIFIED</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cmd-text-muted)', marginTop: '4px' }}>
                    WGS84 high-accuracy coordinates linked directly to distress records for precise boat navigation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. PROTOCOL AUDIT COMPARISON ─── */}
      <section className="cmd-comparison-section">
        <div className="cmd-container">
          <div className="cmd-section-header">
            <div className="cmd-section-kicker">Integrity Architecture</div>
            <h2 className="cmd-section-title">Why Legacy Disaster Charity Fails in Crises</h2>
            <p className="cmd-section-desc">
              A direct comparison between traditional uncoordinated charity drives and the ResQFlow protocol.
            </p>
          </div>

          <div className="cmd-comparison-grid">
            {/* Legacy Charity */}
            <div className="cmd-audit-card cmd-card-failure">
              <div className="cmd-audit-header" style={{ color: '#dc2626' }}>
                <MdClose /> Legacy Uncoordinated Relief
              </div>
              <ul className="cmd-audit-list">
                <li className="cmd-audit-item">
                  <MdClose style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Untracked Donations:</strong> Citizens mail items without knowing whether the hub is full or has already received that item.</span>
                </li>
                <li className="cmd-audit-item">
                  <MdClose style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>High Supply Leakage:</strong> Packages sit in warehouses unverified with zero chain of custody or proof of receipt.</span>
                </li>
                <li className="cmd-audit-item">
                  <MdClose style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Voice Hotline Gridlock:</strong> Emergency phone lines become jammed, leaving stranded families without a way to transmit GPS coordinates.</span>
                </li>
              </ul>
            </div>

            {/* ResQFlow Protocol */}
            <div className="cmd-audit-card cmd-card-protocol">
              <div className="cmd-audit-header" style={{ color: '#059669' }}>
                <MdCheck /> ResQFlow Verified Protocol
              </div>
              <ul className="cmd-audit-list">
                <li className="cmd-audit-item">
                  <MdCheck style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Geofenced Shortage Matching:</strong> NGOs request exact supply quantities tied directly to verified flood sectors.</span>
                </li>
                <li className="cmd-audit-item">
                  <MdCheck style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>6-Digit Cryptographic Handoff:</strong> Delivery status cannot be marked complete without physical security code verification.</span>
                </li>
                <li className="cmd-audit-item">
                  <MdCheck style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Real-Time Cluster Heatmap:</strong> Distress beacons automatically populate the live GIS tactical map in under two seconds.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. CALL TO ACTION ─── */}
      <section className="cmd-cta-section">
        <div className="cmd-container">
          <div className="cmd-cta-box">
            <h2 className="cmd-cta-title">Mobilize Relief When Seconds Matter.</h2>
            <p className="cmd-cta-subhead">
              Join emergency responders, certified relief NGOs, and active donors coordinating 
              disaster logistics with 100% verified delivery accountability.
            </p>
            <div className="cmd-cta-actions">
              <Link to="/register?role=VICTIM" className="cmd-btn cmd-btn-emergency cmd-btn-lg">
                <MdDirectionsRun /> Report SOS Emergency
              </Link>
              <Link to="/register?role=DONOR" className="cmd-btn cmd-btn-primary cmd-btn-lg">
                <MdVolunteerActivism /> Join as Relief Donor
              </Link>
              <Link to="/register?role=NGO" className="cmd-btn cmd-btn-outline cmd-btn-lg" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                <MdShield /> Register Certified NGO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. ENTERPRISE FOOTER ─── */}
      <footer className="cmd-footer">
        <div className="cmd-container">
          <div className="cmd-footer-grid">
            <div className="cmd-footer-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <div className="cmd-brand-icon-wrap" style={{ width: '28px', height: '28px', fontSize: '1rem' }}>
                  <MdShield />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.04em' }}>ResQFlow</span>
              </div>
              <p style={{ color: 'var(--cmd-text-muted)', fontSize: '0.875rem', maxWidth: '320px', lineHeight: 1.6 }}>
                Decentralized disaster response platform. Real-time GIS incident clustering, donor logistics, 
                and verified delivery handoffs.
              </p>
              <div style={{ marginTop: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cmd-text-muted)' }}>
                ARCHITECTED FOR 24/7 MISSION-CRITICAL UPTIME
              </div>
            </div>

            <div className="cmd-footer-col">
              <h4>Stranded Citizens</h4>
              <ul>
                <li><Link to="/register?role=VICTIM">Submit SOS Signal</Link></li>
                <li><Link to="/login">Citizen Login</Link></li>
                <li><a href="tel:112">National Police & Rescue (112)</a></li>
                <li><a href="tel:108">Emergency Ambulance (108)</a></li>
              </ul>
            </div>

            <div className="cmd-footer-col">
              <h4>Relief Donors</h4>
              <ul>
                <li><Link to="/register?role=DONOR">Register as Donor</Link></li>
                <li><Link to="/login">Donor Portal Login</Link></li>
                <li><a href="#capabilities">Verification Protocol</a></li>
                <li><a href="#workflow">Courier Tracking Guide</a></li>
              </ul>
            </div>

            <div className="cmd-footer-col">
              <h4>Ground Responders</h4>
              <ul>
                <li><Link to="/register?role=NGO">Register Relief NGO</Link></li>
                <li><Link to="/login">NGO Incident Command</Link></li>
                <li><Link to="/login">Admin Security Console</Link></li>
                <li><a href="#telemetry">GIS Heatmap Telemetry</a></li>
              </ul>
            </div>
          </div>

          <div className="cmd-footer-bottom">
            <div>
              © {new Date().getFullYear()} ResQFlow Disaster Management System. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>High-Availability Cloud Microservices</span>
              <span>Secure JWT Architecture</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
