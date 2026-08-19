import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdVolunteerActivism, MdRefresh, MdSearch, MdDownload } from 'react-icons/md';
import { getDonations } from '../../api/adminApi';
import StatusBadge from '../../components/StatusBadge';

const AllDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const data = await getDonations();
      setDonations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      let date;
      if (typeof timestamp === 'number') {
        date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
      } else {
        date = new Date(timestamp);
      }
      if (isNaN(date.getTime())) return String(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return String(timestamp);
    }
  };

  // CSV Export function
  const exportToCSV = () => {
    if (!donations || donations.length === 0) {
      toast.error('No donations available to export.');
      return;
    }
    const headers = ['Donation ID', 'Donor ID', 'Item Name', 'Quantity', 'Status', 'Donated At', 'NGO Request ID'];
    const rows = filteredDonations.map(d => [
      `"${d.id || ''}"`,
      `"${d.donorId || ''}"`,
      `"${(d.itemName || '').replace(/"/g, '""')}"`,
      d.quantity || 0,
      `"${d.status || 'PENDING'}"`,
      `"${formatDate(d.donatedAt)}"`,
      `"${d.ngoRequestId || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Admin_All_Donations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Admin donations CSV exported!');
  };

  // Filter donations
  const filteredDonations = donations.filter(d => {
    const itemMatch = (d.itemName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const donorMatch = String(d.donorId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const ngoMatch = String(d.ngoRequestId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = itemMatch || donorMatch || ngoMatch;

    const statusStr = (d.status || '').toString().toUpperCase();
    if (filterStatus === 'PENDING') return matchesSearch && statusStr === 'PENDING';
    if (filterStatus === 'ACCEPTED') return matchesSearch && statusStr === 'ACCEPTED';
    if (filterStatus === 'DELIVERED') return matchesSearch && statusStr === 'DELIVERED';
    return matchesSearch;
  });

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MdVolunteerActivism style={{ color: 'var(--accent-emerald)' }} /> All Relief Donations
          </h1>
          <p className="page-subtitle">View and audit all aid contributions pledged by donors.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-export-csv" onClick={exportToCSV} disabled={donations.length === 0}>
            <MdDownload /> Export CSV
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchDonations}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <MdRefresh /> Refresh
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
              placeholder="Search by item name, donor ID, or NGO request ID..."
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

      {loading ? (
        <div className="grid-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="glass-card skeleton-card skeleton" />
          ))}
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <MdVolunteerActivism className="empty-state-icon" />
            <p className="empty-state-text">
              {donations.length === 0 ? 'No donations found.' : 'No donations matching search filter.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-container glass-card" style={{ padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Donor ID</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Donated At</th>
                <th>NGO Request ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((donation) => (
                <tr key={donation.id || Math.random()}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {donation.id ? String(donation.id) : 'N/A'}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {donation.donorId ? String(donation.donorId) : 'N/A'}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {donation.itemName || 'N/A'}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-ocean)' }}>
                    {donation.quantity !== undefined && donation.quantity !== null ? donation.quantity : 0}
                  </td>
                  <td>
                    <StatusBadge status={donation.status} />
                  </td>
                  <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {formatDate(donation.donatedAt)}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {donation.ngoRequestId ? String(donation.ngoRequestId) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllDonations;
