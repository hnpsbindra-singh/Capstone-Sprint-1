import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  MdHourglassTop,
  MdShield,
  MdCheckCircle,
  MdLock,
  MdRefresh,
  MdLogout,
  MdPhone,
  MdEmail,
  MdInfoOutline
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const NgoPendingApprovalGuard = () => {
  const { user, logout, refreshUser } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const refreshed = await refreshUser();
      if (refreshed && refreshed.isApproved !== false) {
        toast.success('Your NGO account has been APPROVED by the administrator! Access granted.', {
          duration: 6000,
        });
      } else {
        toast('Your account is still pending administrator review. Please check back shortly.', {
          icon: '⏳',
          duration: 4000,
        });
      }
    } catch (err) {
      console.error('Error checking NGO status:', err);
      toast.error('Unable to reach server. Please try again in a few moments.');
    } finally {
      setChecking(false);
    }
  };

  const displayName = user?.name || user?.sub || 'Partner Organization';
  const displayEmail = user?.sub || user?.username || 'Registered Email';

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
      }}
    >
      <div
        className="glass-card animate-fade-in-up"
        style={{
          maxWidth: '640px',
          width: '100%',
          padding: '2.5rem 2rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px -15px rgba(217, 119, 6, 0.15), 0 0 0 1px rgba(245, 158, 11, 0.2)',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top colored highlight strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 50%, #b45309 100%)'
          }}
        />

        {/* Pulse Icon Shield */}
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            color: '#d97706',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 0 0 8px rgba(245, 158, 11, 0.08)',
          }}
        >
          <MdHourglassTop size={42} style={{ animation: 'spin 4s linear infinite' }} />
        </div>

        {/* Tag Pill */}
        <div style={{ marginBottom: '0.75rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#b45309',
              border: '1px solid rgba(245, 158, 11, 0.35)'
            }}
          >
            <MdShield size={14} /> NGO Verification Pending
          </span>
        </div>

        <h1
          style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em'
          }}
        >
          Account Pending Administrator Approval
        </h1>

        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
          Welcome, <strong style={{ color: '#0f172a' }}>{displayName}</strong> ({displayEmail}).
          Your organization account has been verified via OTP, but full platform access requires administrator authorization.
        </p>

        {/* Status Verification Stepper */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            textAlign: 'left',
            marginBottom: '1.75rem'
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
            Verification Progress
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Step 1: Done */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ color: '#10b981', marginTop: '2px' }}>
                <MdCheckCircle size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                  Email & OTP Verification Completed
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Your email address has been authenticated successfully.
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                DONE
              </span>
            </div>

            {/* Step 2: In Review */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ color: '#d97706', marginTop: '2px' }}>
                <MdHourglassTop size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#b45309' }}>
                  Emergency Administration Review
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Disaster response administrators verify NGO credentials to maintain network integrity.
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#d97706', background: '#fef3c7', padding: '2px 8px', borderRadius: '10px' }}>
                IN REVIEW
              </span>
            </div>

            {/* Step 3: Locked */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', opacity: 0.7 }}>
              <div style={{ color: '#94a3b8', marginTop: '2px' }}>
                <MdLock size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#64748b' }}>
                  Relief Operations & Supply Dispatch
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Creating relief requests and accepting donations will unlock once approved.
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>
                LOCKED
              </span>
            </div>
          </div>
        </div>

        {/* Notice Info Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            backgroundColor: 'rgba(2, 132, 199, 0.08)',
            border: '1px solid rgba(2, 132, 199, 0.25)',
            borderRadius: '10px',
            textAlign: 'left',
            marginBottom: '1.75rem',
            fontSize: '0.8125rem',
            color: '#0369a1',
            lineHeight: 1.45
          }}
        >
          <MdInfoOutline size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Why is approval required?</strong> To protect disaster-affected citizens and ensure legitimate aid coordination, all NGO accounts are vetted before broadcast rights are activated.
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleCheckStatus}
            disabled={checking}
            style={{
              backgroundColor: '#d97706',
              borderColor: '#d97706',
              color: '#ffffff',
              padding: '10px 22px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)',
              cursor: 'pointer'
            }}
          >
            <MdRefresh size={18} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Checking Status...' : 'Check Approval Status'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={logout}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MdLogout size={16} /> Log Out
          </button>
        </div>

        {/* Contact info footer */}
        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <MdPhone size={14} /> National Helpline: 112
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <MdEmail size={14} /> Support: admin@resqflow.org
          </span>
        </div>
      </div>
    </div>
  );
};

export default NgoPendingApprovalGuard;
