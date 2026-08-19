import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MdLayers,
  MdFilterList,
  MdWarning,
  MdDirections,
  MdLocationOn,
  MdRadar,
  MdRefresh,
  MdClose
} from 'react-icons/md';

// Base map layer providers (verified working tile servers)
const MAP_STYLES = {
  dark: {
    id: 'dark',
    name: 'Command Dark',
    icon: '🌃',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attribution: '&copy; CartoDB &copy; OpenStreetMap'
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: 'abc',
    attribution: '&copy; Esri World Imagery'
  },
  streets: {
    id: 'streets',
    name: 'Streets',
    icon: '🗺️',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    attribution: '&copy; OpenStreetMap contributors'
  }
};

const getRiskColor = (riskLevel, severityScore = 0) => {
  const level = (riskLevel || '').toUpperCase().trim();
  const score = Number(severityScore) || 0;

  if (level.includes('CRITICAL') || level.includes('CATASTROPHIC') || level.includes('EMERGENCY') || score >= 8) {
    return {
      main: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.45)',
      badgeBg: 'rgba(239, 68, 68, 0.15)',
      badgeBorder: 'rgba(239, 68, 68, 0.4)',
      label: 'Critical Hazard',
    };
  }
  if (level.includes('HIGH') || level.includes('SEVERE') || score >= 6) {
    return {
      main: '#f97316',
      glow: 'rgba(249, 115, 22, 0.45)',
      badgeBg: 'rgba(249, 115, 22, 0.15)',
      badgeBorder: 'rgba(249, 115, 22, 0.4)',
      label: 'High Risk',
    };
  }
  if (level.includes('MODERATE') || level.includes('MEDIUM') || score >= 3) {
    return {
      main: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.45)',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeBorder: 'rgba(245, 158, 11, 0.4)',
      label: 'Moderate Risk',
    };
  }
  return {
    main: '#10b981',
    glow: 'rgba(16, 185, 129, 0.45)',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeBorder: 'rgba(16, 185, 129, 0.4)',
    label: 'Minor Inundation',
  };
};

// Auto-Fit map view bounds based on active reports
const MapAutoFitter = ({ points, activeLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (activeLocation && typeof activeLocation.latitude === 'number' && typeof activeLocation.longitude === 'number') {
      map.flyTo([activeLocation.latitude, activeLocation.longitude], 12, { duration: 1.2 });
      return;
    }

    if (points && points.length > 0) {
      const validPoints = points.filter(p => p && typeof p.latitude === 'number' && typeof p.longitude === 'number');
      if (validPoints.length > 0) {
        const bounds = validPoints.map(p => [p.latitude, p.longitude]);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 11 });
      }
    }
  }, [points, activeLocation, map]);

  return null;
};

