import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

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

export default function ProviderDashboard() {
  const { user, token, logout, isProvider } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('requests');
  const [showCreateService, setShowCreateService] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'legal',
    description: '',
    price: ''
  });

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!isProvider) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isProvider, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch requests
      const reqRes = await fetch(`${BASE_URL}/api/service-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reqData = await reqRes.json();
      if (reqData.success) {
        setRequests(reqData.requests || []);
      }

      // Fetch services
      const srvRes = await fetch(`${BASE_URL}/api/provider/${user.id}/services`);
      const srvData = await srvRes.json();
      if (srvData.success) {
        setServices(srvData.services || []);
      }
    } catch (err) {
      setError('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.description || !formData.price) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price)
        })
      });

      const data = await res.json();
      if (data.success) {
        setServices(prev => [...prev, data.service]);
        setFormData({ name: '', category: 'legal', description: '', price: '' });
        setShowCreateService(false);
        setError('');
      } else {
        setError(data.error || 'Failed to create service');
      }
    } catch (err) {
      setError('Error creating service: ' + err.message);
    }
  };

  const handleRequestStatus = async (requestId, status) => {
    try {
      const res = await fetch(`${BASE_URL}/api/service-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (data.success) {
        setRequests(prev =>
          prev.map(r => r.id === requestId ? { ...r, status } : r)
        );
      }
    } catch (err) {
      setError('Error updating request: ' + err.message);
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
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          📥 Service Requests ({requests.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          📋 My Services ({services.length})
        </button>
      </div>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading your dashboard...</div>
        ) : (
          <>
            {activeTab === 'requests' && (
              <div className="dashboard-section">
                <h2>Incoming Service Requests</h2>

                {requests.length === 0 ? (
                  <div className="empty-state">
                    <p>No service requests yet. Add services to start receiving requests!</p>
                    <button
                      className="btn-browse-large"
                      onClick={() => setActiveTab('services')}
                    >
                      Create Your First Service
                    </button>
                  </div>
                ) : (
                  <div className="requests-list">
                    {requests.map(req => {
                      const isPending = req.status === 'pending';
                      return (
                        <div key={req.id} className="request-card">
                          <div className="request-header">
                            <h3>{req.service?.name || 'Service'}</h3>
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor:
                                  req.status === 'accepted' ? '#10b981' :
                                  req.status === 'declined' ? '#ef4444' :
                                  '#f59e0b'
                              }}
                            >
                              {req.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="request-details">
                            <div className="detail-item">
                              <span className="detail-label">Client:</span>
                              <span className="detail-value">
                                {req.client?.name || 'Client'}
                              </span>
                            </div>

                            <div className="detail-item">
                              <span className="detail-label">Email:</span>
                              <span className="detail-value">
                                {req.client?.email || 'N/A'}
                              </span>
                            </div>

                            {req.preferredDate && (
                              <div className="detail-item">
                                <span className="detail-label">Preferred Date:</span>
                                <span className="detail-value">{req.preferredDate}</span>
                              </div>
                            )}

                            {req.message && (
                              <div className="detail-item">
                                <span className="detail-label">Client's Message:</span>
                                <p className="detail-message">{req.message}</p>
                              </div>
                            )}
                          </div>

                          {isPending && (
                            <div className="request-actions">
                              <button
                                className="btn-accept"
                                onClick={() => handleRequestStatus(req.id, 'accepted')}
                              >
                                ✓ Accept
                              </button>
                              <button
                                className="btn-decline"
                                onClick={() => handleRequestStatus(req.id, 'declined')}
                              >
                                ✗ Decline
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div className="dashboard-section">
                <div className="services-header-row">
                  <h2>My Professional Services</h2>
                  <button
                    className="btn-add-service"
                    onClick={() => setShowCreateService(!showCreateService)}
                  >
                    {showCreateService ? '✕ Cancel' : '+ Add Service'}
                  </button>
                </div>

                {showCreateService && (
                  <form onSubmit={handleCreateService} className="create-service-form">
                    <h3>Create New Service</h3>

                    <div className="form-group">
                      <label htmlFor="name">Service Name</label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="e.g., Corporate Legal Consultation"
                        value={formData.name}
                        onChange={handleServiceChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="category">Category</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleServiceChange}
                      >
                        {PROFESSIONAL_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Describe your service and what clients should expect"
                        value={formData.description}
                        onChange={handleServiceChange}
                        rows="4"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="price">Price (₦)</label>
                      <input
                        id="price"
                        type="number"
                        name="price"
                        placeholder="e.g., 50000"
                        value={formData.price}
                        onChange={handleServiceChange}
                        min="0"
                        required
                      />
                    </div>

                    <button type="submit" className="btn-submit">
                      Create Service
                    </button>
                  </form>
                )}

                {services.length === 0 ? (
                  <div className="empty-state">
                    <p>You haven't created any services yet.</p>
                    <button
                      className="btn-browse-large"
                      onClick={() => setShowCreateService(true)}
                    >
                      Create Your First Service
                    </button>
                  </div>
                ) : (
                  <div className="services-list">
                    {services.map(service => (
                      <div key={service.id} className="service-item">
                        <div className="service-info">
                          <h3>{service.name}</h3>
                          <p className="category">
                            {getCategoryIcon(service.category)} {getCategoryName(service.category)}
                          </p>
                          <p className="description">{service.description}</p>
                          <div className="service-meta">
                            <span className="price">₦{service.price.toLocaleString()}</span>
                            <span className="status">{service.availability}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
