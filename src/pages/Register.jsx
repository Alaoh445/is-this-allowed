import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'client'
  });
  const [providerProfile, setProviderProfile] = useState({
    specialization: '',
    experience: '',
    bio: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProviderChange = (e) => {
    const { name, value } = e.target;
    setProviderProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const profile = formData.type === 'provider' ? providerProfile : {};
      const result = await register(
        formData.email,
        formData.password,
        formData.name,
        formData.type,
        profile
      );

      if (result.success) {
        navigate(formData.type === 'client' ? '/client/dashboard' : '/provider/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Your Account</h1>
        <p className="auth-subtitle">Join our professional services marketplace</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="type">Account Type:</label>
            <div className="type-selector">
              <label className={`type-option ${formData.type === 'client' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="client"
                  checked={formData.type === 'client'}
                  onChange={handleChange}
                  name="type"
                />
                <span>Client</span>
                <p>Request professional services</p>
              </label>
              <label className={`type-option ${formData.type === 'provider' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="provider"
                  checked={formData.type === 'provider'}
                  onChange={handleChange}
                  name="type"
                />
                <span>Service Provider</span>
                <p>Offer your services</p>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {formData.type === 'provider' && (
            <>
              <hr style={{ margin: '20px 0', opacity: 0.3 }} />
              <h3 style={{ marginBottom: '15px' }}>Professional Profile</h3>

              <div className="form-group">
                <label htmlFor="specialization">Specialization</label>
                <input
                  id="specialization"
                  type="text"
                  name="specialization"
                  placeholder="e.g., Criminal Law, General Practice"
                  value={providerProfile.specialization}
                  onChange={handleProviderChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience">Years of Experience</label>
                <input
                  id="experience"
                  type="number"
                  name="experience"
                  placeholder="e.g., 5"
                  value={providerProfile.experience}
                  onChange={handleProviderChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Professional Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell clients about your experience and expertise"
                  value={providerProfile.bio}
                  onChange={handleProviderChange}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="+234 (0) XXX XXX XXXX"
                  value={providerProfile.phone}
                  onChange={handleProviderChange}
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
          <p><Link to="/">Back to Home</Link></p>
        </div>
      </div>
    </div>
  );
}
