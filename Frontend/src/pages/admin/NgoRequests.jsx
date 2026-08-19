import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdBusinessCenter, MdRefresh, MdLocationOn } from 'react-icons/md';
import { getNgoRequests } from '../../api/adminApi';
import StatusBadge from '../../components/StatusBadge';

const NgoRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNgoRequests = async () => {
    setLoading(true);
    try {
      const data = await getNgoRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching NGO requests:', error);
      toast.error('Failed to fetch NGO requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgoRequests();
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
    return 'N/A';
  };

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MdBusinessCenter style={{ color: 'var(--accent-blue)' }} /> NGO Resource Requests
          </h1>
          <p className="page-subtitle">Track and manage emergency supply and assistance requests submitted by NGOs.</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchNgoRequests}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <MdRefresh /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading NGO requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <MdBusinessCenter className="empty-state-icon" />
            <p className="empty-state-text">No NGO requests found.</p>
          </div>
        </div>
      ) : (
        <div className="table-container glass-card" style={{ padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Resource Needed</th>
                <th>Quantity Needed</th>
                <th>Quantity Received</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const needed = Number(request.quantityNeeded) || 0;
                const received = Number(request.quantityReceived) || 0;
                const percentage = needed > 0 ? Math.min(Math.round((received / needed) * 100), 100) : 0;

                return (
                  <tr key={request.id || Math.random()}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {request.id ? String(request.id) : 'N/A'}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', minWidth: '140px', maxWidth: '220px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {request.title || 'Untitled Request'}
                    </td>
                    <td style={{ color: 'var(--accent-cyan)', fontWeight: 500 }}>
                      {request.resourceNeeded || 'N/A'}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {needed}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
                      {received}
                    </td>
                    <td>
                      <div style={{ minWidth: '130px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          <span>{received} / {needed}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${percentage}%`,
                              background: percentage >= 100
                                ? 'linear-gradient(90deg, #10b981, #34d399)'
                                : undefined
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={request.status} />
                    </td>
                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MdLocationOn style={{ color: 'var(--accent-cyan)' }} />
                        {formatLocation(request.location)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NgoRequests;
