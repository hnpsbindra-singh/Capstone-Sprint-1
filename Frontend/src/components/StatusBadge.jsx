import React from 'react';

const getStatusStyle = (status) => {
  const s = (status || '').toUpperCase().trim();
  switch (s) {
    case 'PENDING':
    case 'OPEN':
      return {
        color: '#d97706',
        backgroundColor: 'rgba(217, 119, 6, 0.12)',
        borderColor: 'rgba(217, 119, 6, 0.3)',
        pulseClass: ''
      };
    case 'ACCEPTED':
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
    case 'INPROGRESS':
      return {
        color: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.12)',
        borderColor: 'rgba(2, 132, 199, 0.3)',
        pulseClass: ''
      };
    case 'DELIVERED':
    case 'COMPLETED':
      return {
        color: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.12)',
        borderColor: 'rgba(5, 150, 105, 0.3)',
        pulseClass: ''
      };
    case 'HIGH':
    case 'SEVERE':
      return {
        color: '#ea580c',
        backgroundColor: 'rgba(234, 88, 12, 0.12)',
        borderColor: 'rgba(234, 88, 12, 0.3)',
        pulseClass: 'badge-pulse-high'
      };
    case 'CRITICAL':
    case 'EMERGENCY':
    case 'CATASTROPHIC':
      return {
        color: '#e11d48',
        backgroundColor: 'rgba(225, 29, 72, 0.12)',
        borderColor: 'rgba(225, 29, 72, 0.3)',
        pulseClass: 'badge-pulse-critical'
      };
    default:
      return {
        color: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        borderColor: 'rgba(2, 132, 199, 0.25)',
        pulseClass: ''
      };
  }
};

const StatusBadge = ({ status }) => {
  const statusColors = getStatusStyle(status);
  
  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: statusColors.backgroundColor,
    color: statusColors.color,
    border: `1px solid ${statusColors.borderColor}`,
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  };

  return (
    <span className={statusColors.pulseClass} style={badgeStyle}>
      {status ? String(status).replace('_', ' ') : 'REPORTED'}
    </span>
  );
};

export default StatusBadge;
