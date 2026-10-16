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
  MdShield,
  MdPersonAdd,
  MdHourglassEmpty,
  MdVerified,
  MdCheck,
  MdClose,
  MdVisibility,
  MdVisibilityOff
} from 'react-icons/md';
import { getAllUsers, setUserBlockStatus, createAdmin, setNgoApprovalStatus } from '../../api/adminApi';
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

  // Add New Admin state
  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminConfirmPassword, setNewAdminConfirmPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // NGO Approval state
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [approving, setApproving] = useState(false);

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

  const isUserBlocked = (u) => Boolean(u && (u.isBlocked || u.isBlockedFromReporting));

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

  const isNgoApproved = (u) => {
    if (!u) return true;
    if ((u.role || '').toUpperCase() !== 'NGO') return true;
    return u.isApproved !== false;
  };

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    const name = newAdminName.trim();
    const email = newAdminEmail.trim().toLowerCase();

    if (!name || !email || !newAdminPassword || !newAdminConfirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (newAdminPassword.length < 8 || newAdminPassword.length > 25) {
      toast.error('Password must be between 8 and 25 characters');
      return;
    }

    if (newAdminPassword !== newAdminConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setCreatingAdmin(true);
    try {
      const res = await createAdmin({
        name,
        username: email,
        password: newAdminPassword,
      });
      toast.success(res.message || `Administrator "${name}" created successfully!`);
      setAddAdminModalOpen(false);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminConfirmPassword('');
      fetchUsers();
    } catch (error) {
      console.error('Error creating admin:', error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to create administrator';
      toast.error(errMsg);
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleToggleNgoApprovalClick = (ngo) => {
    setSelectedNgo(ngo);
    setApprovalModalOpen(true);
  };

  const handleConfirmNgoApproval = async () => {
    if (!selectedNgo) return;
    const currentApproved = isNgoApproved(selectedNgo);
    const newApprovalState = !currentApproved;

    setApproving(true);
    try {
      await setNgoApprovalStatus(selectedNgo._id || selectedNgo.id, newApprovalState);
      toast.success(
        newApprovalState
          ? `NGO "${selectedNgo.name}" has been APPROVED. Access granted!`
          : `NGO "${selectedNgo.name}" approval has been REVOKED.`
      );

      // Update local state
      setUsers(prev =>
        prev.map(u =>
          (u._id || u.id) === (selectedNgo._id || selectedNgo.id)
            ? { ...u, isApproved: newApprovalState }
            : u
        )
      );

      setApprovalModalOpen(false);
      setSelectedNgo(null);
    } catch (error) {
      console.error('Error updating NGO approval:', error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to update NGO approval';
      toast.error(errMsg);
    } finally {
      setApproving(false);
    }
  };

  // Calculate statistics
  const pendingNgosCount = users.filter(u => (u.role || '').toUpperCase() === 'NGO' && u.isApproved === false).length;

  // Filter users by role, search, and block status
  const filteredUsers = users.filter(u => {
    const roleMatch = roleFilter === 'ALL' || (u.role || '').toUpperCase() === roleFilter;
    const nameMatch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const userMatch = (u.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || userMatch;
    const blocked = isUserBlocked(u);
    const isNgoPending = (u.role || '').toUpperCase() === 'NGO' && u.isApproved === false;

    if (!roleMatch) return false;
    if (statusFilter === 'BLOCKED') return matchesSearch && blocked;
    if (statusFilter === 'ACTIVE') return matchesSearch && !blocked && !isNgoPending;
    if (statusFilter === 'PENDING') return matchesSearch && isNgoPending;
    return matchesSearch;
  });

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
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => setAddAdminModalOpen(true)}
            style={{
              backgroundColor: '#7c3aed',
              borderColor: '#7c3aed',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              padding: '8px 14px',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)'
            }}
          >
            <MdPersonAdd size={18} /> Add New Admin
          </button>
          <button className="btn btn-secondary" onClick={fetchUsers} disabled={loading}>
            <MdRefresh /> Refresh
          </button>
        </div>
      </div>

      {/* Pending NGO Alert Banner */}
      {pendingNgosCount > 0 && (
        <div
          style={{
            marginBottom: '1.25rem',
            padding: '12px 18px',
            borderRadius: '10px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', color: '#d97706' }}>
              <MdHourglassEmpty size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.9rem' }}>
                {pendingNgosCount} NGO Account{pendingNgosCount > 1 ? 's' : ''} Pending Approval
              </div>
              <div style={{ fontSize: '0.8rem', color: '#b45309' }}>
                NGOs cannot access the platform until an administrator reviews and approves their account.
              </div>
            </div>
          </div>
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: '#d97706',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
            onClick={() => {
              setRoleFilter('NGO');
              setStatusFilter('PENDING');
            }}
          >
            Review Pending NGOs
          </button>
        </div>
      )}

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
          {
            key: 'NGO',
            label: `NGOs (${countByRole('NGO')})${pendingNgosCount > 0 ? ` • ${pendingNgosCount} pending` : ''}`,
            icon: MdHomeWork,
            color: '#16a34a'
          },
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
              { key: 'BLOCKED', label: `Blocked (${totalBlocked})` },
              ...(pendingNgosCount > 0 || roleFilter === 'NGO'
                ? [{ key: 'PENDING', label: `Pending Approval (${pendingNgosCount})` }]
                : [])
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {targetUser.role === 'NGO' && (
                              targetUser.isApproved === false ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                    color: '#d97706',
                                    border: '1px solid rgba(245, 158, 11, 0.35)'
                                  }}
                                >
                                  <MdHourglassEmpty size={12} /> Pending Approval
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                    color: '#10b981',
                                    border: '1px solid rgba(16, 185, 129, 0.3)'
                                  }}
                                >
                                  <MdVerified size={12} /> Approved NGO
                                </span>
                              )
                            )}

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
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                            {targetUser.role === 'NGO' && (
                              targetUser.isApproved === false ? (
                                <button
                                  className="btn btn-sm"
                                  style={{
                                    backgroundColor: '#10b981',
                                    borderColor: '#10b981',
                                    color: '#ffffff',
                                    padding: '5px 12px',
                                    borderRadius: '6px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 3px rgba(16, 185, 129, 0.25)'
                                  }}
                                  onClick={() => handleToggleNgoApprovalClick(targetUser)}
                                >
                                  <MdCheck size={14} /> Approve NGO
                                </button>
                              ) : (
                                <button
                                  className="btn btn-sm"
                                  style={{
                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                    borderColor: 'rgba(245, 158, 11, 0.3)',
                                    color: '#d97706',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => handleToggleNgoApprovalClick(targetUser)}
                                >
                                  <MdClose size={13} /> Revoke
                                </button>
                              )
                            )}

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
                          </div>
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

                    {targetUser.role === 'NGO' && (
                      targetUser.isApproved === false ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            color: '#d97706',
                            border: '1px solid rgba(245, 158, 11, 0.35)'
                          }}
                        >
                          <MdHourglassEmpty size={11} /> Pending Approval
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
                          <MdVerified size={11} /> Approved
                        </span>
                      )
                    )}

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

                  <div className="admin-card-footer" style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {targetUser.role === 'NGO' && (
                      targetUser.isApproved === false ? (
                        <button
                          className="btn btn-sm"
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            backgroundColor: '#10b981',
                            borderColor: '#10b981',
                            color: '#ffffff',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleToggleNgoApprovalClick(targetUser)}
                        >
                          <MdCheck size={16} /> Approve NGO Account
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm"
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderColor: 'rgba(245, 158, 11, 0.3)',
                            color: '#d97706',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleToggleNgoApprovalClick(targetUser)}
                        >
                          <MdClose size={14} /> Revoke NGO Approval
                        </button>
                      )
                    )}

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
            ? `Are you sure you want to UNBLOCK "${selectedUser?.name || 'this user'}" (${selectedUser?.username || ''})? Their account permissions and access will be immediately restored.`
            : `Are you sure you want to BLOCK ${selectedUser?.role || 'user'} "${selectedUser?.name || 'this user'}" (${selectedUser?.username || ''})? They will be suspended from accessing ResQFlow services and logging in.`
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

      {/* Confirmation Modal for NGO Approval */}
      <ConfirmModal
        isOpen={approvalModalOpen}
        title={selectedNgo?.isApproved === false ? "Approve NGO Account" : "Revoke NGO Approval"}
        message={
          selectedNgo?.isApproved === false
            ? `Are you sure you want to APPROVE NGO "${selectedNgo?.name}" (${selectedNgo?.username})? They will immediately be granted access to sign in, create relief requests, and manage operations.`
            : `Are you sure you want to REVOKE approval for NGO "${selectedNgo?.name}" (${selectedNgo?.username})? They will be locked out from the platform until approved again.`
        }
        confirmLabel={
          approving
            ? "Updating..."
            : selectedNgo?.isApproved === false
            ? "Yes, Approve NGO"
            : "Yes, Revoke Approval"
        }
        cancelLabel="Cancel"
        danger={selectedNgo?.isApproved !== false}
        onConfirm={handleConfirmNgoApproval}
        onCancel={() => {
          if (!approving) {
            setApprovalModalOpen(false);
            setSelectedNgo(null);
          }
        }}
      />

      {/* Add New Administrator Modal */}
      {addAdminModalOpen && (
        <div
          className="modal-backdrop animate-fade-in"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            className="modal-content animate-scale-up"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(124, 58, 237, 0.12)',
                    color: '#7c3aed'
                  }}
                >
                  <MdShield size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Add New Administrator</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>Provision a verified system administrator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !creatingAdmin && setAddAdminModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <MdClose size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateAdminSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="e.g. Commander Sarah Connor"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Email Address (Username)
                </label>
                <input
                  type="email"
                  className="form-input"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="admin@resqflow.org"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="Min. 8 characters"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showAdminPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Confirm Password
                </label>
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="Re-enter password"
                  value={newAdminConfirmPassword}
                  onChange={(e) => setNewAdminConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'rgba(124, 58, 237, 0.08)',
                  borderRadius: '8px',
                  border: '1px solid rgba(124, 58, 237, 0.25)',
                  fontSize: '0.75rem',
                  color: '#6d28d9',
                  marginBottom: '1.5rem',
                  lineHeight: 1.45
                }}
              >
                🛡️ <strong>Admin Authority:</strong> This account will be created directly with active & verified status, granting full access to manage accounts, block users, and approve NGOs.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={creatingAdmin}
                  onClick={() => setAddAdminModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creatingAdmin}
                  style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed', color: '#fff', fontWeight: 700 }}
                >
                  {creatingAdmin ? 'Creating...' : 'Create Admin Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVictims;
