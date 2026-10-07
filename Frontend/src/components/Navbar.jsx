import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MdMenu, 
  MdClose, 
  MdLogout 
} from 'react-icons/md';
import { AuthContext, useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const getNavItems = (t) => ({
  VICTIM: [
    { label: t('dashboard') || 'Dashboard', path: '/victim' },
    { label: t('reportFlood') || 'Report Flood', path: '/victim/create-report' },
    { label: t('myReports') || 'My Reports', path: '/victim/my-reports' },
    { label: t('heatmap') || 'Heatmap', path: '/victim/heatmap' }
  ],
  DONOR: [
    { label: t('dashboard') || 'Dashboard', path: '/donor' },
    { label: t('browseRequests') || 'Browse Requests', path: '/donor/browse-requests' },
    { label: t('myDonations') || 'My Donations', path: '/donor/my-donations' },
    { label: t('heatmap') || 'Heatmap', path: '/donor/heatmap' }
  ],
  NGO: [
    { label: t('dashboard') || 'Dashboard', path: '/ngo' },
    { label: t('createRequest') || 'Create Request', path: '/ngo/create-request' },
    { label: t('myRequests') || 'My Requests', path: '/ngo/my-requests' },
    { label: t('manageDonations') || 'Manage Donations', path: '/ngo/manage-donations' },
    { label: t('heatmap') || 'Heatmap', path: '/ngo/heatmap' }
  ],
  ADMIN: [
    { label: t('dashboard') || 'Dashboard', path: '/admin' },
    { label: t('floodReports') || 'Flood Reports', path: '/admin/flood-reports' },
    { label: t('manageVictims') || 'Manage Victims', path: '/admin/manage-victims' },
    { label: t('heatmap') || 'Heatmap', path: '/admin/heatmap' }
  ]
});

const ROLE_THEMES = {
  VICTIM: {
    label: 'VICTIM',
    avatarGradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    badgeBg: 'rgba(2, 132, 199, 0.08)',
    badgeBorder: 'rgba(2, 132, 199, 0.22)',
    badgeText: '#0284c7'
  },
  DONOR: {
    label: 'DONOR',
    avatarGradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    badgeBg: 'rgba(245, 158, 11, 0.08)',
    badgeBorder: 'rgba(245, 158, 11, 0.25)',
    badgeText: '#b45309'
  },
  NGO: {
    label: 'NGO',
    avatarGradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
    badgeBg: 'rgba(16, 185, 129, 0.08)',
    badgeBorder: 'rgba(16, 185, 129, 0.25)',
    badgeText: '#047857'
  },
  ADMIN: {
    label: 'ADMIN',
    avatarGradient: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
    badgeBg: 'rgba(99, 102, 241, 0.08)',
    badgeBorder: 'rgba(99, 102, 241, 0.25)',
    badgeText: '#4338ca'
  }
};

const getInitials = (name, role) => {
  if (name && name !== 'Commander' && name !== 'User') {
    const clean = name.trim().replace(/^[^a-zA-Z0-9]+/, '');
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  }
  return (role ? role[0] : 'U').toUpperCase();
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  let auth = {};
  try {
    if (typeof useAuth === 'function') {
      auth = useAuth() || {};
    }
  } catch (err) {}
  
  const contextVal = useContext(AuthContext);
  if (!auth.role && !auth.user && contextVal) {
    auth = contextVal;
  }

  const rawRole = (auth.role || auth.user?.role || 'VICTIM').toUpperCase();
  const roleTheme = ROLE_THEMES[rawRole] || ROLE_THEMES.VICTIM;

  // Resolve username cleanly; never show "Commander"
  const rawUsername = (
    auth.username || 
    auth.user?.username || 
    auth.user?.name || 
    auth.user?.email || 
    auth.user?.sub || 
    (typeof auth.getUsername === 'function' ? auth.getUsername() : '') || 
    ''
  );
  const username = (rawUsername && rawUsername !== 'Commander') ? rawUsername : '';
  const initials = getInitials(username, rawRole);
  const logout = auth.logout || auth.handleLogout || (() => {});

  const navItemsMap = getNavItems(t);
  const navLinks = navItemsMap[rawRole] || navItemsMap.VICTIM;

  const toggleMobileMenu = () => {
    setMobileOpen(prev => !prev);
  };

  return (
    <>
      {/* Big Tech Custom Navbar Styles */}
      <style>{`
        .resq-navbar-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(226, 232, 240, 0.85);
          box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 4px 12px -2px rgba(15, 23, 42, 0.02);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
        }

        .resq-navbar-container {
          max-width: 1360px;
          margin: 0 auto;
          height: 66px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* Brand Styling */
        .resq-brand-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          user-select: none;
          flex-shrink: 0;
          transition: opacity 0.2s ease;
        }

        .resq-brand-link:hover {
          opacity: 0.85;
        }

        .resq-brand-name {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #0f172a;
          line-height: 1;
        }

        .resq-brand-name .flow-accent {
          background: linear-gradient(135deg, #0284c7 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Center Segmented Pill Navigation */
        .resq-nav-pill-group {
          background: rgba(241, 245, 249, 0.72);
          border: 1px solid rgba(226, 232, 240, 0.85);
          padding: 4px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .resq-nav-pill-item {
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: 9999px;
          color: #475569;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          border: 1px solid transparent;
        }

        .resq-nav-pill-item:hover {
          color: #0f172a;
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
        }

        .resq-nav-pill-item.active {
          color: #ffffff;
          background: #0f172a;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.18);
        }

        /* User Capsule */
        .resq-user-capsule {
          background: rgba(248, 250, 252, 0.85);
          border: 1px solid rgba(226, 232, 240, 0.85);
          border-radius: 9999px;
          padding: 4px 6px 4px 5px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: box-shadow 0.2s ease;
        }

        .resq-user-capsule:hover {
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
        }

        .resq-user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          flex-shrink: 0;
        }

        .resq-user-name {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          max-width: 140px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .resq-role-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 9999px;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .resq-capsule-divider {
          width: 1px;
          height: 16px;
          background: #cbd5e1;
        }

        .resq-logout-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 9999px;
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .resq-logout-btn:hover {
          background: rgba(239, 68, 68, 0.08);
          color: #dc2626;
        }

        .resq-mobile-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .resq-mobile-btn:hover {
          background: #f1f5f9;
        }

        /* Mobile Dropdown Card */
        .resq-mobile-card {
          margin: 0 16px 16px 16px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 18px;
          box-shadow: 0 16px 36px -4px rgba(15, 23, 42, 0.12);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: resqSlideDown 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes resqSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .resq-mobile-nav-link {
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 10px 14px;
          border-radius: 12px;
          color: #334155;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          transition: all 0.18s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .resq-mobile-nav-link.active {
          background: #0f172a;
          color: #ffffff;
          font-weight: 600;
          border-color: #0f172a;
        }
      `}</style>

      <nav className="resq-navbar-header">
        <div className="resq-navbar-container">
          {/* 1. Brand Mark */}
          <NavLink to="/" className="resq-brand-link">
            <span className="resq-brand-name">
              ResQ<span className="flow-accent">Flow</span>
            </span>
          </NavLink>

          {/* 2. Desktop Segmented Nav Capsule */}
          <div className="desktop-menu resq-nav-pill-group">
            {navLinks.map((item) => (
              <NavLink
                key={item.path || 'dashboard'}
                to={item.path}
                end={['/victim', '/donor', '/ngo', '/admin'].includes(item.path)}
                className={({ isActive }) => `resq-nav-pill-item ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* 3. Desktop User Capsule */}
          <div className="desktop-user">
            <div className="resq-user-capsule">
              {/* Dynamic Gradient Avatar with Initials */}
              <div 
                className="resq-user-avatar" 
                style={{ background: roleTheme.avatarGradient }}
                title={username || roleTheme.label}
              >
                {initials}
              </div>

              {/* User Identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {username ? (
                  <span className="resq-user-name" title={username}>{username}</span>
                ) : null}
                <span 
                  className="resq-role-badge"
                  style={{
                    backgroundColor: roleTheme.badgeBg,
                    border: `1px solid ${roleTheme.badgeBorder}`,
                    color: roleTheme.badgeText
                  }}
                >
                  {roleTheme.label}
                </span>
              </div>

              <div className="resq-capsule-divider" />

              {/* Minimal Sign Out Button */}
              <button onClick={logout} className="resq-logout-btn" title="Sign out of ResQFlow">
                <MdLogout size={15} />
                <span>{t('logout') || 'Sign Out'}</span>
              </button>
            </div>
          </div>

          {/* 4. Mobile Hamburger Trigger */}
          <div className="mobile-hamburger-btn" style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="resq-mobile-btn"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <MdClose size={22} color="#0284c7" /> : <MdMenu size={22} color="#0f172a" />}
            </button>
          </div>
        </div>

        {/* 5. Mobile Drawer */}
        {mobileOpen && (
          <div className="resq-mobile-card">
            {/* Mobile User Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div 
                  className="resq-user-avatar" 
                  style={{ background: roleTheme.avatarGradient, width: '32px', height: '32px' }}
                >
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                    {username || `${roleTheme.label} User`}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Active Session
                  </div>
                </div>
              </div>
              <span 
                className="resq-role-badge"
                style={{
                  backgroundColor: roleTheme.badgeBg,
                  border: `1px solid ${roleTheme.badgeBorder}`,
                  color: roleTheme.badgeText
                }}
              >
                {roleTheme.label}
              </span>
            </div>

            {/* Mobile Nav Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0' }}>
              {navLinks.map((item) => (
                <NavLink
                  key={item.path || 'dashboard'}
                  to={item.path}
                  end={['/victim', '/donor', '/ngo', '/admin'].includes(item.path)}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `resq-mobile-nav-link ${isActive ? 'active' : ''}`}
                >
                  <span>{item.label}</span>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>→</span>
                </NavLink>
              ))}
            </div>

            {/* Mobile Sign Out */}
            <button 
              onClick={() => { setMobileOpen(false); logout(); }} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              <MdLogout size={16} />
              <span>{t('logout') || 'Sign Out'}</span>
            </button>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
