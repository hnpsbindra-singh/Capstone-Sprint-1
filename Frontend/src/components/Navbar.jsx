import React, { useState, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  MdMenu, 
  MdClose, 
  MdLogout,
  MdShield,
  MdLanguage,
  MdTranslate
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
  VICTIM: { label: 'VICTIM', color: '#dc2626', bg: '#fee2e2' },
  DONOR: { label: 'DONOR', color: '#0284c7', bg: '#e0f2fe' },
  NGO: { label: 'NGO', color: '#16a34a', bg: '#dcfce7' },
  ADMIN: { label: 'ADMIN', color: '#7c3aed', bg: '#f3e8ff' }
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

  const navItemsMap = getNavItems(t);
  const navLinks = navItemsMap[rawRole] || navItemsMap.VICTIM;

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
        }

        .app-navbar-container {
          max-width: 1380px;
          margin: 0 auto;
          height: 64px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .app-brand-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #09090b;
        }

        .app-brand-logo-box {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: #09090b;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
        }

        .app-brand-text {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #09090b;
          line-height: 1;
        }

        .app-brand-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.625rem;
          font-weight: 700;
          color: #71717a;
          letter-spacing: 0.06em;
          margin-left: 4px;
        }

        /* Segmented Nav Group */
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
          padding: 6px 14px;
          border-radius: 9999px;
          color: #52525b;
          transition: all 160ms cubic-bezier(0.16, 1, 0.3, 1);
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
        }

        /* Right Actions */
        .app-right-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Language Switcher */
        .app-lang-switcher {
          display: flex;
          align-items: center;
          background: #f4f4f5;
          border: 1px solid #e4e4e7;
          border-radius: 6px;
          padding: 2px;
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
          transition: all 150ms ease;
        }

        .app-lang-btn.active {
          background: #09090b;
          color: #ffffff;
        }

        /* User Profile Pill */
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
          max-width: 130px;
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
          transition: all 160ms ease;
        }

        .app-logout-btn:hover {
          color: #dc2626;
          background: #fee2e2;
        }

        .app-mobile-trigger {
          display: none;
          width: 36px;
          height: 36px;
          border-radius: 6px;
          background: #fafafa;
          border: 1px solid #e4e4e7;
          color: #09090b;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        @media (max-width: 960px) {
          .app-nav-group { display: none; }
          .app-mobile-trigger { display: flex; }
        }

        @media (max-width: 640px) {
          .app-navbar-container {
            height: 56px;
            padding: 0 12px;
            gap: 8px;
          }

          .app-brand-text {
            font-size: 1.05rem;
          }

          .app-brand-badge {
            display: none;
          }

          .app-user-name,
          .app-role-badge,
          .app-logout-btn {
            display: none;
          }

          .app-user-pill {
            padding: 0;
            background: transparent;
            border: none;
          }

          .app-right-actions {
            gap: 6px;
          }

          .app-lang-btn {
            padding: 3px 5px;
            font-size: 0.65rem;
          }
        }

        /* Mobile Drawer */
        .app-mobile-drawer {
          position: fixed;
          top: 56px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(9, 9, 11, 0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 999;
          display: flex;
          flex-direction: column;
          padding: 0.875rem;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .app-drawer-card {
          background: #ffffff;
          border: 1px solid #e4e4e7;
          border-radius: 14px;
          padding: 1.25rem;
          box-shadow: 0 16px 36px -4px rgba(0,0,0,0.18);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: calc(100vh - 80px);
          overflow-y: auto;
        }

        .app-drawer-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1rem;
          border-radius: 8px;
          background: #fafafa;
          border: 1px solid #e4e4e7;
          text-decoration: none;
          color: #09090b;
          font-size: 0.9rem;
          font-weight: 600;
          min-height: 44px;
        }

        .app-drawer-nav-item.active {
          background: #09090b;
          color: #ffffff;
          border-color: #09090b;
        }
      `}</style>

      <nav className="app-navbar-header">
        <div className="app-navbar-container">
          {/* Brand Mark */}
          <Link to="/" className="app-brand-link">
            <span className="app-brand-text">ResQFlow</span>
            <span className="app-brand-badge">{roleTheme.label}</span>
          </Link>

          {/* Center Navigation Group */}
          <div className="app-nav-group">
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
          </div>

          {/* Right Action Matrix */}
          <div className="app-right-actions">
            {/* Language Toggle */}
            <div className="app-lang-switcher" title="Select Interface Language">
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

            {/* User Capsule */}
            <div className="app-user-pill">
              <div className="app-user-avatar">
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
                onClick={logout}
                className="app-logout-btn"
                title="Sign out of ResQFlow"
              >
                <MdLogout size={14} />
              </button>
            </div>

            {/* Mobile Hamburger Trigger */}
            <button
              type="button"
              onClick={() => setMobileOpen(prev => !prev)}
              className="app-mobile-trigger"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <MdClose size={20} /> : <MdMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Full-Screen Sheet */}
        {mobileOpen && (
          <div className="app-mobile-drawer" onClick={() => setMobileOpen(false)}>
            <div className="app-drawer-card" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: '#71717a' }}>
                  ACTIVE SESSION // {roleTheme.label}
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{username || 'OPERATOR'}</span>
              </div>

              {navLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={['/victim', '/donor', '/ngo', '/admin'].includes(item.path)}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `app-drawer-nav-item ${isActive ? 'active' : ''}`}
                >
                  <span>{item.label}</span>
                  <span>→</span>
                </NavLink>
              ))}

              <button
                onClick={() => { setMobileOpen(false); logout(); }}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                <MdLogout size={16} />
                <span>{t('logout') || 'Sign Out'}</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
