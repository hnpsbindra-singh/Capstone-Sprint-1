import React from 'react';

const getStatusConfig = (status) => {
  const s = (status || '').toUpperCase().trim();
  switch (s) {
    case 'CRITICAL':
    case 'EMERGENCY':
    case 'CATASTROPHIC':
      return {
        label: s,
        color: '#dc2626',
        bg: '#fee2e2',
        border: '#fca5a5',
        hasPulse: true,
      };
    case 'HIGH':
    case 'SEVERE':
      return {
        label: s,
        color: '#ea580c',
        bg: '#ffedd5',
        border: '#fdba74',
        hasPulse: true,
      };
    case 'PENDING':
    case 'OPEN':
    case 'AWAITING':
      return {
        label: s,
        color: '#b45309',
        bg: '#fef3c7',
        border: '#fde68a',
        hasPulse: false,
      };
    case 'ACCEPTED':
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
    case 'INPROGRESS':
    case 'DISPATCHED':
    case 'SHIPPED':
    case 'IN_TRANSIT':
      return {
        label: s.replace(/_/g, ' '),
        color: '#0369a1',
        bg: '#e0f2fe',
        border: '#bae6fd',
        hasPulse: false,
      };
    case 'DELIVERED':
    case 'COMPLETED':
    case 'VERIFIED':
      return {
        label: s,
        color: '#15803d',
        bg: '#dcfce7',
        border: '#bbf7d0',
        hasPulse: false,
      };
    default:
      return {
        label: s || 'REPORTED',
        color: '#3f3f46',
        bg: '#f4f4f5',
        border: '#e4e4e7',
        hasPulse: false,
      };
  }
};

const StatusBadge = ({ status, className = '' }) => {
  const config = getStatusConfig(status);

  return (
    <span
      className={`status-pill ${config.hasPulse ? 'status-pill-pulse' : ''} ${className}`}
      style={{
        color: config.color,
        backgroundColor: config.bg,
        borderColor: config.border,
      }}
    >
      <span
        className="status-pill-dot"
        style={{ backgroundColor: config.color }}
      />
      <span className="status-pill-text">{config.label}</span>
    </span>
  );
};

export default StatusBadge;
