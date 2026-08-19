import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getHeatmap, getMyDonations } from '../../api/donorApi';
import HeatmapView from '../../components/HeatmapView';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import { MdVolunteerActivism, MdInventory, MdLocalShipping, MdMap } from 'react-icons/md';

import { useLanguage } from '../../context/LanguageContext';

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { getUserId } = useContext(AuthContext);
  const { t } = useLanguage();

  const [heatmapData, setHeatmapData] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const userId = getUserId();

        const [heatmapRes, donationsRes] = await Promise.all([
          getHeatmap().catch((err) => {
            console.error('Error fetching heatmap:', err);
            return [];
          }),
          getMyDonations().catch((err) => {
            console.error('Error fetching my donations:', err);
            return [];
          })
        ]);

        setHeatmapData(Array.isArray(heatmapRes) ? heatmapRes : heatmapRes?.data || []);
        setMyDonations(Array.isArray(donationsRes) ? donationsRes : donationsRes?.data || []);
      } catch (error) {
        console.error('Failed to load donor dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getUserId]);

  const totalDonations = myDonations.length;

  const pendingCount = myDonations.filter((item) => {
    const status = (item?.status || '').toUpperCase().trim();
    return status === 'PENDING' || status === 'OPEN';
  }).length;

  const acceptedCount = myDonations.filter((item) => {
    const status = (item?.status || '').toUpperCase().trim();
    return status === 'ACCEPTED' || status === 'IN_PROGRESS' || status === 'IN PROGRESS' || status === 'INPROGRESS';
  }).length;

  const deliveredCount = myDonations.filter((item) => {
    const status = (item?.status || '').toUpperCase().trim();
    return status === 'DELIVERED' || status === 'COMPLETED';
  }).length;

  const recentDonations = myDonations.slice(0, 5);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return String(dateString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return String(dateString);
    }
  };

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title">{t('donorTitle')}</h1>
        <p className="page-subtitle">
          {t('donorSubtitle')}
        </p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards Section */}
          <div className="grid-4 stagger" style={{ marginBottom: '2rem' }}>
            <StatsCard
              icon={MdVolunteerActivism}
              label="Total Donations"
              value={totalDonations}
              color="#3b82f6"
            />
            <StatsCard
              icon={MdInventory}
              label="Pending"
              value={pendingCount}
              color="#f59e0b"
            />
            <StatsCard
              icon={MdLocalShipping}
              label="Accepted"
              value={acceptedCount}
              color="#06b6d4"
            />
            <StatsCard
              icon={MdVolunteerActivism}
              label="Delivered"
              value={deliveredCount}
              color="#22c55e"
            />
          </div>

          {/* Heatmap Section */}
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: 'var(--accent-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}
                >
                  <MdMap />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Flood Risk Heatmap</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Real-time visualization of flood severity and distress signals
                  </p>
                </div>
              </div>
            </div>
            <HeatmapView data={heatmapData} />
          </div>

          {/* Recent Donations List Section */}
          <div className="glass-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem'
              }}
            >
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Donations</h2>
              {myDonations.length > 5 && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('/donor/my-donations')}
                >
                  View All
                </button>
              )}
            </div>

            {recentDonations.length === 0 ? (
              <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
                <MdVolunteerActivism className="empty-state-icon" />
                <div className="empty-state-text">No donations made yet</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Your generosity can save lives. Browse open requests to donate relief materials.
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/donor/browse-requests')}
                >
                  Browse Requests
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {recentDonations.map((donation, index) => (
                  <div
                    key={donation.id || donation.donationId || index}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      backgroundColor: '#f8fafc',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(2, 132, 199, 0.12)',
                          color: 'var(--accent-ocean)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem',
                          flexShrink: 0
                        }}
                      >
                        <MdInventory />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                          {donation.itemName || donation.item || 'Relief Item'}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          Quantity: <span style={{ color: 'var(--accent-ocean)', fontWeight: 700 }}>{donation.quantity}</span>
                          {(donation.createdAt || donation.donatedAt || donation.date) && (
                            <span> &bull; {formatDate(donation.createdAt || donation.donatedAt || donation.date)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <StatusBadge status={donation.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DonorDashboard;
