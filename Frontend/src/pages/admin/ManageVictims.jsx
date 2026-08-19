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
  MdGppGood
} from 'react-icons/md';
import { getVictims, setVictimBlockStatus } from '../../api/adminApi';
import ConfirmModal from '../../components/ConfirmModal';

const ManageVictims = () => {
  const [victims, setVictims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'BLOCKED'

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVictim, setSelectedVictim] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchVictims = async () => {
    setLoading(true);
    try {
      const data = await getVictims();
      setVictims(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching victims:', error);
      toast.error('Failed to fetch victim accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVictims();
  }, []);

  const handleToggleBlockClick = (victim) => {
    setSelectedVictim(victim);
    setModalOpen(true);
  };

  const handleConfirmToggleBlock = async () => {
    if (!selectedVictim) return;
    const isCurrentlyBlocked = Boolean(selectedVictim.isBlockedFromReporting);
    const newBlockedState = !isCurrentlyBlocked;

    setProcessing(true);
    try {
      await setVictimBlockStatus(selectedVictim._id || selectedVictim.id, newBlockedState);
      toast.success(
        newBlockedState
          ? `Victim "${selectedVictim.name}" is now BLOCKED from reporting floods.`
          : `Victim "${selectedVictim.name}" has been UNBLOCKED and can report floods.`
      );

      // Update local state
      setVictims(prev =>
        prev.map(v =>
          (v._id || v.id) === (selectedVictim._id || selectedVictim.id)
            ? { ...v, isBlockedFromReporting: newBlockedState }
            : v
        )
      );

      setModalOpen(false);
      setSelectedVictim(null);
    } catch (error) {
      console.error('Error updating victim block status:', error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to update victim block status';
      toast.error(errMsg);
    } finally {
      setProcessing(false);
    }
  };

  // Filter victims
  const filteredVictims = victims.filter(v => {
    const nameMatch = (v.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const userMatch = (v.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || userMatch;

    if (statusFilter === 'BLOCKED') return matchesSearch && v.isBlockedFromReporting;
    if (statusFilter === 'ACTIVE') return matchesSearch && !v.isBlockedFromReporting;
    return matchesSearch;
  });

  const totalBlocked = victims.filter(v => v.isBlockedFromReporting).length;
  const totalActive = victims.length - totalBlocked;

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MdPeople style={{ color: 'var(--accent-ocean)' }} /> Manage Victims & Permissions
          </h1>
          <p className="page-subtitle">
            Audit registered victim accounts and restrict abusive or spam reporters from creating flood reports.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchVictims} disabled={loading}>
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
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Registered Victims</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{victims.length}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <MdGppGood size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Reporters</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{totalActive}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
            <MdGppBad size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Blocked from Reporting</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{totalBlocked}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      {!loading && (
        <div className="filter-toolbar" style={{ marginBottom: '1.5rem' }}>
          <div className="search-box-wrapper">
            <MdSearch className="search-icon-inside" />
            <input
              type="text"
              className="search-box-input"
              placeholder="Search victims by name or email/username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-pills-container">
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
            {[
              { key: 'ALL', label: `All (${victims.length})` },
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
          <p style={{ color: 'var(--text-secondary)' }}>Loading victim accounts...</p>
        </div>
      ) : filteredVictims.length === 0 ? (
        <div className="glass-card empty-state">
          <MdWarning className="empty-state-icon" />
          <p className="empty-state-text">
            {victims.length === 0 ? 'No registered victims found.' : 'No victims matching your search filter.'}
          </p>
        </div>
      ) : (
        <div className="table-container glass-card" style={{ padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Victim Name</th>
                <th>Username / Email</th>
                <th>Verification</th>
                <th>Reporting Permission</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVictims.map((victim) => {
                const isBlocked = Boolean(victim.isBlockedFromReporting);
                return (
                  <tr key={victim._id || victim.id || victim.username}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isBlocked ? '#fee2e2' : '#e0f2fe',
                            color: isBlocked ? '#dc2626' : '#0284c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.8125rem'
                          }}
                        >
                          {(victim.name || 'V').charAt(0).toUpperCase()}
                        </div>
                        <span>{victim.name || 'Unnamed Victim'}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {victim.username}
                    </td>
                    <td>
                      {victim.Isverified ? (
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
                      {isBlocked ? (
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
                          <MdBlock size={14} /> Blocked from Reporting
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
                          <MdCheckCircle size={14} /> Allowed to Report
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-sm"
                        style={{
                          backgroundColor: isBlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: isBlocked ? '#10b981' : '#ef4444',
                          border: isBlocked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleToggleBlockClick(victim)}
                      >
                        {isBlocked ? (
                          <>
                            <MdCheckCircle size={15} /> Unblock Victim
                          </>
                        ) : (
                          <>
                            <MdPersonOff size={15} /> Block Reporting
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
      )}

      {/* Confirmation Modal for Block/Unblock */}
      <ConfirmModal
        isOpen={modalOpen}
        title={selectedVictim?.isBlockedFromReporting ? "Unblock Victim" : "Block Victim from Reporting"}
        message={
          selectedVictim?.isBlockedFromReporting
            ? `Are you sure you want to UNBLOCK "${selectedVictim?.name}" (${selectedVictim?.username})? They will immediately regain permission to report flood emergencies.`
            : `Are you sure you want to BLOCK "${selectedVictim?.name}" (${selectedVictim?.username}) from submitting flood reports? Any future report attempts by this account will be denied.`
        }
        confirmLabel={
          processing
            ? "Updating..."
            : selectedVictim?.isBlockedFromReporting
            ? "Yes, Unblock"
            : "Yes, Block Victim"
        }
        cancelLabel="Cancel"
        danger={!selectedVictim?.isBlockedFromReporting}
        onConfirm={handleConfirmToggleBlock}
        onCancel={() => {
          if (!processing) {
            setModalOpen(false);
            setSelectedVictim(null);
          }
        }}
      />
    </div>
  );
};

export default ManageVictims;
