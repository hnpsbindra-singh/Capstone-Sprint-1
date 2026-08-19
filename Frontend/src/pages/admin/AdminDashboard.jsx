import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MdDashboard,
  MdWarning,
  MdBusinessCenter,
  MdVolunteerActivism,
  MdMap,
  MdRefresh,
  MdArrowForward,
  MdLocationOn
} from 'react-icons/md';
import { getReports, getHeatmap, getNgoRequests, getDonations } from '../../api/adminApi';
import HeatmapView from '../../components/HeatmapView';
import StatsCard from '../../components/StatsCard';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [ngoRequests, setNgoRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [reportsData, heatmapData, ngoRequestsData, donationsData] = await Promise.all([
        getReports(),
        getHeatmap(),
        getNgoRequests(),
        getDonations()
      ]);
      setReports(Array.isArray(reportsData) ? reportsData : []);
      setHeatmap(Array.isArray(heatmapData) ? heatmapData : []);
      setNgoRequests(Array.isArray(ngoRequestsData) ? ngoRequestsData : []);
      setDonations(Array.isArray(donationsData) ? donationsData : []);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Get last 5 reports for recent activity
  const recentReports = reports.slice(0, 5);

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MdDashboard style={{ color: 'var(--accent-blue)' }} /> Admin Dashboard
          </h1>
          <p className="page-subtitle">Real-time rescue system overview and operational metrics.</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchAllData}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <MdRefresh /> Refresh
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid-4 stagger" style={{ marginBottom: '2rem' }}>
        <StatsCard
          icon={<MdWarning />}
          label="Total Flood Reports"
          value={reports.length}
          color="#ef4444"
        />
        <StatsCard
          icon={<MdBusinessCenter />}
          label="Total NGO Requests"
          value={ngoRequests.length}
          color="#3b82f6"
        />
        <StatsCard
          icon={<MdVolunteerActivism />}
          label="Total Donations"
          value={donations.length}
          color="#10b981"
        />
        <StatsCard
          icon={<MdMap />}
          label="Active Zones"
          value={heatmap.length}
          color="#f59e0b"
        />
      </div>

      {/* Visual Analytics Charts Section */}
      <AnalyticsDashboard reports={reports} donations={donations} />

      {/* Heatmap Section */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <MdMap style={{ color: 'var(--accent-blue)' }} /> Real-Time Hazard & Risk Heatmap
          </h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {heatmap.length} Active Zone{heatmap.length !== 1 ? 's' : ''}
          </span>
        </div>
        <HeatmapView data={heatmap} />
      </div>

      {/* Recent Activity Section */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <MdWarning style={{ color: '#ef4444' }} /> Recent Activity (Last 5 Flood Reports)
          </h2>
          <Link to="/admin/flood-reports" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            View All Reports <MdArrowForward />
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <MdWarning className="empty-state-icon" />
            <p className="empty-state-text">No recent flood reports available.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentReports.map((report, idx) => {
              const severity = report.severityScore || 0;
              let severityBg = 'rgba(5, 150, 105, 0.12)';
              let severityColor = '#059669';
              let pulseClass = '';

              if (severity >= 8) {
                severityBg = 'rgba(225, 29, 72, 0.12)';
                severityColor = '#e11d48';
                pulseClass = 'badge-pulse-critical';
              } else if (severity >= 6) {
                severityBg = 'rgba(234, 88, 12, 0.12)';
                severityColor = '#ea580c';
                pulseClass = 'badge-pulse-high';
              } else if (severity >= 3) {
                severityBg = 'rgba(217, 119, 6, 0.12)';
                severityColor = '#d97706';
              }

              const coords = report.location?.coordinates;
              const locationStr = coords
                ? `${coords[1]?.toFixed(4)}, ${coords[0]?.toFixed(4)}`
                : (report.location?.latitude && report.location?.longitude
                    ? `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`
                    : 'N/A');

              return (
                <div
                  key={report.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: '1 1 200px', minWidth: '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#475569', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        ID: {report.id ? String(report.id).substring(0, 8) : 'N/A'}
                      </span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        {report.title || 'Untitled Report'}
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, wordBreak: 'break-word', overflowWrap: 'anywhere', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {report.description || 'No description provided.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      <MdLocationOn style={{ color: 'var(--accent-ocean)', flexShrink: 0 }} />
                      <span style={{ wordBreak: 'break-word' }}>{locationStr}</span>
                    </div>
                    <span
                      className={pulseClass}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: severityBg,
                        color: severityColor,
                        border: `1px solid ${severityColor}40`,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Severity: {severity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
