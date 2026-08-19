import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  MdArrowBack, 
  MdWarning, 
  MdCheckCircle, 
  MdLocationOn, 
  MdMap, 
  MdListAlt, 
  MdAddCircle, 
  MdPhoneInTalk, 
  MdSecurity, 
  MdWaterDrop, 
  MdDirectionsCar, 
  MdHome, 
  MdInfo,
  MdShield,
  MdShare,
  MdPrint,
  MdAutoAwesome,
  MdSearch
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

export const SEVERITY_ANALYSIS_DATA = {
  1: {
    level: "Safe / Dry",
    riskCategory: "NONE",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    priority: "Normal Monitoring",
    estimatedDepth: "0 cm (Dry Surface)",
    submergence: "No water accumulation detected.",
    mobility: "Normal road and pedestrian access.",
    structuralRisk: "No structural or electrical hazard.",
    reasoning: "The uploaded image depicts a dry environment without flood inundation. Zero-shot visual semantics confirmed normal urban or indoor setting with no waterlogging.",
    actions: [
      "No immediate emergency action required.",
      "Stay updated with regional meteorological advisories.",
      "Ensure neighborhood storm drains remain clean and unclogged."
    ],
    urgencyLevel: "Safe"
  },
  2: {
    level: "Negligible / Damp",
    riskCategory: "LOW",
    color: "#06b6d4",
    bgColor: "rgba(6, 182, 212, 0.12)",
    borderColor: "rgba(6, 182, 212, 0.3)",
    priority: "Precautionary",
    estimatedDepth: "< 5 cm (Minor Surface Puddle)",
    submergence: "Superficial water pooling in localized ground depressions.",
    mobility: "Fully passable by pedestrians and vehicles.",
    structuralRisk: "Negligible risk to surrounding structures.",
    reasoning: "Minor rain puddle or damp surface detected on ground level. Water extent is localized (< 10% coverage) and does not impede traffic.",
    actions: [
      "Ensure localized drainage outlets are unobstructed.",
      "Monitor low-lying areas if rainfall continues.",
      "Exercise standard caution when walking on wet pavement."
    ],
    urgencyLevel: "Low Alert"
  },
  3: {
    level: "Minor Waterlogging",
    riskCategory: "LOW",
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.12)",
    borderColor: "rgba(59, 130, 246, 0.3)",
    priority: "Local Alert",
    estimatedDepth: "5 – 10 cm (Shallow Street Water)",
    submergence: "Shallow water spreading over road edges and footpaths.",
    mobility: "Slow vehicular traffic; pedestrians need waterproof footwear.",
    structuralRisk: "Low risk; water level is below plinth levels.",
    reasoning: "Surface runoff accumulation detected across road surface. Minor disruption to pedestrian movement with low structural danger.",
    actions: [
      "Avoid walking bare-footed through stagnant street runoff.",
      "Check municipal drainage updates for your ward/sector.",
      "Move electrical appliances from basement floor to elevated surfaces."
    ],
    urgencyLevel: "Low Alert"
  },
  4: {
    level: "Minor-Moderate Inundation",
    riskCategory: "LOW-MEDIUM",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.12)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    priority: "Warning",
    estimatedDepth: "10 – 20 cm (Ankle-Deep)",
    submergence: "Curb-height water covering road markings and pathways.",
    mobility: "Two-wheelers and sedans may experience water resistance.",
    structuralRisk: "Potential water ingress into low basements or underground parking.",
    reasoning: "Continuous flood body detected covering substantial road area (10%–25% ground zone). Water level is at curb height with moderate flow.",
    actions: [
      "Do NOT drive small vehicles or two-wheelers through flooded underpasses.",
      "Protect basement storage and verify water pump readiness.",
      "Keep emergency supplies (torch, power bank, basic medicines) accessible."
    ],
    urgencyLevel: "Moderate Alert"
  },
  5: {
    level: "Moderate Flood Hazard",
    riskCategory: "MEDIUM",
    color: "#f97316",
    bgColor: "rgba(249, 115, 22, 0.12)",
    borderColor: "rgba(249, 115, 22, 0.3)",
    priority: "Elevated Alert",
    estimatedDepth: "20 – 35 cm (Mid-Calf Deep)",
    submergence: "Submerging vehicle tires up to rim level and ground thresholds.",
    mobility: "Roads impassable for sedans; heavy traffic stagnation.",
    structuralRisk: "Water entering ground-level shops, gardens, and building lobbies.",
    reasoning: "Significant flood layer confirmed across ground zone. Submergence reaching vehicle rim height and residential entryways.",
    actions: [
      "Elevate essential electronics, documents, and furniture above 1 meter.",
      "Switch off main electrical breakers in water-prone ground floors.",
      "Coordinate with local community relief wardens and neighborhood groups."
    ],
    urgencyLevel: "High Alert"
  },
  6: {
    level: "Moderate-High Inundation",
    riskCategory: "MEDIUM-HIGH",
    color: "#ea580c",
    bgColor: "rgba(234, 88, 12, 0.12)",
    borderColor: "rgba(234, 88, 12, 0.3)",
    priority: "Urgent Response",
    estimatedDepth: "35 – 55 cm (Knee-Deep)",
    submergence: "Water halfway up car wheels and residential exterior walls.",
    mobility: "Vehicular transit blocked except high-clearance emergency trucks.",
    structuralRisk: "Ground floor living quarters flooded; electrical hazard.",
    reasoning: "Deep sediment-heavy floodwater identified. Significant vehicle and infrastructure submersion detected by physical spectral and semantic classifiers.",
    actions: [
      "Prepare for precautionary relocation to upper floors or designated relief centers.",
      "Do NOT attempt to wade through moving knee-deep water (strong current hazard).",
      "Ensure drinking water and non-perishable food supplies are safely stored."
    ],
    urgencyLevel: "Urgent Alert"
  },
  7: {
    level: "High Risk Flood",
    riskCategory: "HIGH",
    color: "#dc2626",
    bgColor: "rgba(220, 38, 38, 0.12)",
    borderColor: "rgba(220, 38, 38, 0.3)",
    priority: "Rescue Mobilization",
    estimatedDepth: "55 – 85 cm (Waist-Deep)",
    submergence: "Vehicles floating or stalled; water entering residential interiors.",
    mobility: "Streets completely impassable; swift-water rescue boats required.",
    structuralRisk: "Severe electrical hazards, sewage contamination, wall dampening.",
    reasoning: "Major urban flood condition. Water depth exceeds vehicle floorboards with continuous high-volume ground inundation.",
    actions: [
      "Move immediately to first floor or higher ground.",
      "Disconnect main power supply and gas connections.",
      "Notify emergency response teams via ResQFlow or call National Emergency 112."
    ],
    urgencyLevel: "Severe Emergency"
  },
  8: {
    level: "Severe Structural Submergence",
    riskCategory: "CRITICAL",
    color: "#b91c1c",
    bgColor: "rgba(185, 28, 28, 0.15)",
    borderColor: "rgba(185, 28, 28, 0.35)",
    priority: "Mandatory Evacuation",
    estimatedDepth: "85 – 130 cm (Chest-Deep / Ground Floor)",
    submergence: "Complete inundation of ground-floor structures and parked vehicles.",
    mobility: "Only inflatable rescue crafts and NDRF boats can operate.",
    structuralRisk: "Structural wall stress, complete power blackout, acute drowning danger.",
    reasoning: "Severe inundation confirmed by AI vision models. Extensive water coverage exceeding 50% of the image frame with deep structural immersion.",
    actions: [
      "EVACUATE ground levels immediately to upper floors or rooftops.",
      "Signal distress using bright cloth, flashlights, or whistles for boat rescue.",
      "Do NOT enter flood waters — risk of open manholes, debris, and swift currents."
    ],
    urgencyLevel: "Critical Emergency"
  },
  9: {
    level: "Extreme Disaster",
    riskCategory: "EMERGENCY",
    color: "#991b1b",
    bgColor: "rgba(153, 27, 27, 0.18)",
    borderColor: "rgba(153, 27, 27, 0.4)",
    priority: "Immediate Life Rescue",
    estimatedDepth: "1.3 – 2.0 meters (Submerging First Level)",
    submergence: "First floor almost submerged; residents trapped on upper floors.",
    mobility: "Total surface transit collapse; aerial and boat deployment needed.",
    structuralRisk: "Severe foundation undermining and building structural threat.",
    reasoning: "Catastrophic flood condition verified. Deep flood waters submerging primary architectural levels and transport infrastructure.",
    actions: [
      "Relocate immediately to rooftop or highest reinforced structure.",
      "Keep phone batteries conserved; share GPS coordinates with rescue teams.",
      "Prepare high-visibility markers for helicopter and boat evacuation."
    ],
    urgencyLevel: "Catastrophic"
  },
  10: {
    level: "Catastrophic Deluge",
    riskCategory: "EMERGENCY",
    color: "#7f1d1d",
    bgColor: "rgba(127, 29, 29, 0.22)",
    borderColor: "rgba(127, 29, 29, 0.45)",
    priority: "National Emergency / Life Rescue",
    estimatedDepth: "> 2.0 meters (Total Inundation)",
    submergence: "Only rooftops and tree canopies visible above deluge.",
    mobility: "Aerial and specialized disaster tactical assets only.",
    structuralRisk: "Catastrophic damage, potential building collapse, life-threatening.",
    reasoning: "Highest severity disaster detected. Extreme inundation exceeding 80% coverage with total immersion of buildings and ground infrastructure.",
    actions: [
      "Stay secured on highest rooftop; tie safety ropes if water continues to rise.",
      "Display international SOS signs (bright orange/red cloth, mirror reflections).",
      "Keep life jackets or buoyant objects (empty containers, thermocol) ready."
    ],
    urgencyLevel: "Catastrophic SOS"
  }
};

const ReportAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [reportData, setReportData] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    // 1. Try state passed via navigation
    if (location.state?.report) {
      setReportData(location.state.report);
      if (location.state.previewUrl) {
        setImageSrc(location.state.previewUrl);
      }
      // Cache in session storage for refreshing
      try {
        sessionStorage.setItem('last_report_analysis', JSON.stringify(location.state.report));
        if (location.state.previewUrl) {
          sessionStorage.setItem('last_report_image', location.state.previewUrl);
        }
      } catch (e) {
        console.warn('Session storage quota exceeded', e);
      }
    } else {
      // 2. Fallback to session storage
      try {
        const cachedReport = sessionStorage.getItem('last_report_analysis');
        const cachedImg = sessionStorage.getItem('last_report_image');
        if (cachedReport) {
          setReportData(JSON.parse(cachedReport));
          if (cachedImg) setImageSrc(cachedImg);
        }
      } catch (e) {
        console.error('Failed to load cached report analysis', e);
      }
    }
  }, [location.state]);

  if (!reportData) {
    return (
      <div className="page-container animate-fade-in-up" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '2.5rem' }}>
          <MdInfo style={{ fontSize: '3.5rem', color: 'var(--accent-ocean)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>No Active Report Selected</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Please submit a new flood report or select an existing incident from your reports list to view its AI severity breakdown.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/victim/create-report" className="btn btn-primary">
              <MdAddCircle /> Report Flood
            </Link>
            <Link to="/victim/my-reports" className="btn btn-secondary">
              <MdListAlt /> My Reports
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const score = Math.max(1, Math.min(10, Number(reportData.severityScore) || 1));
  const fallback = SEVERITY_ANALYSIS_DATA[score] || SEVERITY_ANALYSIS_DATA[1];

  // Dynamically resolve values from backend/AI reportData or fallbacks
  const displayTitle = reportData.title || fallback.level;
  const displayDescription = reportData.description || fallback.reasoning;
  const displayLevel = reportData.severityLevel || reportData.severity_level || fallback.level;
  const displayPriority = reportData.rescuePriority || reportData.rescue_priority || fallback.priority;
  const displayWhatInImage = reportData.whatIsInImage || reportData.what_is_in_image || fallback.submergence;
  const displayEstimatedDepth = reportData.estimatedDepth || reportData.estimated_depth || fallback.estimatedDepth;
  const displayRoadAccess = reportData.roadAccess || reportData.road_access || reportData.mobility || fallback.mobility;
  const displayActions = (Array.isArray(reportData.recommendations) && reportData.recommendations.length > 0)
    ? reportData.recommendations
    : fallback.actions;

  const getCoordinates = () => {
    if (reportData.location?.coordinates?.length >= 2) {
      return {
        lat: Number(reportData.location.coordinates[1]).toFixed(4),
        lng: Number(reportData.location.coordinates[0]).toFixed(4)
      };
    }
    if (reportData.latitude !== undefined && reportData.longitude !== undefined) {
      return {
        lat: Number(reportData.latitude).toFixed(4),
        lng: Number(reportData.longitude).toFixed(4)
      };
    }
    return { lat: '19.0760', lng: '72.8777' };
  };

  const coords = getCoordinates();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Flood Incident Analysis: ${displayTitle}`,
        text: `Flood Severity Score: ${score}/10 (${displayLevel}) at [${coords.lat}, ${coords.lng}]. Priority: ${displayPriority}.\n\nDetails: ${displayDescription}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Flood Report: ${displayTitle}\nSeverity: ${score}/10 (${displayLevel})\nCoordinates: ${coords.lat}, ${coords.lng}\nPriority: ${displayPriority}\nDetails: ${displayDescription}`
      );
      toast.success('Incident summary copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container animate-fade-in-up" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Top Breadcrumb & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/victim/my-reports')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
        >
          <MdArrowBack /> Back to Reports
        </button>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleShare}
            title="Share Incident Analysis"
          >
            <MdShare /> Share
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handlePrint}
            title="Print Analysis Summary"
          >
            <MdPrint /> Print
          </button>
          <Link to="/victim/create-report" className="btn btn-primary btn-sm">
            <MdAddCircle /> New Report
          </Link>
        </div>
      </div>

      {/* Success Notification Banner */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
          <MdCheckCircle />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            Report Successfully Analyzed by ResQFlow AI Model
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Incident coordinates and risk metrics have been recorded on the regional disaster heatmap.
          </p>
        </div>
        <span 
          style={{ 
            background: fallback.bgColor, 
            color: fallback.color, 
            border: `1.5px solid ${fallback.borderColor}`,
            padding: '6px 14px', 
            borderRadius: '99px', 
            fontWeight: 800, 
            fontSize: '0.8rem',
            letterSpacing: '0.04em'
          }}
        >
          {fallback.urgencyLevel.toUpperCase()}
        </span>
      </div>

      {/* Main Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Left Card: AI Severity Score Meter */}
        <div 
          className="glass-card" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            border: `1.5px solid ${fallback.borderColor}`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top highlight bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: fallback.color }} />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                AI Severity Assessment
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: fallback.color, background: fallback.bgColor, padding: '2px 8px', borderRadius: '6px' }}>
                <MdShield size={13} /> {fallback.riskCategory} RISK
              </span>
            </div>

            {/* Circular / Large Score Display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div 
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  background: fallback.bgColor,
                  border: `4px solid ${fallback.color}`,
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: `0 8px 24px ${fallback.bgColor}`,
                  flexShrink: 0
                }}
              >
                <span style={{ fontSize: '2.4rem', fontWeight: 900, color: fallback.color, lineHeight: 1 }}>
                  {score}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  out of 10
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {displayLevel}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Rescue Priority:</span>
                  <strong style={{ color: fallback.color }}>{displayPriority}</strong>
                </div>
              </div>
            </div>

            {/* Multi-step Severity Bar */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                <span>Safe (1-2)</span>
                <span>Minor (3-4)</span>
                <span>Moderate (5-6)</span>
                <span>Severe (7-8)</span>
                <span>Extreme (9-10)</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden', display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5,6,7,8,9,10].map(step => (
                  <div 
                    key={step} 
                    style={{ 
                      flex: 1, 
                      background: step <= score ? fallback.color : '#e2e8f0',
                      transition: 'background 0.3s ease'
                    }} 
                  />
                ))}
              </div>
            </div>

            {/* Submergence & Depth Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '0.875rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MdWaterDrop style={{ color: 'var(--accent-ocean)' }} /> Est. Water Depth
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {displayEstimatedDepth}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MdDirectionsCar style={{ color: '#ea580c' }} /> Road Access
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.2 }}>
                  {displayRoadAccess}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Uploaded Incident Image & AI Vision Metadata */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Submitted Visual Evidence
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              AI Vision Inspector
            </span>
          </div>

          <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#0f172a', maxHeight: '230px', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {imageSrc ? (
              <img 
                src={imageSrc} 
                alt="Submitted Flood Scene" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                <MdWaterDrop style={{ fontSize: '3rem', marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Image Analyzed by Server</p>
              </div>
            )}

            {/* AI Vision Overlay Badge */}
            <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: fallback.color, display: 'inline-block' }} />
              CLIP Deep Vision + Physical Inundation Model
            </div>
          </div>

          {/* AI Inspection Features */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              ✓ Semantic Scene Verification
            </span>
            <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              ✓ Spectral NDWI & Silt Filtration
            </span>
            <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              ✓ Ground-Zone Gravity Model
            </span>
          </div>
        </div>

      </div>

      {/* Dynamic AI Scene Breakdown Card */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', borderLeft: `4px solid ${fallback.color}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <MdAutoAwesome style={{ color: 'var(--accent-ocean)', fontSize: '1.25rem' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            AI Visual Scene Inspection & Extent Analysis
          </h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
          {displayWhatInImage}
        </p>
      </div>

      {/* Reasoning & Safety Action Plan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Dynamic Description & Reasoning */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MdInfo style={{ color: 'var(--accent-ocean)', fontSize: '1.25rem' }} />
            AI Situational Assessment
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1rem' }}>
            {displayDescription}
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.875rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Structural & Environmental Impact:
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {fallback.structuralRisk}
            </div>
          </div>
        </div>

        {/* Actionable Safety Protocol */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MdSecurity style={{ color: fallback.color, fontSize: '1.25rem' }} />
            Recommended Safety Protocols
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {displayActions.map((act, index) => (
              <li 
                key={index}
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.625rem', 
                  fontSize: '0.875rem', 
                  color: 'var(--text-primary)',
                  lineHeight: 1.45 
                }}
              >
                <span style={{ color: fallback.color, fontSize: '1.1rem', lineHeight: 1, marginTop: '2px', flexShrink: 0 }}>
                  <MdCheckCircle />
                </span>
                <span>{act}</span>
              </li>
            ))}
          </ul>

          {/* Emergency Helpline Callout */}
          {score >= 6 && (
            <div style={{ marginTop: '1.25rem', background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.25)', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MdPhoneInTalk style={{ color: '#dc2626', fontSize: '1.3rem' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#991b1b' }}>
                  National Disaster Helpline: 112 / 1078
                </span>
              </div>
              <a href="tel:112" className="btn btn-sm" style={{ background: '#dc2626', color: '#ffffff', fontWeight: 700, padding: '4px 12px' }}>
                Call SOS
              </a>
            </div>
          )}
        </div>

      </div>

      {/* Incident Summary & Location Info */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              AI Incident Title
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', marginBottom: '0.5rem' }}>
              {displayTitle}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '650px', lineHeight: 1.6, margin: 0 }}>
              {displayDescription}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.875rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <MdLocationOn style={{ color: 'var(--accent-ocean)', fontSize: '1.2rem' }} />
              <span>Coordinates: <strong>{coords.lat}, {coords.lng}</strong></span>
            </div>
            <Link 
              to="/victim/heatmap" 
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginTop: '0.25rem' }}
            >
              <MdMap /> View On Live Heatmap
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/victim/heatmap" className="btn btn-secondary" style={{ minWidth: '180px' }}>
          <MdMap /> Live Risk Heatmap
        </Link>
        <Link to="/victim/my-reports" className="btn btn-secondary" style={{ minWidth: '180px' }}>
          <MdListAlt /> View All My Reports
        </Link>
        <Link to="/victim/create-report" className="btn btn-primary" style={{ minWidth: '180px' }}>
          <MdAddCircle /> Submit Another Report
        </Link>
      </div>

    </div>
  );
};

export default ReportAnalysis;
