import React from 'react';
import { MdTrendingUp, MdBarChart, MdPieChart } from 'react-icons/md';

const AnalyticsDashboard = ({ reports = [], donations = [] }) => {
  // Severity Distribution Breakdown
  const total = reports.length || 1;
  const criticalCount = reports.filter(r => (Number(r.severityScore) || 0) >= 8).length;
  const highCount = reports.filter(r => {
    const s = Number(r.severityScore) || 0;
    return s >= 6 && s < 8;
  }).length;
  const moderateCount = reports.filter(r => {
    const s = Number(r.severityScore) || 0;
    return s >= 3 && s < 6;
  }).length;
  const lowCount = reports.filter(r => (Number(r.severityScore) || 0) < 3).length;

  const criticalPct = Math.round((criticalCount / total) * 100);
  const highPct = Math.round((highCount / total) * 100);
  const moderatePct = Math.round((moderateCount / total) * 100);
  const lowPct = Math.round((lowCount / total) * 100);

  // Supply Fulfillment Status
  const pendingDonations = donations.filter(d => (d.status || '').toUpperCase() === 'PENDING').length;
  const acceptedDonations = donations.filter(d => (d.status || '').toUpperCase() === 'ACCEPTED').length;

  return (
    <div className="grid-2" style={{ marginBottom: '2rem' }}>
      {/* Chart 1: Disaster Severity Breakdown */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MdPieChart style={{ fontSize: '1.4rem', color: 'var(--accent-ocean)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Incident Severity Analytics</h3>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            Total Incidents: {reports.length}
          </span>
        </div>

        {/* Visual Bar Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <span style={{ color: '#e11d48' }}>🚨 Critical / Catastrophic (Score 8 - 10)</span>
              <span>{criticalCount} ({criticalPct}%)</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${criticalPct}%`, background: '#e11d48' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <span style={{ color: '#ea580c' }}>🔥 High Hazard (Score 6 - 7.9)</span>
              <span>{highCount} ({highPct}%)</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${highPct}%`, background: '#ea580c' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <span style={{ color: '#d97706' }}>⚠️ Moderate Waterlogging (Score 3 - 5.9)</span>
              <span>{moderateCount} ({moderatePct}%)</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${moderatePct}%`, background: '#d97706' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <span style={{ color: '#059669' }}>🟢 Minor Inundation (&lt; Score 3)</span>
              <span>{lowCount} ({lowPct}%)</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${lowPct}%`, background: '#059669' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Chart 2: Relief Logistics Pipeline */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MdBarChart style={{ fontSize: '1.4rem', color: '#0d9488' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Relief Logistics Fulfillment</h3>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            Total Relief Lots: {donations.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '160px', paddingTop: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '40%' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#d97706' }}>{pendingDonations}</span>
            <div style={{ width: '100%', height: `${Math.max(12, (pendingDonations / (donations.length || 1)) * 120)}px`, backgroundColor: '#d97706', borderRadius: '8px 8px 0 0', transition: 'height 0.5s ease' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Pending</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '40%' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0284c7' }}>{acceptedDonations}</span>
            <div style={{ width: '100%', height: `${Math.max(12, (acceptedDonations / (donations.length || 1)) * 120)}px`, backgroundColor: '#0284c7', borderRadius: '8px 8px 0 0', transition: 'height 0.5s ease' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Accepted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
