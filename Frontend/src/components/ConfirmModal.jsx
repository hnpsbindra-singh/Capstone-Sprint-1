import { useEffect, useRef } from 'react';
import { MdWarning } from 'react-icons/md';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false }) => {
  const confirmBtnRef = useRef(null);

  // Focus trap
  useEffect(() => {
    if (isOpen && confirmBtnRef.current) {
      confirmBtnRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={onCancel}>
      <div className="confirm-modal-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-modal-icon" style={{ color: danger ? '#e11d48' : 'var(--accent-ocean)' }}>
          <MdWarning size={32} />
        </div>
        <h2 id="confirm-title" className="confirm-modal-title">{title}</h2>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button
            ref={confirmBtnRef}
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
