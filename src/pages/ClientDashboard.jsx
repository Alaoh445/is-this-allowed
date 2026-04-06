import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../utils/api.js';
import Header from '../components/Header.jsx';
import './Dashboard.css';

export default function ClientDashboard() {
  const { user, token, logout, isClient, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewForm, setReviewForm] = useState({}); // { requestId: { rating, comment } }

  const BASE_URL = getApiBaseUrl();

  // Helper function to make authenticated requests
  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };
    
    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        if (response.status === 401) {
          // Token invalid, logout
          logout();
          navigate('/login/client');
        }
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Fetch error:', err);
      throw err;
    }
  }, [token, logout, navigate]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchWithAuth(`${BASE_URL}/api/service-requests`);
      if (data.success) {
        setRequests(data.requests || []);
      } else {
        setError(data.error || 'Failed to load requests');
      }
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Error loading requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, BASE_URL]);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    if (!user) {
      navigate('/login/client');
      return;
    }

    // Check if user is a client
    if (!isClient) {
      navigate('/login/provider');
      return;
    }

    fetchRequests();
  }, [authLoading, user, isClient, navigate, fetchRequests]);

  // Real-time polling for request status updates
  useEffect(() => {
    if (!isClient || !token || authLoading) return;

    const interval = setInterval(() => {
      fetchRequests();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [isClient, token, authLoading, fetchRequests]);

  const formatTimeString = (t) => {
    if (!t) return '';
    const lower = t.toLowerCase();
    if (lower.includes('am') || lower.includes('pm')) return t;
    const [hourStr, minute] = t.split(':');
    let hour = parseInt(hourStr, 10);
    if (isNaN(hour)) return t;
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${period}`;
  };

  const handlePayment = async (requestId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/service-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: 'paid' })
      });

      const data = await res.json();
      if (data.success && data.request) {
        setRequests(prev =>
          prev.map(r => r.id === requestId ? data.request : r)
        );
      }
    } catch (err) {
      setError('Error processing payment: ' + err.message);
    }
  };

  const handleReview = async (requestId, review) => {
    try {
      const res = await fetch(`${BASE_URL}/api/service-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ review })
      });

      const data = await res.json();
      if (data.success) {
        setRequests(prev =>
          prev.map(r => r.id === requestId ? { ...r, review } : r)
        );
      }
    } catch (err) {
      setError('Error submitting review: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'; // orange
      case 'accepted': return '#10b981'; // green
      case 'declined': return '#ef4444'; // red
      case 'completed': return '#667eea'; // blue
      case 'rejected': return '#ef4444'; // red
      default: return '#6b7280';
    }
  };

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <button className="btn-back" onClick={() => navigate('/')}>← Home</button>
          <div className="header-content">
            <h1>Welcome, {user?.name}!</h1>
            <p className="user-email">{user?.email}</p>
          </div>
          <div className="header-actions">
            <button className="btn-browse" onClick={() => navigate('/services')}>
              Browse Services
            </button>
          </div>
        </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Your Service Requests</h2>
          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading your requests...</div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <p>You haven't requested any services yet.</p>
              <button className="btn-browse-large" onClick={() => navigate('/services')}>
                Browse Available Services
              </button>
            </div>
          ) : (
            <div className="requests-list">
              {requests.map(req => (
                <div key={req.id} className="request-card">
                  <div className="request-header">
                    <h3>{req.service?.name || 'Service'}</h3>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(req.status) }}
                    >
                      {req.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="request-details">
                    <div className="detail-item">
                      <span className="detail-label">Provider:</span>
                      <span
                        className="detail-value link"
                        onClick={() => req.provider && navigate(`/profile/${req.provider.id}`)}
                        style={{ cursor: req.provider ? 'pointer' : 'default' }}
                      >
                        {req.provider?.name || 'Provider'}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">{req.status}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value">
                        ₦{req.service?.price?.toLocaleString() || 'N/A'}
                      </span>
                    </div>

                    {req.status === 'completed' && (
                      <div className="detail-item">
                        <span className="detail-label">Payment:</span>
                        <span className="detail-value">{req.paymentStatus || 'Not required'}</span>
                      </div>
                    )}

                    {req.preferredDate && (
                      <div className="detail-item">
                        <span className="detail-label">Preferred Date:</span>
                        <span className="detail-value">{req.preferredDate}</span>
                      </div>
                    )}

                    {req.preferredTime && (
                      <div className="detail-item">
                                <span className="detail-label">Preferred Time:</span>
                                <span className="detail-value">{formatTimeString(req.preferredTime)}</span>
                              </div>
                            )}

                    {req.message && (
                      <div className="detail-item">
                        <span className="detail-label">Your Message:</span>
                        <p className="detail-message">{req.message}</p>
                      </div>
                    )}

                    {req.providerComment && (
                      <div className="detail-item">
                        <span className="detail-label">Provider Says:</span>
                        <p className="detail-message">{req.providerComment}</p>
                      </div>
                    )}

                    {req.review && (
                      <div className="detail-item">
                        <span className="detail-label">Your Review:</span>
                        <div className="review-display">
                          <div>Rating: {'⭐'.repeat(req.review.rating)}</div>
                          <p>{req.review.comment}</p>
                        </div>
                      </div>
                    )}

                    <div className="detail-item">
                      <span className="detail-label">Submitted:</span>
                      <span className="detail-value">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="request-actions">
                    {req.status === 'completed' && req.paymentStatus === 'pending' && (
                      <div className="action-buttons">
                        <button
                          className="btn-pay"
                          onClick={() => handlePayment(req.id)}
                        >
                          💳 Pay Now (₦{req.service?.price?.toLocaleString() || 'N/A'})
                        </button>
                      </div>
                    )}

                    {req.status === 'completed' && req.paymentStatus === 'confirmed' && !req.review && (
                      <div className="review-form">
                        <h4>Leave a Review</h4>
                        <div className="form-group">
                          <label>Rating:</label>
                          <select
                            value={reviewForm[req.id]?.rating || 5}
                            onChange={(e) => setReviewForm(prev => ({
                              ...prev,
                              [req.id]: { ...prev[req.id], rating: parseInt(e.target.value) }
                            }))}
                          >
                            <option value={5}>⭐⭐⭐⭐⭐</option>
                            <option value={4}>⭐⭐⭐⭐</option>
                            <option value={3}>⭐⭐⭐</option>
                            <option value={2}>⭐⭐</option>
                            <option value={1}>⭐</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Comment:</label>
                          <textarea
                            value={reviewForm[req.id]?.comment || ''}
                            onChange={(e) => setReviewForm(prev => ({
                              ...prev,
                              [req.id]: { ...prev[req.id], comment: e.target.value }
                            }))}
                            placeholder="Share your experience..."
                            rows="3"
                          />
                        </div>
                        <button
                          className="btn-submit"
                          onClick={() => handleReview(req.id, reviewForm[req.id])}
                        >
                          Submit Review
                        </button>
                      </div>
                    )}

                    <button className="btn-view" onClick={() => navigate('/services')}>
                      View More Services
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="dashboard-sidebar">
          <div className="sidebar-card">
            <h3>Quick Stats</h3>
            <div className="stat">
              <div className="stat-number">{requests.length}</div>
              <div className="stat-label">Service Requests</div>
            </div>
            <div className="stat">
              <div className="stat-number">
                {requests.filter(r => r.status === 'pending').length}
              </div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat">
              <div className="stat-number">
                {requests.filter(r => r.status === 'accepted').length}
              </div>
              <div className="stat-label">Accepted</div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Need Help?</h3>
            <p>Browse our directory of professional services and submit requests to service providers.</p>
            <button className="btn-browse" onClick={() => navigate('/services')}>
              Browse Services
            </button>
          </div>
        </aside>
      </div>
    </div>
    </>
  );
}
