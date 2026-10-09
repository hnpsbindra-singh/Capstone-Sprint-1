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
    <div className="spatial-canvas">
      {/* ─── 0. VOLUMETRIC SPATIAL BACKDROP ─── */}
      <div className="spatial-volumetric-orbs">
        <div className="spatial-orb spatial-orb-1" />
        <div className="spatial-orb spatial-orb-2" />
        <div className="spatial-orb spatial-orb-3" />
      </div>
      <div className="spatial-perspective-grid" />

      <div className="spatial-content">
        {/* ─── 1. TOP SPATIAL TELEMETRY HUD ─── */}
        <div className="spatial-top-hud">
          <div className="spatial-hud-inner">
            <div className="spatial-telemetry-badge">
              <span className="spatial-pulse-glow" />
              <span>ORBITAL SATELLITE & GIS GRID • 24/7 ACTIVE TELEMETRY</span>
            </div>
            <div className="spatial-hotline-capsules">
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Emergency Helplines:</span>
              <a href="tel:112" className="spatial-hotline-chip">
                <span>POLICE & RESCUE</span> <strong>112</strong>
              </a>
              <a href="tel:108" className="spatial-hotline-chip">
                <span>AMBULANCE</span> <strong>108</strong>
              </a>
            </div>
          </div>
        </div>

        {/* ─── 2. FLOATING VISION-OS STYLE GLASS ISLAND NAVBAR ─── */}
        <div className="spatial-nav-wrapper">
          <nav className="spatial-nav-island">
            <Link to="/" className="spatial-brand">
              <div className="spatial-brand-icon-pod">
                <MdShield />
              </div>
              <div>
                <div className="spatial-brand-title">FloodAid</div>
              </div>
              <span className="spatial-brand-tag">Spatial GIS</span>
            </Link>

            <div className="spatial-nav-links">
              <a href="#overview" className="spatial-nav-link">Overview</a>
              <a href="#terminal" className="spatial-nav-link">Spatial Radar</a>
              <a href="#capabilities" className="spatial-nav-link">Capabilities</a>
              <a href="#operations" className="spatial-nav-link">Operations</a>
            </div>

            <div className="spatial-nav-ctas">
              {token ? (
                <button onClick={handleDashboardRedirect} className="spatial-btn spatial-btn-cyan">
                  <MdShield /> Command Dashboard ↗
                </button>
              ) : (
                <>
                  <Link to="/login" className="spatial-btn spatial-btn-glass">
                    <MdLogin /> Sign In
                  </Link>
                  <Link to="/register?role=VICTIM" className="spatial-btn spatial-btn-ruby">
                    <MdDirectionsRun /> Report SOS ↗
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>

        {/* ─── 3. SPATIAL HERO SECTION ─── */}
        <section className="spatial-hero" id="overview">
          <div className="spatial-container">
            {/* Holographic Header Capsule */}
            <div className="spatial-hero-capsule-badge">
              <span className="spatial-pulse-glow" style={{ background: '#f43f5e', boxShadow: '0 0 10px #f43f5e' }} />
              <span>DECENTRALIZED RESCUE & VERIFIED RELIEF LOGISTICS</span>
            </div>

            {/* Spatial Metallic Headline */}
            <h1 className="spatial-hero-title">
              Spatial Disaster Coordination.<br />
              <span className="spatial-title-gradient">Distress Signal to Verified Delivery.</span>
            </h1>

            {/* Subhead */}
            <p className="spatial-hero-subhead">
              Connecting stranded citizens, verified ground NGOs, and relief contributors on an active spatial 
              GIS grid — secured end-to-end by cryptographic 6-digit physical delivery verification.
            </p>

            {/* VisionOS Floating Action Buttons */}
            <div className="spatial-hero-actions">
              <Link to="/register?role=VICTIM" className="spatial-btn spatial-btn-ruby spatial-btn-lg">
                <MdDirectionsRun /> Report Emergency SOS ↗
              </Link>
              <Link to="/register?role=DONOR" className="spatial-btn spatial-btn-cyan spatial-btn-lg">
                <MdVolunteerActivism /> Pledge Relief Supplies ↗
              </Link>
              <Link to="/login" className="spatial-btn spatial-btn-glass spatial-btn-lg">
                <MdMap /> Live Incident Heatmap ↗
              </Link>
            </div>

            {/* Floating Glass Telemetry Strip */}
            <div className="spatial-hero-stats-glass">
              <div className="spatial-stat-pill">
                <MdCheckCircle style={{ color: '#10b981' }} />
                <span>100% Cryptographic Delivery Verification</span>
              </div>
              <div className="spatial-stat-pill">
                <MdCheckCircle style={{ color: '#38bdf8' }} />
                <span>&lt; 1.2s Ingestion Latency</span>
              </div>
              <div className="spatial-stat-pill">
                <MdCheckCircle style={{ color: '#f43f5e' }} />
                <span>Direct Hub & Carrier Tracking</span>
              </div>
            </div>

            {/* ─── 4. FLOATING HOLOGRAPHIC INCIDENT TERMINAL ─── */}
            <div className="spatial-terminal-window" id="terminal">
              <div className="spatial-terminal-topbar">
                <div className="spatial-topbar-controls">
                  <span className="spatial-dot ruby" />
                  <span className="spatial-dot amber" />
                  <span className="spatial-dot emerald" />
                </div>
                <div className="spatial-topbar-title">
                  <MdLayers style={{ color: '#38bdf8' }} />
                  SPATIAL HUD • SECTOR 4 INCIDENT VECTOR (HOTSPOT)
                </div>
                <div className="spatial-status-capsule">
                  MICROSERVICES SYNCED • LIVE
                </div>
              </div>

              <div className="spatial-terminal-split">
                {/* Left: Holographic 3D Tactical Radar */}
                <div className="spatial-radar-pane">
                  <div className="spatial-radar-meta-top">
                    <span className="spatial-radar-title">
                      <MdLocationOn style={{ color: '#38bdf8' }} /> Sector 4 Flood Hotspot
                    </span>
                    <span className="spatial-severity-pill">
                      SEVERITY: 8.4 / 10 • CRITICAL
                    </span>
                  </div>

                  {/* Concentric Elevation Radar Rings */}
                  <div className="spatial-radar-stage">
                    <div className="spatial-holo-ring ring-sm" />
                    <div className="spatial-holo-ring ring-md" />
                    <div className="spatial-holo-ring ring-lg" />
                    <div className="spatial-radar-ping-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.9rem' }}>
                        <span className="spatial-pulse-glow" style={{ background: '#f43f5e', boxShadow: '0 0 10px #f43f5e' }} />
                        Active Cluster: 14 Distress Beacons
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
                        Water Level: +4.2 ft (Rising) • 32 Stranded Individuals
                      </div>
                    </div>
                  </div>

                  <div className="spatial-radar-meta-bottom">
                    <span>COORDS: 28.7041° N, 77.1025° E</span>
                    <span>RELIEF HUB: Regional Depot Alpha</span>
                  </div>
                </div>

                {/* Right: Custody Pipeline Feed */}
                <div className="spatial-pipeline-pane">
                  <div className="spatial-pipeline-label">
                    Chain of Custody & Delivery Feed
                  </div>

                  {/* Step 1 */}
                  <div className="spatial-card-step">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="spatial-step-tag tag-cyan">1. Beacon Logged</span>
                      <span style={{ fontSize: '0.725rem', color: '#94a3b8', fontFamily: 'monospace' }}>14:22:04</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>Family of 5 stranded on rooftop</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Priority: Inflatable life jackets & clean drinking water</div>
                  </div>

                  {/* Step 2 */}
                  <div className="spatial-card-step">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="spatial-step-tag tag-purple">2. Carrier In Transit</span>
                      <span style={{ fontSize: '0.725rem', color: '#c084fc', fontWeight: 700 }}>Dispatched</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>50x Inflatable Life Rafts & Jackets</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>BlueDart Cargo • Tracking #BD-89234821</div>
                  </div>

                  {/* Step 3: Verified Delivered */}
                  <div className="spatial-card-step active">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="spatial-step-tag tag-emerald">3. Physical Delivery</span>
                      <span style={{ fontSize: '0.725rem', color: '#34d399', fontWeight: 900 }}>VERIFIED</span>
                    </div>
                    <div className="spatial-pin-pod">
                      <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>
                        <MdVpnKey style={{ verticalAlign: 'middle', marginRight: '4px', color: '#38bdf8' }} />
                        Handoff Security PIN:
                      </span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#34d399', letterSpacing: '3px', fontSize: '1rem' }}>
                        849201
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6ee7b7', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MdCheckCircle /> Confirmed on-site by Red Cross Field Commander
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5. SPATIAL BENTO GLASS MATRIX ─── */}
        <section className="spatial-bento-section" id="capabilities">
          <div className="spatial-container">
            <div className="spatial-section-header">
              <div className="spatial-kicker">
                <MdLayers /> Spatial Architecture
              </div>
              <h2 className="spatial-section-title">Engineered for Rapid Response When Seconds Count</h2>
              <p className="spatial-section-desc">
                Every microservice is optimized to eliminate supply leakage, minimize response lag, 
                and route emergency resources directly where flood danger is acute.
              </p>
            </div>

            <div className="spatial-bento-grid">
              {/* Card 1: Precision Geolocation (Span 8) */}
              <div className="spatial-bento-card span-8">
                <div>
                  <div className="spatial-card-icon-pod" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                    <MdDirectionsRun />
                  </div>
                  <h3 className="spatial-card-title">Zero-Friction Geolocation Distress Beacon</h3>
                  <p className="spatial-card-desc">
                    Victims stranded in rising water broadcast precision WGS84 GPS coordinates in 1 tap without typing addresses 
                    or app installation. Captures water depth severity, dependent family counts, and medical priority flags 
                    to triage critical rescues first.
                  </p>
                </div>
                <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--spatial-rim)', paddingTop: '1.25rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--spatial-text-dim)' }}>
                    Resilient over degraded 2G/3G connectivity
                  </span>
                  <Link to="/register?role=VICTIM" className="spatial-btn spatial-btn-glass" style={{ fontSize: '0.8125rem' }}>
                    Report Emergency <MdArrowForward />
                  </Link>
                </div>
              </div>

              {/* Card 2: Spatial GIS Heatmap (Span 4) */}
              <div className="spatial-bento-card span-4">
                <div>
                  <div className="spatial-card-icon-pod" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <MdMap />
                  </div>
                  <h3 className="spatial-card-title">Real-Time Spatial Heatmap</h3>
                  <p className="spatial-card-desc">
                    Spatial incident clustering aggregates individual reports into color-coded flood risk zones (1 to 10 scale). 
                    NGOs and emergency crews inspect distress density prior to launching rescue boats.
                  </p>
                </div>
                <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--spatial-rim)', paddingTop: '1.25rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--spatial-cyan)' }}>
                    Live spatial incident density clustering
                  </span>
                </div>
              </div>

              {/* Card 3: Cryptographic PIN (Span 4) */}
              <div className="spatial-bento-card span-4">
                <div>
                  <div className="spatial-card-icon-pod" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.3)' }}>
                    <MdVpnKey />
                  </div>
                  <h3 className="spatial-card-title">Cryptographic Delivery PIN</h3>
                  <p className="spatial-card-desc">
                    Eliminates lost or siphoned relief shipments. When a donor dispatches goods, a private 6-digit PIN is generated. 
                    The receiving NGO must enter this code upon physical receipt to verify arrival.
                  </p>
                </div>
                <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--spatial-rim)', paddingTop: '1.25rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#c084fc' }}>
                    100% End-to-end chain of custody
                  </span>
                </div>
              </div>

              {/* Card 4: Direct Hub Logistics (Span 8) */}
              <div className="spatial-bento-card span-8">
                <div>
                  <div className="spatial-card-icon-pod" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                    <MdLocalShipping />
                  </div>
                  <h3 className="spatial-card-title">Direct P2P Supply Chain & Relief Hub Drop-off</h3>
                  <p className="spatial-card-desc">
                    NGOs publish verified item shortages linked directly to active flood zones. Donors pledge exact supplies 
                    (life jackets, water purification, medical kits) and dispatch via courier (BlueDart, DTDC, FedEx) or personal drop-off 
                    with consignment tracking.
                  </p>
                </div>
                <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--spatial-rim)', paddingTop: '1.25rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--spatial-text-dim)' }}>
                    Zero centralized warehouse bottlenecks or supply loss
                  </span>
                  <Link to="/register?role=DONOR" className="spatial-btn spatial-btn-glass" style={{ fontSize: '0.8125rem' }}>
                    Browse Shortages <MdArrowForward />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. VISION-OS FLOATING SEGMENTED CONTROLLER (ROLE VIEWS) ─── */}
        <section className="spatial-roles-section" id="operations">
          <div className="spatial-container">
            <div className="spatial-section-header">
              <div className="spatial-kicker">Operational Protocol</div>
              <h2 className="spatial-section-title">Designed for Fast Coordination Across All Roles</h2>
              <p className="spatial-section-desc">
                Select your role to view the exact step-by-step spatial dispatch pipeline.
              </p>
            </div>

            {/* VisionOS Floating Segmented Controller */}
            <div className="spatial-segmented-control">
              <button
                className={`spatial-segment-btn ${activeRoleTab === 'VICTIM' ? 'active' : ''}`}
                onClick={() => setActiveRoleTab('VICTIM')}
              >
                Stranded Citizens
              </button>
              <button
                className={`spatial-segment-btn ${activeRoleTab === 'DONOR' ? 'active' : ''}`}
                onClick={() => setActiveRoleTab('DONOR')}
              >
                Relief Donors
              </button>
              <button
                className={`spatial-segment-btn ${activeRoleTab === 'NGO' ? 'active' : ''}`}
                onClick={() => setActiveRoleTab('NGO')}
              >
                Certified NGOs
              </button>
            </div>

            <div className="spatial-role-view-window">
              <div>
                {activeRoleTab === 'VICTIM' && (
                  <>
                    <div className="spatial-step-node">
                      <div className="spatial-node-num">1</div>
                      <div className="spatial-node-body">
                        <h4>Trigger 1-Tap Geolocation Beacon</h4>
                        <p>Open the app and grant location permission. Your high-accuracy GPS coordinates are resolved in seconds.</p>
                      </div>
                    </div>
                    <div className="spatial-step-node">
                      <div className="spatial-node-num">2</div>
                      <div className="spatial-node-body">
                        <h4>Specify Severity & Stranded Count</h4>
                        <p>Indicate water level (Knee, Waist, Roof) and dependents requiring evacuation, baby supplies, or insulin.</p>
                      </div>
                    </div>
                    <div className="spatial-step-node">
                      <div className="spatial-node-num">3</div>
                      <div className="spatial-node-body">
                        <h4>Direct Ingestion into Incident Dispatch</h4>
                        <p>Your signal immediately plots as an active distress node on the regional disaster heatmap for field crews.</p>
                      </div>
                    </div>
                    <Link to="/register?role=VICTIM" className="spatial-btn spatial-btn-ruby" style={{ marginTop: '1rem' }}>
                      Report Emergency SOS <MdArrowForward />
                    </Link>
                  </>
                )}

                {activeRoleTab === 'DONOR' && (
                  <>
                    <div className="spatial-step-node">
                      <div className="spatial-node-num">1</div>
                      <div className="spatial-node-body">
                        <h4>Browse Shortages by Flood Hotspot</h4>
                        <p>View verified NGO requests linked to active flood sectors. Choose items needed immediately on the ground.</p>
                      </div>
                    </div>
                    <div className="spatial-step-node">
                      <div className="spatial-node-num">2</div>
                      <div className="spatial-node-body">
                        <h4>Attach Tracking & Receive Security PIN</h4>
                        <p>Pledge item quantities and input carrier tracking ID (or Self Drop-off). A private 6-digit PIN is issued.</p>
                      </div>
                    </div>
                    <div className="spatial-step-node">
                      <div className="spatial-node-num">3</div>
                      <div className="spatial-node-body">
                        <h4>Verified Physical Delivery Confirmation</h4>
                        <p>When goods arrive at the relief depot, the NGO inputs your PIN to verify arrival and update the chain of custody.</p>
                      </div>
                    </div>
                    <Link to="/register?role=DONOR" className="spatial-btn spatial-btn-cyan" style={{ marginTop: '1rem' }}>
                      Join as Relief Donor <MdArrowForward />
                    </Link>
                  </>
                )}

                {activeRoleTab === 'NGO' && (
                  <>
                    <div className="spatial-step-node">
                      <div className="spatial-node-num">1</div>
                      <div className="spatial-node-body">
                        <h4>Inspect Incident Heatmap Clusters</h4>
                        <p>Analyze distress severity on the live spatial GIS map to pinpoint sectors requiring urgent supply mobilization.</p>
                      </div>
                    </div>
                    <div className="spatial-step-node">
                      <div className="spatial-node-num">2</div>
                      <div className="spatial-node-body">
                        <h4>Publish Geofenced Supply Requests</h4>
                        <p>Request specific relief quantities (ration packs, medical kits, blankets) with designated regional drop-off hub addresses.</p>
                      </div>
                    </div>
                    <div className="spatial-step-node">
                      <div className="spatial-node-num">3</div>
                      <div className="spatial-node-body">
                        <h4>Validate Inbound Physical Shipments</h4>
                        <p>Receive incoming courier parcels and enter donor verification PINs to confirm delivery into relief inventory.</p>
                      </div>
                    </div>
                    <Link to="/register?role=NGO" className="spatial-btn spatial-btn-cyan" style={{ marginTop: '1rem' }}>
                      Register NGO Portal <MdArrowForward />
                    </Link>
                  </>
                )}
              </div>

              {/* Holographic Spec Card inside Role Window */}
              <div className="spatial-spec-card">
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--spatial-cyan)', marginBottom: '1rem', letterSpacing: '0.06em' }}>
                  Spatial Telemetry Spec • Live Verification
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--spatial-rim)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 800 }}>
                      <span>Consignment Verification</span>
                      <span style={{ color: '#34d399' }}>CRYPTOGRAPHIC</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--spatial-text-dim)', marginTop: '4px' }}>
                      Recipient NGO must physically enter the donor's 6-digit OTP code before status is marked DELIVERED.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--spatial-rim)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 800 }}>
                      <span>Spatial Coordinates</span>
                      <span style={{ color: '#38bdf8' }}>GPS RESOLVED</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--spatial-text-dim)', marginTop: '4px' }}>
                      WGS84 precision coordinates tied directly to distress reports for exact rescue boat navigation.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. SPATIAL COMPARISON AUDIT ─── */}
        <section className="spatial-audit-section">
          <div className="spatial-container">
            <div className="spatial-section-header">
              <div className="spatial-kicker">Integrity Architecture</div>
              <h2 className="spatial-section-title">Why Legacy Disaster Relief Fails in Crises</h2>
              <p className="spatial-section-desc">
                A direct comparison between traditional uncoordinated charity drives and the ResQFlow spatial protocol.
              </p>
            </div>

            <div className="spatial-audit-grid">
              {/* Legacy Charity */}
              <div className="spatial-audit-card card-legacy">
                <div className="spatial-audit-title" style={{ color: '#f43f5e' }}>
                  <MdClose /> Legacy Uncoordinated Relief
                </div>
                <ul className="spatial-audit-list">
                  <li className="spatial-audit-item">
                    <MdClose style={{ color: '#f43f5e', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Untracked Shipments:</strong> Well-meaning citizens mail random supplies without knowing whether the hub is already full.</span>
                  </li>
                  <li className="spatial-audit-item">
                    <MdClose style={{ color: '#f43f5e', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>High Supply Leakage:</strong> Supplies sit in unverified storage with zero chain of custody or proof of delivery.</span>
                  </li>
                  <li className="spatial-audit-item">
                    <MdClose style={{ color: '#f43f5e', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Voice Hotline Gridlock:</strong> Phone lines collapse under peak load, leaving stranded victims unable to transmit GPS coordinates.</span>
                  </li>
                </ul>
              </div>

              {/* Spatial Protocol */}
              <div className="spatial-audit-card card-protocol">
                <div className="spatial-audit-title" style={{ color: '#34d399' }}>
                  <MdCheck /> ResQFlow Spatial Protocol
                </div>
                <ul className="spatial-audit-list">
                  <li className="spatial-audit-item">
                    <MdCheck style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Geofenced Shortage Matching:</strong> NGOs request exact supply quantities linked directly to active flood sectors.</span>
                  </li>
                  <li className="spatial-audit-item">
                    <MdCheck style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>6-Digit Cryptographic Handoff:</strong> Delivery cannot be marked complete without physical security code verification.</span>
                  </li>
                  <li className="spatial-audit-item">
                    <MdCheck style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Real-Time Cluster Heatmap:</strong> Distress beacons automatically populate the live GIS tactical map in under two seconds.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 8. SUSPENDED SPATIAL PORTAL CTA ─── */}
        <section className="spatial-cta-section">
          <div className="spatial-container">
            <div className="spatial-cta-portal">
              <h2 className="spatial-cta-title">
                Mobilize Relief When Seconds Matter.
              </h2>
              <p className="spatial-cta-subhead">
                Join rescue crews, certified relief NGOs, and active donors coordinating 
                disaster logistics with 100% verified delivery accountability.
              </p>
              <div className="spatial-cta-buttons">
                <Link to="/register?role=VICTIM" className="spatial-btn spatial-btn-ruby spatial-btn-lg">
                  <MdDirectionsRun /> Report SOS Emergency ↗
                </Link>
                <Link to="/register?role=DONOR" className="spatial-btn spatial-btn-cyan spatial-btn-lg">
                  <MdVolunteerActivism /> Join as Relief Donor ↗
                </Link>
                <Link to="/register?role=NGO" className="spatial-btn spatial-btn-glass spatial-btn-lg">
                  <MdShield /> Register Certified NGO ↗
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 9. SPATIAL HUD FOOTER ─── */}
        <footer className="spatial-footer">
          <div className="spatial-container">
            <div className="spatial-footer-grid">
              <div className="spatial-footer-col">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                  <div className="spatial-brand-icon-pod" style={{ width: '30px', height: '30px', fontSize: '1rem' }}>
                    <MdShield />
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff' }}>FloodAid</span>
                </div>
                <p style={{ color: 'var(--spatial-text-dim)', fontSize: '0.875rem', maxWidth: '320px', lineHeight: 1.6 }}>
                  Decentralized disaster response platform. Real-time spatial GIS incident clustering, donor logistics, 
                  and verified delivery handoffs.
                </p>
                <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--spatial-cyan)', letterSpacing: '0.06em' }}>
                  HIGH-AVAILABILITY CLOUD MICROSERVICES
                </div>
              </div>

              <div className="spatial-footer-col">
                <h4>Stranded Citizens</h4>
                <ul>
                  <li><Link to="/register?role=VICTIM">Submit SOS Signal</Link></li>
                  <li><Link to="/login">Citizen Login</Link></li>
                  <li><a href="tel:112">National Police & Rescue (112)</a></li>
                  <li><a href="tel:108">Emergency Ambulance (108)</a></li>
                </ul>
              </div>

              <div className="spatial-footer-col">
                <h4>Relief Donors</h4>
                <ul>
                  <li><Link to="/register?role=DONOR">Register as Donor</Link></li>
                  <li><Link to="/login">Donor Portal Login</Link></li>
                  <li><a href="#capabilities">Verification Protocol</a></li>
                  <li><a href="#operations">Carrier Tracking Guide</a></li>
                </ul>
              </div>

              <div className="spatial-footer-col">
                <h4>Ground Responders</h4>
                <ul>
                  <li><Link to="/register?role=NGO">Register Relief NGO</Link></li>
                  <li><Link to="/login">NGO Incident Command</Link></li>
                  <li><Link to="/login">Admin Security Console</Link></li>
                  <li><a href="#terminal">Spatial GIS Telemetry</a></li>
                </ul>
              </div>
            </div>

            <div className="spatial-footer-bottom">
              <div>
                © {new Date().getFullYear()} FloodAid Spatial Disaster Response. All rights reserved.
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <span>Spatial Computing Interface</span>
                <span>Cryptographic PIN Handoffs</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
