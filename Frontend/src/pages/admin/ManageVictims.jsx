import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  MdPeople,
  MdBlock,
  MdCheckCircle,
  MdRefresh,
  MdSearch,
  MdWarning,
  MdPersonOff,
  MdVerifiedUser,
  MdGppBad,
  MdGppGood,
  MdVolunteerActivism,
  MdHomeWork,
  MdShield
} from 'react-icons/md';
import { getAllUsers, setUserBlockStatus } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';

const ROLE_BADGES = {
  VICTIM: { label: 'VICTIM', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)', border: 'rgba(220, 38, 38, 0.3)', icon: MdPeople },
  DONOR: { label: 'DONOR', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)', border: 'rgba(2, 132, 199, 0.3)', icon: MdVolunteerActivism },
  NGO: { label: 'NGO', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)', border: 'rgba(22, 163, 74, 0.3)', icon: MdHomeWork },
  ADMIN: { label: 'ADMIN', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)', border: 'rgba(124, 58, 237, 0.3)', icon: MdShield },
};

const ManageVictims = () => {
  const { user: currentAuthUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'VICTIM' | 'DONOR' | 'NGO' | 'ADMIN'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'BLOCKED'

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const isUserBlocked = (u) => Boolean(u.isBlocked || u.isBlockedFromReporting);

  const isSelf = (targetUser) => {
    if (!targetUser || !currentAuthUser) return false;
    const targetId = targetUser._id || targetUser.id;
    const currentId = currentAuthUser.userId || currentAuthUser._id || currentAuthUser.id;
    const targetUsername = (targetUser.username || '').toLowerCase().trim();
    const currentUsername = (currentAuthUser.username || currentAuthUser.email || '').toLowerCase().trim();
    return targetId === currentId || (targetUsername && targetUsername === currentUsername);
  };

  const handleToggleBlockClick = (userToBlock) => {
    if (isSelf(userToBlock)) {
      toast.error('You cannot block your own active administrator account.');
      return;
    }
    setSelectedUser(userToBlock);
    setModalOpen(true);
  };

  const handleConfirmToggleBlock = async () => {
    if (!selectedUser) return;
    const currentlyBlocked = isUserBlocked(selectedUser);
    const newBlockedState = !currentlyBlocked;
    const roleLabel = selectedUser.role || 'User';

    setProcessing(true);
    try {
      await setUserBlockStatus(selectedUser._id || selectedUser.id, newBlockedState);
      toast.success(
        newBlockedState
          ? `${roleLabel} "${selectedUser.name}" has been BLOCKED.`
          : `${roleLabel} "${selectedUser.name}" has been UNBLOCKED.`
      );

      // Update local state
      setUsers(prev =>
        prev.map(u =>
          (u._id || u.id) === (selectedUser._id || selectedUser.id)
            ? { ...u, isBlocked: newBlockedState, isBlockedFromReporting: newBlockedState }
            : u
        )
      );

      setModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user block status:', error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to update user block status';
      toast.error(errMsg);
    } finally {
      setProcessing(false);
    }
  };

  // Filter users by role, search, and block status
  const filteredUsers = users.filter(u => {
    const roleMatch = roleFilter === 'ALL' || (u.role || '').toUpperCase() === roleFilter;
    const nameMatch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const userMatch = (u.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || userMatch;
    const blocked = isUserBlocked(u);

    if (!roleMatch) return false;
    if (statusFilter === 'BLOCKED') return matchesSearch && blocked;
    if (statusFilter === 'ACTIVE') return matchesSearch && !blocked;
    return matchesSearch;
  });

  // Calculate statistics
  const roleFilteredUsers = roleFilter === 'ALL' ? users : users.filter(u => (u.role || '').toUpperCase() === roleFilter);
  const totalBlocked = roleFilteredUsers.filter(isUserBlocked).length;
  const totalActive = roleFilteredUsers.length - totalBlocked;

  const countByRole = (role) => users.filter(u => (u.role || '').toUpperCase() === role).length;

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MdPeople style={{ color: 'var(--accent-ocean)' }} /> Manage Users & Permissions
          </h1>
          <p className="page-subtitle">
            Audit registered accounts across all roles (Victims, Donors, NGOs, Admins) and manage access permissions.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchUsers} disabled={loading}>
          <MdRefresh /> Refresh
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
            <MdPeople size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {roleFilter === 'ALL' ? 'Total Registered Users' : `Total ${roleFilter}s`}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{roleFilteredUsers.length}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <MdGppGood size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Accounts</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{totalActive}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
            <MdGppBad size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Blocked / Suspended</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{totalBlocked}</div>
          </div>
        </div>
      </div>

      {/* Role Switcher Toolbar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {[
          { key: 'ALL', label: `All Accounts (${users.length})` },
          { key: 'VICTIM', label: `Victims (${countByRole('VICTIM')})`, icon: MdPeople, color: '#dc2626' },
          { key: 'DONOR', label: `Donors (${countByRole('DONOR')})`, icon: MdVolunteerActivism, color: '#0284c7' },
          { key: 'NGO', label: `NGOs (${countByRole('NGO')})`, icon: MdHomeWork, color: '#16a34a' },
          { key: 'ADMIN', label: `Admins (${countByRole('ADMIN')})`, icon: MdShield, color: '#7c3aed' },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`filter-pill-btn ${roleFilter === tab.key ? 'active' : ''}`}
            onClick={() => setRoleFilter(tab.key)}
            style={{
              padding: '6px 14px',
              fontSize: '0.825rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {tab.icon && <tab.icon style={{ color: roleFilter === tab.key ? '#fff' : tab.color }} />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      {!loading && (
        <div className="filter-toolbar" style={{ marginBottom: '1.5rem' }}>
          <div className="search-box-wrapper">
            <MdSearch className="search-icon-inside" />
            <input
              type="text"
              className="search-box-input"
              placeholder={`Search ${roleFilter === 'ALL' ? 'users' : roleFilter.toLowerCase() + 's'} by name or email...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-pills-container">
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
            {[
              { key: 'ALL', label: `All (${roleFilteredUsers.length})` },
              { key: 'ACTIVE', label: `Active (${totalActive})` },
              { key: 'BLOCKED', label: `Blocked (${totalBlocked})` }
            ].map(tab => (
              <button
                key={tab.key}
                className={`filter-pill-btn ${statusFilter === tab.key ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading user accounts...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card empty-state">
          <MdWarning className="empty-state-icon" />
          <p className="empty-state-text">
            {roleFilteredUsers.length === 0 ? `No registered ${roleFilter === 'ALL' ? 'users' : roleFilter.toLowerCase() + 's'} found.` : 'No accounts matching your search filter.'}
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0 }}>
          {/* ── Desktop table ── */}
          <div className="desktop-only-table">
            <div className="table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Email / Username</th>
                    <th>Role</th>
                    <th>Verification</th>
                    <th>Account Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((targetUser) => {
                    const blocked = isUserBlocked(targetUser);
                    const isCurrentUser = isSelf(targetUser);
                    const roleConfig = ROLE_BADGES[(targetUser.role || 'VICTIM').toUpperCase()] || ROLE_BADGES.VICTIM;
                    const RoleIcon = roleConfig.icon;

                    return (
                      <tr key={targetUser._id || targetUser.id || targetUser.username}>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                backgroundColor: blocked ? '#fee2e2' : roleConfig.bg,
                                color: blocked ? '#dc2626' : roleConfig.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.8125rem',
                                flexShrink: 0
                              }}
                            >
                              {(targetUser.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{targetUser.name || 'Unnamed User'}</span>
                                {isCurrentUser && (
                                  <span style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#64748b', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                    YOU
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {targetUser.username}
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 9px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              backgroundColor: roleConfig.bg,
                              color: roleConfig.color,
                              border: `1px solid ${roleConfig.border}`
                            }}
                          >
                            <RoleIcon size={13} /> {roleConfig.label}
                          </span>
                        </td>
                        <td>
                          {targetUser.Isverified ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              <MdVerifiedUser size={14} /> Verified
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                color: '#d97706',
                                border: '1px solid rgba(245, 158, 11, 0.3)'
                              }}
                            >
                              Pending OTP
                            </span>
                          )}
                        </td>
                        <td>
                          {blocked ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                              }}
                            >
                              <MdBlock size={14} /> Blocked / Suspended
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              <MdCheckCircle size={14} /> Active Access
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button
                            className="btn btn-sm"
                            disabled={isCurrentUser}
                            title={isCurrentUser ? "You cannot block your own active account" : ""}
                            style={{
                              backgroundColor: isCurrentUser
                                ? '#f1f5f9'
                                : blocked
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'rgba(239, 68, 68, 0.1)',
                              color: isCurrentUser
                                ? '#94a3b8'
                                : blocked
                                ? '#10b981'
                                : '#ef4444',
                              border: isCurrentUser
                                ? '1px solid #e2e8f0'
                                : blocked
                                ? '1px solid rgba(16, 185, 129, 0.3)'
                                : '1px solid rgba(239, 68, 68, 0.3)',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              cursor: isCurrentUser ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s ease',
                              opacity: isCurrentUser ? 0.6 : 1
                            }}
                            onClick={() => handleToggleBlockClick(targetUser)}
                          >
                            {isCurrentUser ? (
                              'Current Account'
                            ) : blocked ? (
                              <>
                                <MdCheckCircle size={15} /> Unblock
                              </>
                            ) : (
                              <>
                                <MdPersonOff size={15} /> Block
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile cards ── */}
          <div className="mobile-only-cards" style={{ padding: '0.5rem' }}>
            {filteredUsers.map((targetUser) => {
              const blocked = isUserBlocked(targetUser);
              const isCurrentUser = isSelf(targetUser);
              const roleConfig = ROLE_BADGES[(targetUser.role || 'VICTIM').toUpperCase()] || ROLE_BADGES.VICTIM;
              const RoleIcon = roleConfig.icon;

              return (
                <div key={targetUser._id || targetUser.id || targetUser.username} className="admin-victim-card">
                  <div className="admin-card-header">
                    <div className="victim-card-name-row">
                      <div
                        className="victim-avatar"
                        style={{
                          backgroundColor: blocked ? '#fee2e2' : roleConfig.bg,
                          color: blocked ? '#dc2626' : roleConfig.color
                        }}
                      >
                        {(targetUser.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{targetUser.name || 'Unnamed User'}</span>
                          {isCurrentUser && (
                            <span style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#64748b', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                              YOU
                            </span>
                          )}
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {targetUser.username}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="admin-card-meta" style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: roleConfig.bg,
                        color: roleConfig.color,
                        border: `1px solid ${roleConfig.border}`
                      }}
                    >
                      <RoleIcon size={12} /> {roleConfig.label}
                    </span>

                    {targetUser.Isverified ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <MdVerifiedUser size={12} /> Verified
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(245, 158, 11, 0.12)',
                          color: '#d97706',
                          border: '1px solid rgba(245, 158, 11, 0.3)'
                        }}
                      >
                        Pending OTP
                      </span>
                    )}

                    {blocked ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}
                      >
                        <MdBlock size={12} /> Blocked
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <MdCheckCircle size={12} /> Active
                      </span>
                    )}
                  </div>

                  <div className="admin-card-footer" style={{ marginTop: '0.75rem' }}>
                    <button
                      className="btn btn-sm"
                      disabled={isCurrentUser}
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        backgroundColor: isCurrentUser
                          ? '#f1f5f9'
                          : blocked
                          ? 'rgba(16, 185, 129, 0.1)'
                          : 'rgba(239, 68, 68, 0.1)',
                        color: isCurrentUser
                          ? '#94a3b8'
                          : blocked
                          ? '#10b981'
                          : '#ef4444',
                        border: isCurrentUser
                          ? '1px solid #e2e8f0'
                          : blocked
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: isCurrentUser ? 'not-allowed' : 'pointer',
                        opacity: isCurrentUser ? 0.6 : 1
                      }}
                      onClick={() => handleToggleBlockClick(targetUser)}
                    >
                      {isCurrentUser ? (
                        'Current Account (Protected)'
                      ) : blocked ? (
                        <>
                          <MdCheckCircle size={16} /> Unblock Account
                        </>
                      ) : (
                        <>
                          <MdPersonOff size={16} /> Block Account
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Block/Unblock */}
      <ConfirmModal
        isOpen={modalOpen}
        title={isUserBlocked(selectedUser) ? `Unblock ${selectedUser?.role || 'User'}` : `Block ${selectedUser?.role || 'User'}`}
        message={
          isUserBlocked(selectedUser)
            ? `Are you sure you want to UNBLOCK "${selectedUser?.name}" (${selectedUser?.username})? Their account permissions and access will be immediately restored.`
            : `Are you sure you want to BLOCK ${selectedUser?.role} "${selectedUser?.name}" (${selectedUser?.username})? They will be suspended from accessing ResQFlow services and logging in.`
        }
        confirmLabel={
          processing
            ? "Updating..."
            : isUserBlocked(selectedUser)
            ? "Yes, Unblock"
            : `Yes, Block ${selectedUser?.role || 'User'}`
        }
        cancelLabel="Cancel"
        danger={!isUserBlocked(selectedUser)}
        onConfirm={handleConfirmToggleBlock}
        onCancel={() => {
          if (!processing) {
            setModalOpen(false);
            setSelectedUser(null);
          }
        }}
      />
    </div>
  );
};

export default ManageVictims;
