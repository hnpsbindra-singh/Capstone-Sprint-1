import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getRequests, donate } from '../../api/donorApi';
import toast from 'react-hot-toast';
import {
  MdVolunteerActivism, MdInventory, MdClose, MdSearch, MdRefresh,
  MdAccessTime, MdLocalShipping, MdCheckCircle, MdFireTruck, MdOpenInNew,
  MdLocationOn, MdEmail, MdPhone, MdCelebration, MdDoneAll, MdInfo
} from 'react-icons/md';
import { useLanguage } from '../../context/LanguageContext';

const PAGE_SIZE = 9;

const BrowseRequests = () => {
  const navigate = useNavigate();
  const { getUserId } = useContext(AuthContext);
  const { t } = useLanguage();

  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage]             = useState(1);
  const [lastFetched, setLastFetched] = useState(null);

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [itemName, setItemName]     = useState('');
  const [quantity, setQuantity]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedDonation, setConfirmedDonation] = useState(null); // Receipt Modal state
  const confirmBtnRef               = useRef(null);

  const fetchNgoRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRequests();
      setRequests(Array.isArray(data) ? data : data?.data || []);
      setLastFetched(new Date());
      setPage(1);
    } catch (error) {
      console.error('Error fetching NGO requests:', error);
      toast.error('Failed to load NGO requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNgoRequests(); }, [fetchNgoRequests]);

  // Focus trap + ESC on modal
  useEffect(() => {
    if (!selectedRequest && !confirmedDonation) return;
    confirmBtnRef.current?.focus();
    const handler = (e) => { if (e.key === 'Escape') handleCloseModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedRequest, confirmedDonation]);

  const handleOpenModal = (req) => {
    setSelectedRequest(req);
    setItemName(req.resourceNeeded || req.title || '');
    const remaining = Math.max(1, (req.quantityNeeded || 0) - (req.quantityReceived || 0));
    setQuantity(String(remaining));
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setConfirmedDonation(null);
    setItemName('');
    setQuantity('');
    setSubmitting(false);
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!itemName.trim()) { toast.error('Item name is required'); return; }
    const parsedQty = Number(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) { toast.error('Please enter a valid positive quantity'); return; }

    const remaining = (selectedRequest.quantityNeeded || 0) - (selectedRequest.quantityReceived || 0);
    if (selectedRequest.quantityNeeded && parsedQty > remaining) {
      toast.error(`Donation quantity cannot exceed remaining required amount (${remaining} units)`);
      return;
    }

    try {
      setSubmitting(true);
      const ngoRequestId = selectedRequest.id || selectedRequest._id || selectedRequest.ngoRequestId;
      const res = await donate(ngoRequestId, { itemName: itemName.trim(), quantity: parsedQty });
      
      // Store confirmed donation details for the on-screen receipt modal
      setConfirmedDonation({
        itemName: itemName.trim(),
        quantity: parsedQty,
        ngoTitle: selectedRequest.title || 'NGO Relief Operation',
        deliveryAddress: selectedRequest.deliveryAddress || res?.ngoDeliveryAddress || 'Designated Regional Relief Hub',
        contactEmail: selectedRequest.contactEmail || res?.ngoContactEmail || selectedRequest.ngoId || 'support@resqflow.org',
        contactPhone: selectedRequest.contactPhone || res?.ngoContactPhone || ''
      });

      toast.success('🎉 Donation submitted! Delivery details sent to your email.');
      handleCloseModal();
      fetchNgoRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit donation');
    } finally {
      setSubmitting(false);
    }
  };

  const formatRelative = (date) => {
    if (!date) return '';
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    const h = Math.floor(diff / 60);
    return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
  };

  // Urgency helper based on % remaining
  const getUrgency = (pct) => {
    if (pct >= 80) return { label: 'CRITICAL', color: '#e11d48', bg: 'rgba(225,29,72,0.1)', border: 'rgba(225,29,72,0.25)' };
    if (pct >= 50) return { label: 'HIGH',     color: '#ea580c', bg: 'rgba(234,88,12,0.1)', border: 'rgba(234,88,12,0.25)' };
    if (pct >= 20) return { label: 'MODERATE', color: '#d97706', bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.25)' };
    return           { label: 'LOW',      color: '#059669', bg: 'rgba(5,150,105,0.1)', border: 'rgba(5,150,105,0.25)' };
  };

  // Progress bar color
  const getProgressColor = (pct) => {
    if (pct >= 80) return 'linear-gradient(90deg, #e11d48, #be123c)';
    if (pct >= 50) return 'linear-gradient(90deg, #f97316, #ea580c)';
    if (pct >= 20) return 'linear-gradient(90deg, #f59e0b, #d97706)';
    return 'linear-gradient(90deg, #34d399, #059669)';
  };

  // Filter & paginate
  const filtered = requests.filter(req => {
    const q = searchTerm.toLowerCase();
    const match = (req.title || '').toLowerCase().includes(q)
      || (req.description || '').toLowerCase().includes(q)
      || (req.resourceNeeded || '').toLowerCase().includes(q);
    const needed   = req.quantityNeeded   || 0;
    const received = req.quantityReceived || 0;
    const fulfilled = needed > 0 && received >= needed;
    if (filterStatus === 'OPEN')      return match && !fulfilled;
    if (filterStatus === 'FULFILLED') return match && fulfilled;
    return match;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page-container animate-fade-in-up">
      {/* ── Header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">{t('browseRequests') || 'Browse NGO Requests'}</h1>
          <p className="page-subtitle">Discover active relief material requirements from NGOs on the ground and donate directly.</p>
          {lastFetched && (
            <div className="last-updated-badge" style={{ marginTop: '0.375rem' }}>
              <MdAccessTime size={12} /> Updated {formatRelative(lastFetched)}
            </div>
          )}
        </div>
        <div className="tooltip-wrap" data-tip="Refresh NGO requests">
          <button className="btn btn-secondary" onClick={fetchNgoRequests} disabled={loading}>
            <MdRefresh /> Refresh
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      {!loading && requests.length > 0 && (
        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[
            { label: 'Total Requests', value: requests.length, icon: <MdInventory />, color: '#0284c7' },
            { label: 'Open',           value: requests.filter(r => (r.quantityReceived || 0) < (r.quantityNeeded || 1)).length, icon: <MdFireTruck />, color: '#ea580c' },
            { label: 'Fulfilled',      value: requests.filter(r => (r.quantityReceived || 0) >= (r.quantityNeeded || 1)).length, icon: <MdCheckCircle />, color: '#059669' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.5rem 1rem' }}>
              <span style={{ color: s.color, fontSize: '1.1rem' }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter Toolbar ── */}
      {!loading && requests.length > 0 && (
        <div className="filter-toolbar">
          <div className="search-box-wrapper">
            <MdSearch className="search-icon-inside" />
            <input
              type="text"
              className="search-box-input"
              placeholder="Search by item, title, or description…"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <div className="filter-pills-container">
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
            {['ALL', 'OPEN', 'FULFILLED'].map(s => (
              <button key={s} className={`filter-pill-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => { setFilterStatus(s); setPage(1); }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="grid-3">
          {[1,2,3,4,5,6].map(n => <div key={n} className="glass-card skeleton-card skeleton" />)}
        </div>
      ) : paged.length === 0 ? (
        <div className="glass-card empty-state">
          <MdLocalShipping className="empty-state-icon" />
          <div className="empty-state-text">{requests.length === 0 ? 'No Active NGO Requests' : 'No matching requests'}</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '380px', margin: '0 auto' }}>
            {requests.length === 0 ? 'There are currently no active relief material requests. Check back soon!' : 'Try adjusting your search or filter.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid-3">
            {paged.map((req, index) => {
              const needed    = req.quantityNeeded   || 0;
              const received  = req.quantityReceived || 0;
              const remaining = Math.max(0, needed - received);
              const pct       = needed > 0 ? Math.min(100, Math.round((received / needed) * 100)) : 0;
              const fulfilled = remaining === 0;
              const urgency   = getUrgency(100 - pct); // urgency based on how much is still needed

              return (
                <div
                  key={req.id || req._id || req.ngoRequestId || index}
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${fulfilled ? 'rgba(5,150,105,0.3)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.375rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(2,132,199,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,23,42,0.06)'; }}
                >
                  {/* Top colored accent strip */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: fulfilled ? 'linear-gradient(90deg,#34d399,#059669)' : getProgressColor(pct) }} />

                  {/* Title row + urgency badge */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.0rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.35, flex: 1 }}>
                      {req.title || 'NGO Relief Request'}
                    </h3>
                    {fulfilled ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(5,150,105,0.1)', color: '#059669', border: '1px solid rgba(5,150,105,0.3)', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                        <MdCheckCircle size={11} /> FULFILLED
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: urgency.bg, color: urgency.color, border: `1px solid ${urgency.border}`, padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                        {urgency.label}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '0.8375rem', color: 'var(--text-secondary)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {req.description || 'No description provided.'}
                  </p>

                  {/* Resource needed & Delivery details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(2,132,199,0.08)', border: '1px solid rgba(2,132,199,0.2)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--accent-ocean)', fontWeight: 700, alignSelf: 'flex-start' }}>
                      <MdInventory size={14} />
                      {req.resourceNeeded || 'Relief Supplies'}
                    </div>

                    {req.deliveryAddress && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', fontSize: '0.78rem', color: '#475569', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <MdLocationOn style={{ color: '#0284c7', fontSize: '1rem', flexShrink: 0, marginTop: '1px' }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          <strong>Drop-off:</strong> {req.deliveryAddress}
                        </span>
                      </div>
                    )}

                    {(req.contactEmail || req.ngoId) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <MdEmail style={{ color: 'var(--accent-ocean)' }} />
                        <span>{req.contactEmail || req.ngoId}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress section */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.79rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      <span>Fulfilled: <strong style={{ color: 'var(--text-primary)' }}>{pct}%</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>{received} / {needed} units</span>
                    </div>
                    <div style={{ height: '7px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: getProgressColor(pct), borderRadius: '99px', transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600, color: fulfilled ? '#059669' : remaining > 0 ? '#ea580c' : 'var(--text-muted)' }}>
                      {fulfilled ? '✅ Goal fully reached!' : `${remaining} units still needed`}
                    </div>
                  </div>

                  {/* Donate button */}
                  <button
                    className={fulfilled ? 'btn btn-secondary btn-block' : 'btn btn-primary btn-block'}
                    onClick={() => !fulfilled && handleOpenModal(req)}
                    disabled={fulfilled}
                    style={{ marginTop: 'auto' }}
                  >
                    {fulfilled
                      ? <><MdCheckCircle /> Goal Reached</>
                      : <><MdVolunteerActivism /> Donate Now</>
                    }
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-bar">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          )}
        </>
      )}

      {/* ── Donation Input Modal ── */}
      {selectedRequest && (
        <div
          role="dialog" aria-modal="true" aria-labelledby="donate-modal-title"
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={handleCloseModal}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 24px 64px rgba(15,23,42,0.25)', position: 'relative', animation: 'fadeInScale 0.2s ease' }}
          >
            {/* Close btn */}
            <button onClick={handleCloseModal} aria-label="Close" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              <MdClose />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(2,132,199,0.1)', color: 'var(--accent-ocean)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                <MdVolunteerActivism />
              </div>
              <div>
                <h2 id="donate-modal-title" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  Donate to NGO Initiative
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {selectedRequest.title || 'Relief Request'}
                </p>
              </div>
            </div>

            {/* Drop-off Address Callout in Modal */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                <MdLocationOn style={{ color: '#15803d' }} /> Drop-off / Delivery Address:
              </div>
              <div style={{ fontSize: '0.85rem', color: '#14532d', fontWeight: 600, lineHeight: 1.4 }}>
                {selectedRequest.deliveryAddress || 'Designated Regional Relief Hub'}
              </div>
              {(selectedRequest.contactEmail || selectedRequest.ngoId) && (
                <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '6px' }}>
                  <strong>NGO Email:</strong> {selectedRequest.contactEmail || selectedRequest.ngoId}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitDonation}>
              <div className="form-group">
                <label className="form-label" htmlFor="donate-item">Item Name</label>
                <input
                  id="donate-item"
                  type="text"
                  className="form-input"
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder="e.g. Bottled Water, Rice, Blankets"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="donate-qty">
                  Quantity{' '}
                  {selectedRequest.quantityNeeded && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      (max remaining: {Math.max(0, (selectedRequest.quantityNeeded || 0) - (selectedRequest.quantityReceived || 0))})
                    </span>
                  )}
                </label>
                <input
                  id="donate-qty"
                  type="number"
                  min="1"
                  max={selectedRequest.quantityNeeded ? Math.max(1, selectedRequest.quantityNeeded - (selectedRequest.quantityReceived || 0)) : undefined}
                  className="form-input"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleCloseModal} disabled={submitting}>
                  Cancel
                </button>
                <button ref={confirmBtnRef} type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
                  {submitting
                    ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Submitting…</>
                    : <><MdVolunteerActivism /> Confirm Donation</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Donation Confirmation & Delivery Details Receipt Modal ── */}
      {confirmedDonation && (
        <div
          role="dialog" aria-modal="true"
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setConfirmedDonation(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: '520px', boxShadow: '0 24px 64px rgba(15,23,42,0.3)', position: 'relative', animation: 'fadeInScale 0.2s ease' }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 0.75rem auto' }}>
                <MdCelebration />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Donation Registered! 🎉
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                Thank you for contributing <strong>{confirmedDonation.quantity} units of {confirmedDonation.itemName}</strong>.
              </p>
            </div>

            {/* Delivery Instructions Box */}
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                <MdLocationOn style={{ fontSize: '1.2rem', color: '#15803d' }} /> Where to Send / Drop-off Supplies:
              </div>
              <div style={{ fontSize: '0.95rem', color: '#14532d', fontWeight: 700, lineHeight: 1.45, background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '0.75rem' }}>
                {confirmedDonation.deliveryAddress}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#166534' }}>
                <div><strong>Target Initiative:</strong> {confirmedDonation.ngoTitle}</div>
                <div><strong>NGO Email:</strong> <a href={`mailto:${confirmedDonation.contactEmail}`} style={{ color: '#0284c7', fontWeight: 600 }}>{confirmedDonation.contactEmail}</a></div>
                {confirmedDonation.contactPhone && (
                  <div><strong>NGO Phone:</strong> {confirmedDonation.contactPhone}</div>
                )}
              </div>
            </div>

            {/* Email notification notice */}
            <div style={{ background: 'rgba(2,132,199,0.06)', border: '1px solid rgba(2,132,199,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <MdEmail style={{ color: 'var(--accent-ocean)', fontSize: '1.25rem', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                A confirmation email containing these delivery instructions has also been sent to your inbox.
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setConfirmedDonation(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => {
                  setConfirmedDonation(null);
                  navigate('/donor/my-donations');
                }}
              >
                <MdDoneAll /> View My Donations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseRequests;
