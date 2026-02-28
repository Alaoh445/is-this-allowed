import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ServiceDetail.css';

const PROFESSIONAL_CATEGORIES = [
  { id: 'legal', name: 'Legal Services', icon: '⚖️' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'business', name: 'Business Services', icon: '💼' },
  { id: 'tech', name: 'Technology', icon: '💻' },
  { id: 'real-estate', name: 'Real Estate', icon: '🏠' },
  { id: 'finance', name: 'Finance', icon: '💰' },
  { id: 'construction', name: 'Construction', icon: '🏗️' },
  { id: 'automotive', name: 'Automotive', icon: '🚗' },
  { id: 'beauty', name: 'Beauty & Wellness', icon: '💅' },
  { id: 'cleaning', name: 'Cleaning Services', icon: '🧹' },
  { id: 'plumbing', name: 'Home Services', icon: '🔧' }
];

export default function ServiceDetail() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user, token, isClient } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    message: '',
    preferredDate: '',
    preferredTime: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/services/${serviceId}`);
      const data = await res.json();

      if (data.success) {
        setService(data.service);
      } else {
        setError(data.error || 'Failed to load service');
      }
    } catch (err) {
      setError('Error loading service: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (catId) => {
    const cat = PROFESSIONAL_CATEGORIES.find(c => c.id === catId);
    return cat ? cat.name : catId;
  };

  const getCategoryIcon = (catId) => {
    const cat = PROFESSIONAL_CATEGORIES.find(c => c.id === catId);
    return cat ? cat.icon : '📌';
  };

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setRequestData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/service-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId,
          ...requestData
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Service request sent successfully! The provider will respond shortly.');
        setRequestData({ message: '', preferredDate: '', preferredTime: '' });
        setShowRequestForm(false);
        setTimeout(() => navigate('/client/dashboard'), 2000);
      } else {
        setError(data.error || 'Failed to submit request');
      }
    } catch (err) {
      setError('Error submitting request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading service details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!service) return <div className="error-message">Service not found</div>;

  const { provider } = service;

  return (
    <div className="service-detail-container">
      <button className="back-button" onClick={() => navigate('/services')}>
        ← Back to Services
      </button>

      <div className="detail-grid">
        {/* Left: Service Image & Info */}
        <div className="detail-left">
          <div className="service-image-large">
            {service.image ? (
              <img src={service.image} alt={service.name} />
            ) : (
              <div className="placeholder-large">
                {getCategoryIcon(service.category)}
              </div>
            )}
          </div>

          <div className="service-details-box">
            <h1>{service.name}</h1>

            <div className="service-meta">
              <span className="category-badge">
                {getCategoryIcon(service.category)} {getCategoryName(service.category)}
              </span>
              <span className="availability-badge">{service.availability}</span>
            </div>

            {service.rating > 0 && (
              <div className="rating-box">
                <span className="stars">⭐ {service.rating.toFixed(1)}</span>
              </div>
            )}

            <h3 style={{ marginTop: '20px' }}>Description</h3>
            <p className="description">{service.description}</p>

            <div className="pricing-info">
              <h3>Price</h3>
              <p className="price-amount">₦{service.price.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Right: Provider Info & Request */}
        <div className="detail-right">
          {/* Provider Card */}
          {provider && (
            <div className="provider-card">
              <h2>Service Provider</h2>
              <div className="provider-info">
                <div className="provider-avatar">
                  {provider.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{provider.name}</h3>
                  <p className="provider-email">{provider.email}</p>
                  {provider.profile?.specialization && (
                    <p className="provider-spec">
                      {provider.profile.specialization}
                    </p>
                  )}
                  {provider.profile?.experience && (
                    <p className="provider-exp">
                      {provider.profile.experience} years of experience
                    </p>
                  )}
                </div>
              </div>

              {provider.profile?.bio && (
                <div className="provider-bio">
                  <h4>About</h4>
                  <p>{provider.profile.bio}</p>
                </div>
              )}

              {provider.profile?.phone && (
                <div className="provider-contact">
                  <p><strong>Phone:</strong> {provider.profile.phone}</p>
                </div>
              )}
            </div>
          )}

          {/* Request Service Button */}
          {isClient && (
            <div className="request-section">
              {!showRequestForm ? (
                <button
                  className="btn-request"
                  onClick={() => setShowRequestForm(true)}
                >
                  Request This Service
                </button>
              ) : (
                <form onSubmit={handleSubmitRequest} className="request-form">
                  <h3>Request Service</h3>

                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}

                  <div className="form-group">
                    <label htmlFor="message">Message to Provider</label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Tell the provider about your needs"
                      value={requestData.message}
                      onChange={handleRequestChange}
                      rows="4"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="date">Preferred Date</label>
                      <input
                        id="date"
                        type="date"
                        name="preferredDate"
                        value={requestData.preferredDate}
                        onChange={handleRequestChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="time">Preferred Time</label>
                      <input
                        id="time"
                        type="time"
                        name="preferredTime"
                        value={requestData.preferredTime}
                        onChange={handleRequestChange}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn-submit"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowRequestForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {!isClient && (
            <div className="login-prompt">
              <p>Sign in as a client to request this service</p>
              <button className="btn-login" onClick={() => navigate('/login')}>
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
