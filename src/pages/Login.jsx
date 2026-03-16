import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { role } = useParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // default selection comes from role param if present
  const [userType, setUserType] = useState(role || 'client'); // client or provider
  // remove hideSelector so we always show options
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // enforce selected user type matches actual type
        if (result.user.type !== userType) {
          setError(`Account type mismatch. You selected "${userType}" but this account is a "${result.user.type}".`);
          logout();
        } else {
          if (result.user.type === 'client') {
            navigate('/client/dashboard');
          } else {
            navigate('/provider/dashboard');
          }
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Sign in to access the professional services marketplace</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="userType">I am a:</label>
            <div className="type-selector">
              <label className={`type-option ${userType === 'client' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="client"
                  checked={userType === 'client'}
                  onChange={(e) => setUserType(e.target.value)}
                />
                <span>Client</span>
                <p>Looking for services</p>
              </label>
              <label className={`type-option ${userType === 'provider' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="provider"
                  checked={userType === 'provider'}
                  onChange={(e) => setUserType(e.target.value)}
                />
                <span>Service Provider</span>
                <p>Offering services</p>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Create one</Link></p>
          <p><Link to="/">Back to Home</Link></p>
        </div>
      </div>
    </div>
  );
}
