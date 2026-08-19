import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MdMenu, MdClose, MdLogout, MdPerson, MdPhoneInTalk,
  MdVolumeUp, MdVolumeOff, MdContrast, MdTranslate 
} from 'react-icons/md';
import { AuthContext, useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../utils/i18n';
import { startEmergencySiren, stopEmergencySiren } from '../utils/audioSiren';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const getNavItems = (t) => ({
  VICTIM: [
    { label: t('dashboard'), path: '/victim' },
    { label: t('reportFlood'), path: '/victim/create-report' },
    { label: t('myReports'), path: '/victim/my-reports' },
    { label: t('heatmap'), path: '/victim/heatmap' }
  ],
  DONOR: [
    { label: t('dashboard'), path: '/donor' },
    { label: t('browseRequests'), path: '/donor/browse-requests' },
    { label: t('myDonations'), path: '/donor/my-donations' },
    { label: t('heatmap'), path: '/donor/heatmap' }
  ],
  NGO: [
    { label: t('dashboard'), path: '/ngo' },
    { label: t('createRequest'), path: '/ngo/create-request' },
    { label: t('myRequests'), path: '/ngo/my-requests' },
    { label: t('manageDonations'), path: '/ngo/manage-donations' },
    { label: t('heatmap'), path: '/ngo/heatmap' }
  ],
  ADMIN: [
    { label: t('dashboard'), path: '/admin' },
    { label: t('floodReports'), path: '/admin/flood-reports' },
    { label: t('manageVictims') || 'Manage Victims', path: '/admin/manage-victims' },
    { label: t('heatmap'), path: '/admin/heatmap' }
  ]
});

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const { lang, changeLanguage, t } = useLanguage();

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

  const role = (auth.role || auth.user?.role || 'VICTIM').toUpperCase();
  const username = auth.username || auth.user?.username || auth.user?.name || auth.user?.email || 'User';
  const logout = auth.logout || auth.handleLogout || (() => {});

  const navItemsMap = getNavItems(t);
  const navLinks = navItemsMap[role] || navItemsMap.VICTIM;

  const toggleMobileMenu = () => {
    setMobileOpen(prev => !prev);
  };

  const toggleSiren = () => {
    if (sirenActive) {
      stopEmergencySiren();
      setSirenActive(false);
      toast.success('Emergency siren deactivated.');
    } else {
      startEmergencySiren();
      setSirenActive(true);
      toast.error('EMERGENCY SIREN ACTIVATED! Loud rescue audio frequency playing...');
    }
  };

  const toggleHighContrast = () => {
    const nextState = !highContrast;
    setHighContrast(nextState);
    if (nextState) {
      document.body.classList.add('high-contrast-mode');
      toast.success('High Contrast Mode Enabled (WCAG AAA)');
    } else {
      document.body.classList.remove('high-contrast-mode');
      toast.success('Standard Theme Restored');
    }
  };

  const handleLangChange = (e) => {
    const selected = e.target.value;
    changeLanguage(selected);
    toast.success(`Language: ${selected}`);
  };

  const navContainerStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(14, 165, 233, 0.2)',
    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  };

  const innerNavStyle = {
    maxWidth: '1380px',
    margin: '0 auto',
    padding: '0 20px',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px'
  };

  const brandStyle = {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#0f172a',
    fontWeight: 900,
    fontSize: '24px',
    letterSpacing: '-0.06em',
    flexShrink: 0
  };

  const desktopMenuStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    overflowX: 'auto',
    whiteSpace: 'nowrap'
  };

  const userSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0
  };

  const userInfoBadgeStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '9999px',
    backgroundColor: '#f1f5f9',
    border: '1px solid rgba(148, 163, 184, 0.4)',
    color: '#0f172a',
    fontSize: '13px',
    fontWeight: 600
  };

  const rolePillStyle = {
    fontSize: '10px',
    fontWeight: 800,
    padding: '1px 6px',
    borderRadius: '10px',
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    color: '#0284c7',
    border: '1px solid rgba(2, 132, 199, 0.25)',
    textTransform: 'uppercase'
  };

  const logoutBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    color: '#be123c',
    border: '1px solid rgba(225, 29, 72, 0.25)',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  };

  const iconControlBtnStyle = {
    padding: '6px 10px',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap'
  };

  const mobileDrawerStyle = {
    display: mobileOpen ? 'flex' : 'none',
    flexDirection: 'column',
    padding: '16px 20px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid rgba(14, 165, 233, 0.2)',
    gap: '10px'
  };

  return (
    <>
      {/* Live Emergency Broadcast Ticker */}
      <div className="emergency-ticker-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
          <span className="emergency-live-dot"></span>
          <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{t('emergencyBroadcast')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 700 }}>HELPLINE: 112 / 108</span>
        </div>
      </div>

      <nav style={navContainerStyle}>
        <div style={innerNavStyle}>
          {/* App Brand */}
          <NavLink to="/" style={{ ...brandStyle, gap: '6px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '22px'
            }}>
              ResQFlow
            </span>
          </NavLink>

          {/* Desktop Nav Links */}
          <div className="desktop-menu" style={desktopMenuStyle}>
            {navLinks.map((item) => (
              <NavLink
                key={item.path || 'dashboard'}
                to={item.path}
                end={['/victim', '/donor', '/ngo', '/admin'].includes(item.path)}
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 600,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive ? '#0284c7' : 'transparent',
                  color: isActive ? '#ffffff' : '#475569',
                  border: isActive ? '1px solid #0284c7' : '1px solid transparent',
                  whiteSpace: 'nowrap'
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* User Controls & Emergency Tools */}
          <div className="desktop-user" style={userSectionStyle}>
            {/* Siren Toggle */}
            <button 
              onClick={toggleSiren} 
              style={{
                ...iconControlBtnStyle,
                backgroundColor: sirenActive ? '#e11d48' : '#f1f5f9',
                color: sirenActive ? '#ffffff' : '#334155',
                borderColor: sirenActive ? '#e11d48' : '#cbd5e1'
              }}
              title={sirenActive ? t('stopSiren') : t('playSiren')}
            >
              {sirenActive ? <MdVolumeOff size={16} /> : <MdVolumeUp size={16} />}
              <span>{sirenActive ? t('stopSiren') : t('playSiren')}</span>
            </button>

            {/* High Contrast Toggle */}
            <button
              onClick={toggleHighContrast}
              style={{
                ...iconControlBtnStyle,
                backgroundColor: highContrast ? '#0f172a' : '#f1f5f9',
                color: highContrast ? '#ffffff' : '#334155'
              }}
              title="Toggle High Contrast Mode (WCAG AAA)"
            >
              <MdContrast size={16} />
            </button>

            {/* Language Selector (Specifically Enabled for Victim and Donor Roles) */}
            {['VICTIM', 'DONOR'].includes(role) && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <MdTranslate size={14} style={{ color: '#0284c7' }} />
                <select
                  value={lang}
                  onChange={handleLangChange}
                  style={{ background: 'transparent', border: 'none', fontSize: '12px', fontWeight: 800, cursor: 'pointer', outline: 'none', color: '#0f172a' }}
                >
                  {SUPPORTED_LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* SOS Call Helpline */}
            <a href="tel:112" className="btn-sos-emergency" title="Emergency Rescue Helpline: 112">
              <MdPhoneInTalk size={14} />
              <span>{t('sosHelpline')}</span>
            </a>

            {/* User Badge */}
            <div style={userInfoBadgeStyle}>
              <MdPerson size={16} style={{ color: '#0284c7' }} />
              <span>{username}</span>
              <span style={rolePillStyle}>{role}</span>
            </div>

            <button onClick={logout} style={logoutBtnStyle} title="Logout">
              <MdLogout size={16} />
              <span>{t('logout')}</span>
            </button>
          </div>

          {/* Right Controls: Quick Mobile SOS + Hamburger Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a 
              href="tel:112" 
              className="btn-sos-emergency mobile-quick-sos" 
              style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 800 }}
              title="Emergency Helpline: 112"
            >
              <MdPhoneInTalk size={14} />
              <span>112</span>
            </a>

            {/* Hamburger Toggle Button for Mobile */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="mobile-hamburger-btn"
              aria-label="Toggle navigation menu"
              style={{
                background: mobileOpen ? 'rgba(2, 132, 199, 0.1)' : '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#0f172a',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              {mobileOpen ? <MdClose size={24} color="#0284c7" /> : <MdMenu size={24} color="#0f172a" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (only rendered when open) */}
        {mobileOpen && (
          <div className="mobile-drawer">
            {/* User badge in mobile menu */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f1f5f9', borderRadius: '10px', marginBottom: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                <MdPerson size={18} style={{ color: '#0284c7' }} />
                <span>{username}</span>
              </div>
              <span style={rolePillStyle}>{role}</span>
            </div>

            {navLinks.map((item) => (
              <NavLink
                key={item.path || 'dashboard'}
                to={item.path}
                end={['/victim', '/donor', '/ngo', '/admin'].includes(item.path)}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 600,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? '#0284c7' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#334155',
                  border: isActive ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center'
                })}
              >
                {item.label}
              </NavLink>
            ))}

            {/* Mobile Drawer Tools & Actions */}
            <div className="mobile-drawer-extras" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', marginTop: '6px' }}>
              {/* Language Selector for Victim and Donor */}
              {['VICTIM', 'DONOR'].includes(role) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                    <MdTranslate size={16} style={{ color: '#0284c7' }} />
                    <span>Language</span>
                  </div>
                  <select
                    value={lang}
                    onChange={handleLangChange}
                    style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', outline: 'none', color: '#0f172a' }}
                  >
                    {SUPPORTED_LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {/* Siren Toggle */}
                <button 
                  onClick={toggleSiren} 
                  style={{
                    ...iconControlBtnStyle,
                    justifyContent: 'center',
                    padding: '8px 10px',
                    backgroundColor: sirenActive ? '#e11d48' : '#f1f5f9',
                    color: sirenActive ? '#ffffff' : '#334155',
                    borderColor: sirenActive ? '#e11d48' : '#cbd5e1'
                  }}
                >
                  {sirenActive ? <MdVolumeOff size={16} /> : <MdVolumeUp size={16} />}
                  <span>{sirenActive ? t('stopSiren') : t('playSiren')}</span>
                </button>

                {/* High Contrast Toggle */}
                <button
                  onClick={toggleHighContrast}
                  style={{
                    ...iconControlBtnStyle,
                    justifyContent: 'center',
                    padding: '8px 10px',
                    backgroundColor: highContrast ? '#0f172a' : '#f1f5f9',
                    color: highContrast ? '#ffffff' : '#334155'
                  }}
                >
                  <MdContrast size={16} />
                  <span>Contrast</span>
                </button>
              </div>

              {/* SOS Call Helpline */}
              <a 
                href="tel:112" 
                className="btn-sos-emergency" 
                style={{ justifyContent: 'center', width: '100%', padding: '10px', fontSize: '13px' }}
              >
                <MdPhoneInTalk size={16} />
                <span>{t('sosHelpline')} (112 / 108)</span>
              </a>

              {/* Logout */}
              <button 
                onClick={() => { setMobileOpen(false); logout(); }} 
                style={{ ...logoutBtnStyle, justifyContent: 'center', padding: '10px', width: '100%' }}
              >
                <MdLogout size={16} />
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
