import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { verifyOtp } from '../../api/authApi';

const VerifyOtpPage = () => {
  const [searchParams] = useSearchParams();
  const initialUsername = searchParams.get('username') || '';

  const [username] = useState(initialUsername);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 min OTP validity

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Handle single OTP digit input
  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // numbers only
    const digits = [...otpDigits];
    digits[index] = value.slice(-1); // only last char
    setOtpDigits(digits);
    // Auto-advance to next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste across all digits
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!username) {
      toast.error('Username is missing. Please register again.');
      navigate('/register');
      return;
    }

    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP code');
      return;
    }

    setVerifying(true);
    try {
      // Backend: POST /api/auth/verify-otp?username=&otp= → returns "Registration Successful"
      const response = await verifyOtp(username, otp);
      const successMsg = typeof response === 'string' ? response : 'Account verified successfully!';
      toast.success(successMsg);
      navigate('/login');
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message ||
        'OTP verification failed. Please check the code and try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setVerifying(false);
    }
  };

  const otp = otpDigits.join('');
  const isComplete = otp.length === 6;

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

        {/* Email icon */}
        <div className="auth-icon-circle">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h1 className="auth-title">Verify Your Email</h1>
        <p className="auth-subtitle">
          {username ? (
            <>
              We sent a 6-digit code to{' '}
              <strong style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{username}</strong>
            </>
          ) : (
            'Enter the 6-digit code sent to your email'
          )}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleVerifyOtp} noValidate>
          {/* OTP digit boxes */}
          <div className="otp-input-group" onPaste={handlePaste}>
            {otpDigits.map((digit, i) => (
              <input
                key={i}
                id={`otp-digit-${i}`}
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

          {/* Countdown */}
          <div className="otp-countdown">
            {countdown > 0 ? (
              <>
                <span className="otp-countdown-icon">⏱</span>
                Code expires in{' '}
                <span className={countdown < 60 ? 'otp-countdown-urgent' : 'otp-countdown-time'}>
                  {formatTime(countdown)}
                </span>
              </>
            ) : (
              <span className="otp-countdown-expired">
                OTP expired — please{' '}
                <Link to="/register" style={{ color: 'var(--accent-ocean)', fontWeight: 700 }}>
                  register again
                </Link>
              </span>
            )}
          </div>

          <button
            type="submit"
            id="verify-otp-submit-btn"
            className="btn btn-primary btn-block"
            disabled={verifying || !isComplete || countdown <= 0}
          >
            {verifying ? (
              <>
                <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                Verifying...
              </>
            ) : (
              'Verify & Activate Account'
            )}
          </button>
        </form>

        <div className="otp-resend-hint">
          Didn&apos;t receive the code? Check your spam folder or{' '}
          <Link to="/register">re-register</Link>.
        </div>

        <div className="auth-footer">
          Back to <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
