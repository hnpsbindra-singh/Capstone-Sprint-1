import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  MdCameraAlt, 
  MdMyLocation, 
  MdArrowBack, 
  MdArrowForward,
  MdCheckCircle, 
  MdAutoAwesome, 
  MdLock, 
  MdLocationOn, 
  MdShield, 
  MdRefresh, 
  MdVideocam, 
  MdFlipCameraIos,
  MdInfo,
  MdWaterDrop,
  MdWarning,
  MdMap,
  MdPhotoLibrary
} from 'react-icons/md';
import { createFloodReport } from '../../api/victimApi';
import { enqueueOfflineReport } from '../../utils/offlineQueue';
import { useLanguage } from '../../context/LanguageContext';
import AiScanningModal from '../../components/AiScanningModal';

// ==============================================================================
// FEATURE TOGGLE: Set to false to disable gallery and enforce live camera only
// ==============================================================================
const ALLOW_GALLERY_UPLOAD = false;

const CreateReport = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Wizard Step: 'process' (explanation) -> 'camera' (live viewfinder)
  const [step, setStep] = useState('process');

  const [coords, setCoords] = useState(null);
  const [addressLabel, setAddressLabel] = useState('Detecting current location...');
  const [locating, setLocating] = useState(true);
  
  // Live Camera state
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear) or 'user' (front)
  const [submitting, setSubmitting] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // 1. Automatically fetch & lock current GPS location on mount
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      setLocating(false);
      setAddressLabel('GPS not supported');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });

        // Reverse geocode to get human-readable city & area
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const road = data.address?.road || data.address?.suburb || 'Local Area';
          const city = data.address?.city || data.address?.town || data.address?.county || 'District';
          const state = data.address?.state || '';
          setAddressLabel(`${road}, ${city}${state ? ', ' + state : ''}`);
        } catch (e) {
          setAddressLabel(`Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error('Error fetching GPS location:', error);
        toast.error('Failed to get precise GPS. Please enable location permissions.');
        setCoords({ lat: 19.0760, lng: 72.8777 });
        setAddressLabel('Default GPS Lock (19.0760, 72.8777)');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // 2. Start Live Camera Stream
  const startCamera = useCallback(async (mode = facingMode) => {
    setCameraError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access is not supported by this browser.');
      }

      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      let msg = 'Unable to access camera. Please allow camera permissions in your browser settings.';
      if (err.name === 'NotAllowedError') {
        msg = 'Camera permission was denied. Please grant camera permission to capture flood photos.';
      } else if (err.name === 'NotFoundError') {
        msg = 'No camera device found on this system.';
      }
      setCameraError(msg);
      setCameraActive(false);
    }
  }, [facingMode]);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Fetch GPS on mount
  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  // Activate camera when user switches to 'camera' step
  useEffect(() => {
    if (step === 'camera' && !previewUrl) {
      startCamera(facingMode);
    }
    return () => {
      stopCamera();
    };
  }, [step, previewUrl, startCamera, stopCamera, facingMode]);

  // Flip camera between rear and front
  const toggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture still frame from live video
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `live_flood_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        stopCamera();
        toast.success('Live photo captured successfully!');
      }
    }, 'image/jpeg', 0.92);
  };

  // Retake photo
  const retakePhoto = () => {
    setImageFile(null);
    setPreviewUrl(null);
    startCamera(facingMode);
  };

  // Helper to optimize and normalize large/AI-generated images before sending to backend
  const optimizeImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const safeName = `flood_evidence_${Date.now()}.jpg`;
                const optimizedFile = new File([blob], safeName, { type: 'image/jpeg' });
                resolve({ file: optimizedFile, previewUrl: URL.createObjectURL(blob) });
              } else {
                resolve({ file, previewUrl: URL.createObjectURL(file) });
              }
            },
            'image/jpeg',
            0.88
          );
        };
        img.onerror = () => resolve({ file, previewUrl: URL.createObjectURL(file) });
        img.src = e.target.result;
      };
      reader.onerror = () => resolve({ file, previewUrl: URL.createObjectURL(file) });
      reader.readAsDataURL(file);
    });
  };

  // Upload/Select photo from gallery for testing
  const handleGalleryFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file.');
        return;
      }
      toast.loading('Processing and optimizing image...', { id: 'image-opt' });
      try {
        const { file: optimizedFile, previewUrl: newPreview } = await optimizeImageFile(file);
        setImageFile(optimizedFile);
        setPreviewUrl(newPreview);
        stopCamera();
        toast.success('Image ready for analysis!', { id: 'image-opt' });
      } catch (err) {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        stopCamera();
        toast.dismiss('image-opt');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error('Please capture a live photo of the flood area using the camera.');
      return;
    }

    if (!coords) {
      toast.error('Acquiring your current GPS location. Please wait a moment...');
      return;
    }

    setSubmitting(true);

    const payload = {
      latitude: coords.lat,
      longitude: coords.lng
    };

    // 1. Proactive Offline Check: Save to emergency cache if disconnected
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        toast.loading('Saving incident to Offline Emergency Cache...', { id: 'submit-report' });
        await enqueueOfflineReport(payload, imageFile, { addressLabel });
        toast.success(
          'Offline Mode: Flood incident & live photo saved locally with GPS stamp! Will auto-dispatch when network reconnects.',
          { id: 'submit-report', duration: 7000, icon: '📡' }
        );
        navigate('/victim/my-reports');
      } catch (err) {
        console.error('Failed to store offline report:', err);
        toast.error('Could not save offline report locally. Please try again.', { id: 'submit-report' });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // 2. Online Submission with Network Drop Catch
    try {
      toast.loading('AI Model analyzing flood hazard & generating report...', { id: 'submit-report' });
      const result = await createFloodReport(payload, imageFile);

      const severityScore = result?.severityScore ?? result?.data?.severityScore ?? 1;
      if (severityScore <= 2) {
        toast('Incident Analyzed: Severity is ≤ 2 (Safe/Dry). Not considered an active flood disaster.', {
          icon: 'ℹ️',
          id: 'submit-report',
          duration: 5000
        });
      } else {
        toast.success(`Emergency Verified! AI Severity Score: ${severityScore}/10 (Considered & Dispatched)`, { id: 'submit-report' });
      }

      const reportState = {
        ...(typeof result === 'object' ? result : {}),
        title: result?.title || `Flood Incident near ${addressLabel}`,
        description: result?.description || 'AI-analyzed flood hazard report.',
        whatIsInImage: result?.whatIsInImage,
        estimatedDepth: result?.estimatedDepth,
        roadAccess: result?.roadAccess,
        recommendations: result?.recommendations,
        severityLevel: result?.severityLevel,
        rescuePriority: result?.rescuePriority,
        latitude: coords.lat,
        longitude: coords.lng,
        location: result?.location || { coordinates: [coords.lng, coords.lat] },
        severityScore: severityScore,
        id: result?.id || result?._id || String(Date.now())
      };

      navigate('/victim/report-analysis', {
        state: {
          report: reportState,
          previewUrl: previewUrl
        }
      });
    } catch (error) {
      console.error('Error submitting flood report:', error);

      // Check if network failed mid-flight
      if (!navigator.onLine || error.code === 'ERR_NETWORK' || !error.response) {
        try {
          await enqueueOfflineReport(payload, imageFile, { addressLabel });
          toast.success(
            'Connection lost mid-flight! Report preserved in offline queue. Auto-dispatch will trigger when back online.',
            { id: 'submit-report', duration: 7000, icon: '📡' }
          );
          navigate('/victim/my-reports');
          return;
        } catch (queueErr) {
          console.error('Failed to cache offline report after network drop:', queueErr);
        }
      }

      if (error.response?.status === 429) {
        const rateLimitMsg =
          error.response?.data?.message ||
          'Rate limit reached: You can submit up to 5 flood reports per hour. Please wait before submitting another report.';
        toast.error(rateLimitMsg, {
          id: 'submit-report',
          duration: 7000,
          icon: '⏳'
        });
      } else {
        const errMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          (typeof error.response?.data === 'string' ? error.response?.data : null) ||
          error.message ||
          'Failed to submit flood report. Please try again.';
        toast.error(errMsg, { id: 'submit-report', duration: 5000 });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container animate-fade-in-up" style={{ maxWidth: '720px', margin: '0 auto' }}>
      
      {/* Top Breadcrumb / Back Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        {step === 'camera' ? (
          <button 
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              stopCamera();
              setStep('process');
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <MdArrowBack /> Back to Process Guide
          </button>
        ) : (
          <Link 
            to="/victim/my-reports" 
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <MdArrowBack /> {t('myReports')}
          </Link>
        )}

        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          Step {step === 'process' ? '1 of 2: Overview' : '2 of 2: Photo Capture'}
        </span>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STEP 1: COMPLETE PROCESS EXPLANATION                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {step === 'process' && (
        <div className="glass-card animate-fade-in-up create-report-card">
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              How Flood Incident Reporting Works
            </h1>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.5 }}>
              Follow these simple steps to report a flood emergency. Our AI computer vision model evaluates depth and dispatches alerts to rescue teams in real-time.
            </p>
          </div>

          {/* Process Timeline Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            
            {/* Step 1 Item */}
            <div style={{ display: 'flex', gap: '1rem', background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(2, 132, 199, 0.12)', color: 'var(--accent-ocean)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                <MdLocationOn />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-ocean)', textTransform: 'uppercase' }}>Step 1</span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Automatic GPS Lock & Geocoding
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Your precise latitude and longitude are recorded in the background so emergency responders and NGOs know the exact point of incident.
                </p>
              </div>
            </div>

            {/* Step 2 Item */}
            <div style={{ display: 'flex', gap: '1rem', background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(234, 88, 12, 0.12)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                <MdCameraAlt />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>Step 2</span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Capture Live Photo via Camera
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Point your camera at the flooded street, submerged objects, or water depth. Pre-saved gallery uploads are disabled to guarantee verified real-time evidence.
                </p>
              </div>
            </div>

            {/* Step 3 Item */}
            <div style={{ display: 'flex', gap: '1rem', background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                <MdWaterDrop />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>Step 3</span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    AI Vision Analysis & Severity Score
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Our AI vision model calculates inundation depth, road access status, structural hazard level, and assigns a calibrated severity score from 1 to 10.
                </p>
              </div>
            </div>

            {/* Step 4 Item */}
            <div style={{ display: 'flex', gap: '1rem', background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                <MdMap />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase' }}>Step 4</span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Live Heatmap & Rescue Dispatch
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  The report is instantly plotted on the disaster risk heatmap, allowing relief agencies and disaster managers to prioritize rescue and resource allocation.
                </p>
              </div>
            </div>

          </div>

          {/* Safety Advisory Callout */}
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <MdWarning style={{ color: '#d97706', fontSize: '1.5rem', flexShrink: 0 }} />
            <div style={{ fontSize: '0.825rem', color: '#92400e', lineHeight: 1.5 }}>
              <strong>Safety Warning:</strong> Do not walk or drive into deep moving floodwaters to take photos. Ensure your physical safety before capturing footage.
            </div>
          </div>

          {/* Proceed to Click Photo Action Button */}
          <button 
            type="button"
            className="btn btn-primary"
            onClick={() => setStep('camera')}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              fontSize: '1.1rem', 
              fontWeight: 800, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.625rem',
              boxShadow: '0 4px 16px rgba(2, 132, 199, 0.35)'
            }}
          >
            <MdCameraAlt style={{ fontSize: '1.35rem' }} />
            Proceed to Click Photo
            <MdArrowForward style={{ fontSize: '1.25rem' }} />
          </button>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STEP 2: LIVE CAMERA VIEWFINDER & SUBMISSION                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {step === 'camera' && (
        <div className="glass-card animate-fade-in-up create-report-card">
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--accent-ocean)', padding: '6px 16px', borderRadius: '99px', fontSize: '0.825rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              <MdAutoAwesome /> Live Camera Sensor Verification
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Capture Live Flood Incident
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
              Aim your camera at the flood level. Your GPS location will be stamped on the bottom right of the photo.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Live Camera Viewfinder & Options */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Visual Incident Evidence <span style={{ color: '#dc2626' }}>*</span>
                </label>
                
                {ALLOW_GALLERY_UPLOAD && !previewUrl && (
                  <label
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', margin: 0 }}
                    title="Select an image from gallery/files"
                  >
                    <MdPhotoLibrary style={{ color: 'var(--accent-ocean)' }} /> Choose from Files
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleGalleryFileSelect} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                )}
              </div>

              {/* Camera Viewfinder / Preview Container */}
              <div 
                style={{ 
                  position: 'relative', 
                  borderRadius: '14px', 
                  overflow: 'hidden', 
                  background: '#09090b', 
                  minHeight: '280px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1.5px solid var(--border-subtle)'
                }}
              >
                {/* State A: Preview of Captured Photo */}
                {previewUrl ? (
                  <div style={{ 
                    width: '100%', 
                    position: 'relative', 
                    background: '#09090b', 
                    minHeight: '260px', 
                    maxHeight: '420px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    overflow: 'hidden' 
                  }}>
                    {/* Ambient blurred backdrop for portrait / custom aspect ratios */}
                    <div 
                      style={{
                        position: 'absolute',
                        top: '-10%',
                        left: '-10%',
                        width: '120%',
                        height: '120%',
                        backgroundImage: `url(${previewUrl})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        filter: 'blur(20px) brightness(0.25)',
                        transform: 'scale(1.1)',
                        pointerEvents: 'none'
                      }} 
                    />

                    <img 
                      src={previewUrl} 
                      alt="Captured Flood Scene" 
                      style={{ 
                        position: 'relative',
                        zIndex: 2,
                        maxWidth: '100%', 
                        maxHeight: '400px', 
                        width: 'auto', 
                        height: 'auto', 
                        objectFit: 'contain', 
                        display: 'block',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                      }}
                    />
                    
                    {/* Bottom Metadata Ribbon (Single clean overlay across bottom) */}
                    <div 
                      style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        zIndex: 3,
                        background: 'linear-gradient(to top, rgba(9, 9, 11, 0.92) 0%, rgba(9, 9, 11, 0.6) 70%, transparent 100%)', 
                        padding: '1.25rem 0.85rem 0.75rem',
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '4px',
                        color: '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MdCheckCircle /> Ready for Analysis
                        </span>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                          {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Locating...'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <MdLocationOn style={{ display: 'inline', marginRight: '3px', verticalAlign: '-2px', color: '#38bdf8' }} />
                        {addressLabel}
                      </div>
                    </div>
                  </div>
                ) : cameraError ? (
                  /* State B: Camera Permission / Device Error */
                  <div style={{ padding: '2rem 1.25rem', textAlign: 'center', color: '#e2e8f0', width: '100%' }}>
                    <MdVideocam style={{ fontSize: '2.75rem', color: '#f87171', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.35rem', color: '#fca5a5' }}>
                      Camera Access Required
                    </div>
                    <p style={{ fontSize: '0.825rem', color: '#94a3b8', maxWidth: '340px', margin: '0 auto 1.25rem auto', lineHeight: 1.4 }}>
                      {cameraError}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => startCamera(facingMode)}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <MdRefresh /> Retry Camera
                      </button>
                      <label
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}
                      >
                        <MdPhotoLibrary /> Pick from Files
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleGalleryFileSelect} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  /* State C: Active Camera Viewfinder */
                  <div style={{ width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <video 
                      ref={videoRef} 
                      playsInline 
                      muted 
                      autoPlay 
                      style={{ width: '100%', maxHeight: '360px', minHeight: '260px', objectFit: 'cover', display: 'block', background: '#000' }}
                    />

                    {/* Top Live Camera Badge */}
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(220, 38, 38, 0.9)', backdropFilter: 'blur(6px)', color: '#ffffff', padding: '3px 8px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '0.04em' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff', display: 'inline-block' }} />
                      LIVE CAMERA
                    </div>

                    {/* Camera Control Dock (Mobile Optimized Shutter) */}
                    <div 
                      style={{ 
                        position: 'absolute', 
                        bottom: '0.75rem', 
                        left: 0, 
                        right: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-around', 
                        padding: '0 1.25rem' 
                      }}
                    >
                      {/* Flip Camera */}
                      <button
                        type="button"
                        onClick={toggleCamera}
                        style={{ 
                          width: '42px', 
                          height: '42px', 
                          borderRadius: '50%', 
                          background: 'rgba(15, 23, 42, 0.75)', 
                          backdropFilter: 'blur(8px)', 
                          border: '1px solid rgba(255,255,255,0.25)', 
                          color: '#ffffff', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '1.2rem',
                          cursor: 'pointer' 
                        }}
                        title="Switch camera"
                      >
                        <MdFlipCameraIos />
                      </button>

                      {/* Main Big Shutter Trigger */}
                      <button
                        type="button"
                        onClick={capturePhoto}
                        style={{ 
                          width: '64px', 
                          height: '64px', 
                          borderRadius: '50%', 
                          background: '#ffffff', 
                          border: '4px solid rgba(255, 255, 255, 0.4)', 
                          boxShadow: '0 0 0 3px #09090b, 0 8px 24px rgba(0,0,0,0.4)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: '#09090b', 
                          fontSize: '1.6rem',
                          cursor: 'pointer',
                          transition: 'transform 0.1s ease'
                        }}
                        title="Capture Photo"
                      >
                        <MdCameraAlt />
                      </button>

                      {/* Gallery Upload Icon */}
                      <label
                        style={{ 
                          width: '42px', 
                          height: '42px', 
                          borderRadius: '50%', 
                          background: 'rgba(15, 23, 42, 0.75)', 
                          backdropFilter: 'blur(8px)', 
                          border: '1px solid rgba(255,255,255,0.25)', 
                          color: '#ffffff', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          margin: 0
                        }}
                        title="Upload from gallery"
                      >
                        <MdPhotoLibrary />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleGalleryFileSelect} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Dedicated Post-Capture Action Bar (Rendered cleanly beneath preview) */}
              {previewUrl && (
                <div className="create-report-post-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.65rem', marginTop: '0.75rem' }}>
                  <button 
                    type="button"
                    onClick={retakePhoto}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', padding: '0.65rem' }}
                  >
                    <MdCameraAlt /> Retake Live Photo
                  </button>
                  <label
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', padding: '0.65rem', cursor: 'pointer', margin: 0 }}
                  >
                    <MdPhotoLibrary /> Choose Different File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleGalleryFileSelect} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Notice */}
            <div style={{ background: 'rgba(2, 132, 199, 0.05)', border: '1px solid rgba(2, 132, 199, 0.2)', borderRadius: '10px', padding: '0.875rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <MdInfo style={{ color: 'var(--accent-ocean)', fontSize: '1.25rem', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Live Verification:</strong> Image is captured directly from your device sensor. The AI vision model evaluates flood depth and severity upon submission.
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting || locating || !imageFile}
              style={{ padding: '0.9rem', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}
            >
              <MdShield size={20} />
              {submitting ? 'AI Analyzing & Submitting Report...' : 'Analyze & Submit SOS Report'}
            </button>

          </form>

        </div>
      )}

      {/* High-Tech AI Scanning Radar Modal */}
      <AiScanningModal
        isOpen={submitting && (typeof navigator === 'undefined' || navigator.onLine)}
        previewUrl={previewUrl}
        coords={coords}
        addressLabel={addressLabel}
      />

    </div>
  );
};

export default CreateReport;

