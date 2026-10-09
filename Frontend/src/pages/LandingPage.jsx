import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';
import {
  MdShield,
  MdWarning,
  MdLocationOn,
  MdCheckCircle,
  MdArrowForward,
  MdMap,
  MdPhoneInTalk,
  MdDirectionsRun,
  MdLocalShipping,
  MdVpnKey,
  MdClose,
  MdCheck,
  MdLogin,
  MdVolunteerActivism,
  MdLayers,
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
    <div className="min-landing">
      {/* ─── 1. TOP STATUS STRIP ─── */}
      <div className="min-top-strip">
        <div className="min-strip-inner">
          <div className="min-strip-indicator">
            <span className="min-live-dot" />
            <span>Disaster Grid Active • 24/7 Incident Tracking</span>
          </div>
          <div className="min-strip-links">
            <span style={{ fontSize: '0.75rem', color: 'var(--min-text-muted)' }}>Emergency Lines:</span>
            <a href="tel:112" className="min-hotline-link">
              <span className="min-hotline-tag">POLICE / RESCUE</span> 112
            </a>
            <a href="tel:108" className="min-hotline-link">
              <span className="min-hotline-tag">AMBULANCE</span> 108
            </a>
          </div>
        </div>
      </div>

      {/* ─── 2. NAVBAR ─── */}
      <header className="min-navbar">
        <div className="min-container min-nav-container">
          <Link to="/" className="min-nav-brand">
            <div className="min-brand-icon">
              <MdShield />
            </div>
            <span className="min-brand-title">FloodAid</span>
          </Link>

          <nav className="min-nav-menu">
            <a href="#overview" className="min-nav-link">Overview</a>
            <a href="#preview" className="min-nav-link">Live Radar</a>
            <a href="#capabilities" className="min-nav-link">Features</a>
            <a href="#workflow" className="min-nav-link">Operations</a>
          </nav>

          <div className="min-nav-ctas">
            {token ? (
              <button onClick={handleDashboardRedirect} className="min-btn min-btn-black">
                <MdShield /> Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="min-btn min-btn-outline">
                  <MdLogin /> Sign In
                </Link>
                <Link to="/register?role=VICTIM" className="min-btn min-btn-danger">
                  <MdDirectionsRun /> Report SOS
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── 3. MINIMAL HERO ─── */}
      <section className="min-hero" id="overview">
        <div className="min-container">
          <div className="min-hero-kicker">
            Emergency Response & Relief Network
          </div>

          <h1 className="min-hero-title">
            Decentralized flood response.<br />
            Distress signal to verified delivery.
          </h1>

          <p className="min-hero-subtitle">
            A minimalist coordination network connecting stranded citizens, verified ground NGOs, 
            and relief donors on a real-time GIS map — secured with 6-digit physical delivery verification.
          </p>

          <div className="min-hero-actions">
            <Link to="/register?role=VICTIM" className="min-btn min-btn-danger min-btn-lg">
              <MdDirectionsRun /> Report Emergency SOS
            </Link>
            <Link to="/register?role=DONOR" className="min-btn min-btn-black min-btn-lg">
              <MdVolunteerActivism /> Pledge Relief Supplies
            </Link>
            <Link to="/login" className="min-btn min-btn-outline min-btn-lg">
              <MdMap /> Live Incident Heatmap
            </Link>
          </div>

          <div className="min-hero-guarantees">
            <div className="min-guarantee-item">
              <MdCheckCircle style={{ color: 'var(--min-accent-emerald)' }} />
              <span>100% Physical PIN Verification</span>
            </div>
            <div className="min-guarantee-item">
              <MdCheckCircle style={{ color: 'var(--min-accent-emerald)' }} />
              <span>&lt; 2s Broadcast Latency</span>
            </div>
            <div className="min-guarantee-item">
              <MdCheckCircle style={{ color: 'var(--min-accent-emerald)' }} />
              <span>Direct Courier & Hub Drop-off</span>
            </div>
          </div>

          {/* ─── 4. PRODUCT SHOWCASE CARD ─── */}
          <div className="min-showcase-box" id="preview">
            <div className="min-showcase-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="min-live-dot" />
                <span>Sector 4 Incident Telemetry</span>
              </div>
              <span style={{ fontFamily: 'monospace', color: 'var(--min-text-muted)' }}>
                GPS: 28.7041° N, 77.1025° E
              </span>
            </div>

            <div className="min-showcase-grid">
              {/* Left Tactical Map Preview */}
              <div className="min-preview-map">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MdLocationOn style={{ color: '#0284c7' }} /> Sector 4 Flood Hotspot
                  </div>
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px' }}>
                    Severity 8.4 / 10 • High Risk
                  </span>
                </div>

                <div className="min-preview-hotspot">
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Active Distress Cluster</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--min-text-secondary)', marginTop: '2px' }}>
                    14 Distress Reports • Water Level +4.2 ft
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--min-text-muted)' }}>
                  <span>Assigned: Regional Depot A</span>
                  <span>Cluster Status: Priority 1</span>
                </div>
              </div>

              {/* Right Pipeline Feed */}
              <div className="min-preview-pipeline">
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--min-text-muted)', letterSpacing: '0.05em' }}>
                  Chain of Custody Feed
                </div>

                <div className="min-pipeline-step">
                  <div className="min-step-head">
                    <span style={{ color: '#0284c7' }}>1. Signal Logged</span>
                    <span style={{ color: 'var(--min-text-muted)' }}>14:22</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Family of 5 stranded on rooftop</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--min-text-muted)' }}>Need: 5x Life jackets & drinking water</div>
                </div>

                <div className="min-pipeline-step">
                  <div className="min-step-head">
                    <span style={{ color: '#7c3aed' }}>2. Courier Dispatched</span>
                    <span style={{ color: 'var(--min-text-muted)' }}>In Transit</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>50x Inflatable Life Rafts</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--min-text-muted)' }}>BlueDart Cargo • Tracking #BD-89234821</div>
                </div>

                <div className="min-pipeline-step" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <div className="min-step-head">
                    <span style={{ color: '#16a34a' }}>3. Verified Delivered</span>
                    <span style={{ color: '#16a34a', fontWeight: 800 }}>Complete</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#166534' }}>Handoff Security PIN:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#15803d', letterSpacing: '2px' }}>849201</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. BENTO GRID ─── */}
      <section className="min-bento-section" id="capabilities">
        <div className="min-container">
          <div className="min-section-header">
            <div className="min-section-kicker">Core System Modules</div>
            <h2 className="min-section-title">Built for Mission-Critical Incident Response</h2>
            <p className="min-section-desc">
              Every microservice is architected to eliminate supply leakage and route relief 
              directly where flood danger is acute.
            </p>
          </div>

          <div className="min-bento-grid">
            {/* Card 1 */}
            <div className="min-bento-card min-span-8">
              <div>
                <div className="min-card-icon">
                  <MdDirectionsRun />
                </div>
                <h3 className="min-card-title">1-Tap Precision Geolocation Beacon</h3>
                <p className="min-card-desc">
                  Victims in rising waters capture precision GPS coordinates in 1 tap without typing addresses 
                  or installing apps. Captures water depth severity, dependent family counts, and medical priority flags 
                  to triage critical rescues first.
                </p>
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--min-border)', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--min-text-muted)' }}>
                  Operates over degraded mobile connectivity
                </span>
                <Link to="/register?role=VICTIM" className="min-btn min-btn-outline" style={{ fontSize: '0.8125rem' }}>
                  Report Emergency <MdArrowForward />
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="min-bento-card min-span-4">
              <div>
                <div className="min-card-icon">
                  <MdMap />
                </div>
                <h3 className="min-card-title">Real-Time GIS Heatmap</h3>
                <p className="min-card-desc">
                  Autonomous spatial clustering aggregates individual reports into color-coded flood risk zones (1 to 10 scale). 
                  NGOs inspect distress density prior to launching boats.
                </p>
              </div>
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--min-border)', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--min-accent-blue)' }}>
                  Live incident density & radius calculation
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="min-bento-card min-span-4">
              <div>
                <div className="min-card-icon">
                  <MdVpnKey />
                </div>
                <h3 className="min-card-title">Cryptographic Delivery PIN</h3>
                <p className="min-card-desc">
                  Eliminates missing relief shipments. When a donor dispatches goods, a private 6-digit PIN is generated. 
                  The receiving NGO must enter this code upon physical receipt to verify arrival.
                </p>
              </div>
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--min-border)', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--min-text-primary)' }}>
                  100% Chain-of-custody verification
                </span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="min-bento-card min-span-8">
              <div>
                <div className="min-card-icon">
                  <MdLocalShipping />
                </div>
                <h3 className="min-card-title">Direct P2P Supply Chain & Hub Drop-off</h3>
                <p className="min-card-desc">
                  NGOs publish verified item shortages linked directly to active flood zones. Donors pledge exact supplies 
                  (life jackets, water purification, blankets) and dispatch via courier (BlueDart, DTDC, FedEx) or personal drop-off 
                  with consignment tracking.
                </p>
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--min-border)', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--min-text-muted)' }}>
                  Zero centralized warehouse bottlenecks or supply loss
                </span>
                <Link to="/register?role=DONOR" className="min-btn min-btn-outline" style={{ fontSize: '0.8125rem' }}>
                  Browse Shortages <MdArrowForward />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. WORKFLOWS SECTION ─── */}
      <section className="min-roles-section" id="workflow">
        <div className="min-container">
          <div className="min-section-header">
            <div className="min-section-kicker">Operational Workflows</div>
            <h2 className="min-section-title">Designed for Fast Coordination Across All Roles</h2>
            <p className="min-section-desc">
              Select your role to view the exact step-by-step dispatch workflow.
            </p>
          </div>

          <div className="min-segmented-control">
            <button
              className={`min-segment-btn ${activeRoleTab === 'VICTIM' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('VICTIM')}
            >
              Stranded Citizens
            </button>
            <button
              className={`min-segment-btn ${activeRoleTab === 'DONOR' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('DONOR')}
            >
              Relief Donors
            </button>
            <button
              className={`min-segment-btn ${activeRoleTab === 'NGO' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('NGO')}
            >
              Certified NGOs
            </button>
          </div>

          <div className="min-role-window">
            <div>
              {activeRoleTab === 'VICTIM' && (
                <>
                  <div className="min-step-row">
                    <div className="min-step-num">1</div>
                    <div className="min-step-body">
                      <h4>Trigger 1-Tap Geolocation Beacon</h4>
                      <p>Open the app and grant location permission. Your precision GPS coordinates are auto-filled in seconds.</p>
                    </div>
                  </div>
                  <div className="min-step-row">
                    <div className="min-step-num">2</div>
                    <div className="min-step-body">
                      <h4>Specify Severity & Stranded Count</h4>
                      <p>Select current water level (Knee, Waist, Roof) and number of dependents needing evacuation or emergency food.</p>
                    </div>
                  </div>
                  <div className="min-step-row">
                    <div className="min-step-num">3</div>
                    <div className="min-step-body">
                      <h4>Direct Integration into Rescue Dispatch</h4>
                      <p>Your signal immediately turns into a live distress pin on the regional disaster heatmap for ground rescue crews.</p>
                    </div>
                  </div>
                  <Link to="/register?role=VICTIM" className="min-btn min-btn-danger" style={{ marginTop: '0.75rem' }}>
                    Report Emergency SOS <MdArrowForward />
                  </Link>
                </>
              )}

              {activeRoleTab === 'DONOR' && (
                <>
                  <div className="min-step-row">
                    <div className="min-step-num">1</div>
                    <div className="min-step-body">
                      <h4>Browse Shortages by Flood Zone</h4>
                      <p>View verified NGO requests sorted by flood hotspot proximity. Choose items currently needed on the ground.</p>
                    </div>
                  </div>
                  <div className="min-step-row">
                    <div className="min-step-num">2</div>
                    <div className="min-step-body">
                      <h4>Attach Courier Tracking & Receive Security PIN</h4>
                      <p>Pledge item quantities and input carrier tracking ID (or Self Drop-off). A private 6-digit verification PIN is issued.</p>
                    </div>
                  </div>
                  <div className="min-step-row">
                    <div className="min-step-num">3</div>
                    <div className="min-step-body">
                      <h4>Verified Delivery Confirmation</h4>
                      <p>When the shipment reaches the NGO relief camp, the team enters your PIN to verify physical receipt.</p>
                    </div>
                  </div>
                  <Link to="/register?role=DONOR" className="min-btn min-btn-black" style={{ marginTop: '0.75rem' }}>
                    Join as Relief Donor <MdArrowForward />
                  </Link>
                </>
              )}

              {activeRoleTab === 'NGO' && (
                <>
                  <div className="min-step-row">
                    <div className="min-step-num">1</div>
                    <div className="min-step-body">
                      <h4>Inspect Incident Heatmap Sectors</h4>
                      <p>Analyze distress severity clusters on the live GIS map to identify sectors requiring urgent supply mobilization.</p>
                    </div>
                  </div>
                  <div className="min-step-row">
                    <div className="min-step-num">2</div>
                    <div className="min-step-body">
                      <h4>Issue Targeted Resource Requests</h4>
                      <p>Request specific relief quantities (food, medical kits, blankets) with designated regional drop-off hub addresses.</p>
                    </div>
                  </div>
                  <div className="min-step-row">
                    <div className="min-step-num">3</div>
                    <div className="min-step-body">
                      <h4>Validate Inbound Physical Shipments</h4>
                      <p>Receive incoming courier boxes and input donor verification PINs to confirm delivery into relief inventory.</p>
                    </div>
                  </div>
                  <Link to="/register?role=NGO" className="min-btn min-btn-black" style={{ marginTop: '0.75rem' }}>
                    Register NGO Portal <MdArrowForward />
                  </Link>
                </>
              )}
            </div>

            {/* Minimalist Telemetry Box */}
            <div style={{ background: 'var(--min-bg-subtle)', border: '1px solid var(--min-border)', borderRadius: 'var(--min-radius-md)', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--min-text-muted)', marginBottom: '0.85rem' }}>
                System Architecture Spec
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid var(--min-border)', borderRadius: 'var(--min-radius-sm)', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                    <span>Consignment Security</span>
                    <span style={{ color: 'var(--min-accent-emerald)' }}>VALIDATED</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--min-text-secondary)', marginTop: '4px' }}>
                    Recipient NGO must physically match the donor's 6-digit OTP code before database status marks DELIVERED.
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid var(--min-border)', borderRadius: 'var(--min-radius-sm)', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                    <span>Spatial Precision</span>
                    <span style={{ color: 'var(--min-accent-blue)' }}>GPS RESOLVED</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--min-text-secondary)', marginTop: '4px' }}>
                    WGS84 high-accuracy coordinates linked directly to distress records for precise boat navigation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. COMPARISON SECTION ─── */}
      <section className="min-comparison-section">
        <div className="min-container">
          <div className="min-section-header">
            <div className="min-section-kicker">Integrity Protocol</div>
            <h2 className="min-section-title">Why Legacy Disaster Charity Fails in Crises</h2>
            <p className="min-section-desc">
              A direct comparison between traditional uncoordinated charity drives and the FloodAid protocol.
            </p>
          </div>

          <div className="min-comp-grid">
            <div className="min-comp-card">
              <h3 className="min-comp-title" style={{ color: '#dc2626' }}>
                <MdClose /> Legacy Uncoordinated Relief
              </h3>
              <ul className="min-comp-list">
                <li className="min-comp-item">
                  <MdClose style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Untracked Donations:</strong> Citizens mail items without knowing whether the hub is full or has already received that item.</span>
                </li>
                <li className="min-comp-item">
                  <MdClose style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>High Supply Leakage:</strong> Packages sit in warehouses unverified with zero chain of custody or proof of receipt.</span>
                </li>
                <li className="min-comp-item">
                  <MdClose style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Voice Hotline Gridlock:</strong> Emergency phone lines become jammed, leaving stranded families without a way to transmit GPS coordinates.</span>
                </li>
              </ul>
            </div>

            <div className="min-comp-card highlight">
              <h3 className="min-comp-title" style={{ color: '#16a34a' }}>
                <MdCheck /> FloodAid Verified Protocol
              </h3>
              <ul className="min-comp-list">
                <li className="min-comp-item">
                  <MdCheck style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Geofenced Shortage Matching:</strong> NGOs request exact supply quantities tied directly to verified flood sectors.</span>
                </li>
                <li className="min-comp-item">
                  <MdCheck style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>6-Digit Cryptographic Handoff:</strong> Delivery status cannot be marked complete without physical security code verification.</span>
                </li>
                <li className="min-comp-item">
                  <MdCheck style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Real-Time Cluster Heatmap:</strong> Distress beacons automatically populate the live GIS tactical map in under two seconds.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. CALL TO ACTION ─── */}
      <section className="min-cta-section">
        <div className="min-container">
          <div className="min-cta-box">
            <h2 className="min-cta-title">Mobilize Relief When Seconds Matter.</h2>
            <p className="min-cta-desc">
              Join emergency responders, certified relief NGOs, and active donors coordinating 
              disaster logistics with 100% verified delivery accountability.
            </p>
            <div className="min-cta-actions">
              <Link to="/register?role=VICTIM" className="min-btn min-btn-danger min-btn-lg">
                <MdDirectionsRun /> Report SOS Emergency
              </Link>
              <Link to="/register?role=DONOR" className="min-btn min-btn-outline min-btn-lg" style={{ background: '#ffffff', color: '#09090b' }}>
                <MdVolunteerActivism /> Join as Relief Donor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. MINIMAL FOOTER ─── */}
      <footer className="min-footer">
        <div className="min-container">
          <div className="min-footer-grid">
            <div className="min-footer-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.65rem' }}>
                <div className="min-brand-icon" style={{ width: '26px', height: '26px', fontSize: '0.9rem' }}>
                  <MdShield />
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.03em' }}>FloodAid</span>
              </div>
              <p style={{ color: 'var(--min-text-secondary)', fontSize: '0.85rem', maxWidth: '300px', lineHeight: 1.6 }}>
                Decentralized disaster response platform. Real-time GIS incident clustering, donor logistics, 
                and verified delivery handoffs.
              </p>
            </div>

            <div className="min-footer-col">
              <h4>Stranded Citizens</h4>
              <ul>
                <li><Link to="/register?role=VICTIM">Submit SOS Signal</Link></li>
                <li><Link to="/login">Citizen Login</Link></li>
                <li><a href="tel:112">National Police & Rescue (112)</a></li>
                <li><a href="tel:108">Emergency Ambulance (108)</a></li>
              </ul>
            </div>

            <div className="min-footer-col">
              <h4>Relief Donors</h4>
              <ul>
                <li><Link to="/register?role=DONOR">Register as Donor</Link></li>
                <li><Link to="/login">Donor Portal Login</Link></li>
                <li><a href="#capabilities">Verification Protocol</a></li>
                <li><a href="#workflow">Courier Tracking Guide</a></li>
              </ul>
            </div>

            <div className="min-footer-col">
              <h4>Ground Responders</h4>
              <ul>
                <li><Link to="/register?role=NGO">Register Relief NGO</Link></li>
                <li><Link to="/login">NGO Incident Command</Link></li>
                <li><Link to="/login">Admin Security Console</Link></li>
                <li><a href="#preview">GIS Heatmap Telemetry</a></li>
              </ul>
            </div>
          </div>

          <div className="min-footer-bottom">
            <div>
              © {new Date().getFullYear()} FloodAid Disaster Management System.
            </div>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
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
