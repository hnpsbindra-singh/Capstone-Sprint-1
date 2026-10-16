import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  MdMenu, 
  MdClose, 
  MdLogout,
  MdArrowForward,
  MdOpenInNew
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
    { label: t('manageAccounts') || t('manageVictims') || 'Manage Account', path: '/admin/manage-victims' },
    { label: t('ngoRequests') || 'NGO Requests', path: '/admin/ngo-requests' },
    { label: t('allDonations') || 'All Donations', path: '/admin/donations' },
    { label: t('heatmap') || 'Heatmap', path: '/admin/heatmap' }
  ]
});

const ROLE_THEMES = {
  VICTIM: { label: 'VICTIM', color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  DONOR: { label: 'DONOR', color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd' },
  NGO: { label: 'NGO', color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
  ADMIN: { label: 'ADMIN', color: '#7c3aed', bg: '#f3e8ff', border: '#e9d5ff' }
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
  const location = useLocation();
  const { t, lang, changeLanguage } = useLanguage();

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

  const isUnapprovedNgo = rawRole === 'NGO' && auth.user?.isApproved === false;
  const navItemsMap = getNavItems(t);
  const navLinks = isUnapprovedNgo ? [] : (navItemsMap[rawRole] || navItemsMap.VICTIM);

  // Auto-close mobile drawer on route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [mobileOpen]);

  // Close drawer on Escape key or when window resizes to desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth > 960) setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <style>{`
        .app-navbar-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid #e4e4e7;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          padding-top: env(safe-area-inset-top, 0px);
          padding-left: env(safe-area-inset-left, 0px);
          padding-right: env(safe-area-inset-right, 0px);
        }

        .app-navbar-container {
          max-width: 1380px;
          margin: 0 auto;
          height: 60px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .app-brand-link {
          display: inline-flex;
          align-items: baseline;
          gap: 8px;
          text-decoration: none;
          color: #09090b;
          flex-shrink: 0;
        }

        .app-brand-text {
          font-size: 1.18rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #09090b;
          line-height: 1;
        }

        .app-brand-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.625rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          padding: 2px 6px;
          border-radius: 4px;
        }

        /* Segmented Nav Group (Desktop) */
        .app-nav-group {
          background: #f4f4f5;
          border: 1px solid #e4e4e7;
          border-radius: 9999px;
          padding: 3px;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .app-nav-item {
          text-decoration: none;
          font-size: 0.8125rem;
          font-weight: 600;
          padding: 6px 13px;
          border-radius: 9999px;
          color: #52525b;
          transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }

        .app-nav-item:hover {
          color: #09090b;
          background: #ffffff;
        }

        .app-nav-item.active {
          color: #ffffff;
          background: #09090b;
          font-weight: 700;
          box-shadow: 0 1px 2px rgba(0,0,0,0.08);
        }

        /* Right Actions */
        .app-right-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        /* Language Switcher */
        .app-lang-switcher {
          display: inline-flex;
          align-items: center;
          background: #f4f4f5;
          border: 1px solid #e4e4e7;
          border-radius: 6px;
          padding: 2px;
          gap: 2px;
        }

        .app-lang-btn {
          background: transparent;
          border: none;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6875rem;
          font-weight: 700;
          color: #71717a;
          padding: 3px 7px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 120ms ease;
          line-height: 1.2;
          min-height: unset !important;
          min-width: unset !important;
        }

        .app-lang-btn.active {
          background: #09090b;
          color: #ffffff;
        }

        /* User Profile Capsule */
        .app-user-pill {
          background: #fafafa;
          border: 1px solid #e4e4e7;
          border-radius: 9999px;
          padding: 3px 8px 3px 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .app-user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #09090b;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6875rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .app-user-name {
          font-size: 0.8125rem;
          font-weight: 700;
          color: #09090b;
          max-width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .app-role-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.625rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.04em;
        }

        .app-logout-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 8px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: #71717a;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 140ms ease;
          min-height: unset !important;
          min-width: unset !important;
        }

        .app-logout-btn:hover {
          color: #dc2626;
          background: #fee2e2;
        }

        /* Mobile Trigger */
        .app-mobile-trigger {
          display: none;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: #fafafa;
          border: 1px solid #e4e4e7;
          color: #09090b;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 140ms ease;
          padding: 0;
          min-height: 38px !important;
          min-width: 38px !important;
        }

        .app-mobile-trigger:active {
          transform: scale(0.96);
          background: #f4f4f5;
        }

        /* Responsive Breakpoints */
        @media (max-width: 960px) {
          .app-nav-group {
            display: none !important;
          }
          .app-mobile-trigger {
            display: flex !important;
          }
          .app-user-name,
          .app-logout-btn {
            display: none !important;
          }
          .app-user-pill {
            padding: 2px;
            background: transparent;
            border: none;
          }
        }

        @media (max-width: 640px) {
          .app-navbar-container {
            height: 56px;
            padding: 0 12px;
            gap: 8px;
          }

          .app-brand-text {
            font-size: 1.08rem;
          }

          .app-role-badge {
            display: none !important;
          }
        }

        /* ─── PORTAL-RENDERED MOBILE DRAWER ─── */
        .app-drawer-portal-overlay {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          background: rgba(9, 9, 11, 0.52);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 999999;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          animation: appDrawerOverlayFade 180ms ease forwards;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @keyframes appDrawerOverlayFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .app-drawer-portal-sheet {
          background: #ffffff;
          border-bottom: 1px solid #e4e4e7;
          border-radius: 0 0 18px 18px;
          box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.25);
          padding: 1rem 1.15rem 1.5rem;
          padding-top: max(1rem, calc(0.75rem + env(safe-area-inset-top, 0px)));
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          max-height: 88vh;
          max-height: 88dvh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          animation: appDrawerSheetSlide 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes appDrawerSheetSlide {
          from { transform: translateY(-16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .app-drawer-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f4f4f5;
        }

        .app-drawer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #09090b;
        }

        .app-drawer-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid #e4e4e7;
          background: #fafafa;
          color: #09090b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 120ms ease;
        }

        .app-drawer-close-btn:active {
          transform: scale(0.95);
          background: #f4f4f5;
        }

        .app-drawer-session-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0.85rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          gap: 10px;
        }

        .app-drawer-session-user {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .app-drawer-nav-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .app-drawer-nav-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1rem;
          border-radius: 10px;
          background: #fafafa;
          border: 1px solid #e4e4e7;
          text-decoration: none;
          color: #09090b;
          font-size: 0.92rem;
          font-weight: 600;
          min-height: 48px;
          transition: all 140ms ease;
        }

        .app-drawer-nav-link.active {
          background: #09090b;
          color: #ffffff;
          border-color: #09090b;
          font-weight: 700;
        }

        .app-drawer-nav-link:active {
          transform: scale(0.98);
        }

        .app-drawer-footer {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          margin-top: 0.25rem;
        }

        .app-drawer-signout-btn {
          width: 100%;
          min-height: 46px;
          border-radius: 10px;
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          font-weight: 700;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 140ms ease;
        }

        .app-drawer-signout-btn:active {
          transform: scale(0.98);
          background: #fee2e2;
        }

        .app-drawer-landing-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #71717a;
          text-decoration: none;
          padding: 6px;
        }

        .app-drawer-landing-link:hover {
          color: #09090b;
        }
      `}</style>

      {/* ─── DESKTOP & MOBILE TOP HEADER BAR ─── */}
      <header className="app-navbar-header">
        <div className="app-navbar-container">
          {/* Brand Mark (links to role dashboard) */}
          <Link 
            to={`/${rawRole.toLowerCase()}`} 
            className="app-brand-link"
            title="Go to Dashboard"
          >
            <span className="app-brand-text">ResQFlow</span>
            <span 
              className="app-brand-badge"
              style={{ color: roleTheme.color, backgroundColor: roleTheme.bg }}
            >
              {roleTheme.label}
            </span>
            {isUnapprovedNgo && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#b45309',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                ⏳ Pending Approval
              </span>
            )}
          </Link>

          {/* Center Navigation Group (Desktop $\ge$ 960px) */}
          <nav className="app-nav-group" aria-label="Main Navigation">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={['/victim', '/donor', '/ngo', '/admin'].includes(item.path)}
                className={({ isActive }) => `app-nav-item ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Matrix */}
          <div className="app-right-actions">
            {/* Language Switcher */}
            <div className="app-lang-switcher" title="Select Interface Language">
              <button
                type="button"
                className={`app-lang-btn ${lang === 'EN' ? 'active' : ''}`}
                onClick={() => changeLanguage('EN')}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                className={`app-lang-btn ${lang === 'HI' ? 'active' : ''}`}
                onClick={() => changeLanguage('HI')}
                aria-label="Switch to Hindi"
              >
                HI
              </button>
            </div>

            {/* User Capsule */}
            <div className="app-user-pill">
              <div className="app-user-avatar" title={username || roleTheme.label}>
                {initials}
              </div>
              {username ? (
                <span className="app-user-name" title={username}>{username}</span>
              ) : null}
              <span
                className="app-role-badge"
                style={{ color: roleTheme.color, backgroundColor: roleTheme.bg }}
              >
                {roleTheme.label}
              </span>
              <button
                type="button"
                onClick={logout}
                className="app-logout-btn"
                title="Sign out of ResQFlow"
                aria-label="Sign out"
              >
                <MdLogout size={14} />
              </button>
            </div>

            {/* Mobile Hamburger Trigger (shown $\le$ 960px) */}
            <button
              type="button"
              onClick={() => setMobileOpen(prev => !prev)}
              className="app-mobile-trigger"
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <MdClose size={20} /> : <MdMenu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── PORTAL-MOUNTED MOBILE DRAWER ─── */}
      {mobileOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="app-drawer-portal-overlay" 
          onClick={() => setMobileOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
        >
          <div 
            className="app-drawer-portal-sheet" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Top Header */}
            <div className="app-drawer-topbar">
              <Link 
                to={`/${rawRole.toLowerCase()}`}
                className="app-drawer-brand"
                onClick={() => setMobileOpen(false)}
              >
                <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                  ResQFlow
                </span>
                <span 
                  className="app-brand-badge"
                  style={{ color: roleTheme.color, backgroundColor: roleTheme.bg }}
                >
                  {roleTheme.label}
                </span>
              </Link>

              <button
                type="button"
                className="app-drawer-close-btn"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Active User Session Details */}
            <div className="app-drawer-session-card">
              <div className="app-drawer-session-user">
                <div className="app-user-avatar">
                  {initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    color: '#09090b', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    maxWidth: '170px'
                  }}>
                    {username || `${roleTheme.label} Session`}
                  </div>
                  <div style={{ fontSize: '0.6875rem', fontFamily: 'JetBrains Mono', color: '#64748b' }}>
                    ROLE // {roleTheme.label}
                  </div>
                </div>
              </div>

              {/* Language Switcher in Drawer */}
              <div className="app-lang-switcher">
                <button
                  type="button"
                  className={`app-lang-btn ${lang === 'EN' ? 'active' : ''}`}
                  onClick={() => changeLanguage('EN')}
                >
                  EN
                </button>
                <button
                  type="button"
                  className={`app-lang-btn ${lang === 'HI' ? 'active' : ''}`}
                  onClick={() => changeLanguage('HI')}
                >
                  HI
                </button>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="app-drawer-nav-list" aria-label="Mobile Navigation Links">
              {isUnapprovedNgo && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#92400e',
                    fontSize: '0.8rem',
                    lineHeight: 1.45,
                    marginBottom: '0.5rem'
                  }}
                >
                  ⏳ <strong>Approval In Review:</strong> Navigation is locked while your NGO account awaits administrator verification.
                </div>
              )}
              {navLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={['/victim', '/donor', '/ngo', '/admin'].includes(item.path)}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `app-drawer-nav-link ${isActive ? 'active' : ''}`}
                >
                  <span>{item.label}</span>
                  <MdArrowForward size={16} style={{ opacity: 0.6 }} />
                </NavLink>
              ))}
            </nav>

            {/* Actions & Sign Out */}
            <div className="app-drawer-footer">
              <button
                type="button"
                onClick={() => { setMobileOpen(false); logout(); }}
                className="app-drawer-signout-btn"
              >
                <MdLogout size={17} />
                <span>{t('logout') || 'Sign Out'}</span>
              </button>

              <Link 
                to="/" 
                className="app-drawer-landing-link"
                onClick={() => setMobileOpen(false)}
              >
                <span>ResQFlow Public Portal</span>
                <MdOpenInNew size={13} />
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Navbar;
