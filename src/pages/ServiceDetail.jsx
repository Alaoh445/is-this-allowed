import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../utils/api.js';
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
  const { token, isClient } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestData, setRequestData] = useState({
    message: '',
    preferredDate: '',
    preferredHour: '',
    preferredMinute: '00',
    preferredPeriod: 'AM'
  });
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const BASE_URL = getApiBaseUrl();

  const fetchService = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/services/${serviceId}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();

      if (data.success) {
        setService(data.service);
        setReviews(data.service.reviews || []);
      } else {
        setError(data.error || 'Failed to load service');
      }
    } catch (err) {
      console.error('Error loading service:', err);
      setError('Error loading service: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [serviceId, BASE_URL]); 

  // Poll for updated reviews every 10 seconds
  useEffect(() => {
    const reviewInterval = setInterval(() => {
      fetchService();
    }, 10000);
    return () => clearInterval(reviewInterval);
  }, [fetchService]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);



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

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${BASE_URL}/api/services/${serviceId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: parseInt(reviewData.rating),
          comment: reviewData.comment
        })
      });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    if (data.success) {
      console.log('✅ Review submitted successfully');
      setReviewData({ rating: 5, comment: '' });
      setShowReviewForm(false);
      // Refresh service to get updated reviews
      await fetchService();
    } else {
      setError(data.error || 'Failed to submit review');
    }
  } catch (err) {
    console.error('❌ Review submission error:', err);
    setError('Error submitting review: ' + err.message);
  } finally {
    setSubmittingReview(false);
  }
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
      // prepare time string in 12-hour format if hour is provided
      let timeString = '';
      if (requestData.preferredHour) {
        timeString = `${requestData.preferredHour}:${requestData.preferredMinute} ${requestData.preferredPeriod}`;
      }
      const res = await fetch(`${BASE_URL}/api/service-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId,
          message: requestData.message,
          preferredDate: requestData.preferredDate,
          preferredTime: timeString
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      if (data.success) {
        setSuccess('Service request sent successfully! The provider will respond shortly.');
        setRequestData({ message: '', preferredDate: '', preferredHour: '', preferredMinute: '00', preferredPeriod: 'AM' });
        setShowRequestForm(false);
        console.log('✅ Service request created successfully:', data.request);
        setTimeout(() => navigate('/client/dashboard'), 2000);
      } else {
        setError(data.error || 'Failed to submit request');
      }
    } catch (err) {
      console.error('❌ Request submission error:', err);
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
                  <h3
                    className="link"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/profile/${provider.id}`)}
                  >
                    {provider.name}
                  </h3>
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

                    <div className="form-group time-group">
                      <label>Preferred Time</label>
                      <div className="time-selectors">
                        <select
                          name="preferredHour"
                          value={requestData.preferredHour}
                          onChange={handleRequestChange}
                        >
                          <option value="">Hour</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={`hour-${i}`} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                        :
                        <select
                          name="preferredMinute"
                          value={requestData.preferredMinute}
                          onChange={handleRequestChange}
                        >
                          <option value="00">00</option>
                          <option value="15">15</option>
                          <option value="30">30</option>
                          <option value="45">45</option>
                        </select>
                        <select
                          name="preferredPeriod"
                          value={requestData.preferredPeriod}
                          onChange={handleRequestChange}
                        >
                          <option>AM</option>
                          <option>PM</option>
                        </select>
                      </div>
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
              <button className="btn-login" onClick={() => navigate('/login/client')}>
                Sign In as Client
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Reviews ({reviews.length})</h2>

        {isClient && (
          <div className="review-submission">
            {!showReviewForm ? (
              <button
                className="btn-write-review"
                onClick={() => setShowReviewForm(true)}
              >
                Write a Review
              </button>
            ) : (
              <form onSubmit={handleSubmitReview} className="review-form">
                <h3>Share Your Experience</h3>

                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                  <label htmlFor="rating">Rating</label>
                  <select
                    id="rating"
                    name="rating"
                    value={reviewData.rating}
                    onChange={handleReviewChange}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                    <option value="4">⭐⭐⭐⭐ Good</option>
                    <option value="3">⭐⭐⭐ Average</option>
                    <option value="2">⭐⭐ Poor</option>
                    <option value="1">⭐ Very Poor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="comment">Your Review</label>
                  <textarea
                    id="comment"
                    name="comment"
                    placeholder="Share your experience with this service..."
                    value={reviewData.comment}
                    onChange={handleReviewChange}
                    rows="4"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="reviews-list">
          {reviews && reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="review-author">
                    <strong>{review.clientName}</strong>
                    <span className="review-rating">
                      {'⭐'.repeat(review.rating)}
                    </span>
                  </div>
                  <small className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to review this service!</p>
          )}
        </div>
      </div>
    </div>
  );
}
