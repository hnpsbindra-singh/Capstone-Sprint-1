import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../../api/authApi';

const ROLES = [
  {
    value: 'VICTIM',
    label: 'Victim',
    desc: 'Need relief or rescue assistance',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    value: 'DONOR',
    label: 'Donor',
    desc: 'Offer supplies or financial support',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    value: 'NGO',
    label: 'NGO',
    desc: 'Manage relief operations & rescue',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    value: 'ADMIN',
    label: 'Admin',
    desc: 'System administration',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    ),
  },
];

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role')?.toUpperCase() || 'VICTIM';

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(
    ['VICTIM', 'DONOR', 'NGO', 'ADMIN'].includes(initialRole) ? initialRole : 'VICTIM'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedName || !trimmedUsername || !password || !confirmPassword || !role) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!emailRegex.test(trimmedUsername)) {
      const msg = 'Please enter a valid email address';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 8 || password.length > 15) {
      const msg = 'Password must be between 8 and 15 characters';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      // Backend: POST /api/auth/register → sends OTP to email, returns "Otp Sent Successfully"
      await register(trimmedName, trimmedUsername, password, role);

      toast.success('OTP sent to your email! Please verify your account.');
      navigate(`/verify-otp?username=${encodeURIComponent(trimmedUsername)}`);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message ||
        'Registration failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <Link to="/" className="auth-back-link">
        ← Back to Home
      </Link>

      <div className="auth-card auth-card-wide animate-fade-in-up">
        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-brand-name">ResQFlow</span>
          <p className="auth-brand-tagline">Flood Relief Coordination Network</p>
        </div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the network — help or be helped</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Role Selector */}
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div className="role-grid">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  id={`role-${r.value.toLowerCase()}`}
                  className={`role-card ${role === r.value ? 'role-card-active' : ''}`}
                  onClick={() => setRole(r.value)}
                >
                  <span className="role-card-icon">{r.icon}</span>
                  <span className="role-card-label">{r.label}</span>
                  <span className="role-card-desc">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">
              Full Name / Organization Name
            </label>
            <input
              id="reg-name"
              type="text"
              className="form-input"
              placeholder="e.g. John Doe or Relief Foundation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          {/* Email (used as username in backend) */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">
              Email Address
              <span className="form-label-hint"> — used as your username</span>
            </label>
            <input
              id="reg-username"
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Passwords side by side */}
          <div className="form-row-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="8 to 15 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={15}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
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

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Re-enter password"
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
          </div>

          <div style={{ marginBottom: '1.5rem' }} />

          <button
            type="submit"
            id="register-submit-btn"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                Creating Account...
              </>
            ) : (
              'Create Account & Send OTP'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
