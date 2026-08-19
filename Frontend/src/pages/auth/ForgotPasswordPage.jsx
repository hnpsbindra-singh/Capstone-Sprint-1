import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sendResetOtp, resetPassword } from '../../api/authApi';

const STEPS = [
  { id: 1, label: 'Enter Email' },
  { id: 2, label: 'Verify OTP' },
  { id: 3, label: 'New Password' },
];

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ── Step 1: Send OTP ─────────────────────────────────────────────────
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedUsername) {
      toast.error('Please enter your email address');
      return;
    }

    if (!emailRegex.test(trimmedUsername)) {
      const msg = 'Please enter a valid email address';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      // Backend: POST /api/auth/send-otp?username= → returns "Otp Sent Successfully"
      await sendResetOtp(trimmedUsername);
      toast.success('Reset OTP sent to your email!');
      setStep(2);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message ||
        'Failed to send reset OTP. Please verify your email address.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP digit handlers ────────────────────────────────────────────────
  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const digits = [...otpDigits];
    digits[index] = value.slice(-1);
    setOtpDigits(digits);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleOtpNext = (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP code');
      return;
    }
    setError('');
    setStep(3);
  };

  // ── Step 3: Reset password ────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 15) {
      const msg = 'Password must be between 8 and 15 characters';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      toast.error(msg);
      return;
    }

    const otp = otpDigits.join('');
    setLoading(true);
    try {
      // Backend: PUT /api/auth/verify-reset-otp → body: { username, OTP, newpassword }
      const response = await resetPassword(username.trim().toLowerCase(), otp, newPassword);
      const successMsg = typeof response === 'string' ? response : 'Password reset successfully!';
      toast.success(successMsg);
      navigate('/login');
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message ||
        'Failed to reset password. Please check your OTP and try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      // If OTP is invalid, go back to step 2
      if (errorMsg.toLowerCase().includes('otp') || errorMsg.toLowerCase().includes('expired')) {
        setStep(2);
      }
    } finally {
      setLoading(false);
    }
  };

  const otp = otpDigits.join('');

  return (
    <div className="auth-layout">
      <Link to="/" className="auth-back-link">
        ← Back to Home
      </Link>

      <div className="auth-card animate-fade-in-up">
        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-brand-name">ResQFlow</span>
          <p className="auth-brand-tagline">Flood Relief Coordination Network</p>
        </div>

        {/* Step indicator */}
        <div className="step-indicator">
          {STEPS.map((s, i) => (
            <div key={s.id} className="step-indicator-item">
              <div className={`step-dot ${step > s.id ? 'step-dot-done' : step === s.id ? 'step-dot-active' : ''}`}>
                {step > s.id ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  s.id
                )}
              </div>
              <span className={`step-label ${step === s.id ? 'step-label-active' : ''}`}>{s.label}</span>
              {i < STEPS.length - 1 && (
                <div className={`step-connector ${step > s.id ? 'step-connector-done' : ''}`} />
              )}
            </div>
          ))}
        </div>

        <h1 className="auth-title">
          {step === 1 && 'Reset Password'}
          {step === 2 && 'Enter OTP Code'}
          {step === 3 && 'Set New Password'}
        </h1>
        <p className="auth-subtitle">
          {step === 1 && "Enter your email and we'll send you a reset code"}
          {step === 2 && (
            <>
              OTP sent to{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{username}</strong>
            </>
          )}
          {step === 3 && 'Choose a strong new password for your account'}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        {/* ── Step 1 ── */}
        {step === 1 && (
          <form onSubmit={handleSendResetOtp} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">
                Email Address / Username
              </label>
              <input
                id="reset-email"
                type="text"
                className="form-input"
                placeholder="Enter your registered email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              id="send-reset-otp-btn"
              className="btn btn-primary btn-block"
              disabled={loading || !username.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                  Sending OTP...
                </>
              ) : (
                'Send Reset OTP'
              )}
            </button>
          </form>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <form onSubmit={handleOtpNext} noValidate>
            <div className="form-group">
              <label className="form-label">6-Digit OTP Code</label>
              <div className="otp-input-group" onPaste={handlePaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    id={`reset-otp-digit-${i}`}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`otp-box ${digit ? 'otp-box-filled' : ''}`}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    autoComplete="one-time-code"
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              id="verify-reset-otp-btn"
              className="btn btn-primary btn-block"
              disabled={otp.length !== 6}
            >
              Continue
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                className="auth-text-btn"
                onClick={() => { setStep(1); setOtpDigits(['', '', '', '', '', '']); }}
              >
                ← Change email / Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="new-password">New Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  className="form-input"
                  placeholder="8 to 15 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={15}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-new-password">Confirm New Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="confirm-new-password"
                  type={showConfirm ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="form-error-hint">Passwords do not match</p>
            )}

            <button
              type="submit"
              id="reset-password-submit-btn"
              className="btn btn-primary btn-block"
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                className="auth-text-btn"
                onClick={() => setStep(2)}
              >
                ← Back to OTP
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
