import React, { useState, useEffect } from 'react';
import { 
  MdCheckCircle, 
  MdSecurity, 
  MdLocationOn, 
  MdWaterDrop, 
  MdDirectionsCar,
  MdSensors,
  MdSync
} from 'react-icons/md';

const SCAN_STEPS = [
  {
    title: 'Geospatial & Sensor Calibration',
    subtitle: 'Validating satellite coordinates & optical capture timestamp',
    icon: MdLocationOn
  },
  {
    title: 'Hydrographic Surface Segmentation',
    subtitle: 'Measuring floodwater boundaries & surface coverage area',
    icon: MdWaterDrop
  },
  {
    title: 'Infrastructure & Transit Evaluation',
    subtitle: 'Calculating water depth, vehicular passability & hazard level',
    icon: MdDirectionsCar
  },
  {
    title: 'Synthesizing Emergency Directives',
    subtitle: 'Generating structured incident briefing for first responders',
    icon: MdSecurity
  }
];

const AiScanningModal = ({ isOpen, previewUrl, coords, addressLabel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    if (!isOpen) {
      setActiveStep(0);
      setProgress(18);
      return;
    }

    const timer1 = setTimeout(() => { setActiveStep(1); setProgress(48); }, 700);
    const timer2 = setTimeout(() => { setActiveStep(2); setProgress(76); }, 1500);
    const timer3 = setTimeout(() => { setActiveStep(3); setProgress(95); }, 2300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="sos-modal-overlay">
      <style>{`
        .sos-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(9, 9, 11, 0.76);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        .sos-modal-card {
          width: 100%;
          max-width: 520px;
          background: #09090b;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
          overflow: hidden;
          color: #fafafa;
        }

        .sos-modal-header {
          padding: 1rem 1.25rem;
          background: rgba(24, 24, 27, 0.6);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .sos-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #0284c7;
          background: rgba(2, 132, 199, 0.12);
          padding: 0.25rem 0.6rem;
          border-radius: 9999px;
          border: 1px solid rgba(2, 132, 199, 0.3);
        }

        .sos-status-dot {
          width: 7px;
          height: 7px;
          background: #0284c7;
          border-radius: 50%;
          animation: sosDotPulse 1.4s ease-in-out infinite alternate;
        }

        @keyframes sosDotPulse {
          0% { opacity: 0.5; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1.15); }
        }

        .sos-coords-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          color: #a1a1aa;
          letter-spacing: -0.01em;
        }

        .sos-image-viewport {
          position: relative;
          width: 100%;
          height: 200px;
          background: #18181b;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sos-optical-sweep {
          position: absolute;
          left: 0;
          right: 0;
          height: 48px;
          background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.18) 50%, transparent 100%);
          z-index: 10;
          pointer-events: none;
          animation: apertureSweep 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes apertureSweep {
          0% { top: -48px; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        .sos-image-badge {
          position: absolute;
          bottom: 10px;
          left: 12px;
          z-index: 15;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(9, 9, 11, 0.82);
          backdrop-filter: blur(8px);
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 0.7rem;
          font-weight: 500;
          color: #e4e4e7;
        }

        .sos-steps-list {
          padding: 1.25rem 1.35rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .sos-step-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          transition: opacity 0.25s ease;
        }

        .sos-step-badge {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          flex-shrink: 0;
          transition: all 0.25s ease;
        }

        .sos-progress-container {
          padding: 0 1.35rem 1.25rem 1.35rem;
        }

        .sos-progress-track {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          overflow: hidden;
          margin-top: 0.4rem;
        }

        .sos-progress-fill {
          height: 100%;
          background: #16a34a;
          border-radius: 9999px;
          transition: width 0.4s ease;
        }
      `}</style>

      <div className="sos-modal-card">
        {/* Header HUD: Clean & Authoritative */}
        <div className="sos-modal-header">
          <div className="sos-status-pill">
            <span className="sos-status-dot" />
            <span>Incident Analysis in Progress</span>
          </div>
          <span className="sos-coords-label">
            {coords ? `${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E` : 'GPS LOCKING...'}
          </span>
        </div>

        {/* Viewport with Image & Optical Aperture Sweep */}
        <div className="sos-image-viewport">
          <div className="sos-optical-sweep" />

          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Flood Incident Frame" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ color: '#71717a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <MdSensors size={36} />
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.02em' }}>Validating Sensor Payload...</span>
            </div>
          )}

          <div className="sos-image-badge">
            <span style={{ color: '#16a34a', fontSize: '0.8rem' }}>●</span>
            <span>Live Field Sensor Capture</span>
          </div>
        </div>

        {/* Minimalist Mission-Critical Stepper */}
        <div className="sos-steps-list">
          {SCAN_STEPS.map((step, idx) => {
            const isDone = idx < activeStep;
            const isCurrent = idx === activeStep;
            const isPending = idx > activeStep;

            return (
              <div 
                key={idx} 
                className="sos-step-item"
                style={{ opacity: isPending ? 0.35 : 1 }}
              >
                <div 
                  className="sos-step-badge"
                  style={{
                    background: isDone 
                      ? '#16a34a' 
                      : isCurrent 
                        ? 'rgba(2, 132, 199, 0.15)' 
                        : 'rgba(255, 255, 255, 0.06)',
                    color: isDone 
                      ? '#ffffff' 
                      : isCurrent 
                        ? '#0284c7' 
                        : '#71717a',
                    border: isCurrent ? '1.5px solid #0284c7' : '1px solid transparent'
                  }}
                >
                  {isDone ? (
                    <MdCheckCircle size={16} />
                  ) : isCurrent ? (
                    <MdSync size={15} style={{ animation: 'spin 1.2s linear infinite' }} />
                  ) : (
                    <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{idx + 1}</span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600, color: isCurrent ? '#f4f4f5' : isDone ? '#e4e4e7' : '#71717a' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#71717a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {step.subtitle}
                  </div>
                </div>

                {isCurrent && (
                  <span style={{ fontSize: '0.675rem', color: '#0284c7', fontWeight: 600, letterSpacing: '0.04em' }}>
                    RUNNING
                  </span>
                )}
                {isDone && (
                  <span style={{ fontSize: '0.675rem', color: '#16a34a', fontWeight: 700, letterSpacing: '0.04em' }}>
                    COMPLETE
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Minimal Progress Bar */}
        <div className="sos-progress-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#71717a', fontWeight: 500 }}>
            <span>Verification Progress</span>
            <span style={{ color: '#e4e4e7', fontFamily: 'monospace' }}>{progress}%</span>
          </div>
          <div className="sos-progress-track">
            <div className="sos-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AiScanningModal;
