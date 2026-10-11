import React from 'react';

const StatsCard = ({ icon: Icon, label, value, color = '#09090b', subtext }) => {
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    return <Icon />;
  };

  const formattedValue = value !== undefined && value !== null ? value : 0;

  return (
    <div className="telemetry-card">
      <div className="telemetry-top">
        <span className="telemetry-label">{label}</span>
        <div className="telemetry-icon-box" style={{ borderColor: `${color}30`, color: color }}>
          {renderIcon()}
        </div>
      </div>

      <div className="telemetry-value-row">
        <span className="telemetry-value">{formattedValue}</span>
        {subtext && <span className="telemetry-subtext">{subtext}</span>}
      </div>

      <div className="telemetry-baseline">
        <div className="telemetry-rule" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
};

export default StatsCard;
