import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getMyDonations, dispatchDonation } from '../../api/donorApi';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import { 
  MdVolunteerActivism, MdInventory, MdSearch, MdDownload, MdRefresh, 
  MdArrowUpward, MdArrowDownward, MdUnfoldMore, MdAccessTime, 
  MdLocationOn, MdEmail, MdPhone, MdClose, MdLocalShipping, 
  MdVpnKey, MdContentCopy, MdCheck 
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
  
  // Modals state
  const [selectedDonation, setSelectedDonation] = useState(null); // Detail modal
  const [dispatchModalDonation, setDispatchModalDonation] = useState(null); // Dispatch modal
  const [dispatchSubmitting, setDispatchSubmitting] = useState(false);
  const [copiedPinId, setCopiedPinId] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({
    deliveryMethod: 'COURIER',
    carrier: '',
    trackingNumber: '',
    estimatedArrival: '',
  });

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

  const copyPin = (pin, donationId) => {
    if (!pin) return;
    navigator.clipboard.writeText(String(pin));
    setCopiedPinId(donationId);
    toast.success(`Handoff PIN ${pin} copied to clipboard!`);
    setTimeout(() => setCopiedPinId(null), 2500);
  };

  const openDispatchModal = (donation) => {
    setDispatchModalDonation(donation);
    setDispatchForm({
      deliveryMethod: 'COURIER',
      carrier: '',
      trackingNumber: '',
      estimatedArrival: '',
    });
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!dispatchModalDonation) return;

    const donationId = dispatchModalDonation.id || dispatchModalDonation._id || dispatchModalDonation.donationId;
    if (dispatchForm.deliveryMethod === 'COURIER' && !dispatchForm.carrier && !dispatchForm.trackingNumber) {
      toast.error('Please enter a carrier or tracking number for courier shipment.');
      return;
    }

    try {
      setDispatchSubmitting(true);
      await dispatchDonation(donationId, {
        deliveryMethod: dispatchForm.deliveryMethod,
        carrier: dispatchForm.carrier || (dispatchForm.deliveryMethod === 'SELF_DROPOFF' ? 'Self Drop-off' : 'Volunteer Fleet'),
        trackingNumber: dispatchForm.trackingNumber || 'N/A',
        estimatedArrival: dispatchForm.estimatedArrival || '',
      });
      toast.success('Supplies dispatched successfully! Tracking details attached.');
      setDispatchModalDonation(null);
      await fetchDonations();
    } catch (err) {
      console.error('Dispatch error:', err);
      toast.error(err.response?.data?.message || 'Failed to dispatch donation');
    } finally {
      setDispatchSubmitting(false);
    }
  };

  const exportToCSV = () => {
    if (!donations.length) { toast.error('No donations to export.'); return; }
    const headers = ['Item Name', 'Quantity', 'Status', 'Verification PIN', 'Delivery Method', 'Carrier', 'Tracking Number', 'Donated At', 'Drop-off Address', 'NGO Email'];
    const rows = filtered.map(d => [
      `"${(d.itemName || d.item || '').replace(/"/g, '""')}"`,
      d.quantity || 0,
      `"${d.status || 'PENDING'}"`,
      `"${d.verificationCode || ''}"`,
      `"${d.deliveryMethod || ''}"`,
      `"${(d.carrier || '').replace(/"/g, '""')}"`,
      `"${(d.trackingNumber || '').replace(/"/g, '""')}"`,
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
    if (filterStatus === 'DISPATCHED') return itemMatch && statusStr === 'DISPATCHED';
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
          <p className="page-subtitle">View history, status, dispatch shipments, and track drop-off instructions for your relief supplies.</p>
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
            {['ALL', 'PENDING', 'ACCEPTED', 'DISPATCHED', 'DELIVERED'].map(status => (
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
                  <th>Delivery PIN</th>
                  <th className={`th-sortable ${sortKey === 'createdAt' ? `sort-${sortDir}` : ''}`} onClick={() => handleSort('createdAt')}>
                    Donated At <SortIcon col="createdAt" />
                  </th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((donation, index) => {
                  const donationId = donation.id || donation.donationId || donation._id || index;
                  const statusStr = (donation.status || '').toString().toUpperCase();
                  const isCopied = copiedPinId === donationId;

                  return (
                    <tr key={donationId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.12)', color: 'var(--accent-ocean)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                            <MdInventory />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{donation.itemName || donation.item || 'Relief Item'}</div>
                            {donation.carrier && donation.trackingNumber && (
                              <div style={{ fontSize: '0.75rem', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <MdLocalShipping size={12} /> {donation.carrier}: #{donation.trackingNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontWeight: 700, color: 'var(--accent-ocean)' }}>{donation.quantity}</span></td>
                      <td><StatusBadge status={donation.status} /></td>
                      <td>
                        {donation.verificationCode ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(2, 132, 199, 0.08)', padding: '3px 8px', borderRadius: '6px' }}>
                            <MdVpnKey size={14} style={{ color: 'var(--accent-ocean)' }} />
                            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.875rem', letterSpacing: '1px', color: 'var(--text-primary)' }}>
                              {donation.verificationCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyPin(donation.verificationCode, donationId)}
                              title="Copy 6-digit PIN"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: isCopied ? '#16a34a' : 'var(--text-muted)' }}
                            >
                              {isCopied ? <MdCheck size={14} /> : <MdContentCopy size={13} />}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{formatDate(donation.createdAt || donation.donatedAt || donation.date)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {statusStr === 'ACCEPTED' && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '4px 9px', background: '#7c3aed', borderColor: '#7c3aed' }}
                              onClick={() => openDispatchModal(donation)}
                            >
                              <MdLocalShipping /> Dispatch / Track
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '4px 8px' }}
                            onClick={() => setSelectedDonation(donation)}
                          >
                            <MdLocationOn style={{ color: 'var(--accent-ocean)' }} /> Details
                          </button>
                        </div>
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

      {/* ── Dispatch Shipment Modal ── */}
      {dispatchModalDonation && (
        <div
          role="dialog" aria-modal="true"
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => !dispatchSubmitting && setDispatchModalDonation(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 24px 64px rgba(15,23,42,0.25)', position: 'relative', animation: 'fadeInScale 0.2s ease' }}
          >
            <button
              onClick={() => !dispatchSubmitting && setDispatchModalDonation(null)}
              aria-label="Close"
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.1rem' }}
            >
              <MdClose />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                <MdLocalShipping />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  Dispatch Relief Shipment
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Item: {dispatchModalDonation.quantity}x {dispatchModalDonation.itemName}
                </p>
              </div>
            </div>

            <form onSubmit={handleDispatchSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                  Delivery Method
                </label>
                <select
                  className="form-control"
                  value={dispatchForm.deliveryMethod}
                  onChange={e => setDispatchForm(prev => ({ ...prev, deliveryMethod: e.target.value }))}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontWeight: 600 }}
                >
                  <option value="COURIER">Courier / Postal Service</option>
                  <option value="SELF_DROPOFF">Self Drop-off (Personal Vehicle)</option>
                  <option value="VOLUNTEER_FLEET">Volunteer Fleet / Logistics Group</option>
                </select>
              </div>

              {dispatchForm.deliveryMethod === 'COURIER' ? (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                      Courier / Carrier Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. BlueDart, Delhivery, DTDC, India Post, FedEx"
                      value={dispatchForm.carrier}
                      onChange={e => setDispatchForm(prev => ({ ...prev, carrier: e.target.value }))}
                      style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                      Tracking / Consignment Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. BD-89234821"
                      value={dispatchForm.trackingNumber}
                      onChange={e => setDispatchForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                      style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontFamily: 'monospace' }}
                    />
                  </div>
                </>
              ) : (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                    Vehicle or Contact Reference
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Vehicle plate, driver contact or 'Self drop'"
                    value={dispatchForm.carrier}
                    onChange={e => setDispatchForm(prev => ({ ...prev, carrier: e.target.value }))}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                  Estimated Arrival / Drop-off Time
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={dispatchForm.estimatedArrival}
                  onChange={e => setDispatchForm(prev => ({ ...prev, estimatedArrival: e.target.value }))}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              {/* Security info card */}
              <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.875rem', marginBottom: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  <MdVpnKey style={{ color: 'var(--accent-ocean)' }} />
                  Delivery Verification Required
                </div>
                Your 6-digit PIN <strong>({dispatchModalDonation.verificationCode || 'Assigned Code'})</strong> will be requested by the NGO when supplies arrive to verify delivery.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={dispatchSubmitting}
                  onClick={() => setDispatchModalDonation(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={dispatchSubmitting}
                  style={{ background: '#7c3aed', borderColor: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {dispatchSubmitting ? 'Updating...' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
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
            style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 24px 64px rgba(15,23,42,0.25)', position: 'relative', animation: 'fadeInScale 0.2s ease', maxHeight: '90vh', overflowY: 'auto' }}
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
                  Delivery & Drop-off Details
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  For Donation: {selectedDonation.quantity} units of {selectedDonation.itemName}
                </p>
              </div>
            </div>

            {/* Delivery Verification PIN Box */}
            {selectedDonation.verificationCode && (
              <div style={{ background: '#eff6ff', border: '1.5px dashed #60a5fa', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
                  <MdVpnKey style={{ color: '#2563eb' }} /> 6-Digit Delivery Handoff PIN:
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.875rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.35rem', fontWeight: 900, letterSpacing: '4px', color: '#1e3a8a' }}>
                    {selectedDonation.verificationCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyPin(selectedDonation.verificationCode, 'modal')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {copiedPinId === 'modal' ? <MdCheck /> : <MdContentCopy />} {copiedPinId === 'modal' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p style={{ margin: '0.45rem 0 0 0', fontSize: '0.75rem', color: '#1e40af', lineHeight: 1.4 }}>
                  Provide this PIN to the receiving NGO workers or courier delivery agent on handoff. They will enter it to verify physical receipt.
                </p>
              </div>
            )}

            {/* Tracking Info if Dispatched */}
            {(selectedDonation.status === 'DISPATCHED' || selectedDonation.trackingNumber) && (
              <div style={{ background: '#f5f3ff', border: '1.5px solid #ddd6fe', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6d28d9', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                  <MdLocalShipping style={{ color: '#7c3aed' }} /> Shipment & Dispatch Details:
                </div>
                <div style={{ fontSize: '0.825rem', color: '#5b21b6', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>Method: <strong>{selectedDonation.deliveryMethod || 'COURIER'}</strong></div>
                  {selectedDonation.carrier && <div>Carrier: <strong>{selectedDonation.carrier}</strong></div>}
                  {selectedDonation.trackingNumber && <div>Tracking ID: <strong style={{ fontFamily: 'monospace' }}>{selectedDonation.trackingNumber}</strong></div>}
                  {selectedDonation.estimatedArrival && <div>Estimated Arrival: <strong>{formatDate(selectedDonation.estimatedArrival)}</strong></div>}
                  {selectedDonation.dispatchedAt && <div>Dispatched At: <strong>{formatDate(selectedDonation.dispatchedAt)}</strong></div>}
                </div>
              </div>
            )}

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
