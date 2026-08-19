import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdWarning, MdRefresh, MdLocationOn, MdSearch, MdDownload, MdDeleteOutline } from 'react-icons/md';
import { getReports, softDeleteReport } from '../../api/adminApi';
import { useLanguage } from '../../context/LanguageContext';
import ConfirmModal from '../../components/ConfirmModal';

const FloodReports = () => {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching flood reports:', error);
      toast.error('Failed to fetch flood reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    setDeleting(true);
    try {
      await softDeleteReport(reportToDelete.id || reportToDelete._id);
      toast.success(`Flood report #${reportToDelete.id || ''} soft-deleted successfully.`);
      setReports(prev => prev.filter(r => (r.id || r._id) !== (reportToDelete.id || reportToDelete._id)));
      setDeleteModalOpen(false);
      setReportToDelete(null);
    } catch (error) {
      console.error('Error soft-deleting flood report:', error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to soft delete flood report';
      toast.error(errMsg);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatLocation = (location) => {
    if (!location) return 'N/A';
    if (Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
      const lng = location.coordinates[0];
      const lat = location.coordinates[1];
      return `${lat?.toFixed(4)}, ${lng?.toFixed(4)}`;
    }
    if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
      return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    }
    if (typeof location.y === 'number' && typeof location.x === 'number') {
      return `${location.y.toFixed(4)}, ${location.x.toFixed(4)}`;
    }
    return 'N/A';
  };

  const renderSeverityBadge = (score) => {
    const num = typeof score === 'number' ? score : Number(score || 0);
    let color = '#059669';
    let bg = 'rgba(5, 150, 105, 0.12)';
    let border = 'rgba(5, 150, 105, 0.3)';
    let pulseClass = '';

    if (num >= 8) {
      color = '#e11d48';
      bg = 'rgba(225, 29, 72, 0.12)';
      border = 'rgba(225, 29, 72, 0.3)';
      pulseClass = 'badge-pulse-critical';
    } else if (num >= 6) {
      color = '#ea580c';
      bg = 'rgba(234, 88, 12, 0.12)';
      border = 'rgba(234, 88, 12, 0.3)';
      pulseClass = 'badge-pulse-high';
    } else if (num >= 3) {
      color = '#d97706';
      bg = 'rgba(217, 119, 6, 0.12)';
      border = 'rgba(217, 119, 6, 0.3)';
    }

    return (
      <span
        className={pulseClass}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 800,
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          whiteSpace: 'nowrap'
        }}
      >
        Severity: {num.toFixed(1)}
      </span>
    );
  };

  // CSV Export function
  const exportToCSV = () => {
    if (!reports || reports.length === 0) {
      toast.error('No reports to export.');
      return;
    }
    const headers = ['Report ID', 'Title', 'Description', 'Victim ID', 'Severity Score', 'Location'];
    const rows = filteredReports.map(r => [
      `"${r.id || ''}"`,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`,
      `"${r.victimId || ''}"`,
      r.severityScore || 0,
      `"${formatLocation(r.location)}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Admin_Flood_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Admin report CSV exported!');
  };

  // Filter logic
  const filteredReports = reports.filter(r => {
    const titleMatch = (r.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = (r.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const victimMatch = String(r.victimId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || descMatch || victimMatch;

    const score = Number(r.severityScore) || 0;
    if (filterSeverity === 'CRITICAL') return matchesSearch && score >= 8;
    if (filterSeverity === 'HIGH') return matchesSearch && score >= 6 && score < 8;
    if (filterSeverity === 'MODERATE') return matchesSearch && score >= 3 && score < 6;
    if (filterSeverity === 'LOW') return matchesSearch && score < 3;
    return matchesSearch;
  });

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">{t('allReportsTitle')}</h1>
          <p className="page-subtitle">View and monitor all victim-submitted flood reports across active response zones.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-export-csv" onClick={exportToCSV} disabled={reports.length === 0}>
            <MdDownload /> Export CSV
          </button>
          <button
            className="btn btn-secondary"
            onClick={fetchReports}
            disabled={loading}
          >
            <MdRefresh /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      {!loading && reports.length > 0 && (
        <div className="filter-toolbar">
          <div className="search-box-wrapper">
            <MdSearch className="search-icon-inside" />
            <input
              type="text"
              className="search-box-input"
              placeholder="Search reports by title, description, or victim ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-pills-container">
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Severity Filter:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map(sev => (
              <button
                key={sev}
                className={`filter-pill-btn ${filterSeverity === sev ? 'active' : ''}`}
                onClick={() => setFilterSeverity(sev)}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="glass-card skeleton-card skeleton" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="glass-card empty-state">
          <MdWarning className="empty-state-icon" />
          <p className="empty-state-text">
            {reports.length === 0 ? 'No flood reports found.' : 'No reports matching your search filter.'}
          </p>
        </div>
      ) : (
        <div className="table-container glass-card" style={{ padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Victim ID</th>
                <th>Severity Score</th>
                <th>Location (Lat, Lng)</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id || Math.random()}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {report.id ? String(report.id) : 'N/A'}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)', minWidth: '140px', maxWidth: '200px', wordBreak: 'break-word' }}>
                    {report.title || 'Untitled'}
                  </td>
                  <td className="td-description">
                    <div style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {report.description || 'No description'}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {report.victimId ? String(report.victimId) : 'N/A'}
                  </td>
                  <td>
                    {renderSeverityBadge(report.severityScore)}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MdLocationOn style={{ color: 'var(--accent-ocean)' }} />
                      {formatLocation(report.location)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-sm"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                      title="Soft delete this report"
                      onClick={() => handleDeleteClick(report)}
                    >
                      <MdDeleteOutline size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal for Soft Deletion */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Soft Delete Flood Report"
        message={`Are you sure you want to soft-delete report "${reportToDelete?.title || reportToDelete?.id}"? This will deactivate the report and automatically recalculate regional hazard risk levels.`}
        confirmLabel={deleting ? "Deleting..." : "Delete Report"}
        cancelLabel="Cancel"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setReportToDelete(null);
          }
        }}
      />
    </div>
  );
};

export default FloodReports;