const HeatmapView = ({ data = [] }) => {
  const [activeStyle, setActiveStyle] = useState('dark');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [activeZone, setActiveZone] = useState(null);
  const [showQuickList, setShowQuickList] = useState(false);

  const validData = Array.isArray(data) ? data.filter(p => p && typeof p.latitude === 'number' && typeof p.longitude === 'number') : [];

  // Filter points
  const filteredData = validData.filter(point => {
    const score = Number(point.averageSeverity || point.severityScore || 0);
    if (severityFilter === 'CRITICAL') return score >= 8;
    if (severityFilter === 'HIGH') return score >= 6 && score < 8;
    if (severityFilter === 'MODERATE') return score >= 3 && score < 6;
    if (severityFilter === 'LOW') return score < 3;
    return true;
  });

  // Calculate HUD Metrics
  const totalZones = validData.length;
  const criticalZones = validData.filter(p => Number(p.averageSeverity || p.severityScore || 0) >= 8).length;
  const highZones = validData.filter(p => {
    const s = Number(p.averageSeverity || p.severityScore || 0);
    return s >= 6 && s < 8;
  }).length;

  const avgSeverity = totalZones > 0
    ? (validData.reduce((acc, p) => acc + Number(p.averageSeverity || p.severityScore || 0), 0) / totalZones).toFixed(1)
    : '0.0';

  const currentLayer = MAP_STYLES[activeStyle] || MAP_STYLES.dark;

  return (
    <div className="heatmap-command-container">
      {/* ── Top Tactical HUD Header ── */}
      <div className="heatmap-hud-header">
        <div className="heatmap-hud-left">
          <div className="heatmap-live-radar">
            <span className="radar-ping"></span>
            <MdRadar className="radar-icon" />
            <span className="radar-text">LIVE GEOSPATIAL RADAR</span>
          </div>
          <div className="heatmap-metrics-row">
            <div className="hud-metric-pill">
              <span className="hud-metric-label">Active Zones:</span>
              <strong className="hud-metric-value">{totalZones}</strong>
            </div>
            <div className="hud-metric-pill hud-pill-critical">
              <span className="hud-metric-dot dot-critical"></span>
              <span className="hud-metric-label">Critical:</span>
              <strong>{criticalZones}</strong>
            </div>
            <div className="hud-metric-pill hud-pill-high">
              <span className="hud-metric-dot dot-high"></span>
              <span className="hud-metric-label">High:</span>
              <strong>{highZones}</strong>
            </div>
            <div className="hud-metric-pill">
              <span className="hud-metric-label">Avg Severity:</span>
              <strong style={{ color: Number(avgSeverity) >= 7 ? '#ef4444' : Number(avgSeverity) >= 5 ? '#f97316' : '#0284c7' }}>
                {avgSeverity}/10
              </strong>
            </div>
          </div>
        </div>

        {/* Tactical Controls (Direct Segmented Layer Switcher + Drawer) */}
        <div className="heatmap-hud-actions">
          {/* Direct 1-Click Map View Selector */}
          <div className="hud-map-switcher-group">
            <span className="hud-switcher-label">
              <MdLayers /> View:
            </span>
            {Object.keys(MAP_STYLES).map((key) => {
              const style = MAP_STYLES[key];
              const isActive = activeStyle === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={`hud-map-btn ${isActive ? 'active-map-btn' : ''}`}
                  onClick={() => setActiveStyle(key)}
                  title={`Switch map view to ${style.name}`}
                >
                  <span className="map-btn-icon">{style.icon}</span>
                  <span className="map-btn-text">{style.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick List Toggle */}
          <button
            type="button"
            className={`hud-action-btn ${showQuickList ? 'active-hud-btn' : ''}`}
            onClick={() => setShowQuickList(!showQuickList)}
            title="Toggle Monitored Zones List"
          >
            <MdFilterList /> Sector List ({filteredData.length})
          </button>
        </div>
      </div>

      {/* ── Filter Severity Chips Ribbon ── */}
      <div className="heatmap-filter-ribbon">
        <span className="filter-ribbon-title">Filter Severity:</span>
        <div className="filter-chips-track">
          {[
            { id: 'ALL', label: `All (${validData.length})` },
            { id: 'CRITICAL', label: `🔴 Critical (${criticalZones})` },
            { id: 'HIGH', label: `🟠 High (${highZones})` },
            { id: 'MODERATE', label: '🟡 Moderate' },
            { id: 'LOW', label: '🟢 Minor' }
          ].map(chip => (
            <button
              key={chip.id}
              type="button"
              className={`heatmap-filter-chip ${severityFilter === chip.id ? 'active-chip' : ''}`}
              onClick={() => setSeverityFilter(chip.id)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Interactive Map Viewport ── */}
      <div className="heatmap-viewport-wrapper">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ width: '100%', height: '100%', minHeight: '520px' }}
          scrollWheelZoom={true}
        >
          {/* Keyed TileLayer forces instantaneous seamless layer swap */}
          <TileLayer
            key={activeStyle}
            attribution={currentLayer.attribution}
            url={currentLayer.url}
            subdomains={currentLayer.subdomains}
            maxZoom={19}
          />

          <MapAutoFitter points={filteredData} activeLocation={activeZone} />

          {filteredData.map((point, index) => {
            const score = Number(point.averageSeverity || point.severityScore || 0);
            const count = typeof point.reportCount === 'number' ? point.reportCount : 1;
            const riskInfo = getRiskColor(point.riskLevel, score);
            const radius = Math.max(12, Math.min(count * 4 + score * 1.5, 34));

            return (
              <React.Fragment key={`${index}-${point.latitude}-${point.longitude}`}>
                {/* Outer Glow Halo */}
                <CircleMarker
                  center={[point.latitude, point.longitude]}
                  radius={radius + 8}
                  pathOptions={{
                    color: riskInfo.main,
                    fillColor: riskInfo.glow,
                    fillOpacity: 0.35,
                    weight: 1,
                    dashArray: score >= 8 ? '4, 4' : undefined
                  }}
                />

                {/* Core Incident Marker */}
                <CircleMarker
                  center={[point.latitude, point.longitude]}
                  radius={radius}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: riskInfo.main,
                    fillOpacity: 0.85,
                    weight: 2.5
                  }}
                >
                  <Popup className="custom-tactical-popup">
                    <div className="tactical-popup-card">
                      <div className="popup-header" style={{ borderBottom: `2px solid ${riskInfo.main}` }}>
                        <div className="popup-risk-badge" style={{ backgroundColor: riskInfo.badgeBg, color: riskInfo.main, border: `1px solid ${riskInfo.badgeBorder}` }}>
                          <MdWarning /> {riskInfo.label.toUpperCase()}
                        </div>
                        <span className="popup-score-pill" style={{ backgroundColor: riskInfo.main }}>
                          {score.toFixed(1)} / 10
                        </span>
                      </div>

                      <div className="popup-body">
                        <div className="popup-stat-row">
                          <span className="popup-stat-label">Total Reports:</span>
                          <strong className="popup-stat-val">{count} incident{count > 1 ? 's' : ''}</strong>
                        </div>
                        <div className="popup-stat-row">
                          <span className="popup-stat-label">Coordinates:</span>
                          <span className="popup-coord-text">{point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}</span>
                        </div>
                      </div>

                      <div className="popup-footer">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="popup-directions-btn"
                        >
                          <MdDirections /> Navigate via GPS
                        </a>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* ── Slide-out Zone Drawer ── */}
        {showQuickList && (
          <div className="heatmap-zone-drawer animate-fade-in">
            <div className="drawer-header">
              <h4>Active Disaster Sectors</h4>
              <button onClick={() => setShowQuickList(false)} className="drawer-close-btn" title="Close Drawer">
                <MdClose />
              </button>
            </div>
            <div className="drawer-list">
              {filteredData.length === 0 ? (
                <div className="drawer-empty">No sectors match filter</div>
              ) : (
                filteredData.map((pt, i) => {
                  const sc = Number(pt.averageSeverity || pt.severityScore || 0);
                  const rk = getRiskColor(pt.riskLevel, sc);
                  return (
                    <div
                      key={i}
                      className="drawer-zone-card"
                      onClick={() => setActiveZone(pt)}
                    >
                      <div className="drawer-card-top">
                        <span className="drawer-badge" style={{ color: rk.main, backgroundColor: rk.badgeBg }}>
                          {rk.label}
                        </span>
                        <strong style={{ color: rk.main }}>Score: {sc.toFixed(1)}</strong>
                      </div>
                      <div className="drawer-card-geo">
                        <MdLocationOn style={{ color: rk.main }} />
                        <span>Lat: {pt.latitude.toFixed(4)}, Lng: {pt.longitude.toFixed(4)}</span>
                      </div>
                      <div className="drawer-card-sub">
                        <span>Reports: {pt.reportCount || 1}</span>
                        <span className="drawer-focus-hint">Click to Focus &rarr;</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── Floating Tactical Legend ── */}
        <div className="heatmap-tactical-legend">
          <div className="legend-head">
            <span>RADAR INTENSITY</span>
          </div>
          <div className="legend-items">
            <div className="legend-row">
              <span className="legend-indicator" style={{ backgroundColor: '#ef4444', boxShadow: '0 0 10px #ef4444' }}></span>
              <span>Critical (8.0 - 10.0)</span>
            </div>
            <div className="legend-row">
              <span className="legend-indicator" style={{ backgroundColor: '#f97316', boxShadow: '0 0 8px #f97316' }}></span>
              <span>High (6.0 - 7.9)</span>
            </div>
            <div className="legend-row">
              <span className="legend-indicator" style={{ backgroundColor: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }}></span>
              <span>Moderate (3.0 - 5.9)</span>
            </div>
            <div className="legend-row">
              <span className="legend-indicator" style={{ backgroundColor: '#10b981' }}></span>
              <span>Minor (&lt; 3.0)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapView;
