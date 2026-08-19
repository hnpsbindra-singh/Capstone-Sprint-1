import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyRequests } from '../../api/ngoApi';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import { MdInventory, MdAddCircle, MdRefresh, MdLocationOn, MdEmail } from 'react-icons/md';

const MyRequests = () => {
  const navigate = useNavigate();
  const { getUserId } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getMyRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading my requests:', error);
      toast.error('Failed to load your resource requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [getUserId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your requests...</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in-up">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">My Resource Requests</h1>
          <p className="page-subtitle">Track the status and progress of relief supplies requested by your organization</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchRequests}
            title="Refresh list"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <MdRefresh style={{ fontSize: '1.2rem' }} />
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/ngo/create-request')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <MdAddCircle style={{ fontSize: '1.25rem' }} />
            New Request
          </button>
        </div>
      </div>

      {/* Content / List */}
      {requests.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">
            <MdInventory />
          </div>
          <h3 className="empty-state-text">No Resource Requests Found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
            You have not submitted any relief resource requests yet.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/ngo/create-request')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <MdAddCircle style={{ fontSize: '1.25rem' }} />
            Create Request
          </button>
        </div>
      ) : (
        <div className="grid-2 stagger">
          {requests.map((req) => {
            const needed = req.quantityNeeded || 1;
            const received = req.quantityReceived || 0;
            const percentage = Math.min(100, Math.round((received / needed) * 100));

            return (
              <div key={req.id || req._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Top Bar: Title & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {req.title}
                    </h3>
                    <StatusBadge status={req.status} />
                  </div>

                  {/* Description */}
                  {req.description && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {req.description}
                    </p>
                  )}

                  {/* Details Badge / Info */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Resource: </span>
                      <strong style={{ color: 'var(--accent-blue)' }}>{req.resourceNeeded}</strong>
                    </div>
                  </div>

                  {/* Drop-off & Contact Details */}
                  {req.deliveryAddress && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.8rem', color: '#475569', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginBottom: '0.75rem' }}>
                      <MdLocationOn style={{ color: 'var(--accent-ocean)', fontSize: '1rem', flexShrink: 0, marginTop: '1px' }} />
                      <span><strong>Drop-off Address:</strong> {req.deliveryAddress}</span>
                    </div>
                  )}

                  {req.contactEmail && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      <MdEmail style={{ color: 'var(--accent-ocean)' }} />
                      <span>{req.contactEmail}</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar & Quantity Text */}
                <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Fulfillment Progress</span>
                    <span style={{ fontWeight: 700, color: percentage === 100 ? 'var(--color-delivered)' : 'var(--text-primary)' }}>
                      {received}/{needed} received ({percentage}%)
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${percentage}%`,
                        background: percentage === 100 
                          ? 'linear-gradient(90deg, #10b981, #14b8a6)' 
                          : 'linear-gradient(90deg, #3b82f6, #06b6d4)'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
