import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createRequest } from '../../api/ngoApi';
import toast from 'react-hot-toast';
import { MdAddCircle, MdMyLocation, MdArrowBack } from 'react-icons/md';

const CreateRequest = () => {
  const navigate = useNavigate();
  const { getUserId } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resourceNeeded: '',
    quantityNeeded: '',
    deliveryAddress: '',
    contactEmail: '',
    contactPhone: '',
    latitude: '19.0760',
    longitude: '72.8777'
  });

  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

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

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      toast.error('Please enter a valid latitude between -90 and 90');
      return;
    }

    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      toast.error('Please enter a valid longitude between -180 and 180');
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
            <div style={{ marginTop: '1rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                  Target Location Coordinates <span style={{ color: 'var(--color-critical)' }}>*</span>
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleUseMyLocation}
                  disabled={gettingLocation}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                >
                  <MdMyLocation style={{ color: 'var(--accent-ocean)' }} />
                  {gettingLocation ? 'Getting Location...' : 'Use My GPS Location'}
                </button>
              </div>

              <div className="grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="latitude">
                    Latitude <span style={{ color: 'var(--color-critical)' }}>*</span>
                  </label>
                  <input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="e.g. 19.0760"
                    value={formData.latitude}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="longitude">
                    Longitude <span style={{ color: 'var(--color-critical)' }}>*</span>
                  </label>
                  <input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="e.g. 72.8777"
                    value={formData.longitude}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
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
