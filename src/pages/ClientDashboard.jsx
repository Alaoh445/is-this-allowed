import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function ClientDashboard() {
  const { user, token, logout, isClient } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!isClient) {
      navigate('/login');
      return;
    }
    fetchRequests();
  }, [isClient, navigate]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/service-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      } else {
        setError(data.error || 'Failed to load requests');
      }
    } catch (err) {
      setError('Error loading requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'; // orange
      case 'accepted': return '#10b981'; // green
      case 'declined': return '#ef4444'; // red
      case 'completed': return '#667eea'; // blue
      default: return '#6b7280';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome, {user?.name}!</h1>
          <p className="user-email">{user?.email}</p>
        </div>
        <div className="header-actions">
          <button className="btn-browse" onClick={() => navigate('/services')}>
            Browse Services
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
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
                      <span className="detail-value">
                        {req.provider?.name || 'Provider'}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value">
                        ₦{req.service?.price?.toLocaleString() || 'N/A'}
                      </span>
                    </div>

                    {req.preferredDate && (
                      <div className="detail-item">
                        <span className="detail-label">Preferred Date:</span>
                        <span className="detail-value">{req.preferredDate}</span>
                      </div>
                    )}

                    {req.preferredTime && (
                      <div className="detail-item">
                        <span className="detail-label">Preferred Time:</span>
                        <span className="detail-value">{req.preferredTime}</span>
                      </div>
                    )}

                    {req.message && (
                      <div className="detail-item">
                        <span className="detail-label">Your Message:</span>
                        <p className="detail-message">{req.message}</p>
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
                    {req.status === 'accepted' && (
                      <p style={{ color: '#10b981', fontWeight: 600, marginBottom: '10px' }}>
                        ✓ Provider accepted your request. Check your email for details.
                      </p>
                    )}
                    {req.status === 'declined' && (
                      <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: '10px' }}>
                        The provider has declined your request.
                      </p>
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
  );
}
