import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MdWarning, MdMap, MdAddCircle, MdDescription } from 'react-icons/md';
import { AuthContext } from '../../context/AuthContext';
import { getHeatmap, getMyReports } from '../../api/victimApi';
import HeatmapView from '../../components/HeatmapView';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';

import { useLanguage } from '../../context/LanguageContext';

const VictimDashboard = () => {
  const navigate = useNavigate();
  const { getUsername } = useContext(AuthContext);
  const { t } = useLanguage();
  const username = getUsername() || 'Victim';

  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState([]);
  const [myReports, setMyReports] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [heatmapRes, reportsRes] = await Promise.all([
        getHeatmap(),
        getMyReports()
      ]);
      setHeatmapData(Array.isArray(heatmapRes) ? heatmapRes : []);
      setMyReports(Array.isArray(reportsRes) ? reportsRes : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalReports = myReports.length;

  const avgSeverity = totalReports > 0
    ? (myReports.reduce((acc, r) => acc + (Number(r.severityScore) || 0), 0) / totalReports).toFixed(1)
    : '0.0';

  const highestSeverity = totalReports > 0
    ? Math.max(...myReports.map(r => Number(r.severityScore) || 0)).toFixed(1)
    : '0.0';

  const activeZones = heatmapData.length;

  const recentReports = [...myReports].slice(0, 5);

  const getSeverityColor = (score) => {
    const num = Number(score) || 0;
    if (num < 3) return '#059669';
    if (num < 6) return '#d97706';
    if (num < 8) return '#ea580c';
    return '#e11d48';
  };

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

  return (
    <div className="page-container animate-fade-in-up">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">{t('victimTitle')}</h1>
          <p className="page-subtitle">{t('victimSubtitle')}</p>
        </div>
        <Link to="/victim/create-report" className="btn btn-primary">
          <MdAddCircle style={{ fontSize: '1.2rem' }} /> {t('reportFlood')}
        </Link>
      </div>

      {/* Stats Cards Row */}
      <div className="grid-4 stagger" style={{ marginBottom: '2rem' }}>
        <StatsCard
          icon={MdDescription}
          label={t('totalReports')}
          value={totalReports}
          color="#0284c7"
        />
        <StatsCard
          icon={MdWarning}
          label={t('avgSeverity')}
          value={avgSeverity}
          color="#d97706"
        />
        <StatsCard
          icon={MdWarning}
          label={t('highestSeverity')}
          value={highestSeverity}
          color="#e11d48"
        />
        <StatsCard
          icon={MdMap}
          label={t('activeZones')}
          value={activeZones}
          color="#059669"
        />
      </div>

      {/* Heatmap Section */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MdMap style={{ fontSize: '1.5rem', color: 'var(--accent-blue)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Live Flood Risk Heatmap</h2>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {activeZones} monitored zones
          </span>
        </div>
        <HeatmapView data={heatmapData} />
      </div>

      {/* Recent Reports Section */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MdDescription style={{ fontSize: '1.5rem', color: 'var(--accent-blue)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Incident Reports</h2>
          </div>
          <Link to="/victim/my-reports" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            View All Reports ({totalReports}) &rarr;
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
            <MdDescription className="empty-state-icon" />
            <div className="empty-state-text">No reports created yet</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Have you experienced flood impact or need emergency assistance?
            </p>
            <Link to="/victim/create-report" className="btn btn-primary btn-sm">
              <MdAddCircle /> Create Your First Report
            </Link>
          </div>
        ) : (
          <div className="grid-3 stagger">
            {recentReports.map((report, idx) => {
              const severity = Number(report.severityScore) || 0;
              const severityColor = getSeverityColor(severity);
              const desc = report.description || '';
              const truncatedDesc = desc.length > 90 ? `${desc.substring(0, 90)}...` : desc;

              return (
                <div
                  key={report.id || idx}
                  className="glass-card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        {report.title || 'Untitled Report'}
                      </h3>
                      <StatusBadge status={report.status} />
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {truncatedDesc || 'No description provided.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Severity:</span>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '8px',
                          backgroundColor: `${severityColor}20`,
                          color: severityColor,
                          border: `1px solid ${severityColor}40`
                        }}
                      >
                        {severity.toFixed(1)}
                      </span>
                    </div>

                    {report.createdAt && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) for Instant Reporting */}
      <Link to="/victim/create-report" className="fab-button" title="Report Flood Incident">
        <MdAddCircle style={{ fontSize: '1.4rem' }} />
        <span>+ Report Incident</span>
      </Link>
    </div>
  );
};

export default VictimDashboard;
