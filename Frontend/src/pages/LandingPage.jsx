import React, { useState, useEffect } from 'react';
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
  MdSensors,
  MdCameraAlt,
  MdAutoAwesome,
  MdLayers,
  MdRefresh
} from 'react-icons/md';

const SIMULATED_SECTORS = [
  {
    id: 'SEC-01',
    name: 'Sector 01: Yamuna Basin, Delhi',
    coords: '28.6712° N, 77.2341° E',
    waterDepth: '5.4 ft',
    severity: '8.7',
    severityLevel: 'CRITICAL',
    severityColor: '#dc2626',
    aiDiagnosis: 'Ground floor submerged. Structural compromise risk. 4 elderly citizens on second-floor balcony.',
    neededSupplies: '30x Inflatable Life Vests • 120x Water Purification Tablets',
    carrier: 'DTDC Cargo Express',
    trackingId: 'DT-948102',
    pin: '482-910',
    status: 'IN TRANSIT',
    assignedNgo: 'Delhi Civil Defence Depot 4'
  },
  {
    id: 'SEC-02',
    name: 'Sector 02: Kaziranga Buffer, Assam',
    coords: '26.5775° N, 93.1711° E',
    waterDepth: '7.8 ft',
    severity: '9.4',
    severityLevel: 'CATASTROPHIC',
    severityColor: '#dc2626',
    aiDiagnosis: 'Embankment breached. Fast current +3.5 knots. Evacuation launch required immediately.',
    neededSupplies: '15x Heavy-duty Inflatable Rafts • 80x High-Calorie Rations',
    carrier: 'BlueDart Air Freight',
    trackingId: 'BD-551029',
    pin: '719-304',
    status: 'VERIFIED DELIVERED',
    assignedNgo: 'Assam Riverine Relief Force'
  },
  {
    id: 'SEC-03',
    name: 'Sector 03: Wayanad Slopes, Kerala',
    coords: '11.6854° N, 76.1320° E',
    waterDepth: '3.9 ft',
    severity: '7.2',
    severityLevel: 'HIGH',
    severityColor: '#ea580c',
    aiDiagnosis: 'Silt runoff cut road access. Community shelter isolated. Medical supplies depleted.',
    neededSupplies: '200x Sterile First-Aid Kits • Baby Nutrition Formula',
    carrier: 'Direct Volunteer Vehicle',
    trackingId: 'VOL-882194',
    pin: '502-831',
    status: 'ACCEPTED BY DEPOT',
    assignedNgo: 'Wayanad Community Relief Hub'
  }
];

const LandingPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [activeRoleTab, setActiveRoleTab] = useState('VICTIM');
  const [selectedSectorIndex, setSelectedSectorIndex] = useState(0);
  const [liveUtc, setLiveUtc] = useState('');

  const currentSector = SIMULATED_SECTORS[selectedSectorIndex];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveUtc(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDashboardRedirect = () => {
    if (user?.role) navigate(`/${user.role.toLowerCase()}`);
    else navigate('/login');
  };

  return (
    <div className="min-landing">
      {/* ─── 1. TOP OPERATIONAL STATUS STRIP ─── */}
      <div className="min-top-strip">
        <div className="min-strip-inner">
          <div className="min-strip-indicator">
            <span className="min-live-dot" />
            <span className="min-strip-telemetry">
              DISASTER TELEMETRY ACTIVE // 7 CLOUD NODES OPERATIONAL // {liveUtc || 'SYNCING...'}
            </span>
          </div>

          <div className="min-strip-links">
            <span className="min-strip-label">EMERGENCY DISPATCH:</span>
            <a href="tel:112" className="min-hotline-link" title="Call National Police and Rescue">
              <span className="min-hotline-tag">POLICE / RESCUE</span> 112
            </a>
            <a href="tel:108" className="min-hotline-link" title="Call Emergency Ambulance">
              <span className="min-hotline-tag">AMBULANCE</span> 108
            </a>
          </div>
        </div>
      </div>

      {/* ─── 2. ARCHITECTURAL NAVBAR ─── */}
      <header className="min-navbar">
        <div className="min-container min-nav-container">
          <Link to="/" className="min-nav-brand">
            <div className="min-brand-icon">
              <MdShield />
            </div>
            <div className="min-brand-text-group">
              <span className="min-brand-title">ResQFlow</span>
              <span className="min-brand-badge">DISPATCH GRID</span>
            </div>
          </Link>

          <nav className="min-nav-menu">
            <a href="#overview" className="min-nav-link">Overview</a>
            <a href="#telemetry-console" className="min-nav-link">Live Telemetry</a>
            <a href="#capabilities" className="min-nav-link">Architecture</a>
            <a href="#workflow" className="min-nav-link">Workflows</a>
            <a href="#comparison" className="min-nav-link">Protocol Integrity</a>
          </nav>

          <div className="min-nav-ctas">
            {token ? (
              <button onClick={handleDashboardRedirect} className="min-btn min-btn-black">
                <MdShield /> Operations Dashboard
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

      {/* ─── 3. SWISS EDITORIAL HERO ─── */}
      <section className="min-hero" id="overview">
        <div className="min-container">
          <div className="min-hero-kicker">
            <span>RESQFLOW EMERGENCY PROTOCOL v2.4</span>
            <span className="hero-kicker-sep">/</span>
            <span>HIGH-CONSEQUENCE DISASTER LOGISTICS</span>
          </div>

          <h1 className="min-hero-title">
            Decentralized flood response. <br />
            Distress beacon to verified delivery.
          </h1>

          <p className="min-hero-subtitle">
            An open disaster logistics grid uniting stranded citizens, autonomous computer vision severity scoring, 
            and registered relief NGOs on a real-time GIS tactical map — protected by physical 6-digit delivery verification.
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

          {/* Operational Guarantees Bar */}
          <div className="min-hero-guarantees">
            <div className="min-guarantee-item">
              <MdCheckCircle className="guarantee-icon" />
              <span>100% Physical 6-Digit Handshake PIN</span>
            </div>
            <div className="min-guarantee-item">
              <MdCheckCircle className="guarantee-icon" />
              <span>&lt; 2s WebRTC Beacon Broadcast</span>
            </div>
            <div className="min-guarantee-item">
              <MdCheckCircle className="guarantee-icon" />
              <span>Direct Courier Consignment Tracking</span>
            </div>
          </div>

          {/* ─── 4. INTERACTIVE LIVE TELEMETRY CONSOLE ─── */}
          <div className="min-showcase-box" id="telemetry-console">
            {/* Top Toolbar */}
            <div className="min-showcase-bar">
              <div className="showcase-bar-left">
                <span className="min-live-dot" />
                <span className="bar-title">MISSION SIMULATOR // ACTIVE DISPATCH FEED</span>
              </div>

              {/* Sector Switcher Tabs */}
              <div className="sector-switcher">
                {SIMULATED_SECTORS.map((sec, idx) => (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSectorIndex(idx)}
                    className={`sector-tab-btn ${selectedSectorIndex === idx ? 'active' : ''}`}
                  >
                    {sec.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="min-showcase-grid">
              {/* Left Column: Tactical Spatial Telemetry */}
              <div className="min-preview-map">
                <div className="sector-header-row">
                  <div>
                    <div className="sector-name">{currentSector.name}</div>
                    <div className="sector-coords">
                      <MdLocationOn style={{ color: '#0284c7' }} />
                      <span>{currentSector.coords}</span>
                    </div>
                  </div>
                  <span 
                    className="sector-severity-pill"
                    style={{
                      backgroundColor: `${currentSector.severityColor}15`,
                      color: currentSector.severityColor,
                      borderColor: `${currentSector.severityColor}40`
                    }}
                  >
                    SEVERITY {currentSector.severity} / 10 • {currentSector.severityLevel}
                  </span>
                </div>

                {/* Simulated Incident Telemetry Card */}
                <div className="min-preview-hotspot">
                  <div className="hotspot-kicker">
                    <MdAutoAwesome style={{ color: '#0284c7' }} />
                    <span>AI COMPUTER VISION ANALYSIS</span>
                  </div>

                  <div className="hotspot-metric-row">
                    <div className="hotspot-metric">
                      <span className="metric-num">{currentSector.waterDepth}</span>
                      <span className="metric-tag">ESTIMATED DEPTH</span>
                    </div>
                    <div className="hotspot-metric">
                      <span className="metric-num">HIGH</span>
                      <span className="metric-tag">DEBRIS RISK</span>
                    </div>
                    <div className="hotspot-metric">
                      <span className="metric-num">WGS84</span>
                      <span className="metric-tag">GPS LOCK</span>
                    </div>
                  </div>

                  <p className="hotspot-diagnosis">{currentSector.aiDiagnosis}</p>
                </div>

                <div className="sector-footer-meta">
                  <span>Assigned Unit: <strong>{currentSector.assignedNgo}</strong></span>
                  <span className="click-hint">Click sector tabs above to inspect alternative zones</span>
                </div>
              </div>

              {/* Right Column: Custody Chain & Cryptographic Handoff */}
              <div className="min-preview-pipeline">
                <div className="pipeline-header">
                  <span>CHAIN OF CUSTODY TELEMETRY</span>
                  <span className="pipeline-state-tag">{currentSector.status}</span>
                </div>

                {/* Step 1: Beacon */}
                <div className="min-pipeline-step">
                  <div className="min-step-head">
                    <span className="step-tag-blue">1. DISTRESS BEACON LOGGED</span>
                    <span className="step-time">LIVE</span>
                  </div>
                  <div className="step-content-title">Citizen GPS & Depth Uploaded</div>
                  <div className="step-content-sub">Shortage: {currentSector.neededSupplies}</div>
                </div>

                {/* Step 2: Courier */}
                <div className="min-pipeline-step">
                  <div className="min-step-head">
                    <span className="step-tag-purple">2. CONSIGNMENT DISPATCHED</span>
                    <span className="step-time">TRANSIT</span>
                  </div>
                  <div className="step-content-title">{currentSector.carrier}</div>
                  <div className="step-content-sub">Waybill / Consignment ID: {currentSector.trackingId}</div>
                </div>

                {/* Step 3: Physical PIN Verification */}
                <div className="min-pipeline-step step-complete">
                  <div className="min-step-head">
                    <span className="step-tag-green">3. PHYSICAL HANDSHAKE PIN</span>
                    <span className="step-tag-verified">SECURE</span>
                  </div>
                  <div className="pin-handoff-row">
                    <span className="pin-label">RECIPIENT DEPOT VERIFICATION PIN:</span>
                    <span className="pin-value">{currentSector.pin}</span>
                  </div>
                  <div className="pin-subtext">
                    Consignment database status cannot be marked complete without physical PIN validation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. ARCHITECTURAL BENTO GRID ─── */}
      <section className="min-bento-section" id="capabilities">
        <div className="min-container">
          <div className="min-section-header">
            <div className="min-section-kicker">ENGINEERED ARCHITECTURE</div>
            <h2 className="min-section-title">Mission-Critical Incident Coordination</h2>
            <p className="min-section-desc">
              Every component is built to eliminate supply stockpiling, prevent missing parcels, 
              and direct rescue teams straight to acute flood zones.
            </p>
          </div>

          <div className="min-bento-grid">
            {/* Card 1: 1-Tap Geolocation */}
            <div className="min-bento-card min-span-8">
              <div>
                <div className="min-card-icon">
                  <MdDirectionsRun />
                </div>
                <h3 className="min-card-title">1-Tap Precision Geolocation Beacon</h3>
                <p className="min-card-desc">
                  Stranded citizens in rising water transmit precision WGS84 coordinates instantly with 1 tap. 
                  No address typing, no manual forms. Captures live camera frames, current water level, and dependent counts 
                  to prioritize vulnerable families first.
                </p>
              </div>
              <div className="card-footer-action">
                <span className="card-footer-note">Operates seamlessly over low-bandwidth mobile networks</span>
                <Link to="/register?role=VICTIM" className="min-btn min-btn-outline card-link-sm">
                  Report Emergency <MdArrowForward />
                </Link>
              </div>
            </div>

            {/* Card 2: AI Computer Vision */}
            <div className="min-bento-card min-span-4">
              <div>
                <div className="min-card-icon">
                  <MdAutoAwesome />
                </div>
                <h3 className="min-card-title">AI Computer Vision Severity</h3>
                <p className="min-card-desc">
                  Analyzes uploaded flood imagery using deep learning to score water severity from 1.0 to 10.0, 
                  identifying structural risk and rooftop evacuation urgency automatically.
                </p>
              </div>
              <div className="card-footer-simple">
                <span>Autonomous visual triage & classification</span>
              </div>
            </div>

            {/* Card 3: Cryptographic PIN */}
            <div className="min-bento-card min-span-4">
              <div>
                <div className="min-card-icon">
                  <MdVpnKey />
                </div>
                <h3 className="min-card-title">Cryptographic 6-Digit Handshake</h3>
                <p className="min-card-desc">
                  Eliminates missing disaster supplies. When donors dispatch items, a unique 6-digit PIN is locked to that donation. 
                  Receiving NGOs must physically enter this PIN to verify delivery into inventory.
                </p>
              </div>
              <div className="card-footer-simple">
                <span>100% chain-of-custody proof</span>
              </div>
            </div>

            {/* Card 4: Real-time GIS Heatmap */}
            <div className="min-bento-card min-span-8">
              <div>
                <div className="min-card-icon">
                  <MdMap />
                </div>
                <h3 className="min-card-title">Live GIS Spatial Cluster Heatmap</h3>
                <p className="min-card-desc">
                  Aggregates incoming distress reports into color-coded flood clusters. NGO rescue squads and government triage teams 
                  inspect density hotspots before deploying boats, avoiding duplicate sweeps and isolated pockets.
                </p>
              </div>
              <div className="card-footer-action">
                <span className="card-footer-note">Real-time Leaflet GIS clustering engine</span>
                <Link to="/login" className="min-btn min-btn-outline card-link-sm">
                  Explore Incident Map <MdArrowForward />
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
            <div className="min-section-kicker">DISPATCH DIRECTORY</div>
            <h2 className="min-section-title">Structured Roles Across the Relief Network</h2>
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
                      <h4>Capture Photo for AI Severity Scoring</h4>
                      <p>Snap a camera frame of the flood depth. The AI evaluates severity (1-10) and flags structural hazard.</p>
                    </div>
                  </div>
                  <div className="min-step-row">
                    <div className="min-step-num">3</div>
                    <div className="min-step-body">
                      <h4>Direct Broadcast to Rescue Squads</h4>
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
                      <h4>Browse Verified Shortages by Flood Sector</h4>
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

            {/* Architecture Telemetry Box */}
            <div className="architecture-specs-box">
              <div className="specs-title">SYSTEM ARCHITECTURE SPECIFICATION</div>
              <div className="specs-stack">
                <div className="spec-card">
                  <div className="spec-head">
                    <span>Cryptographic Handshake</span>
                    <span className="spec-status green">VERIFIED</span>
                  </div>
                  <p className="spec-text">
                    Physical receipt is strictly protected: recipient NGO must match the donor's 6-digit PIN before the database marks DELIVERED.
                  </p>
                </div>

                <div className="spec-card">
                  <div className="spec-head">
                    <span>Spatial Precision</span>
                    <span className="spec-status blue">WGS84 RESOLVED</span>
                  </div>
                  <p className="spec-text">
                    High-accuracy coordinates linked directly to distress records for precise boat navigation and drone drops.
                  </p>
                </div>

                <div className="spec-card">
                  <div className="spec-head">
                    <span>Computer Vision Pipeline</span>
                    <span className="spec-status purple">LIVE SCORING</span>
                  </div>
                  <p className="spec-text">
                    Deep neural net processes flood imagery to compute water depth, debris velocity, and hazard scores (1.0 to 10.0).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. PROTOCOL COMPARISON ─── */}
      <section className="min-comparison-section" id="comparison">
        <div className="min-container">
          <div className="min-section-header">
            <div className="min-section-kicker">PROTOCOL INTEGRITY</div>
            <h2 className="min-section-title">Why Traditional Charity Fails in Crises</h2>
            <p className="min-section-desc">
              A direct comparison between legacy uncoordinated relief efforts and the ResQFlow verified protocol.
            </p>
          </div>

          <div className="min-comp-grid">
            <div className="min-comp-card">
              <h3 className="min-comp-title" style={{ color: '#dc2626' }}>
                <MdClose /> Legacy Uncoordinated Relief
              </h3>
              <ul className="min-comp-list">
                <li className="min-comp-item">
                  <MdClose className="comp-icon red" />
                  <span><strong>Blind Donating:</strong> Citizens send items without knowing if the local camp already has hundreds of them.</span>
                </li>
                <li className="min-comp-item">
                  <MdClose className="comp-icon red" />
                  <span><strong>High Supply Leakage:</strong> Goods pile up in unmonitored warehouses with zero chain of custody or proof of receipt.</span>
                </li>
                <li className="min-comp-item">
                  <MdClose className="comp-icon red" />
                  <span><strong>Phone Gridlock:</strong> Emergency phone lines become overwhelmed, leaving stranded victims unable to send GPS coordinates.</span>
                </li>
              </ul>
            </div>

            <div className="min-comp-card highlight">
              <h3 className="min-comp-title" style={{ color: '#16a34a' }}>
                <MdCheck /> ResQFlow Verified Protocol
              </h3>
              <ul className="min-comp-list">
                <li className="min-comp-item">
                  <MdCheck className="comp-icon green" />
                  <span><strong>Targeted Shortage Matching:</strong> NGOs request exact supply quantities tied directly to verified flood sectors.</span>
                </li>
                <li className="min-comp-item">
                  <MdCheck className="comp-icon green" />
                  <span><strong>6-Digit Handshake PIN:</strong> Delivery status cannot be marked complete without physical code verification.</span>
                </li>
                <li className="min-comp-item">
                  <MdCheck className="comp-icon green" />
                  <span><strong>Autonomous GIS Heatmap:</strong> Distress beacons automatically populate the live tactical map in under two seconds.</span>
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
              Join disaster responders, registered relief NGOs, and proactive donors coordinating 
              flood emergency logistics with 100% verified delivery accountability.
            </p>
            <div className="min-cta-actions">
              <Link to="/register?role=VICTIM" className="min-btn min-btn-danger min-btn-lg">
                <MdDirectionsRun /> Report Emergency SOS
              </Link>
              <Link to="/register?role=DONOR" className="min-btn min-btn-outline min-btn-lg" style={{ background: '#ffffff', color: '#09090b' }}>
                <MdVolunteerActivism /> Join as Relief Donor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. ARCHITECTURAL FOOTER ─── */}
      <footer className="min-footer">
        <div className="min-container">
          <div className="min-footer-grid">
            <div className="min-footer-col">
              <div className="footer-brand-row">
                <div className="min-brand-icon" style={{ width: '26px', height: '26px', fontSize: '0.9rem' }}>
                  <MdShield />
                </div>
                <span className="footer-brand-title">ResQFlow</span>
              </div>
              <p className="footer-tagline">
                Emergency flood rescue & relief logistics network. Real-time GIS incident clustering, 
                computer-vision damage triage, and verified delivery handoffs.
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
                <li><a href="#telemetry-console">GIS Heatmap Telemetry</a></li>
              </ul>
            </div>
          </div>

          <div className="min-footer-bottom">
            <div>
              © {new Date().getFullYear()} ResQFlow Disaster Management System.
            </div>
            <div className="footer-badges">
              <span>7 High-Availability Cloud Microservices</span>
              <span className="dot-sep">•</span>
              <span>WGS84 GPS Precision</span>
              <span className="dot-sep">•</span>
              <span>Secure JWT Architecture</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
