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
  MdDownload
} from 'react-icons/md';

const ManageDonations = () => {
  const { getUserId } = useAuth();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

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

  const handleDeliver = async (donationId) => {
    setActionLoading((prev) => ({ ...prev, [donationId]: 'deliver' }));
    try {
      await deliverDonation(donationId);
      toast.success('Donation marked as delivered!');
      await fetchDonations();
    } catch (error) {
      console.error('Error marking donation delivered:', error);
      toast.error(error.response?.data?.message || 'Failed to mark donation as delivered');
    } finally {
      setActionLoading((prev) => ({ ...prev, [donationId]: null }));
    }
  };

  // CSV Export function
  const exportToCSV = () => {
    if (!donations || donations.length === 0) {
      toast.error('No donations available to export.');
      return;
    }
    const headers = ['Donation ID', 'Item Name', 'Quantity', 'Donor ID', 'Status'];
    const rows = filteredDonations.map(d => [
      `"${d.id || d._id || ''}"`,
      `"${(d.itemName || '').replace(/"/g, '""')}"`,
      d.quantity || 0,
      `"${d.donorId || 'Anonymous'}"`,
      `"${d.status || 'PENDING'}"`
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
    const matchesSearch = itemMatch || donorMatch;

    const statusStr = (d.status || '').toString().toUpperCase();
    if (filterStatus === 'PENDING') return matchesSearch && statusStr === 'PENDING';
    if (filterStatus === 'ACCEPTED') return matchesSearch && statusStr === 'ACCEPTED';
    if (filterStatus === 'DELIVERED') return matchesSearch && statusStr === 'DELIVERED';
    return matchesSearch;
  });

  return (
    <div className="page-container animate-fade-in-up">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Manage Donations</h1>
          <p className="page-subtitle">Review, accept, and track relief donations assigned to your NGO</p>
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
              placeholder="Search donations by item name or donor ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-pills-container">
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
            {['ALL', 'PENDING', 'ACCEPTED', 'DELIVERED'].map(status => (
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
        <div className="glass-card" style={{ padding: '1rem' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Donor ID</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation) => {
                  const donationId = donation.id || donation._id;
                  const isAccepting = actionLoading[donationId] === 'accept';
                  const isDelivering = actionLoading[donationId] === 'deliver';
                  const statusStr = (donation.status || '').toString().toUpperCase();

                  return (
                    <tr key={donationId}>
                      <td style={{ fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MdInventory style={{ color: 'var(--accent-ocean)', fontSize: '1.1rem' }} />
                          {donation.itemName || 'N/A'}
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

                        {statusStr === 'ACCEPTED' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleDeliver(donationId)}
                            disabled={Boolean(actionLoading[donationId])}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                          >
                            {isDelivering ? (
                              <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                            ) : (
                              <MdLocalShipping style={{ fontSize: '1rem' }} />
                            )}
                            Mark Delivered
                          </button>
                        )}

                        {statusStr === 'DELIVERED' && (
                          <span style={{ color: 'var(--color-delivered)', fontSize: '0.8125rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MdCheckCircle /> Delivered
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
    </div>
  );
};

export default ManageDonations;
