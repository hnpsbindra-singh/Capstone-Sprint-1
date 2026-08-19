import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHeatmap, getMyRequests, getAvailableDonations } from '../../api/ngoApi';
import HeatmapView from '../../components/HeatmapView';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import { 
  MdBusinessCenter, 
  MdInventory, 
  MdCheckCircle, 
  MdLocalShipping, 
  MdAddCircle, 
  MdMap 
} from 'react-icons/md';

const NgoDashboard = () => {
  const navigate = useNavigate();
  const { getUserId } = useAuth();
  
  const [heatmapData, setHeatmapData] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [availableDonations, setAvailableDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const userId = getUserId();
      try {
        const [heatmapRes, requestsRes, donationsRes] = await Promise.all([
          getHeatmap().catch(err => {
            console.error('Error fetching heatmap:', err);
            return [];
          }),
          getMyRequests().catch(err => {
            console.error('Error fetching my requests:', err);
            return [];
          }),
          getAvailableDonations().catch(err => {
            console.error('Error fetching available donations:', err);
            return [];
          })
        ]);

        setHeatmapData(Array.isArray(heatmapRes) ? heatmapRes : []);
        setMyRequests(Array.isArray(requestsRes) ? requestsRes : []);
        setAvailableDonations(Array.isArray(donationsRes) ? donationsRes : []);
      } catch (error) {
        console.error('Dashboard data load error:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getUserId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading NGO Dashboard...</p>
      </div>
    );
  }

  // Calculate statistics
  const totalRequests = myRequests.length;
  const openRequests = myRequests.filter(
    (req) => req.status === 'OPEN' || req.status === 'PENDING'
  ).length;
  const completedRequests = myRequests.filter(
    (req) => req.status === 'COMPLETED' || req.status === 'DELIVERED'
  ).length;
  const pendingDonations = availableDonations.filter(
    (don) => don.status === 'PENDING'
  ).length;

  const latestRequests = [...myRequests].slice(0, 4);

  return (
    <div className="page-container animate-fade-in-up">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">NGO Dashboard</h1>
          <p className="page-subtitle">Monitor disaster response requests, active donations, and risk heatmaps</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/ngo/create-request')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <MdAddCircle style={{ fontSize: '1.25rem' }} />
          Create New Request
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid-4 stagger" style={{ marginBottom: '2.5rem' }}>
        <StatsCard 
          icon={MdBusinessCenter} 
          label="Total Requests" 
          value={totalRequests} 
          color="#3b82f6" 
        />
        <StatsCard 
          icon={MdInventory} 
          label="Open Requests" 
          value={openRequests} 
          color="#f59e0b" 
        />
        <StatsCard 
          icon={MdCheckCircle} 
          label="Completed" 
          value={completedRequests} 
          color="#22c55e" 
        />
        <StatsCard 
          icon={MdLocalShipping} 
          label="Pending Donations" 
          value={pendingDonations} 
          color="#8b5cf6" 
        />
      </div>

      {/* Heatmap Section */}
      <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <MdMap style={{ fontSize: '1.5rem', color: 'var(--accent-blue)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Disaster Risk Heatmap</h2>
        </div>
        <HeatmapView data={heatmapData} />
      </div>

      {/* Latest Requests Overview */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Resource Requests</h2>
          {myRequests.length > 0 && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/ngo/my-requests')}
            >
              View All Requests
            </button>
          )}
        </div>

        {latestRequests.length === 0 ? (
          <div className="glass-card empty-state">
            <div className="empty-state-icon">
              <MdInventory />
            </div>
            <p className="empty-state-text">No resource requests submitted yet</p>
            <button 
              className="btn btn-primary btn-sm" 
              style={{ marginTop: '1rem' }}
              onClick={() => navigate('/ngo/create-request')}
            >
              Create Your First Request
            </button>
          </div>
        ) : (
          <div className="grid-2 stagger">
            {latestRequests.map((req) => {
              const needed = req.quantityNeeded || 1;
              const received = req.quantityReceived || 0;
              const progressPct = Math.min(100, Math.round((received / needed) * 100));

              return (
                <div key={req.id || req._id} className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {req.title}
                    </h3>
                    <StatusBadge status={req.status} />
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {req.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                    <span>Resource: <strong style={{ color: 'var(--text-primary)' }}>{req.resourceNeeded}</strong></span>
                    <span><strong>{received}</strong> / {needed} received</span>
                  </div>

                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NgoDashboard;
