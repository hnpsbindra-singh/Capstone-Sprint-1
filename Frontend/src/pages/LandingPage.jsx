import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';
import {
  MdShield,
  MdLocationOn,
  MdCheckCircle,
  MdArrowForward,
  MdMap,
  MdDirectionsRun,
  MdVolunteerActivism,
  MdAutoAwesome,
  MdVpnKey,
  MdSensors,
  MdCheck,
  MdClose,
  MdContentCopy,
  MdLocalShipping,
  MdLayers,
  MdFlashOn,
  MdLock
} from 'react-icons/md';

const SECTOR_DATA = [
  {
    id: 'SEC-01',
    name: 'Sector 01 // Yamuna Basin, Delhi',
    coords: '28.6712° N, 77.2341° E',
    waterDepth: '5.4 ft',
    severity: '8.7',
    severityLevel: 'CRITICAL',
    severityColor: '#ff3366',
    chartPath: 'M 0 160 Q 70 140, 140 100 T 280 80 T 420 40 T 560 30 T 700 20',
    areaPath: 'M 0 160 Q 70 140, 140 100 T 280 80 T 420 40 T 560 30 T 700 20 L 700 200 L 0 200 Z',
    neededSupplies: '30x Inflatable Life Vests • 120x Water Purification Tablets',
    carrier: 'DTDC Cargo Express #DT-948102',
    pin: '482-910',
    status: 'IN TRANSIT',
    assignedNgo: 'Delhi Civil Defence Depot 4',
    bids: [
      { item: '40x Inflatable Rafts', time: '14:38:02', carrier: 'DTDC Express', color: 'green' },
      { item: '120x Water Tabs', time: '14:35:19', carrier: 'BlueDart Air', color: 'green' },
      { item: '500x High-Calorie Packs', time: '14:31:44', carrier: 'Local Hub', color: 'green' }
    ],
    asks: [
      { item: '4 Elderly Trapped (Balcony)', time: '14:39:10', zone: 'Yamuna Lowlands', color: 'red' },
      { item: 'Submerged Ground Floor', time: '14:37:55', zone: 'Sector 01 Outer', color: 'red' },
      { item: 'Power Grid Severed', time: '14:33:12', zone: 'Yamuna East', color: 'red' }
    ]
  },
  {
    id: 'SEC-02',
    name: 'Sector 02 // Kaziranga Buffer, Assam',
    coords: '26.5775° N, 93.1711° E',
    waterDepth: '7.8 ft',
    severity: '9.4',
    severityLevel: 'CATASTROPHIC',
    severityColor: '#ff3366',
    chartPath: 'M 0 180 Q 70 150, 140 110 T 280 60 T 420 25 T 560 15 T 700 10',
    areaPath: 'M 0 180 Q 70 150, 140 110 T 280 60 T 420 25 T 560 15 T 700 10 L 700 200 L 0 200 Z',
    neededSupplies: '15x Heavy Rafts • 80x High-Calorie Rations',
    carrier: 'BlueDart Air Freight #BD-551029',
    pin: '719-304',
    status: 'VERIFIED DELIVERED',
    assignedNgo: 'Assam Riverine Relief Force',
    bids: [
      { item: '15x Heavy Duty Rafts', time: '14:36:20', carrier: 'BlueDart Air', color: 'green' },
      { item: '200x Trauma Packs', time: '14:32:05', carrier: 'Army Depot', color: 'green' },
      { item: '1,000x Pure Water Kits', time: '14:28:40', carrier: 'RedCross Hub', color: 'green' }
    ],
    asks: [
      { item: 'Embankment Breach +3.5kt', time: '14:38:40', zone: 'Brahmaputra South', color: 'red' },
      { item: 'Livestock Ring Isolated', time: '14:36:11', zone: 'Buffer Zone B', color: 'red' },
      { item: 'Medical Hub Inundated', time: '14:30:02', zone: 'Kaziranga Core', color: 'red' }
    ]
  },
  {
    id: 'SEC-03',
    name: 'Sector 03 // Wayanad Slopes, Kerala',
    coords: '11.6854° N, 76.1320° E',
    waterDepth: '3.9 ft',
    severity: '7.2',
    severityLevel: 'HIGH',
    severityColor: '#f59e0b',
    chartPath: 'M 0 150 Q 80 130, 160 120 T 320 90 T 480 60 T 600 45 T 700 35',
    areaPath: 'M 0 150 Q 80 130, 160 120 T 320 90 T 480 60 T 600 45 T 700 35 L 700 200 L 0 200 Z',
    neededSupplies: '200x Sterile First-Aid Kits • Baby Nutrition Formula',
    carrier: 'Direct Volunteer Vehicle #VOL-882194',
    pin: '502-831',
    status: 'DEPOT ACCEPTED',
    assignedNgo: 'Wayanad Community Relief Hub',
    bids: [
      { item: '200x First-Aid Trauma Kits', time: '14:35:50', carrier: 'Direct Van', color: 'green' },
      { item: '80x Baby Formula Cartons', time: '14:30:15', carrier: 'Volunteer Fleet', color: 'green' },
      { item: '150x Woolen Thermal Blankets', time: '14:25:30', carrier: 'Express Van', color: 'green' }
    ],
    asks: [
      { item: 'Mudslide Blocked Highway', time: '14:37:12', zone: 'Wayanad Hillpass', color: 'red' },
      { item: 'Community Clinic Isolated', time: '14:34:08', zone: 'Slope Village 4', color: 'red' },
      { item: 'Infant Supplies Depleted', time: '14:29:45', zone: 'Shelter Hub Beta', color: 'red' }
    ]
  }
];

const LandingPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [selectedSectorIdx, setSelectedSectorIdx] = useState(0);
  const [timeframe, setTimeframe] = useState('24H');
  const [tradeMode, setTradeMode] = useState('DONOR'); // DONOR | VICTIM
  const [selectedSupply, setSelectedSupply] = useState('Life Vests (Class 1)');
  const [allocationQty, setAllocationQty] = useState(120);
  const [calcPledge, setCalcPledge] = useState(1500); // Resource impact calculator slider
  const [liveUtc, setLiveUtc] = useState('');
  const [activePinDemo, setActivePinDemo] = useState(['4', '8', '2', '9', '1', '0']);
  const [flashRow, setFlashRow] = useState(false);

  const currentSector = SECTOR_DATA[selectedSectorIdx];

  // Live UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveUtc(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Periodic Flash on Orderbook to evoke live high-frequency matching
  useEffect(() => {
    const flashInterval = setInterval(() => {
      setFlashRow((prev) => !prev);
    }, 2800);
    return () => clearInterval(flashInterval);
  }, []);

  const handleDashboardRedirect = () => {
    if (user?.role) navigate(`/${user.role.toLowerCase()}`);
    else navigate('/login');
  };

  // Simulated Order Execution Toast
  const handleExecuteAllocation = (e) => {
    e.preventDefault();
    const generatedPin = Math.floor(100000 + Math.random() * 900000);
    toast.success(
      `Pledge Confirmed! Dispatched ${allocationQty}x ${selectedSupply}. Handshake PIN: ${generatedPin}`,
      {
        duration: 4500,
        style: {
          background: '#0e121e',
          color: '#00f59b',
          border: '1px solid rgba(0, 245, 155, 0.4)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.8rem'
        }
      }
    );
  };

  // Copy API cURL Command
  const handleCopyCurl = () => {
    const cmd = `curl -X POST https://api-gateway.resqflow.org/api/reports \\\n  -H "Authorization: Bearer <JWT_TOKEN>" \\\n  -d '{"lat": 28.6712, "lng": 77.2341, "severity": "CRITICAL", "waterDepth": "5.4ft"}'`;
    navigator.clipboard.writeText(cmd);
    toast.success('API snippet copied to clipboard!', {
      style: {
        background: '#0e121e',
        color: '#00d2ff',
        border: '1px solid rgba(0, 210, 255, 0.4)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.8rem'
      }
    });
  };

  // Impact Calculations derived from calculator slider
  const calcMetrics = useMemo(() => {
    const citizensRescued = Math.round(calcPledge * 2.8);
    const avgResponseTime = calcPledge > 3000 ? '< 45 mins' : '< 90 mins';
    const kitsDelivered = Math.round(calcPledge / 12);
    return { citizensRescued, avgResponseTime, kitsDelivered };
  }, [calcPledge]);

  return (
    <div className="trade-landing">
      {/* Background Ambient Gradient Grid */}
      <div className="trade-ambient-bg" aria-hidden="true" />

      {/* ─── 1. CONTINUOUS ENGAGING TICKER TAPE ─── */}
      <div className="trade-ticker-bar">
        <div className="trade-ticker-track">
          {/* Loop items */}
          <div className="trade-ticker-item">
            <span className="trade-ticker-symbol">YAMUNA // SEC-01</span>
            <span className="trade-ticker-val">8.7 SEV</span>
            <span className="trade-ticker-badge badge-crimson">CRITICAL SOS</span>
            <span className="trade-ticker-sep">•</span>
          </div>
          <div className="trade-ticker-item">
            <span className="trade-ticker-symbol">INBOUND RELIEF</span>
            <span className="trade-ticker-val">14,850 UNITS</span>
            <span className="trade-ticker-badge badge-neon">LIQUID</span>
            <span className="trade-ticker-sep">•</span>
          </div>
          <div className="trade-ticker-item">
            <span className="trade-ticker-symbol">KAZIRANGA // SEC-02</span>
            <span className="trade-ticker-val">9.4 SEV</span>
            <span className="trade-ticker-badge badge-crimson">AIR-LIFT TRANSIT</span>
            <span className="trade-ticker-sep">•</span>
          </div>
          <div className="trade-ticker-item">
            <span className="trade-ticker-symbol">CUSTODY PIN INTEGRITY</span>
            <span className="trade-ticker-val">100.0%</span>
            <span className="trade-ticker-badge badge-neon">ZERO LOSS</span>
            <span className="trade-ticker-sep">•</span>
          </div>
          <div className="trade-ticker-item">
            <span className="trade-ticker-symbol">AI VISION INFERENCE</span>
            <span className="trade-ticker-val">&lt; 1.4s</span>
            <span className="trade-ticker-badge badge-cyan">DEEP LEARNING</span>
            <span className="trade-ticker-sep">•</span>
          </div>
          <div className="trade-ticker-item">
            <span className="trade-ticker-symbol">WAYANAD // SEC-03</span>
            <span className="trade-ticker-val">7.2 SEV</span>
            <span className="trade-ticker-badge badge-amber">DEPOT ACCEPTED</span>
            <span className="trade-ticker-sep">•</span>
          </div>
          <div className="trade-ticker-item">
            <span className="trade-ticker-symbol">ACTIVE SQUADRONS</span>
            <span className="trade-ticker-val">38 REGIONAL UNITS</span>
            <span className="trade-ticker-badge badge-neon">MOBILIZED</span>
            <span className="trade-ticker-sep">•</span>
          </div>

          {/* Duplicate buffer for seamless infinite marquee */}
          <div className="trade-ticker-item">
            <span className="trade-ticker-symbol">YAMUNA // SEC-01</span>
            <span className="trade-ticker-val">8.7 SEV</span>
            <span className="trade-ticker-badge badge-crimson">CRITICAL SOS</span>
            <span className="trade-ticker-sep">•</span>
          </div>
          <div className="trade-ticker-item">
            <span className="trade-ticker-symbol">INBOUND RELIEF</span>
            <span className="trade-ticker-val">14,850 UNITS</span>
            <span className="trade-ticker-badge badge-neon">LIQUID</span>
            <span className="trade-ticker-sep">•</span>
          </div>
          <div className="trade-ticker-item">
            <span className="trade-ticker-symbol">KAZIRANGA // SEC-02</span>
            <span className="trade-ticker-val">9.4 SEV</span>
            <span className="trade-ticker-badge badge-crimson">AIR-LIFT TRANSIT</span>
            <span className="trade-ticker-sep">•</span>
          </div>
          <div className="trade-ticker-item">
            <span className="trade-ticker-symbol">CUSTODY PIN INTEGRITY</span>
            <span className="trade-ticker-val">100.0%</span>
            <span className="trade-ticker-badge badge-neon">ZERO LOSS</span>
            <span className="trade-ticker-sep">•</span>
          </div>
        </div>
      </div>

      {/* ─── 2. CYBERPUNK / FINTECH NAVBAR ─── */}
      <header className="trade-navbar">
        <div className="trade-container trade-nav-inner">
          <Link to="/" className="trade-nav-brand">
            <div className="trade-brand-logo">
              <MdShield size={20} />
            </div>
            <div>
              <span className="trade-brand-name">ResQFlow</span>
              <span className="trade-brand-tag">EXCHANGE</span>
            </div>
          </Link>

          <nav className="trade-nav-links">
            <a href="#terminal" className="trade-nav-link">Terminal</a>
            <a href="#calculator" className="trade-nav-link">Impact Calculator</a>
            <a href="#capabilities" className="trade-nav-link">Architecture</a>
            <a href="#comparison" className="trade-nav-link">Protocol Integrity</a>
            <a href="#developer" className="trade-nav-link">API Terminal</a>
          </nav>

          <div className="trade-nav-actions">
            {token ? (
              <button onClick={handleDashboardRedirect} className="trade-btn trade-btn-neon">
                <MdShield /> Command Deck
              </button>
            ) : (
              <>
                <Link to="/login" className="trade-btn trade-btn-glass">
                  Sign In
                </Link>
                <Link to="/register?role=VICTIM" className="trade-btn trade-btn-crimson">
                  <MdDirectionsRun /> Report SOS
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── 3. HIGH-IMPACT HERO SECTION ─── */}
      <section className="trade-hero">
        <div className="trade-container">
          <div className="trade-hero-badge">
            <span className="pulse-dot-green" />
            <span>HIGH-FREQUENCY DISASTER LOGISTICS PROTOCOL v2.4</span>
          </div>

          <h1 className="trade-hero-title">
            The Decentralized Relief Exchange. <br />
            <span className="trade-title-gradient">Distress Beacon to Verified Handshake.</span>
          </h1>

          <p className="trade-hero-sub">
            Sub-second distress telemetry, autonomous computer vision severity triage, and institutional-grade 
            6-digit delivery verification. Converting raw donor empathy into zero-leakage ground relief execution.
          </p>

          <div className="trade-hero-cta-cluster">
            <Link to="/register?role=VICTIM" className="trade-btn trade-btn-crimson trade-btn-lg">
              <MdDirectionsRun size={18} /> Launch Emergency SOS
            </Link>
            <Link to="/register?role=DONOR" className="trade-btn trade-btn-neon trade-btn-lg">
              <MdVolunteerActivism size={18} /> Pledge Relief Supplies
            </Link>
            <Link to="/login" className="trade-btn trade-btn-glass trade-btn-lg">
              <MdMap size={18} /> Live GIS Heatmap
            </Link>
          </div>

          {/* Live KPI Metric Strip */}
          <div className="trade-metrics-strip">
            <div className="trade-metric-cell">
              <span className="trade-metric-val cyan">&lt; 1.8s</span>
              <span className="trade-metric-label">AI Vision Inference Speed</span>
            </div>
            <div className="trade-metric-cell">
              <span className="trade-metric-val neon">100.0%</span>
              <span className="trade-metric-label">PIN Handshake Zero-Leakage</span>
            </div>
            <div className="trade-metric-cell">
              <span className="trade-metric-val">14,850+</span>
              <span className="trade-metric-label">Verified Rations Dispatched</span>
            </div>
            <div className="trade-metric-cell">
              <span className="trade-metric-val neon">99.98%</span>
              <span className="trade-metric-label">Gateway Network Availability</span>
            </div>
          </div>

          {/* ─── 4. THE SIGNATURE CENTERPIECE: INTERACTIVE DISASTER LOGISTICS TERMINAL ─── */}
          <div className="trade-terminal-stage" id="terminal">
            {/* Horizon Glow Behind Terminal */}
            <div className="trade-terminal-glow" />

            {/* Orbiting Glass Telemetry Badges (Vino Costa Signature) */}
            <div className="orbit-badge top-left">
              <div className="orbit-icon-wrap red">
                <MdAutoAwesome />
              </div>
              <div>
                <div className="orbit-badge-text-title">AI VISION TRIAGE: {currentSector.severity}</div>
                <div className="orbit-badge-text-sub">Depth {currentSector.waterDepth} • Structural Hazard</div>
              </div>
            </div>

            <div className="orbit-badge bottom-right">
              <div className="orbit-icon-wrap green">
                <MdLock />
              </div>
              <div>
                <div className="orbit-badge-text-title">HANDSHAKE PIN: {currentSector.pin}</div>
                <div className="orbit-badge-text-sub">Verified Physical Custody</div>
              </div>
            </div>

            {/* Main Terminal Shell */}
            <div className="trade-terminal-window">
              {/* Terminal Top Bar */}
              <div className="trade-term-header">
                <div className="trade-term-left">
                  <div className="trade-term-dots">
                    <span className="trade-dot red" />
                    <span className="trade-dot yellow" />
                    <span className="trade-dot green" />
                  </div>
                  <span className="trade-term-title">DISASTER DISPATCH TERMINAL // {currentSector.name}</span>
                </div>

                {/* Sector Tabs */}
                <div className="trade-sector-tabs">
                  {SECTOR_DATA.map((sec, idx) => (
                    <button
                      key={sec.id}
                      onClick={() => setSelectedSectorIdx(idx)}
                      className={`trade-sector-btn ${selectedSectorIdx === idx ? 'active' : ''}`}
                    >
                      {sec.id}
                    </button>
                  ))}
                </div>

                <div className="trade-term-right">
                  <span className="trade-term-ping">
                    <span className="pulse-dot-green" style={{ width: '5px', height: '5px' }} />
                    <span>LATENCY &lt;1.4MS</span>
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6875rem', color: '#64748b' }}>
                    {liveUtc.split(' ')[4] || '14:40:12 UTC'}
                  </span>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="trade-term-body">
                {/* Left: Dynamic Wave Chart & Orderbook */}
                <div className="trade-chart-col">
                  {/* Chart Control Header */}
                  <div className="trade-chart-ctrl">
                    <div className="trade-chart-info">
                      <span className="trade-chart-price">SEV {currentSector.severity}</span>
                      <span className="trade-chart-delta">{currentSector.severityLevel}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#64748b' }}>
                        WGS84 {currentSector.coords}
                      </span>
                    </div>

                    <div className="trade-chart-toggles">
                      {['1H', '24H', '7D', 'ALL'].map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setTimeframe(tf)}
                          className={`time-pill-btn ${timeframe === tf ? 'active' : ''}`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SVG Wave Chart */}
                  <div className="trade-chart-canvas-box">
                    <div className="chart-tooltip-hud">
                      <div className="chart-hud-item">Zone: <strong>{currentSector.name.split('//')[1]}</strong></div>
                      <div className="chart-hud-item">Water Depth: <strong>{currentSector.waterDepth}</strong></div>
                      <div className="chart-hud-item">Carrier: <strong>{currentSector.carrier.split('#')[0]}</strong></div>
                    </div>

                    <svg className="trade-svg-chart" viewBox="0 0 700 200" fill="none">
                      <defs>
                        <linearGradient id="tradeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00f59b" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#00f59b" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#00d2ff" />
                          <stop offset="70%" stopColor="#00f59b" />
                          <stop offset="100%" stopColor="#ff3366" />
                        </linearGradient>
                      </defs>

                      {/* Area Fill */}
                      <path d={currentSector.areaPath} fill="url(#tradeGrad)" />

                      {/* Wave Line */}
                      <path
                        d={currentSector.chartPath}
                        stroke="url(#strokeGrad)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Live Head Pulse Node */}
                      <circle cx="700" cy="20" r="5" fill="#ff3366" />
                      <circle cx="700" cy="20" r="10" stroke="#ff3366" strokeWidth="1.5" opacity="0.6">
                        <animate attributeName="r" values="5;14;5" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                  </div>

                  {/* Live Orderbook / Dispatch Matching Feed */}
                  <div className="trade-orderbook-shelf">
                    <div className="trade-shelf-header">
                      <span>LIVE DISPATCH ORDERBOOK // CONTINUOUS EXECUTION FEED</span>
                      <span>MATCHING ENGINE: ACTIVE</span>
                    </div>

                    <div className="trade-feed-columns">
                      {/* Green Side: Inbound Pledges (Donors) */}
                      <div>
                        <div className="feed-column-title green">INBOUND RELIEF PLEDGES (BID)</div>
                        {currentSector.bids.map((b, i) => (
                          <div
                            key={i}
                            className={`trade-order-row ${i === 0 && flashRow ? 'flash-green' : ''}`}
                          >
                            <span className="order-col-main" style={{ color: '#00f59b' }}>{b.item}</span>
                            <span className="order-col-sub">{b.carrier}</span>
                            <span className="order-col-sub">{b.time}</span>
                          </div>
                        ))}
                      </div>

                      {/* Red Side: Acute Sector Asks (Victim SOS) */}
                      <div>
                        <div className="feed-column-title red">SECTOR CRISIS DEMAND (ASK)</div>
                        {currentSector.asks.map((a, i) => (
                          <div
                            key={i}
                            className={`trade-order-row ${i === 0 && flashRow ? 'flash-red' : ''}`}
                          >
                            <span className="order-col-main" style={{ color: '#ff3366' }}>{a.item}</span>
                            <span className="order-col-sub">{a.zone}</span>
                            <span className="order-col-sub">{a.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Instant Relief Allocation Trade Box */}
                <div className="trade-box-col">
                  <div>
                    {/* Trade Mode Selector */}
                    <div className="trade-box-mode-tabs">
                      <button
                        type="button"
                        onClick={() => setTradeMode('DONOR')}
                        className={`trade-mode-btn ${tradeMode === 'DONOR' ? 'active donor' : ''}`}
                      >
                        Pledge Supplies (Donor)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTradeMode('VICTIM')}
                        className={`trade-mode-btn ${tradeMode === 'VICTIM' ? 'active victim' : ''}`}
                      >
                        Request SOS (Victim)
                      </button>
                    </div>

                    {/* Supply Type */}
                    <div className="trade-field-group">
                      <label className="trade-field-label">
                        <span>ASSET TO ALLOCATE</span>
                        <span>TIER 1 EMERGENCY</span>
                      </label>
                      <select
                        className="trade-select-input"
                        value={selectedSupply}
                        onChange={(e) => setSelectedSupply(e.target.value)}
                      >
                        <option value="Life Vests (Class 1)">Life Vests (Class 1)</option>
                        <option value="Purification Tablets (1,000pk)">Purification Tablets (1,000pk)</option>
                        <option value="Trauma First-Aid Kits">Trauma First-Aid Kits</option>
                        <option value="High-Calorie Rations">High-Calorie Rations</option>
                        <option value="Inflatable Rafts (6-Man)">Inflatable Rafts (6-Man)</option>
                      </select>
                    </div>

                    {/* Allocation Slider */}
                    <div className="trade-field-group">
                      <div className="trade-field-label">
                        <span>QUANTITY UNITS</span>
                        <strong style={{ color: '#00f59b' }}>{allocationQty} UNITS</strong>
                      </div>
                      <div className="trade-slider-wrap">
                        <input
                          type="range"
                          min="10"
                          max="500"
                          step="10"
                          className="trade-slider-input"
                          value={allocationQty}
                          onChange={(e) => setAllocationQty(Number(e.target.value))}
                        />
                      </div>
                      <div className="trade-preset-pills">
                        {[50, 100, 250, 500].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            className={`preset-pill ${allocationQty === preset ? 'active' : ''}`}
                            onClick={() => setAllocationQty(preset)}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Impact Readout */}
                    <div className="trade-impact-readout">
                      <div className="impact-readout-row">
                        <span>Estimated Impact:</span>
                        <strong>{Math.round(allocationQty * 2.4)} Citizens Sheltered</strong>
                      </div>
                      <div className="impact-readout-row">
                        <span>Handshake Security:</span>
                        <strong className="neon">100% Physical PIN</strong>
                      </div>
                      <div className="impact-readout-row">
                        <span>Estimated Arrival:</span>
                        <strong>&lt; 3.2 hrs via Courier</strong>
                      </div>
                    </div>
                  </div>

                  {/* Execute Button */}
                  <button
                    onClick={handleExecuteAllocation}
                    className={`trade-btn ${tradeMode === 'DONOR' ? 'trade-btn-neon' : 'trade-btn-crimson'} trade-btn-lg`}
                    style={{ width: '100%' }}
                  >
                    <MdFlashOn size={18} />
                    <span>{tradeMode === 'DONOR' ? 'Execute Supply Pledge' : 'Broadcast Distress Beacon'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. INTERACTIVE LIVE RESOURCE YIELD & IMPACT CALCULATOR ─── */}
      <section className="trade-calculator-section" id="calculator">
        <div className="trade-container">
          <div className="trade-calc-card">
            <div className="trade-calc-grid">
              <div>
                <span className="trade-calc-header-tag">ALGORITHMIC RESOURCE ALLOCATION</span>
                <h2 className="trade-calc-title">Simulate Your Relief Footprint</h2>
                <p className="trade-calc-desc">
                  Adjust target supply volume to project instantaneous ground survival metrics, 
                  courier delivery latency, and guaranteed zero-loss verification.
                </p>

                <div className="trade-calc-slider-box">
                  <div className="calc-slider-top">
                    <span>ALLOCATED RELIEF VOLUME</span>
                    <strong>${calcPledge.toLocaleString()} / {Math.round(calcPledge / 10)} UNITS</strong>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    className="trade-slider-input"
                    value={calcPledge}
                    onChange={(e) => setCalcPledge(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Live Metric Counters */}
              <div className="trade-calc-results">
                <div className="calc-result-tile">
                  <span className="calc-result-num green">{calcMetrics.citizensRescued.toLocaleString()}</span>
                  <span className="calc-result-label">Citizens Sustained</span>
                </div>
                <div className="calc-result-tile">
                  <span className="calc-result-num cyan">{calcMetrics.avgResponseTime}</span>
                  <span className="calc-result-label">Beacon-to-Drop Latency</span>
                </div>
                <div className="calc-result-tile">
                  <span className="calc-result-num purple">100.0%</span>
                  <span className="calc-result-label">PIN Anti-Leakage Proof</span>
                </div>
                <div className="calc-result-tile">
                  <span className="calc-result-num">{calcMetrics.kitsDelivered.toLocaleString()}</span>
                  <span className="calc-result-label">Medical Trauma Kits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. BENTO FEATURE MATRIX (KINETIC CARDS) ─── */}
      <section className="trade-bento-section" id="capabilities">
        <div className="trade-container">
          <div className="trade-section-header">
            <div className="trade-section-kicker">ENGINEERED ARCHITECTURE</div>
            <h2 className="trade-section-title">Institutional Relief Precision</h2>
            <p className="trade-section-desc">
              Every microservice is built to eradicate disaster fraud, eliminate paper manifests, 
              and route critical rescue boats with sub-second synchronization.
            </p>
          </div>

          <div className="trade-bento-grid">
            {/* Card 1: 1-Tap Geolocation Beacon */}
            <div className="trade-bento-card bento-span-8">
              <div>
                <div className="bento-icon-box cyan">
                  <MdDirectionsRun />
                </div>
                <h3 className="bento-card-title">1-Tap Precision WGS84 Distress Beacon</h3>
                <p className="bento-card-desc">
                  Stranded citizens transmit sub-meter latitude and longitude with a single tap. 
                  Captures camera frames, current water level, and dependent counts over low-bandwidth cellular websockets.
                </p>
              </div>
              <div className="bento-widget-hud">
                <span>BEACON LATENCY: &lt; 1.8s</span>
                <span style={{ color: '#00d2ff' }}>WEBSOCKET ENCRYPTED</span>
              </div>
            </div>

            {/* Card 2: AI Computer Vision */}
            <div className="trade-bento-card bento-span-4">
              <div>
                <div className="bento-icon-box neon">
                  <MdAutoAwesome />
                </div>
                <h3 className="bento-card-title">Deep Learning Severity Scoring</h3>
                <p className="bento-card-desc">
                  Neural vision pipeline parses flood depth, current turbulence, and rooftop stranding 
                  into a standardized 1.0 to 10.0 hazard index in under two seconds.
                </p>
              </div>
              <div className="bento-widget-hud">
                <span>MODEL ACCURACY: 94.2%</span>
                <span style={{ color: '#00f59b' }}>AUTONOMOUS</span>
              </div>
            </div>

            {/* Card 3: Cryptographic 6-Digit Handshake PIN */}
            <div className="trade-bento-card bento-span-4">
              <div>
                <div className="bento-icon-box purple">
                  <MdVpnKey />
                </div>
                <h3 className="bento-card-title">Cryptographic 6-Digit Handshake</h3>
                <p className="bento-card-desc">
                  Eliminates missing disaster inventory. Consignments cannot transition to DELIVERED 
                  without the receiving NGO physically keying the donor's secret PIN.
                </p>
              </div>
              <div className="bento-interactive-pin-demo">
                {activePinDemo.map((digit, i) => (
                  <div key={i} className="pin-digit-box">{digit}</div>
                ))}
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#00f59b', marginLeft: '0.4rem' }}>
                  MATCHED
                </span>
              </div>
            </div>

            {/* Card 4: Real-Time GIS Heatmap Radar */}
            <div className="trade-bento-card bento-span-8">
              <div>
                <div className="bento-icon-box crimson">
                  <MdMap />
                </div>
                <h3 className="bento-card-title">Dynamic GIS Spatial Hotspot Radar</h3>
                <p className="bento-card-desc">
                  Aggregates incoming beacons into density clusters on interactive Leaflet vector heatmaps. 
                  Allows disaster rescue units to deploy hovercraft and boats into acute zones without duplicate sweeps.
                </p>
              </div>
              <div className="bento-widget-hud">
                <span>LEAFLET VECTOR CLUSTERING</span>
                <Link to="/login" style={{ color: '#00f59b', textDecoration: 'none', fontWeight: 'bold' }}>
                  Open Incident Radar &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. PROTOCOL COMPARISON MATRIX ─── */}
      <section className="trade-comp-section" id="comparison">
        <div className="trade-container">
          <div className="trade-section-header">
            <div className="trade-section-kicker">PROTOCOL COMPARISON</div>
            <h2 className="trade-section-title">Why Legacy Relief Fails in Crises</h2>
            <p className="trade-section-desc">
              Compare uncoordinated charity drives with ResQFlow's high-frequency verified logistics exchange.
            </p>
          </div>

          <div className="trade-comp-table">
            <div className="trade-comp-header">
              <span>CRISIS METRIC</span>
              <span>LEGACY RELIEF</span>
              <span>RESQFLOW EXCHANGE</span>
            </div>

            <div className="trade-comp-row">
              <span className="comp-col-feature">Beacon Dispatch Latency</span>
              <span className="comp-col-legacy"><MdClose /> 4 to 24 Hours (Call Queues)</span>
              <span className="comp-col-resq"><MdCheck /> &lt; 1.8s (WebSockets)</span>
            </div>

            <div className="trade-comp-row">
              <span className="comp-col-feature">Physical Delivery Verification</span>
              <span className="comp-col-legacy"><MdClose /> Paper Manifests (Unverified)</span>
              <span className="comp-col-resq"><MdCheck /> 6-Digit Cryptographic Handshake</span>
            </div>

            <div className="trade-comp-row">
              <span className="comp-col-feature">Damage Assessment Speed</span>
              <span className="comp-col-legacy"><MdClose /> Manual Ground Surveys (Days)</span>
              <span className="comp-col-resq"><MdCheck /> Autonomous AI Computer Vision</span>
            </div>

            <div className="trade-comp-row">
              <span className="comp-col-feature">Supply Leakage & Fraud</span>
              <span className="comp-col-legacy"><MdClose /> Up to 35% Diverted Stock</span>
              <span className="comp-col-resq"><MdCheck /> 0.0% Verified Chain of Custody</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. DEVELOPER & DISPATCHER API QUICKSTART TERMINAL ─── */}
      <section className="trade-api-terminal-section" id="developer">
        <div className="trade-container">
          <div className="trade-code-terminal">
            <div className="trade-code-bar">
              <span className="code-title">REST API v2.4 // DISPATCH INCIDENT BEACON</span>
              <button onClick={handleCopyCurl} className="trade-copy-btn">
                <MdContentCopy size={13} style={{ marginRight: '4px' }} /> Copy cURL
              </button>
            </div>
            <pre className="trade-code-body">
              <code>
                <span className="code-keyword">curl</span> -X POST <span className="code-url">https://api-gateway.resqflow.org/api/reports</span> \<br />
                &nbsp;&nbsp;-H <span className="code-string">"Authorization: Bearer &lt;JWT_TOKEN&gt;"</span> \<br />
                &nbsp;&nbsp;-H <span className="code-string">"Content-Type: application/json"</span> \<br />
                &nbsp;&nbsp;-d '<span className="code-string">&#123;"lat": 28.6712, "lng": 77.2341, "severity": "CRITICAL", "waterDepth": "5.4ft"&#125;</span>'
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* ─── 9. HIGH-CONVERSION TERMINAL CALL TO ACTION ─── */}
      <section className="trade-cta-section">
        <div className="trade-container">
          <div className="trade-cta-deck">
            <h2 className="trade-cta-title">Mobilize Relief When Seconds Decide Lives.</h2>
            <p className="trade-cta-sub">
              Join disaster first-responders, certified relief NGOs, and proactive donors coordinating 
              flood emergency logistics with 100% verified delivery accountability.
            </p>
            <div className="trade-cta-buttons">
              <Link to="/register?role=VICTIM" className="trade-btn trade-btn-crimson trade-btn-lg">
                <MdDirectionsRun /> Submit Emergency SOS
              </Link>
              <Link to="/register?role=DONOR" className="trade-btn trade-btn-neon trade-btn-lg">
                <MdVolunteerActivism /> Join as Relief Donor
              </Link>
              <Link to="/register?role=NGO" className="trade-btn trade-btn-glass trade-btn-lg">
                <MdShield /> Register Certified NGO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. CYBERPUNK TERMINAL FOOTER ─── */}
      <footer className="trade-footer">
        <div className="trade-container">
          <div className="trade-footer-grid">
            <div className="trade-footer-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div className="trade-brand-logo" style={{ width: '28px', height: '28px' }}>
                  <MdShield size={16} />
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>ResQFlow</span>
              </div>
              <p style={{ color: '#64748b', lineHeight: 1.6, maxWidth: '320px', fontSize: '0.8rem' }}>
                Decentralized disaster response and relief logistics protocol. 
                Real-time GIS incident clustering, deep learning water severity classification, 
                and physical 6-digit delivery verification.
              </p>
            </div>

            <div className="trade-footer-col">
              <h4>Citizen SOS</h4>
              <ul>
                <li><Link to="/register?role=VICTIM">Submit Distress Signal</Link></li>
                <li><Link to="/login">Citizen Status Login</Link></li>
                <li><a href="tel:112">National Police & Rescue (112)</a></li>
                <li><a href="tel:108">Emergency Ambulance (108)</a></li>
              </ul>
            </div>

            <div className="trade-footer-col">
              <h4>Relief Donors</h4>
              <ul>
                <li><Link to="/register?role=DONOR">Pledge Supply Cargo</Link></li>
                <li><Link to="/login">Donor Portal Login</Link></li>
                <li><a href="#calculator">Resource Impact Simulator</a></li>
                <li><a href="#capabilities">Handshake Security Protocol</a></li>
              </ul>
            </div>

            <div className="trade-footer-col">
              <h4>Ground Responders</h4>
              <ul>
                <li><Link to="/register?role=NGO">Register Relief NGO</Link></li>
                <li><Link to="/login">NGO Incident Command</Link></li>
                <li><Link to="/login">Admin Security Console</Link></li>
                <li><a href="#terminal">GIS Heatmap Radar</a></li>
              </ul>
            </div>
          </div>

          <div className="trade-footer-bottom">
            <div>
              &copy; {new Date().getFullYear()} ResQFlow Disaster Management Network.
            </div>
            <div className="footer-telemetry-tags">
              <span style={{ color: '#00f59b' }}>● 7 CLOUD NODES ONLINE</span>
              <span>//</span>
              <span>WGS84 PRECISION</span>
              <span>//</span>
              <span>256-BIT JWT ENCRYPTED</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
