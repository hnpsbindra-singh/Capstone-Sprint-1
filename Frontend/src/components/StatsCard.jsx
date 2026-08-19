import React from 'react';

const StatsCard = ({ icon: Icon, label, value, color = '#3b82f6' }) => {
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    return <Icon />;
  };

  return (
    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', overflow: 'hidden' }}>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '54px',
          height: '54px',
          borderRadius: '12px',
          backgroundColor: `${color}20`,
          color: color,
          fontSize: '1.75rem',
          flexShrink: 0,
          border: `1px solid ${color}40`
        }}
      >
        {renderIcon()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.25rem' }}>
          {label}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
          {value !== undefined && value !== null ? value : 0}
        </div>
      </div>
      <div 
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default StatsCard;
