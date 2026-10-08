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
    <div className="tapdaa-landing">
      <div className="tapdaa-content-layer">

        {/* ─── 1. FLOATING PILL NAVBAR ─── */}
        <div className="tapdaa-nav-wrapper">
          <nav className="tapdaa-nav-island">
            <Link to="/" className="tapdaa-nav-brand">
              <div className="tapdaa-brand-icon">🌊</div>
              <span className="tapdaa-brand-title">FloodAid</span>
              <span className="tapdaa-brand-tag">( ͡❛ ͜ʖ ͡❛) v2.0</span>
            </Link>

            <div className="tapdaa-nav-menu">
              <a href="#how-it-works" className="tapdaa-nav-link">How It Works</a>
              <a href="#capabilities" className="tapdaa-nav-link">Capabilities</a>
              <a href="#comparison" className="tapdaa-nav-link">Why FloodAid</a>
              <a href="#roles" className="tapdaa-nav-link">For Responders</a>
            </div>

            <div className="tapdaa-nav-ctas">
              {token ? (
                <button onClick={handleDashboardRedirect} className="tapdaa-btn tapdaa-btn-ink tapdaa-btn-sm">
                  <MdShield /> My Dashboard ↗
                </button>
              ) : (
                <>
                  <Link to="/login" className="tapdaa-btn tapdaa-btn-ghost tapdaa-btn-sm">
                    <MdLogin /> Sign In
                  </Link>
                  <Link to="/register?role=VICTIM" className="tapdaa-btn tapdaa-btn-ink tapdaa-btn-sm">
                    <MdDirectionsRun /> SOS Report ↗
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>

        {/* ─── 2. HERO SECTION ─── */}
        <section className="tapdaa-hero">
          <div className="tapdaa-container">
            {/* Top Sticker Pill */}
            <div className="tapdaa-hero-sticker-pill">
              <span className="tapdaa-pulse-dot" />
              <span>Real-Time Disaster Response Network ( ͡❛ ͜ʖ ͡❛)</span>
            </div>

            {/* Massive Chunky Headline */}
            <h1 className="tapdaa-hero-title">
              Mobilizing flood relief is as quick and simple as a <span className="lime-highlight">tap.</span>
            </h1>

            {/* Subtitle */}
            <p className="tapdaa-hero-subtitle">
              When floodwaters rise, bureaucracy fails. Connect stranded citizens, verified ground NGOs, 
              and generous donors on a single real-time GIS map — with cryptographic delivery verification.
            </p>

            {/* CTA Button Row */}
            <div className="tapdaa-hero-actions">
              <Link to="/register?role=VICTIM" className="tapdaa-btn tapdaa-btn-ink tapdaa-btn-lg">
                <MdDirectionsRun /> Report SOS Emergency ↗
              </Link>
              <Link to="/register?role=DONOR" className="tapdaa-btn tapdaa-btn-lime tapdaa-btn-lg">
                <MdVolunteerActivism /> Donate Relief Supplies ↗
              </Link>
              <a href="tel:112" className="tapdaa-btn tapdaa-btn-ghost tapdaa-btn-lg" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#b91c1c' }}>
                <MdPhoneInTalk /> Emergency Hotline (112)
              </a>
            </div>

            {/* Chunky Sticker Tag Pills (Tapdaa signature) */}
            <div className="tapdaa-tags-marquee">
              <div className="tapdaa-tag-card tag-lime">
                <MdLocationOn /> 1-Tap GPS Distress Beacon
              </div>
              <div className="tapdaa-tag-card tag-lilac">
                <MdMap /> Live Severity Heatmap (1–10)
              </div>
              <div className="tapdaa-tag-card tag-sky">
                <MdVpnKey /> 6-Digit Delivery Handoff PIN
              </div>
              <div className="tapdaa-tag-card tag-peach">
                <MdLocalShipping /> Direct Courier & Hub Drop-off
              </div>
            </div>

            {/* ─── 3. HERO SHOWCASE FRAME (Device Mockup) ─── */}
            <div className="tapdaa-showcase-frame">
              <div className="tapdaa-showcase-topbar">
                <div className="tapdaa-showcase-dots">
                  <span className="tapdaa-showcase-dot red" />
                  <span className="tapdaa-showcase-dot yellow" />
                  <span className="tapdaa-showcase-dot green" />
                </div>
                <div className="tapdaa-showcase-title-chip">
                  FLOODAID DISASTER DISPATCH GRID • LIVE FEED
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
                  MICROSERVICES SYNCED
                </div>
              </div>

              <div className="tapdaa-showcase-grid">
                {/* Left Radar Simulation */}
                <div className="tapdaa-radar-box">
                  <div className="tapdaa-radar-header">
                    <span className="tapdaa-radar-title">
                      <MdLocationOn style={{ color: '#0284c7' }} /> Sector 4 Flood Hotspot
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '9999px' }}>
                      CRITICAL RISK • 8.4/10
                    </span>
                  </div>

                  <div className="tapdaa-radar-pings">
                    <div className="tapdaa-radar-ring ring-1" />
                    <div className="tapdaa-radar-ring ring-2" />
                    <div className="tapdaa-radar-ring ring-3" />
                    <div className="tapdaa-radar-center-ping">
                      <MdWarning /> 14 Active Distress Reports
                    </div>
                  </div>

                  <div className="tapdaa-radar-bottom">
                    <span>GPS: 28.7041° N, 77.1025° E</span>
                    <span>Water Level: +4.2 ft (Rising)</span>
                  </div>
                </div>

                {/* Right Pipeline Simulation */}
                <div className="tapdaa-mockup-flow">
                  {/* Step 1: Donor Pledge */}
                  <div className="tapdaa-mockup-item">
                    <div className="mockup-item-header">
                      <span className="mockup-tag mockup-tag-lime">Step 1: Pledged</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Just Now</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>50x Inflatable Life Jackets</div>
                    <div style={{ fontSize: '0.775rem', color: '#64748b' }}>By Donor: Ananya S. &rarr; Red Cross Hub</div>
                  </div>

                  {/* Step 2: Dispatched */}
                  <div className="tapdaa-mockup-item">
                    <div className="mockup-item-header">
                      <span className="mockup-tag mockup-tag-lilac">Step 2: Dispatched</span>
                      <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 800 }}>In Transit</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>BlueDart Express #BD-98234123</div>
                    <div className="mockup-pin-box">
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                        <MdVpnKey style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Handoff PIN:
                      </span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#1e3a8a', letterSpacing: '2px' }}>
                        849201
                      </span>
                    </div>
                  </div>

                  {/* Step 3: Verified Delivered */}
                  <div className="tapdaa-mockup-item" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
                    <div className="mockup-item-header">
                      <span className="mockup-tag" style={{ background: '#22c55e', color: '#fff' }}>Step 3: Verified</span>
                      <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 800 }}>DELIVERED</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#14532d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MdCheckCircle /> PIN 849201 Confirmed on Physical Handoff
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. METRICS / NUMBERS STRIP ─── */}
        <section className="tapdaa-metrics-bar">
          <div className="tapdaa-container">
            <div className="tapdaa-metrics-grid">
              <div>
                <div className="tapdaa-metric-stat">100%</div>
                <div className="tapdaa-metric-label">PIN Verified Handoffs</div>
              </div>
              <div>
                <div className="tapdaa-metric-stat">&lt; 2 min</div>
                <div className="tapdaa-metric-label">SOS Broadcast to GIS Map</div>
              </div>
              <div>
                <div className="tapdaa-metric-stat">0%</div>
                <div className="tapdaa-metric-label">Middleman Waste</div>
              </div>
              <div>
                <div className="tapdaa-metric-stat">24/7</div>
                <div className="tapdaa-metric-label">High-Availability Microservices</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5. BENTO GRID (The Modular Tapdaa Color Cards) ─── */}
        <section className="tapdaa-bento-section" id="capabilities">
          <div className="tapdaa-container">
            <div className="tapdaa-section-head">
              <div className="tapdaa-section-pill">Core Engine Capabilities</div>
              <h2 className="tapdaa-section-title">Engineered for pure speed when seconds determine survival.</h2>
              <p className="tapdaa-section-desc">
                No complex forms, no lost donations, and no bureaucratic red tape. Pure, verifiable relief coordination.
              </p>
            </div>

            <div className="tapdaa-bento-grid">
              {/* Card 1: Lime */}
              <div className="tapdaa-bento-card col-8 card-lime">
                <div>
                  <div className="bento-card-badge">Instant SOS Broadcast</div>
                  <h3 className="bento-card-title">1-Tap GPS Distress Beacon</h3>
                  <p className="bento-card-text">
                    Victims stranded by floodwaters simply tap SOS. The platform grabs precision GPS coordinates, 
                    water depth levels, stranded family headcounts, and immediate medical flags.
                  </p>
                </div>
                <div className="bento-card-footer">
                  <span style={{ fontWeight: 800 }}>Built for low bandwidth & poor connectivity</span>
                  <Link to="/register?role=VICTIM" className="tapdaa-btn tapdaa-btn-ink tapdaa-btn-sm">
                    Report SOS ↗
                  </Link>
                </div>
              </div>

              {/* Card 2: Lilac */}
              <div className="tapdaa-bento-card col-4 card-lilac">
                <div>
                  <div className="bento-card-badge">Smart GIS Clustering</div>
                  <h3 className="bento-card-title">Dynamic Flood Heatmap</h3>
                  <p className="bento-card-text">
                    Automated severity clustering groups distress pings into color-coded danger zones (1 to 10 scale).
                  </p>
                </div>
                <div className="bento-card-footer">
                  <Link to="/login" className="tapdaa-btn tapdaa-btn-ink tapdaa-btn-sm">
                    View Map ↗
                  </Link>
                </div>
              </div>

              {/* Card 3: Sky Blue */}
              <div className="tapdaa-bento-card col-4 card-sky">
                <div>
                  <div className="bento-card-badge">Zero Fraud Logistics</div>
                  <h3 className="bento-card-title">6-Digit Delivery Handoff PIN</h3>
                  <p className="bento-card-text">
                    Every donation generates a private cryptographic PIN. NGOs must enter this code upon receiving supplies to mark them verified.
                  </p>
                </div>
                <div className="bento-card-footer">
                  <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>100% Physical Audit Trail</span>
                </div>
              </div>

              {/* Card 4: Dark Card */}
              <div className="tapdaa-bento-card col-8 card-dark">
                <div>
                  <div className="bento-card-badge">Decentralized Supply Chain</div>
                  <h3 className="bento-card-title" style={{ color: '#fff' }}>
                    Direct Donor &rarr; NGO Relief Hub Pledges
                  </h3>
                  <p className="bento-card-text" style={{ color: '#a1b2a6' }}>
                    NGOs create targeted requests tied directly to active flood zones. Donors fulfill the exact items needed 
                    (life jackets, water filters, dry rations) and attach real courier tracking numbers or self drop-off notes.
                  </p>
                </div>
                <div className="bento-card-footer">
                  <span style={{ color: 'var(--tapdaa-lime)', fontWeight: 800 }}>Zero warehouse stockpiling</span>
                  <Link to="/register?role=DONOR" className="tapdaa-btn tapdaa-btn-lime tapdaa-btn-sm">
                    Browse Requests ↗
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. OBJECTION HANDLING: OLD WAY vs FLOODAID ─── */}
        <section className="tapdaa-comparison-section" id="comparison">
          <div className="tapdaa-container">
            <div className="tapdaa-section-head">
              <div className="tapdaa-section-pill">Why Traditional Charity Fails</div>
              <h2 className="tapdaa-section-title">Traditional Disaster Relief vs. FloodAid</h2>
              <p className="tapdaa-section-desc">
                See why decentralized, PIN-verified microservices outperform legacy bureaucratic aid distribution.
              </p>
            </div>

            <div className="tapdaa-comparison-grid">
              {/* Bad Old Way */}
              <div className="tapdaa-comp-card comp-card-bad">
                <h3 className="comp-title" style={{ color: '#9a3412' }}>
                  <MdClose className="comp-icon-bad" /> The Old Bureaucratic Way
                </h3>
                <ul className="comp-list">
                  <li className="comp-item">
                    <MdClose className="comp-icon-bad" />
                    <span><strong>Blind Donations:</strong> Donors send random items that rot in transit while critical medicine is missing.</span>
                  </li>
                  <li className="comp-item">
                    <MdClose className="comp-icon-bad" />
                    <span><strong>Unverified Handoffs:</strong> Up to 30% of relief packages disappear with zero accountability or proof of receipt.</span>
                  </li>
                  <li className="comp-item">
                    <MdClose className="comp-icon-bad" />
                    <span><strong>Panic Phone Overload:</strong> Emergency hotlines get congested; rescue teams don't have accurate GPS coordinates.</span>
                  </li>
                  <li className="comp-item">
                    <MdClose className="comp-icon-bad" />
                    <span><strong>No Real-Time Map:</strong> Ground responders don't know where water levels are highest until it's too late.</span>
                  </li>
                </ul>
              </div>

              {/* Good FloodAid Way */}
              <div className="tapdaa-comp-card comp-card-good">
                <h3 className="comp-title" style={{ color: '#166534' }}>
                  <MdCheck className="comp-icon-good" /> The FloodAid Way (Instant & Verified)
                </h3>
                <ul className="comp-list">
                  <li className="comp-item">
                    <MdCheck className="comp-icon-good" />
                    <span><strong>Targeted Zone Matching:</strong> NGOs only request exact quantities linked directly to active flood severity sectors.</span>
                  </li>
                  <li className="comp-item">
                    <MdCheck className="comp-icon-good" />
                    <span><strong>Cryptographic 6-Digit PIN:</strong> Supplies cannot be marked delivered until on-ground workers input the donor's security code.</span>
                  </li>
                  <li className="comp-item">
                    <MdCheck className="comp-icon-good" />
                    <span><strong>Instant GIS Heatmap:</strong> Distress reports instantly update the public radar with automated 1–10 risk ratings.</span>
                  </li>
                  <li className="comp-item">
                    <MdCheck className="comp-icon-good" />
                    <span><strong>Direct Shipment Tracking:</strong> Donors link BlueDart, DTDC, FedEx, or self drop-off details directly in app.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. INTERACTIVE ROLE TABS / WALKTHROUGHS ─── */}
        <section className="tapdaa-roles-section" id="roles">
          <div className="tapdaa-container">
            <div className="tapdaa-section-head">
              <div className="tapdaa-section-pill">Tailored for Every Actor</div>
              <h2 className="tapdaa-section-title">How It Works in 3 Quick Steps</h2>
              <p className="tapdaa-section-desc">
                Choose your role to see how FloodAid streamlines emergency coordination.
              </p>
            </div>

            {/* Role Tab Buttons */}
            <div className="tapdaa-tabs-pill-row">
              <button
                className={`tapdaa-tab-pill ${activeRoleTab === 'VICTIM' ? 'active' : ''}`}
                onClick={() => setActiveRoleTab('VICTIM')}
              >
                🚨 For Stranded Victims
              </button>
              <button
                className={`tapdaa-tab-pill ${activeRoleTab === 'DONOR' ? 'active' : ''}`}
                onClick={() => setActiveRoleTab('DONOR')}
              >
                📦 For Relief Donors
              </button>
              <button
                className={`tapdaa-tab-pill ${activeRoleTab === 'NGO' ? 'active' : ''}`}
                onClick={() => setActiveRoleTab('NGO')}
              >
                🏢 For On-Ground NGOs
              </button>
            </div>

            {/* Active Tab Preview Card */}
            <div className="tapdaa-role-preview-card">
              <div className="role-preview-info">
                {activeRoleTab === 'VICTIM' && (
                  <>
                    <div className="bento-card-badge">Victim Flow</div>
                    <h3>Broadcast your distress in 10 seconds.</h3>
                    <p>
                      Your phone detects current GPS coordinates. Select water level severity and submit.
                      Emergency teams nearby are instantly alerted on the live heatmap.
                    </p>
                    <div className="role-step-list">
                      <div className="role-step-row">
                        <span className="role-step-num">1</span>
                        <span>Open FloodAid and tap "Report SOS Emergency".</span>
                      </div>
                      <div className="role-step-row">
                        <span className="role-step-num">2</span>
                        <span>Auto-capture GPS and state stranded family count.</span>
                      </div>
                      <div className="role-step-row">
                        <span className="role-step-num">3</span>
                        <span>Get pinned to the official disaster relief radar.</span>
                      </div>
                    </div>
                    <Link to="/register?role=VICTIM" className="tapdaa-btn tapdaa-btn-ink">
                      Submit Distress Signal ↗
                    </Link>
                  </>
                )}

                {activeRoleTab === 'DONOR' && (
                  <>
                    <div className="bento-card-badge">Donor Flow</div>
                    <h3>Send supplies directly with zero leakage.</h3>
                    <p>
                      Browse real-time NGO supply shortages linked to flood sectors. Pledge items, 
                      courier them to the designated regional hub, and get a 6-digit confirmation PIN.
                    </p>
                    <div className="role-step-list">
                      <div className="role-step-row">
                        <span className="role-step-num">1</span>
                        <span>Filter requests by flood location and needed items.</span>
                      </div>
                      <div className="role-step-row">
                        <span className="role-step-num">2</span>
                        <span>Pledge quantity & dispatch via courier with tracking ID.</span>
                      </div>
                      <div className="role-step-row">
                        <span className="role-step-num">3</span>
                        <span>NGO enters your 6-digit PIN on delivery & confirms receipt.</span>
                      </div>
                    </div>
                    <Link to="/register?role=DONOR" className="tapdaa-btn tapdaa-btn-ink">
                      Join as Donor ↗
                    </Link>
                  </>
                )}

                {activeRoleTab === 'NGO' && (
                  <>
                    <div className="bento-card-badge">NGO Flow</div>
                    <h3>Manage relief inventory & verify physical arrivals.</h3>
                    <p>
                      Inspect flood hazard zones, set up targeted supply requests for relief camps, 
                      and verify each delivered box using the donor's 6-digit handoff PIN.
                    </p>
                    <div className="role-step-list">
                      <div className="role-step-row">
                        <span className="role-step-num">1</span>
                        <span>Inspect heatmap clusters and create resource request.</span>
                      </div>
                      <div className="role-step-row">
                        <span className="role-step-num">2</span>
                        <span>Accept incoming pledges and track carrier shipments.</span>
                      </div>
                      <div className="role-step-row">
                        <span className="role-step-num">3</span>
                        <span>Verify receipt via 6-digit code upon physical handoff.</span>
                      </div>
                    </div>
                    <Link to="/register?role=NGO" className="tapdaa-btn tapdaa-btn-ink">
                      Register NGO ↗
                    </Link>
                  </>
                )}
              </div>

              {/* Visual Mockup inside Role Card */}
              <div className="role-preview-mock">
                {activeRoleTab === 'VICTIM' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: '#fee2e2', border: '1.5px solid #fca5a5', padding: '1rem', borderRadius: '12px' }}>
                      <div style={{ fontWeight: 800, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MdWarning /> ACTIVE DISTRESS BEACON
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#7f1d1d', marginTop: '4px' }}>
                        Location: 28.704° N, 77.102° E • 4 Stranded
                      </div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid var(--tapdaa-border)', fontSize: '0.825rem' }}>
                      <div style={{ fontWeight: 700 }}>Dispatch Status:</div>
                      <div style={{ color: '#0284c7', fontWeight: 800, marginTop: '2px' }}>
                        Nearby NGO Response Team Alerted
                      </div>
                    </div>
                  </div>
                )}

                {activeRoleTab === 'DONOR' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', padding: '1rem', borderRadius: '12px' }}>
                      <div style={{ fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MdLocalShipping /> SHIPMENT IN TRANSIT
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#14532d', marginTop: '4px' }}>
                        Carrier: BlueDart (#BD-89234821)
                      </div>
                    </div>
                    <div style={{ background: '#eff6ff', border: '1.5px dashed #93c5fd', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af' }}>
                        YOUR 6-DIGIT HANDOFF PIN:
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '4px', color: '#1e3a8a', marginTop: '4px' }}>
                        729104
                      </div>
                    </div>
                  </div>
                )}

                {activeRoleTab === 'NGO' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: '#ffffff', border: '1.5px solid var(--tapdaa-border)', padding: '1rem', borderRadius: '12px' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Verify Delivery Receipt</div>
                      <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '2px' }}>
                        Item: 100x Clean Water Bottles (20L)
                      </div>
                      <div style={{ marginTop: '0.75rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 800, textAlign: 'center', letterSpacing: '3px' }}>
                        [ 7 2 9 1 0 4 ]
                      </div>
                    </div>
                    <div style={{ background: '#f0fdf4', color: '#166534', padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MdCheckCircle /> Verified and added to field inventory
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 8. CALL TO ACTION ISLAND (Tapdaa Dark Banner) ─── */}
        <section className="tapdaa-cta-section">
          <div className="tapdaa-container">
            <div className="tapdaa-cta-island">
              <h2 className="tapdaa-cta-title">
                Be the lifeline someone is waiting for.
              </h2>
              <p className="tapdaa-cta-subtitle">
                Join thousands of citizens, volunteers, and certified NGOs building a faster, 
                100% verified disaster response grid.
              </p>
              <div className="tapdaa-cta-buttons">
                <Link to="/register?role=VICTIM" className="tapdaa-btn tapdaa-btn-lime tapdaa-btn-lg">
                  <MdDirectionsRun /> Report SOS Emergency ↗
                </Link>
                <Link to="/register?role=DONOR" className="tapdaa-btn tapdaa-btn-ghost tapdaa-btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}>
                  <MdVolunteerActivism /> Join as Relief Donor ↗
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 9. EDITORIAL FOOTER ─── */}
        <footer className="tapdaa-footer">
          <div className="tapdaa-container">
            <div className="tapdaa-footer-grid">
              <div className="tapdaa-footer-col">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🌊</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.04em' }}>FloodAid</span>
                </div>
                <p style={{ color: 'var(--tapdaa-ink-muted)', fontSize: '0.9rem', maxWidth: '320px', lineHeight: 1.6 }}>
                  Decentralized real-time flood monitoring, GIS heatmap dispatch, and verified relief logistics.
                </p>
                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                  <span className="tapdaa-brand-tag">Open Architecture</span>
                  <span className="tapdaa-brand-tag">Zero Red Tape</span>
                </div>
              </div>

              <div className="tapdaa-footer-col">
                <h4>Stranded Citizens</h4>
                <ul>
                  <li><Link to="/register?role=VICTIM">Submit SOS Signal</Link></li>
                  <li><Link to="/login">Victim Portal Login</Link></li>
                  <li><a href="tel:112">Emergency Dispatch: 112</a></li>
                  <li><a href="tel:108">Medical Ambulance: 108</a></li>
                </ul>
              </div>

              <div className="tapdaa-footer-col">
                <h4>Relief Donors</h4>
                <ul>
                  <li><Link to="/register?role=DONOR">Register as Donor</Link></li>
                  <li><Link to="/login">Donor Portal Login</Link></li>
                  <li><a href="#capabilities">How Verification Works</a></li>
                  <li><a href="#comparison">Transparency Model</a></li>
                </ul>
              </div>

              <div className="tapdaa-footer-col">
                <h4>Ground NGOs</h4>
                <ul>
                  <li><Link to="/register?role=NGO">Register Relief NGO</Link></li>
                  <li><Link to="/login">NGO Dashboard Login</Link></li>
                  <li><Link to="/login">Admin Security Portal</Link></li>
                  <li><a href="#how-it-works">API Documentation</a></li>
                </ul>
              </div>
            </div>

            <div className="tapdaa-footer-bottom">
              <div>
                © {new Date().getFullYear()} FloodAid. Built for emergency response resilience.
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <span>( ͡❛ ͜ʖ ͡❛) Designed with Tapdaa aesthetic</span>
                <span>All microservices operational</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default LandingPage;
