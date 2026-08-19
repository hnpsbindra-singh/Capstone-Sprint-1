import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../api/authApi';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedUsername || !password) {
      toast.error('Please enter both email and password');
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

    setLoading(true);
    try {
      // Backend: POST /api/auth/login → returns JWT token string
      const token = await loginApi(trimmedUsername, password);

      let role = 'victim';
      try {
        const decoded = jwtDecode(token);
        if (decoded && decoded.role) {
          role = decoded.role.toLowerCase();
        }
      } catch (decodeErr) {
        console.error('Error decoding JWT token:', decodeErr);
      }

      login(token);
      toast.success('Login successful!');
      navigate(`/${role}`);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message ||
        'Login failed. Please check your credentials.';
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

      <div className="auth-card animate-fade-in-up">
        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-brand-name">ResQFlow</span>
          <p className="auth-brand-tagline">Flood Relief Coordination Network</p>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to access your dashboard</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              Email Address
            </label>
            <input
              id="login-username"
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <div className="auth-label-row">
              <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>
                Password
              </label>
              <Link to="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
            </div>
            <div className="auth-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password (8-15 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/register">Create one here</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
