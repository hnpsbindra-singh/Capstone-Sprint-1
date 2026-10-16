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

  // Lock background scrolling and prevent page dragging while modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      const prevTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.touchAction = prevTouchAction;
      };
    }
  }, [isOpen]);

  // Step sequencer
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
    <div className="sos-modal-overlay" role="dialog" aria-modal="true" aria-label="AI Incident Analysis">
      <style>{`
        .sos-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(9, 9, 11, 0.85);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          touch-action: none;
          overscroll-behavior: contain;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        .sos-modal-card {
          width: 100%;
          max-width: 480px;
          max-height: 92vh;
          max-height: 92dvh;
          display: flex;
          flex-direction: column;
          background: #09090b;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          overflow-y: auto;
          color: #fafafa;
          touch-action: pan-y;
          overscroll-behavior: contain;
        }

        .sos-modal-header {
          padding: 0.875rem 1.25rem;
          background: #121215;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .sos-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #38bdf8;
          background: rgba(2, 132, 199, 0.15);
          padding: 0.25rem 0.6rem;
          border-radius: 9999px;
          border: 1px solid rgba(2, 132, 199, 0.35);
        }

        .sos-status-dot {
          width: 7px;
          height: 7px;
          background: #38bdf8;
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
          min-height: 220px;
          height: 270px;
          max-height: 340px;
          background: #09090b;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sos-hud-bracket {
          position: absolute;
          width: 12px;
          height: 12px;
          pointer-events: none;
          z-index: 5;
        }
        .sos-hud-tl { top: 12px; left: 12px; border-top: 2px solid #0284c7; border-left: 2px solid #0284c7; }
        .sos-hud-tr { top: 12px; right: 12px; border-top: 2px solid #0284c7; border-right: 2px solid #0284c7; }
        .sos-hud-bl { bottom: 12px; left: 12px; border-bottom: 2px solid #0284c7; border-left: 2px solid #0284c7; }
        .sos-hud-br { bottom: 12px; right: 12px; border-bottom: 2px solid #0284c7; border-right: 2px solid #0284c7; }

        .sos-optical-sweep {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: #38bdf8;
          box-shadow: 0 0 10px 2px rgba(56, 189, 248, 0.7);
          z-index: 10;
          pointer-events: none;
          animation: apertureSweep 2s ease-in-out infinite;
        }

        @keyframes apertureSweep {
          0% { top: 4%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 96%; opacity: 0; }
        }

        .sos-image-badge {
          position: absolute;
          bottom: 12px;
          left: 14px;
          z-index: 15;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(9, 9, 11, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
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

        @media (max-width: 480px) {
          .sos-modal-overlay {
            padding: 0.5rem;
          }
          .sos-modal-card {
            max-height: 94vh;
            border-radius: 14px;
          }
          .sos-image-viewport {
            height: 200px;
            min-height: 180px;
          }
          .sos-steps-list {
            padding: 0.875rem 1rem;
            gap: 0.625rem;
          }
          .sos-progress-container {
            padding: 0 1rem 1rem 1rem;
          }
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

        {/* Viewport with Clean Image & Laser Scan Line */}
        <div className="sos-image-viewport">
          {/* Laser Scanner Line */}
          <div className="sos-optical-sweep" />

          {/* Corner HUD Telemetry Brackets */}
          <div className="sos-hud-bracket sos-hud-tl" />
          <div className="sos-hud-bracket sos-hud-tr" />
          <div className="sos-hud-bracket sos-hud-bl" />
          <div className="sos-hud-bracket sos-hud-br" />

          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Flood Incident Frame" 
              style={{ 
                position: 'relative',
                zIndex: 2,
                maxWidth: '92%', 
                maxHeight: '92%', 
                width: 'auto', 
                height: 'auto', 
                objectFit: 'contain', 
                display: 'block',
                borderRadius: '6px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)'
              }} 
            />
          ) : (
            <div style={{ color: '#71717a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 2 }}>
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
