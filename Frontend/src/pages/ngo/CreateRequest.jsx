import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createRequest, getHeatmap } from '../../api/ngoApi';
import toast from 'react-hot-toast';
import { MdAddCircle, MdMyLocation, MdArrowBack, MdWarning, MdMap, MdFlood, MdLocationOn } from 'react-icons/md';

const CreateRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getUserId } = useAuth();

  const heatmapContext = location.state?.fromHeatmap || null;

  const [activeFloodZones, setActiveFloodZones] = useState([]);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState('');

  const [formData, setFormData] = useState({
    title: heatmapContext ? `Emergency Relief: Flood Zone (${heatmapContext.latitude.toFixed(3)}, ${heatmapContext.longitude.toFixed(3)})` : '',
    description: heatmapContext ? `Emergency resource mobilization for disaster sector with risk level ${heatmapContext.riskLevel || 'HIGH'} (Severity: ${(heatmapContext.averageSeverity || heatmapContext.severityScore || 7).toFixed(1)}/10, ${heatmapContext.reportCount || 1} active distress reports).` : '',
    resourceNeeded: '',
    quantityNeeded: '',
    deliveryAddress: '',
    contactEmail: '',
    contactPhone: '',
    latitude: heatmapContext ? String(heatmapContext.latitude) : '',
    longitude: heatmapContext ? String(heatmapContext.longitude) : ''
  });

  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zones = await getHeatmap();
        if (Array.isArray(zones)) {
          const valid = zones.filter(z => Number(z.averageSeverity || z.severityScore || 0) > 2);
          setActiveFloodZones(valid);

          // If no initial coordinates set and zones available, select the first active zone
          if (!heatmapContext && valid.length > 0 && !formData.latitude) {
            const first = valid[0];
            setSelectedZoneIndex('0');
            setFormData(prev => ({
              ...prev,
              latitude: String(first.latitude),
              longitude: String(first.longitude),
              title: prev.title || `Emergency Relief: Flood Sector (${first.latitude.toFixed(3)}, ${first.longitude.toFixed(3)})`,
              description: prev.description || `Relief supply mobilization for flood emergency (Risk: ${first.riskLevel || 'HIGH'}, Severity: ${Number(first.averageSeverity || 7).toFixed(1)}/10, ${first.reportCount || 1} reports).`
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load active flood zones:', err);
      }
    };
    fetchZones();
  }, []);

  const handleSelectZone = (e) => {
    const idx = e.target.value;
    setSelectedZoneIndex(idx);
    if (idx !== '' && activeFloodZones[idx]) {
      const z = activeFloodZones[idx];
      setFormData(prev => ({
        ...prev,
        latitude: String(z.latitude),
        longitude: String(z.longitude),
        title: `Emergency Relief: Flood Sector (${z.latitude.toFixed(3)}, ${z.longitude.toFixed(3)})`,
        description: `Emergency resource mobilization for disaster sector with risk level ${z.riskLevel || 'HIGH'} (Severity: ${(z.averageSeverity || z.severityScore || 7).toFixed(1)}/10, ${z.reportCount || 1} active distress reports).`
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        setGettingLocation(false);
        toast.success('Location fetched successfully');
      },
      (error) => {
        console.error('Error getting location:', error);
        setGettingLocation(false);
        toast.error('Failed to get location. Please enter coordinates manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = getUserId();
    if (!userId) {
      toast.error('User session invalid. Please log in again.');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a request title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a description for the relief request');
      return;
    }

    if (!formData.resourceNeeded.trim()) {
      toast.error('Please specify the resource needed');
      return;
    }

    const qty = Number(formData.quantityNeeded);
    if (!formData.quantityNeeded || isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid positive quantity needed');
      return;
    }

    if (!formData.deliveryAddress.trim()) {
      toast.error('Please enter the drop-off / shipping address where supplies should be sent');
      return;
    }

    if (!formData.contactEmail.trim()) {
      toast.error('Please provide an official contact email for donors');
      return;
    }

    const latNum = parseFloat(formData.latitude);
    const lngNum = parseFloat(formData.longitude);

    if (isNaN(latNum) || isNaN(lngNum) || !formData.latitude || !formData.longitude) {
      toast.error('Please select an active flood emergency sector from the list above');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      resourceNeeded: formData.resourceNeeded.trim(),
      quantityNeeded: qty,
      deliveryAddress: formData.deliveryAddress.trim(),
      contactEmail: formData.contactEmail.trim(),
      contactPhone: formData.contactPhone.trim(),
      latitude: latNum,
      longitude: lngNum
    };

    setLoading(true);
    try {
      await createRequest(userId, payload);
      toast.success('Resource request created successfully!');
      navigate('/ngo/my-requests');
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error(error.response?.data?.message || 'Failed to create resource request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in-up">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(-1)}
          style={{ padding: '0.5rem' }}
          title="Go Back"
        >
          <MdArrowBack style={{ fontSize: '1.25rem' }} />
        </button>
        <div>
          <h1 className="page-title">Create Resource Request</h1>
          <p className="page-subtitle">Submit a new request for relief materials or medical supplies with drop-off details for donors</p>
        </div>
      </div>

      {/* Form Container */}
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div className="glass-card">
          {heatmapContext && (
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                <MdWarning />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span>Disaster Heatmap Emergency Zone Selected</span>
                  <span style={{ fontSize: '0.75rem', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>
                    {heatmapContext.riskLevel || 'CRITICAL'} ({(heatmapContext.averageSeverity || heatmapContext.severityScore || 7).toFixed(1)}/10)
                  </span>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: 0 }}>
                  Coordinates: <strong>{heatmapContext.latitude.toFixed(4)}, {heatmapContext.longitude.toFixed(4)}</strong> ({heatmapContext.reportCount || 1} reported incidents). Location and description have been auto-populated below.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Request Title <span style={{ color: 'var(--color-critical)' }}>*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className="form-input"
                placeholder="e.g. Emergency Food Supplies for Sector 4"
                value={formData.title}
                onChange={handleChange}
                maxLength={100}
                required
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.25rem' }}>
                {formData.title.length} / 100 characters
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description <span style={{ color: 'var(--color-critical)' }}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                placeholder="Provide detailed description of the situation and relief items required..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
                maxLength={500}
                required
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.25rem' }}>
                {formData.description.length} / 500 characters
              </div>
            </div>

            {/* Resource Needed & Quantity Needed */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="resourceNeeded">
                  Resource Needed <span style={{ color: 'var(--color-critical)' }}>*</span>
                </label>
                <input
                  id="resourceNeeded"
                  name="resourceNeeded"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Drinking Water Packets, Blankets"
                  value={formData.resourceNeeded}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="quantityNeeded">
                  Quantity Needed <span style={{ color: 'var(--color-critical)' }}>*</span>
                </label>
                <input
                  id="quantityNeeded"
                  name="quantityNeeded"
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="e.g. 500"
                  value={formData.quantityNeeded}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Drop-off & Contact Details (Where to Send) */}
            <div style={{ margin: '1.25rem 0', padding: '1.25rem', background: 'rgba(2, 132, 199, 0.04)', borderRadius: 'var(--radius-md)', border: '1.5px solid rgba(2, 132, 199, 0.2)' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                📦 Where to Send Relief Supplies & NGO Contact Details
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                These details will be displayed to donors on the website and sent directly to their email upon donation.
              </p>

              {/* Delivery Address */}
              <div className="form-group">
                <label className="form-label" htmlFor="deliveryAddress">
                  Drop-off / Shipping Address (Where to send) <span style={{ color: 'var(--color-critical)' }}>*</span>
                </label>
                <textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  className="form-textarea"
                  placeholder="e.g. Community Center Hall 2, Ground Floor, Sector 15 Relief Base, City - PIN 123456"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  rows={2}
                  required
                />
              </div>

              {/* Contact Email & Phone */}
              <div className="grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="contactEmail">
                    NGO Contact Email <span style={{ color: 'var(--color-critical)' }}>*</span>
                  </label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    className="form-input"
                    placeholder="e.g. contact@helpcare-ngo.org"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="contactPhone">
                    Contact Phone Number
                  </label>
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.contactPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div style={{ marginTop: '1rem', marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="form-label" style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MdMap style={{ color: 'var(--accent-ocean)' }} /> Select Target Flood Emergency Area <span style={{ color: 'var(--color-critical)' }}>*</span>
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('/ngo/heatmap')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem' }}
                >
                  <MdMap style={{ color: 'var(--accent-ocean)' }} />
                  View Heatmap
                </button>
              </div>

              {/* Interactive Flood Area Cards Grid */}
              {activeFloodZones.length > 0 ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                    {activeFloodZones.map((z, idx) => {
                      const isSelected = selectedZoneIndex === String(idx);
                      const sev = Number(z.averageSeverity || z.severityScore || 0);
                      const isCrit = sev >= 8;
                      const isHigh = sev >= 6 && sev < 8;
                      const badgeBg = isCrit ? 'rgba(239, 68, 68, 0.12)' : isHigh ? 'rgba(249, 115, 22, 0.12)' : 'rgba(245, 158, 11, 0.12)';
                      const badgeColor = isCrit ? '#ef4444' : isHigh ? '#f97316' : '#d97706';

                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectZone({ target: { value: String(idx) } })}
                          style={{
                            background: isSelected ? 'rgba(2, 132, 199, 0.08)' : '#ffffff',
                            border: `2px solid ${isSelected ? 'var(--accent-ocean)' : 'var(--border-subtle)'}`,
                            borderRadius: '10px',
                            padding: '0.875rem 1rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                            boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.15)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: badgeBg, color: badgeColor }}>
                              🚨 {z.riskLevel || 'HAZARD'}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                              Severity: <strong style={{ color: badgeColor }}>{sev.toFixed(1)}/10</strong>
                            </span>
                          </div>

                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MdLocationOn style={{ color: isSelected ? 'var(--accent-ocean)' : '#64748b' }} />
                            <span>Lat: {z.latitude.toFixed(4)}, Lon: {z.longitude.toFixed(4)}</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <span>{z.reportCount || 1} distress report{(z.reportCount || 1) > 1 ? 's' : ''}</span>
                            <span style={{ color: isSelected ? 'var(--accent-ocean)' : 'var(--text-muted)', fontWeight: 700 }}>
                              {isSelected ? '✓ Selected' : 'Click to Select'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Locked coordinates status indicator */}
                  <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700 }}>Selected Flood Coordinates:</span>
                      <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, color: '#0f172a' }}>
                        {formData.latitude || 'None'}, {formData.longitude || 'None'}
                      </code>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
                      ✓ Verified against live hazard radar
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '0.875rem 1rem', fontSize: '0.85rem', color: '#b91c1c' }}>
                  ⚠️ No active flood sectors are currently detected from the radar. You can view the live hazard radar from the Heatmap page.
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/ngo/my-requests')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', minWidth: '160px', justifyContent: 'center' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MdAddCircle style={{ fontSize: '1.25rem' }} />
                    Create Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
