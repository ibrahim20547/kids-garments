import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Lock, Mail, Phone, ArrowRight, Eye, EyeOff, Sparkles, Key, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();
  const { success, error, info } = useToast();

  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('ayesha.khan@example.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Password Reset states
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (isAuthenticated) {
    navigate('/account');
    return null;
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(loginEmail.trim(), loginPassword);
      success('Welcome back! Signed in successfully.');
      navigate('/account');
    } catch (err) {
      error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regPassword) {
      error('Please complete all required fields.');
      return;
    }
    if (regPassword.length < 6) {
      error('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register(regFullName.trim(), regEmail.trim(), regPassword, regPhone.trim());
      success('Account created successfully! Welcome to Kids Garments Pakistan.');
      navigate('/account');
    } catch (err) {
      error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      error('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.forgotPassword(forgotEmail.trim());
      info(res.message || 'Password reset instructions generated.');
      if (res.reset_token || res.demo_token) {
        setResetToken(res.reset_token || res.demo_token);
        setMode('reset');
      }
    } catch (err) {
      error(err.message || 'Failed to initiate password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetToken.trim() || !newPassword) {
      error('Please enter the reset token and your new password.');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.resetPassword(resetToken.trim(), newPassword);
      success(res.message || 'Password reset successfully! You can now sign in.');
      setMode('login');
      setLoginPassword(newPassword);
      if (forgotEmail) setLoginEmail(forgotEmail);
    } catch (err) {
      error(err.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '60px 20px 100px', background: 'var(--bg-page)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card" style={{ padding: '36px', boxShadow: 'var(--shadow-lg)' }}>
          {/* Header Tab Toggles */}
          {(mode === 'login' || mode === 'register') && (
            <div style={{ display: 'flex', background: 'var(--bg-alt)', padding: '6px', borderRadius: '16px', marginBottom: '28px' }}>
              <button
                onClick={() => setMode('login')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  background: mode === 'login' ? '#FFFFFF' : 'transparent',
                  color: mode === 'login' ? 'var(--primary)' : 'var(--text-body)',
                  boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('register')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  background: mode === 'register' ? '#FFFFFF' : 'transparent',
                  color: mode === 'register' ? 'var(--primary)' : 'var(--text-body)',
                  boxShadow: mode === 'register' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Mode 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)' }}>Welcome Back! 🇵🇰</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Sign in to access your orders and saved addresses</p>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="ayesha.khan@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setMode('forgot');
                    }}
                    style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                    required
                  />
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '6px' }}
              >
                {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
              </button>

              {/* Demo Hint */}
              <div style={{ padding: '12px', background: 'var(--primary-light)', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-dark)', textAlign: 'center' }}>
                💡 <strong>Customer Demo:</strong> <code>ayesha.khan@example.com</code> / <code>password123</code>
              </div>
            </form>
          )}

          {/* Mode 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)' }}>Join Kids Garments Club</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Get 10% off your first order with code KIDS10</p>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ayesha Khan"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="ayesha@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pakistani Mobile (03xx-xxxxxxx)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="0300-1234567"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                  />
                  <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Create Password (min 6 chars) *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                    required
                  />
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '8px' }}
              >
                {loading ? 'Creating Account...' : 'Create Account'} <Sparkles size={18} />
              </button>
            </form>
          )}

          {/* Mode 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>Forgot Password?</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Enter your registered email and we will send you instructions to reset your password.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Registered Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="ayesha.khan@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="btn btn-soft"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ArrowLeft size={16} /> Back to Sign In
              </button>
            </form>
          )}

          {/* Mode 4: RESET PASSWORD */}
          {mode === 'reset' && (
            <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>Set New Password</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Enter your reset verification token and choose a new password.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Reset Token</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="reset_..."
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    style={{ paddingLeft: '40px', fontFamily: 'monospace' }}
                    required
                  />
                  <Key size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">New Password (min 6 chars)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                    required
                  />
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                {loading ? 'Resetting Password...' : 'Set New Password'} <CheckCircle size={18} />
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="btn btn-soft"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ArrowLeft size={16} /> Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
