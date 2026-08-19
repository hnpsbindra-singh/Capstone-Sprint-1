import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getMyDonations } from '../../api/donorApi';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import { 
  MdVolunteerActivism, MdInventory, MdSearch, MdDownload, MdRefresh, 
  MdArrowUpward, MdArrowDownward, MdUnfoldMore, MdAccessTime, 
  MdLocationOn, MdEmail, MdPhone, MdClose, MdInfo 
} from 'react-icons/md';

const PAGE_SIZE = 8;

const MyDonations = () => {
  const { getUserId } = useContext(AuthContext);

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [lastFetched, setLastFetched] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null); // Detail modal

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyDonations();
      setDonations(Array.isArray(data) ? data : data?.data || []);
      setLastFetched(new Date());
      setPage(1);
    } catch (error) {
      console.error('Error fetching my donations:', error);
      toast.error('Failed to load your donations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return String(dateValue);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return String(dateValue); }
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

  const exportToCSV = () => {
    if (!donations.length) { toast.error('No donations to export.'); return; }
    const headers = ['Item Name', 'Quantity', 'Status', 'Donated At', 'Drop-off Address', 'NGO Email'];
    const rows = filtered.map(d => [
      `"${(d.itemName || d.item || '').replace(/"/g, '""')}"`,
      d.quantity || 0,
      `"${d.status || 'PENDING'}"`,
      `"${formatDate(d.createdAt || d.donatedAt || d.date)}"`,
      `"${(d.ngoDeliveryAddress || '').replace(/"/g, '""')}"`,
      `"${d.ngoContactEmail || ''}"`
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const a = Object.assign(document.createElement('a'), { href: encodeURI(csv), download: `My_Donations_${new Date().toISOString().slice(0,10)}.csv` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success('Donations CSV exported successfully!');
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

  const filtered = donations.filter(d => {
    const itemMatch = (d.itemName || d.item || '').toLowerCase().includes(searchTerm.toLowerCase());
    const statusStr = (d.status || '').toString().toUpperCase();
    if (filterStatus === 'PENDING') return itemMatch && statusStr === 'PENDING';
    if (filterStatus === 'ACCEPTED') return itemMatch && statusStr === 'ACCEPTED';
    if (filterStatus === 'DELIVERED') return itemMatch && statusStr === 'DELIVERED';
    return itemMatch;
  });

  const sorted = [...filtered].sort((a, b) => {
    let av = sortKey === 'quantity' ? Number(a.quantity) || 0
           : sortKey === 'createdAt' ? new Date(a.createdAt || a.donatedAt || 0).getTime()
           : (a[sortKey] || '').toString().toLowerCase();
    let bv = sortKey === 'quantity' ? Number(b.quantity) || 0
           : sortKey === 'createdAt' ? new Date(b.createdAt || b.donatedAt || 0).getTime()
           : (b[sortKey] || '').toString().toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">My Donations</h1>
          <p className="page-subtitle">View history, status, and drop-off instructions for all relief items you have contributed.</p>
          {lastFetched && (
            <div className="last-updated-badge" style={{ marginTop: '0.375rem' }}>
              <MdAccessTime size={12} />
              Updated {formatRelative(lastFetched)}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="tooltip-wrap" data-tip="Export visible donations as CSV">
            <button className="btn-export-csv" onClick={exportToCSV} disabled={donations.length === 0}>
              <MdDownload /> Export CSV
            </button>
          </div>
          <div className="tooltip-wrap" data-tip="Reload donations from server">
            <button className="btn btn-secondary" onClick={fetchDonations} disabled={loading}>
              <MdRefresh /> Refresh
            </button>
          </div>
        </div>
      </div>

      {!loading && donations.length > 0 && (
        <div className="filter-toolbar">
          <div className="search-box-wrapper">
            <MdSearch className="search-icon-inside" />
            <input type="text" className="search-box-input" placeholder="Search donations by item name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="filter-pills-container">
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
            {['ALL', 'PENDING', 'ACCEPTED', 'DELIVERED'].map(status => (
              <button key={status} className={`filter-pill-btn ${filterStatus === status ? 'active' : ''}`} onClick={() => { setFilterStatus(status); setPage(1); }}>{status}</button>
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
          <MdVolunteerActivism className="empty-state-icon" />
          <div className="empty-state-text">{donations.length === 0 ? 'No Donations Found' : 'No matching donations found'}</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {donations.length === 0 ? "You haven't made any donations yet. Browse NGO requests to contribute relief supplies!" : 'Try clearing your search query or filter pills.'}
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className={`th-sortable ${sortKey === 'itemName' ? `sort-${sortDir}` : ''}`} onClick={() => handleSort('itemName')}>
                    Item Name <SortIcon col="itemName" />
                  </th>
                  <th className={`th-sortable ${sortKey === 'quantity' ? `sort-${sortDir}` : ''}`} onClick={() => handleSort('quantity')}>
                    Quantity <SortIcon col="quantity" />
                  </th>
                  <th className={`th-sortable ${sortKey === 'status' ? `sort-${sortDir}` : ''}`} onClick={() => handleSort('status')}>
                    Status <SortIcon col="status" />
                  </th>
                  <th className={`th-sortable ${sortKey === 'createdAt' ? `sort-${sortDir}` : ''}`} onClick={() => handleSort('createdAt')}>
                    Donated At <SortIcon col="createdAt" />
                  </th>
                  <th>Drop-off & NGO Contact</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((donation, index) => (
                  <tr key={donation.id || donation.donationId || donation._id || index}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.12)', color: 'var(--accent-ocean)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                          <MdInventory />
                        </div>
                        <span style={{ fontWeight: 700 }}>{donation.itemName || donation.item || 'Relief Item'}</span>
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 700, color: 'var(--accent-ocean)' }}>{donation.quantity}</span></td>
                    <td><StatusBadge status={donation.status} /></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{formatDate(donation.createdAt || donation.donatedAt || donation.date)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '4px 8px' }}
                        onClick={() => setSelectedDonation(donation)}
                      >
                        <MdLocationOn style={{ color: 'var(--accent-ocean)' }} /> View Drop-off Details
                      </button>
                    </td>
                  </tr>
                ))}
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

      {/* ── Donation Drop-off & Contact Info Modal ── */}
      {selectedDonation && (
        <div
          role="dialog" aria-modal="true"
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setSelectedDonation(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 24px 64px rgba(15,23,42,0.25)', position: 'relative', animation: 'fadeInScale 0.2s ease' }}
          >
            {/* Close btn */}
            <button onClick={() => setSelectedDonation(null)} aria-label="Close" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              <MdClose />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(2,132,199,0.1)', color: 'var(--accent-ocean)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                <MdLocationOn />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  Delivery & NGO Contact Details
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  For Donation: {selectedDonation.quantity} units of {selectedDonation.itemName}
                </p>
              </div>
            </div>

            {/* Where to send box */}
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '1.125rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
                <MdLocationOn style={{ color: '#15803d' }} /> Drop-off / Shipping Address:
              </div>
              <div style={{ fontSize: '0.925rem', color: '#14532d', fontWeight: 700, lineHeight: 1.45 }}>
                {selectedDonation.ngoDeliveryAddress || 'Designated Regional Relief Hub (Check your confirmation email)'}
              </div>
            </div>

            {/* Contact details */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              {selectedDonation.ngoTitle && (
                <div><span style={{ color: 'var(--text-muted)' }}>Target Initiative: </span><strong>{selectedDonation.ngoTitle}</strong></div>
              )}
              {selectedDonation.ngoContactEmail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MdEmail style={{ color: 'var(--accent-ocean)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>NGO Email: </span>
                  <a href={`mailto:${selectedDonation.ngoContactEmail}`} style={{ color: 'var(--accent-ocean)', fontWeight: 600 }}>
                    {selectedDonation.ngoContactEmail}
                  </a>
                </div>
              )}
              {selectedDonation.ngoContactPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MdPhone style={{ color: 'var(--accent-ocean)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>NGO Phone: </span>
                  <strong>{selectedDonation.ngoContactPhone}</strong>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                <StatusBadge status={selectedDonation.status} />
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => setSelectedDonation(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDonations;




