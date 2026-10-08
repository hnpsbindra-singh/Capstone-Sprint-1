import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAvailableDonations, acceptDonation, deliverDonation } from '../../api/ngoApi';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import { 
  MdLocalShipping, 
  MdCheckCircle, 
  MdRefresh, 
  MdInventory,
  MdSearch,
  MdDownload,
  MdVpnKey,
  MdClose,
  MdInfo
} from 'react-icons/md';

const ManageDonations = () => {
  const { getUserId } = useAuth();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Delivery Verification Modal State
  const [verifyModalDonation, setVerifyModalDonation] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const data = await getAvailableDonations();
      setDonations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching available donations:', error);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleAccept = async (donationId) => {
    setActionLoading((prev) => ({ ...prev, [donationId]: 'accept' }));
    try {
      await acceptDonation(donationId);
      toast.success('Donation accepted successfully!');
      await fetchDonations();
    } catch (error) {
      console.error('Error accepting donation:', error);
      toast.error(error.response?.data?.message || 'Failed to accept donation');
    } finally {
      setActionLoading((prev) => ({ ...prev, [donationId]: null }));
    }
  };

  const openVerifyModal = (donation) => {
    setVerifyModalDonation(donation);
    setVerificationCode('');
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyModalDonation) return;

    const donationId = verifyModalDonation.id || verifyModalDonation._id;
    const cleanCode = verificationCode.trim();

    if (!cleanCode) {
      toast.error('Please enter the 6-digit verification PIN provided by the donor.');
      return;
    }

    setIsVerifying(true);
    try {
      await deliverDonation(donationId, cleanCode);
      toast.success('Donation verified and officially marked as DELIVERED!');
      setVerifyModalDonation(null);
      await fetchDonations();
    } catch (error) {
      console.error('Error verifying delivery:', error);
      toast.error(error.response?.data?.message || 'Invalid verification PIN. Please re-check with donor/courier.');
    } finally {
      setIsVerifying(false);
    }
  };

  // CSV Export function
  const exportToCSV = () => {
    if (!donations || donations.length === 0) {
      toast.error('No donations available to export.');
      return;
    }
    const headers = ['Donation ID', 'Item Name', 'Quantity', 'Donor ID', 'Status', 'Carrier', 'Tracking Number'];
    const rows = filteredDonations.map(d => [
      `"${d.id || d._id || ''}"`,
      `"${(d.itemName || '').replace(/"/g, '""')}"`,
      d.quantity || 0,
      `"${d.donorId || 'Anonymous'}"`,
      `"${d.status || 'PENDING'}"`,
      `"${(d.carrier || '').replace(/"/g, '""')}"`,
      `"${(d.trackingNumber || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NGO_Managed_Donations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Donations CSV exported successfully!');
  };

  // Filter donations
  const filteredDonations = donations.filter(d => {
    const itemMatch = (d.itemName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const donorMatch = String(d.donorId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const trackingMatch = String(d.trackingNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = itemMatch || donorMatch || trackingMatch;

    const statusStr = (d.status || '').toString().toUpperCase();
    if (filterStatus === 'PENDING') return matchesSearch && statusStr === 'PENDING';
    if (filterStatus === 'ACCEPTED') return matchesSearch && statusStr === 'ACCEPTED';
    if (filterStatus === 'DISPATCHED') return matchesSearch && statusStr === 'DISPATCHED';
    if (filterStatus === 'DELIVERED') return matchesSearch && statusStr === 'DELIVERED';
    return matchesSearch;
  });

  return (
    <div className="page-container animate-fade-in-up">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Manage Donations</h1>
          <p className="page-subtitle">Review, accept, track shipments, and verify incoming relief supplies for your NGO</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-export-csv" onClick={exportToCSV} disabled={donations.length === 0}>
            <MdDownload /> Export CSV
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchDonations}
            disabled={loading}
            title="Refresh list"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <MdRefresh style={{ fontSize: '1.2rem' }} />
            Refresh List
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      {!loading && donations.length > 0 && (
        <div className="filter-toolbar">
          <div className="search-box-wrapper">
            <MdSearch className="search-icon-inside" />
            <input
              type="text"
              className="search-box-input"
              placeholder="Search donations by item name, donor ID, or tracking number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-pills-container">
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
            {['ALL', 'PENDING', 'ACCEPTED', 'DISPATCHED', 'DELIVERED'].map(status => (
              <button
                key={status}
                className={`filter-pill-btn ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="glass-card skeleton-card skeleton" />
          ))}
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">
            <MdLocalShipping />
          </div>
          <h3 className="empty-state-text">
            {donations.length === 0 ? 'No Donations Available' : 'No donations matching search filter'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            {donations.length === 0
              ? 'There are currently no active or pending donations assigned to your requests.'
              : 'Try clearing your search query or filter pills.'}
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Donor ID</th>
                  <th>Status</th>
                  <th>Shipment / Tracking</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation) => {
                  const donationId = donation.id || donation._id;
                  const isAccepting = actionLoading[donationId] === 'accept';
                  const statusStr = (donation.status || '').toString().toUpperCase();

                  return (
                    <tr key={donationId}>
                      <td style={{ fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MdInventory style={{ color: 'var(--accent-ocean)', fontSize: '1.1rem', flexShrink: 0 }} />
                          <div>
                            <div>{donation.itemName || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          {donation.quantity}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {donation.donorId || 'Anonymous'}
                      </td>
                      <td>
                        <StatusBadge status={donation.status} />
                      </td>
                      <td>
                        {donation.carrier || donation.trackingNumber ? (
                          <div style={{ fontSize: '0.8125rem', color: '#5b21b6', background: 'rgba(124, 58, 237, 0.08)', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MdLocalShipping size={13} style={{ color: '#7c3aed' }} />
                            <span><strong>{donation.carrier || 'Courier'}</strong> {donation.trackingNumber ? `(#${donation.trackingNumber})` : ''}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Pending Dispatch</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {statusStr === 'PENDING' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAccept(donationId)}
                            disabled={Boolean(actionLoading[donationId])}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                          >
                            {isAccepting ? (
                              <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                            ) : (
                              <MdCheckCircle style={{ fontSize: '1rem' }} />
                            )}
                            Accept
                          </button>
                        )}

                        {(statusStr === 'ACCEPTED' || statusStr === 'DISPATCHED') && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => openVerifyModal(donation)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#059669', borderColor: '#059669' }}
                          >
                            <MdCheckCircle style={{ fontSize: '1rem' }} />
                            Verify & Receive
                          </button>
                        )}

                        {statusStr === 'DELIVERED' && (
                          <span style={{ color: 'var(--color-delivered)', fontSize: '0.8125rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MdCheckCircle /> Delivered & Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Delivery Verification Modal ── */}
      {verifyModalDonation && (
        <div
          role="dialog" aria-modal="true"
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => !isVerifying && setVerifyModalDonation(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: '460px', boxShadow: '0 24px 64px rgba(15,23,42,0.25)', position: 'relative', animation: 'fadeInScale 0.2s ease' }}
          >
            <button
              onClick={() => !isVerifying && setVerifyModalDonation(null)}
              aria-label="Close"
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.1rem' }}
            >
              <MdClose />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                <MdCheckCircle />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  Verify Delivery Receipt
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Item: {verifyModalDonation.quantity}x {verifyModalDonation.itemName}
                </p>
              </div>
            </div>

            {/* Shipment details summary */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.875rem', marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Donor:</span>
                <strong>{verifyModalDonation.donorId || 'Anonymous'}</strong>
              </div>
              {verifyModalDonation.carrier && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Carrier / Method:</span>
                  <strong>{verifyModalDonation.carrier} ({verifyModalDonation.deliveryMethod || 'COURIER'})</strong>
                </div>
              )}
              {verifyModalDonation.trackingNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tracking Number:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{verifyModalDonation.trackingNumber}</strong>
                </div>
              )}
            </div>

            <form onSubmit={handleVerifySubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Enter 6-Digit Delivery Handoff PIN
                </label>
                <div style={{ position: 'relative' }}>
                  <MdVpnKey style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.2rem' }} />
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="e.g. 549201"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.75rem',
                      borderRadius: '8px',
                      border: '2px solid #059669',
                      fontSize: '1.25rem',
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      letterSpacing: '4px',
                      textAlign: 'center',
                      background: '#f0fdf4',
                      color: '#065f46'
                    }}
                  />
                </div>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Ask the donor or courier agent for the 6-digit confirmation code shown on their dispatch receipt or donor dashboard.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={isVerifying}
                  onClick={() => setVerifyModalDonation(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={isVerifying}
                  style={{ background: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {isVerifying ? 'Verifying...' : 'Verify & Mark Delivered'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDonations;
