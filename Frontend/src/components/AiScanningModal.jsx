import React, { useState, useEffect } from 'react';
import { 
  MdCheckCircle, 
  MdSecurity, 
  MdRadar, 
  MdLocationOn, 
  MdAutoAwesome, 
  MdWaterDrop, 
  MdSensors 
} from 'react-icons/md';

const SCAN_STEPS = [
  {
    title: 'Acquiring Satellite GPS & Sensor Telemetry',
    subtitle: 'Extracting location coordinates and device metadata',
    icon: MdLocationOn
  },
  {
    title: 'Multimodal Vision & Turbidity Analysis',
    subtitle: 'Neural segmentation of floodwater boundaries',
    icon: MdWaterDrop
  },
  {
    title: 'Evaluating Submerged Road & Infrastructure Risk',
    subtitle: 'Estimating depth levels and vehicular passability',
    icon: MdSensors
  },
  {
    title: 'Synthesizing First-Responder Triage Directives',
    subtitle: 'Formatting incident report for emergency dispatch',
    icon: MdSecurity
  }
];

const AiScanningModal = ({ isOpen, previewUrl, coords, addressLabel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    if (!isOpen) {
      setActiveStep(0);
      setProgress(15);
      return;
    }

    // Step progression during AI inference
    const timer1 = setTimeout(() => { setActiveStep(1); setProgress(45); }, 650);
    const timer2 = setTimeout(() => { setActiveStep(2); setProgress(75); }, 1450);
    const timer3 = setTimeout(() => { setActiveStep(3); setProgress(94); }, 2250);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="ai-scanner-overlay">
      <style>{`
        .ai-scanner-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(8, 12, 22, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          animation: scannerFadeIn 0.25s ease-out;
        }

        @keyframes scannerFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        .ai-scanner-card {
          width: 100%;
          max-width: 580px;
          background: #0d1527;
          border: 1px solid rgba(56, 189, 248, 0.35);
          border-radius: 16px;
          box-shadow: 0 0 50px rgba(14, 165, 233, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          overflow: hidden;
          color: #f8fafc;
        }

        .ai-scanner-header {
          padding: 1rem 1.25rem;
          background: rgba(15, 23, 42, 0.85);
          border-bottom: 1px solid rgba(56, 189, 248, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .ai-pulse-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #38bdf8;
          background: rgba(14, 165, 233, 0.12);
          padding: 0.3rem 0.65rem;
          border-radius: 9999px;
          border: 1px solid rgba(56, 189, 248, 0.35);
        }

        .ai-pulse-dot {
          width: 8px;
          height: 8px;
          background: #38bdf8;
          border-radius: 50%;
          animation: pulseScan 1.2s ease-in-out infinite alternate;
          box-shadow: 0 0 8px #38bdf8;
        }

        @keyframes pulseScan {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.3); opacity: 1; }
        }

        .ai-image-viewport {
          position: relative;
          width: 100%;
          height: 220px;
          background: #020617;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-laser-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, #38bdf8 20%, #38bdf8 80%, transparent 100%);
          box-shadow: 0 0 15px #38bdf8, 0 0 30px #0284c7;
          z-index: 10;
          animation: sweepLaser 2s linear infinite alternate;
        }

        .ai-laser-glow {
          position: absolute;
          left: 0;
          right: 0;
          height: 45px;
          background: linear-gradient(180deg, rgba(56, 189, 248, 0.25) 0%, transparent 100%);
          z-index: 9;
          animation: sweepLaser 2s linear infinite alternate;
        }

        @keyframes sweepLaser {
          0% { top: 0%; }
          100% { top: calc(100% - 3px); }
        }

        .ai-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
          z-index: 5;
        }

        .ai-corner-reticle {
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: #38bdf8;
          border-style: solid;
          z-index: 12;
          pointer-events: none;
        }
        .ai-corner-tl { top: 12px; left: 12px; border-width: 3px 0 0 3px; }
        .ai-corner-tr { top: 12px; right: 12px; border-width: 3px 3px 0 0; }
        .ai-corner-bl { bottom: 12px; left: 12px; border-width: 0 0 3px 3px; }
        .ai-corner-br { bottom: 12px; right: 12px; border-width: 0 3px 3px 0; }

        .ai-telemetry-strip {
          position: absolute;
          bottom: 10px;
          left: 16px;
          right: 16px;
          z-index: 15;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(6px);
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.725rem;
          font-family: monospace;
          color: #94a3b8;
        }

        .ai-steps-container {
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .ai-step-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          transition: all 0.3s ease;
        }

        .ai-step-indicator {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .ai-progress-track {
          width: 100%;
          height: 6px;
          background: rgba(51, 65, 85, 0.6);
          border-radius: 9999px;
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .ai-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #34d399 100%);
          border-radius: 9999px;
          transition: width 0.4s ease;
        }
      `}</style>

      <div className="ai-scanner-card">
        {/* Header HUD */}
        <div className="ai-scanner-header">
          <div className="ai-pulse-badge">
            <span className="ai-pulse-dot" />
            <span>AI Radar Vision Pipeline</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
            ENGINE: GEMINI 2.5 FLASH / GROQ
          </span>
        </div>

        {/* Viewport with Image & Cyber Laser Scan */}
        <div className="ai-image-viewport">
          <div className="ai-grid-overlay" />
          <div className="ai-laser-line" />
          <div className="ai-laser-glow" />

          {/* Targeting Brackets */}
          <div className="ai-corner-reticle ai-corner-tl" />
          <div className="ai-corner-reticle ai-corner-tr" />
          <div className="ai-corner-reticle ai-corner-bl" />
          <div className="ai-corner-reticle ai-corner-br" />

          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Analyzing Flood Capture" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} 
            />
          ) : (
            <div style={{ color: '#38bdf8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <MdRadar size={42} style={{ animation: 'spin 3s linear infinite' }} />
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>PROCESSING SENSOR FEED...</span>
            </div>
          )}

          {/* Telemetry Footer */}
          <div className="ai-telemetry-strip">
            <span>
              GPS: {coords ? `${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E` : 'LOCKING...'}
            </span>
            <span style={{ color: '#38bdf8' }}>
              {activeStep === 3 ? 'FINALIZING DISPATCH' : 'NEURAL INFERENCE IN PROGRESS'}
            </span>
          </div>
        </div>

        {/* Progress & Live Pipeline Steps */}
        <div className="ai-steps-container">
          {SCAN_STEPS.map((step, idx) => {
            const isDone = idx < activeStep;
            const isCurrent = idx === activeStep;
            const isPending = idx > activeStep;

            return (
              <div 
                key={idx} 
                className="ai-step-row"
                style={{ opacity: isPending ? 0.35 : 1 }}
              >
                <div 
                  className="ai-step-indicator"
                  style={{
                    background: isDone 
                      ? '#059669' 
                      : isCurrent 
                        ? 'rgba(14, 165, 233, 0.2)' 
                        : 'rgba(51, 65, 85, 0.4)',
                    color: isDone 
                      ? '#ffffff' 
                      : isCurrent 
                        ? '#38bdf8' 
                        : '#64748b',
                    border: isCurrent ? '1px solid #38bdf8' : 'none',
                    boxShadow: isCurrent ? '0 0 10px rgba(56, 189, 248, 0.5)' : 'none'
                  }}
                >
                  {isDone ? (
                    <MdCheckCircle size={18} />
                  ) : isCurrent ? (
                    <MdAutoAwesome size={15} style={{ animation: 'pulseScan 0.8s alternate infinite' }} />
                  ) : (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{idx + 1}</span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: isCurrent ? '#38bdf8' : '#f1f5f9' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {step.subtitle}
                  </div>
                </div>

                {isCurrent && (
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600, fontFamily: 'monospace' }}>
                    PROCESSING...
                  </span>
                )}
                {isDone && (
                  <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, fontFamily: 'monospace' }}>
                    DONE
                  </span>
                )}
              </div>
            );
          })}

          {/* Smooth Progress Bar */}
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: '#64748b', fontWeight: 600, fontFamily: 'monospace' }}>
              <span>NEURAL PIPELINE COMPLETION</span>
              <span style={{ color: '#38bdf8' }}>{progress}%</span>
            </div>
            <div className="ai-progress-track">
              <div className="ai-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AiScanningModal;
