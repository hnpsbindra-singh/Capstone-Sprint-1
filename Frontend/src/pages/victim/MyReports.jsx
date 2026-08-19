import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MdDescription, MdAddCircle, MdRefresh, MdLocationOn, MdSearch, MdDownload, MdArrowUpward, MdArrowDownward, MdUnfoldMore, MdAccessTime, MdAnalytics } from 'react-icons/md';
import { getMyReports } from '../../api/victimApi';
import StatusBadge from '../../components/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';

const PAGE_SIZE = 8;

const MyReports = () => {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchMyReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyReports();
      setReports(Array.isArray(data) ? data : []);
      setLastFetched(new Date());
      setPage(1);
    } catch (error) {
      console.error('Error fetching my reports:', error);
      toast.error('Failed to load your reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMyReports(); }, [fetchMyReports]);

  const formatDate = (v) => {
    if (!v) return 'N/A';
    try { return new Date(v).toLocaleString(); } catch { return String(v); }
  };

  const formatRelative = (date) => {
    if (!date) return '';
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return `${Math.floor(diffH / 24)}d ago`;
  };

  const formatReportLocation = (report) => {
    if (!report) return 'N/A';
    if (report.location?.coordinates?.length >= 2) {
      return `${Number(report.location.coordinates[1]).toFixed(4)}, ${Number(report.location.coordinates[0]).toFixed(4)}`;
    }
    if (report.latitude !== undefined) return `${Number(report.latitude).toFixed(4)}, ${Number(report.longitude).toFixed(4)}`;
    return 'N/A';
  };

  const getSeverityStyle = (score) => {
    const n = Number(score) || 0;
    if (n < 3) return { background: 'rgba(5,150,105,0.12)', color: '#059669', border: '1px solid rgba(5,150,105,0.3)' };
    if (n < 6) return { background: 'rgba(217,119,6,0.12)', color: '#d97706', border: '1px solid rgba(217,119,6,0.3)' };
    if (n < 8) return { background: 'rgba(234,88,12,0.12)', color: '#ea580c', border: '1px solid rgba(234,88,12,0.3)' };
    return { background: 'rgba(225,29,72,0.12)', color: '#e11d48', border: '1px solid rgba(225,29,72,0.3)' };
  };

  const exportToCSV = () => {
    if (!reports.length) { toast.error('No reports to export.'); return; }
    const headers = ['Title', 'Description', 'Severity Score', 'Location', 'Status', 'Submitted At'];
    const rows = filteredReports.map(r => [
      `"${(r.title || '').replace(/"/g, '""')}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`,
      r.severityScore || 0,
      `"${formatReportLocation(r)}"`,
      `"${r.status || 'REPORTED'}"`,
      `"${r.createdAt || r.timestamp || ''}"`
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const a = Object.assign(document.createElement('a'), { href: encodeURI(csv), download: `My_Flood_Reports_${new Date().toISOString().slice(0,10)}.csv` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success('CSV Report exported successfully!');
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <MdUnfoldMore className="th-sort-icon" />;
    return sortDir === 'asc' ? <MdArrowUpward className="th-sort-icon" /> : <MdArrowDownward className="th-sort-icon" />;
  };

  const filtered = reports.filter(r => {
    const m = (r.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (r.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const score = Number(r.severityScore) || 0;
    if (filterSeverity === 'HIGH') return m && score >= 6 && score < 8;
    if (filterSeverity === 'CRITICAL') return m && score >= 8;
    if (filterSeverity === 'LOW') return m && score < 6;
    return m;
  });

  const sorted = [...filtered].sort((a, b) => {
    let av = sortKey === 'severityScore' ? Number(a.severityScore) || 0
           : sortKey === 'createdAt'    ? new Date(a.createdAt || a.timestamp || 0).getTime()
           : (a[sortKey] || '').toString().toLowerCase();
    let bv = sortKey === 'severityScore' ? Number(b.severityScore) || 0
           : sortKey === 'createdAt'    ? new Date(b.createdAt || b.timestamp || 0).getTime()
           : (b[sortKey] || '').toString().toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filteredReports = filtered; // for CSV export

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">{t('myReports')}</h1>
          <p className="page-subtitle">View and track all incident reports you have submitted.</p>
          {lastFetched && (
            <div className="last-updated-badge" style={{ marginTop: '0.375rem' }}>
              <MdAccessTime size={12} />
              Updated {formatRelative(lastFetched)}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="tooltip-wrap" data-tip="Export visible reports as CSV">
            <button className="btn-export-csv" onClick={exportToCSV} disabled={reports.length === 0}>
              <MdDownload /> {t('exportCSV')}
            </button>
          </div>
          <div className="tooltip-wrap" data-tip="Reload reports from server">
            <button className="btn btn-secondary" onClick={fetchMyReports} disabled={loading}>
              <MdRefresh /> {t('refresh')}
            </button>
          </div>
          <Link to="/victim/create-report" className="btn btn-primary">
            <MdAddCircle /> {t('reportFlood')}
          </Link>
        </div>
      </div>

      {!loading && reports.length > 0 && (
        <div className="filter-toolbar">
          <div className="search-box-wrapper">
            <MdSearch className="search-icon-inside" />
            <input type="text" className="search-box-input" placeholder="Search reports by title or description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="filter-pills-container">
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'LOW'].map(sev => (
              <button key={sev} className={`filter-pill-btn ${filterSeverity === sev ? 'active' : ''}`} onClick={() => { setFilterSeverity(sev); setPage(1); }}>{sev}</button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid-3">
          {[1,2,3].map(n => <div key={n} className="glass-card skeleton-card skeleton" />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="glass-card empty-state">
          <MdDescription className="empty-state-icon" />
          <div className="empty-state-text">{reports.length === 0 ? 'No Reports Found' : 'No matching reports found'}</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            {reports.length === 0 ? "You haven't submitted any flood incident reports yet." : 'Try clearing your search query or filter pills.'}
          </p>
          <Link to="/victim/create-report" className="btn btn-primary"><MdAddCircle /> Submit a Flood Report</Link>
        </div>
      ) : (
        <div className="glass-card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className={`th-sortable ${sortKey === 'title' ? `sort-${sortDir}` : ''}`} onClick={() => handleSort('title')}>
                    Title <SortIcon col="title" />
                  </th>
                  <th>Description</th>
                  <th className={`th-sortable ${sortKey === 'severityScore' ? `sort-${sortDir}` : ''}`} onClick={() => handleSort('severityScore')}>
                    Severity <SortIcon col="severityScore" />
                  </th>
                  <th>Location (Lat, Lng)</th>
                  <th className={`th-sortable ${sortKey === 'status' ? `sort-${sortDir}` : ''}`} onClick={() => handleSort('status')}>
                    Status <SortIcon col="status" />
                  </th>
                  <th className={`th-sortable ${sortKey === 'createdAt' ? `sort-${sortDir}` : ''}`} onClick={() => handleSort('createdAt')}>
                    Submitted At <SortIcon col="createdAt" />
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((report, idx) => {
                  const score = Number(report.severityScore) || 0;
                  const sStyle = getSeverityStyle(score);
                  return (
                    <tr key={report.id || idx}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)', minWidth: '140px', maxWidth: '200px', wordBreak: 'break-word' }}>
                        {report.title || 'Untitled Report'}
                      </td>
                      <td className="td-description">
                        <div style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                          {report.description || 'N/A'}
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', color: sStyle.color, backgroundColor: sStyle.backgroundColor, border: sStyle.border }}>
                          {score.toFixed(1)}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MdLocationOn style={{ color: 'var(--accent-ocean)' }} />{formatReportLocation(report)}
                        </div>
                      </td>
                      <td><StatusBadge status={report.status || (score >= 8 ? 'CRITICAL' : score >= 6 ? 'HIGH' : 'REPORTED')} /></td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(report.createdAt || report.timestamp)}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <Link 
                          to="/victim/report-analysis" 
                          state={{ report }}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', padding: '4px 10px' }}
                          title="View AI Severity Analysis"
                        >
                          <MdAnalytics style={{ color: 'var(--accent-ocean)' }} /> Analysis
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination-bar">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default MyReports;
