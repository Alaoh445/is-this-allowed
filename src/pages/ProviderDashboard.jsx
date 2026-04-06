import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../utils/api.js';
import Header from '../components/Header.jsx';
import './Dashboard.css';

const PROFESSIONAL_CATEGORIES = [
  { id: 'legal', name: 'Legal Services', icon: '⚖️' },
  { id: 'health', name: 'Healthcare', icon: '🏥' },
  { id: 'education', name: 'Education & Tutoring', icon: '📚' },
  { id: 'business', name: 'Business Services', icon: '💼' },
  { id: 'tech', name: 'Technology & IT', icon: '💻' },
  { id: 'real-estate', name: 'Real Estate', icon: '🏠' },
  { id: 'finance', name: 'Financial Services', icon: '💰' },
  { id: 'construction', name: 'Construction & Engineering', icon: '🏗️' },
  { id: 'automotive', name: 'Automotive Services', icon: '🚗' },
  { id: 'beauty', name: 'Beauty & Wellness', icon: '💅' },
  { id: 'cleaning', name: 'Cleaning Services', icon: '🧹' },
  { id: 'plumbing', name: 'Plumbing & Repairs', icon: '🔧' }
];

export default function ProviderDashboard() {
  const { user, token, logout, isProvider, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('requests');
  const [showCreateService, setShowCreateService] = useState(false);
  const [predefinedServices, setPredefinedServices] = useState([]);
  const [selectedPredefined, setSelectedPredefined] = useState(null);
  const [editingService, setEditingService] = useState(null);

  const confirmedPayments = requests.filter(r => r.paymentStatus === 'confirmed');
  const totalEarnings = confirmedPayments.reduce((sum, r) => sum + (r.service?.price || 0), 0);
  const pendingPayments = requests.filter(r => r.paymentStatus === 'paid');

  const [formData, setFormData] = useState({
    name: '',
    category: 'legal',
    description: '',
    price: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    category: 'legal',
    description: '',
    price: ''
  });

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
          logout();
          navigate('/login/provider');
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
    try {
      const reqData = await fetchWithAuth(`${BASE_URL}/api/service-requests`);
      if (reqData.success) {
        setRequests(reqData.requests || []);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  }, [fetchWithAuth, BASE_URL]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      // Fetch requests
      await fetchRequests();

      // Fetch services
      const srvData = await fetchWithAuth(`${BASE_URL}/api/provider/${user.id}/services`);
      if (srvData.success) {
        setServices(srvData.services || []);
      }
    } catch (err) {
      setError('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchRequests, fetchWithAuth, BASE_URL, user]);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // if no user (logged out), redirect
    if (!user) {
      navigate('/login/provider');
      return;
    }

    // Check if user is a provider
    if (!isProvider) {
      navigate('/login/client');
      return;
    }

    fetchData();
  }, [authLoading, user, isProvider, navigate, fetchData]);

  // Real-time polling for new requests
  useEffect(() => {
    if (!isProvider || !token || authLoading) return;

    const interval = setInterval(() => {
      fetchRequests();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [isProvider, token, authLoading, fetchRequests]);

  // scroll to highlighted request when ID provided in query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightId = params.get('requestId');
    if (highlightId) {
      // try to scroll after requests are loaded
      setTimeout(() => {
        const elem = document.getElementById(`request-${highlightId}`);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          elem.classList.add('highlight');
        }
      }, 300);
    }
  }, [location.search, requests]);

  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      // Fetch predefined services for this category
      fetchPredefinedServices(value);
      setSelectedPredefined(null);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchPredefinedServices = async (category) => {
    try {
      const res = await fetch(`${BASE_URL}/api/predefined-services/${category}`);
      const data = await res.json();
      if (data.success) {
        setPredefinedServices(data.services || []);
      }
    } catch (err) {
      console.error('Error fetching predefined services:', err);
      setPredefinedServices([]);
    }
  };

  const selectPredefinedService = (service) => {
    setFormData(prev => ({
      ...prev,
      name: service.name,
      description: service.description
    }));
    setSelectedPredefined(service.name);
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

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      if (data.success) {
        setServices(prev => [...prev, data.service]);
        setFormData({ name: '', category: 'legal', description: '', price: '' });
        setShowCreateService(false);
        setError('');
        console.log('✅ Service created successfully:', data.service);
      } else {
        setError(data.error || 'Failed to create service');
      }
    } catch (err) {
      console.error('❌ Error creating service:', err);
      setError('Error creating service: ' + err.message);
    }
  };

  const handleEditService = async (e) => {
    e.preventDefault();
    setError('');

    if (!editFormData.name || !editFormData.description || !editFormData.price) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/services/${editingService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editFormData,
          price: parseInt(editFormData.price)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      if (data.success) {
        setServices(prev => prev.map(s => s.id === editingService.id ? data.service : s));
        setEditingService(null);
        setEditFormData({ name: '', category: 'legal', description: '', price: '' });
        setError('');
        console.log('✅ Service updated successfully:', data.service);
      } else {
        setError(data.error || 'Failed to update service');
      }
    } catch (err) {
      console.error('❌ Error updating service:', err);
      setError('Error updating service: ' + err.message);
    }
  };

  const startEditService = (service) => {
    setEditingService(service);
    setEditFormData({
      name: service.name,
      category: service.category,
      description: service.description,
      price: service.price.toString()
    });
  };

  const cancelEdit = () => {
    setEditingService(null);
    setEditFormData({ name: '', category: 'legal', description: '', price: '' });
  };

  const [comments, setComments] = useState({}); // track optional comments per request

  const handleRequestStatus = async (requestId, status) => {
    try {
      const res = await fetch(`${BASE_URL}/api/service-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, comment: comments[requestId] || '' })
      });

      const data = await res.json();
      if (data.success && data.request) {
        setRequests(prev =>
          prev.map(r => r.id === requestId ? data.request : r)
        );
      }
    } catch (err) {
      setError('Error updating request: ' + err.message);
    }
  };

  const handlePaymentStatus = async (requestId, paymentStatus) => {
    try {
      const res = await fetch(`${BASE_URL}/api/service-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus })
      });

      const data = await res.json();
      if (data.success && data.request) {
        setRequests(prev =>
          prev.map(r => r.id === requestId ? data.request : r)
        );
      }
    } catch (err) {
      setError('Error updating payment: ' + err.message);
    }
  };

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

  const getCategoryName = (catId) => {
    const cat = PROFESSIONAL_CATEGORIES.find(c => c.id === catId);
    return cat ? cat.name : catId;
  };

  const getCategoryIcon = (catId) => {
    const cat = PROFESSIONAL_CATEGORIES.find(c => c.id === catId);
    return cat ? cat.icon : '📌';
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
                <div className="wallet-summary">
                  <div className="wallet-card">
                    <div className="wallet-label">Confirmed Earnings</div>
                    <div className="wallet-value">₦{totalEarnings.toLocaleString()}</div>
                  </div>
                  <div className="wallet-card">
                    <div className="wallet-label">Pending Payments</div>
                    <div className="wallet-value">{pendingPayments.length}</div>
                  </div>
                </div>

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
                      return (
                        <div id={`request-${req.id}`} key={req.id} className="request-card">
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
                              <span
                                className="detail-value link"
                                onClick={() => req.client && navigate(`/profile/${req.client.id}`)}
                                style={{ cursor: req.client ? 'pointer' : 'default' }}
                              >
                                {req.client?.name || 'Client'}
                              </span>
                            </div>

                            <div className="detail-item">
                              <span className="detail-label">Email:</span>
                              <span className="detail-value">
                                {req.client?.email || 'N/A'}
                              </span>
                            </div>

                            {req.client?.profile && Object.keys(req.client.profile).map(key => (
                              <div className="detail-item" key={key}>
                                <span className="detail-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                                <span className="detail-value">
                                  {req.client.profile[key] || 'N/A'}
                                </span>
                              </div>
                            ))}

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
                                <span className="detail-label">Client's Message:</span>
                                <p className="detail-message">{req.message}</p>
                              </div>
                            )}
                          </div>

                          <div className="request-actions">
                            {req.status === 'pending' && (
                              <>
                                <textarea
                                  className="comment-input"
                                  placeholder="Leave a comment for the client (optional)"
                                  value={comments[req.id] || ''}
                                  onChange={(e) => setComments(prev => ({
                                    ...prev,
                                    [req.id]: e.target.value
                                  }))}
                                />
                                <div className="action-buttons">
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
                              </>
                            )}

                            {req.status === 'accepted' && (
                              <div className="action-buttons">
                                <button
                                  className="btn-start"
                                  onClick={() => handleRequestStatus(req.id, 'in_progress')}
                                >
                                  🚀 Start Work
                                </button>
                              </div>
                            )}

                            {req.status === 'in_progress' && (
                              <div className="action-buttons">
                                <button
                                  className="btn-complete"
                                  onClick={() => handleRequestStatus(req.id, 'completed')}
                                >
                                  ✅ Mark Completed
                                </button>
                              </div>
                            )}

                            {req.status === 'completed' && req.paymentStatus === 'paid' && (
                              <div className="action-buttons">
                                <button
                                  className="btn-confirm"
                                  onClick={() => handlePaymentStatus(req.id, 'confirmed')}
                                >
                                  💰 Confirm Payment
                                </button>
                              </div>
                            )}
                          </div>
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

                    {predefinedServices.length > 0 && (
                      <div className="form-group">
                        <label>Select from Predefined Services (or create custom)</label>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                          gap: '12px',
                          marginBottom: '15px'
                        }}>
                          {predefinedServices.map((service, index) => (
                            <div
                              key={service.name ? service.name : `predef-${index}`}
                              style={{
                                padding: '12px',
                                border: selectedPredefined === service.name ? '2px solid #667eea' : '1px solid #ddd',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: selectedPredefined === service.name ? '#f0f4ff' : '#f9f9f9',
                                transition: 'all 0.3s ease'
                              }}
                              onClick={() => selectPredefinedService(service)}
                            >
                              <strong style={{ color: '#333' }}>{service.name}</strong>
                              <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                                {service.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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

                {editingService && (
                  <form onSubmit={handleEditService} className="create-service-form">
                    <h3>Edit Service</h3>

                    <div className="form-group">
                      <label htmlFor="edit-category">Category</label>
                      <select
                        id="edit-category"
                        name="category"
                        value={editFormData.category}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                      >
                        {PROFESSIONAL_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-name">Service Name</label>
                      <input
                        type="text"
                        id="edit-name"
                        name="name"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Legal Consultation"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-description">Description</label>
                      <textarea
                        id="edit-description"
                        name="description"
                        value={editFormData.description}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your service in detail..."
                        rows="4"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-price">Price (₦)</label>
                      <input
                        type="number"
                        id="edit-price"
                        name="price"
                        value={editFormData.price}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, price: e.target.value }))}
                        min="0"
                        required
                      />
                    </div>

                    <div className="action-buttons">
                      <button type="submit" className="btn-submit">
                        Update Service
                      </button>
                      <button type="button" className="btn-cancel" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
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
                        <div className="service-actions">
                          <button
                            className="btn-edit"
                            onClick={() => startEditService(service)}
                          >
                            ✏️ Edit
                          </button>
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
    </>
  );
}
