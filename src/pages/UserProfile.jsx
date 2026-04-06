import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../utils/api.js';
import './UserProfile.css';

export default function UserProfile() {
  const { user: currentUser, token, updateUser } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [providerServices, setProviderServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', profile: {} });
  const [saving, setSaving] = useState(false);

  const isSelf = !userId || (currentUser && userId === currentUser.id);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const id = userId || currentUser?.id;
        if (!id) {
          setError('User not found');
          setLoading(false);
          return;
        }
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/users/${id}`, {
          headers
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setProfileUser(data.user);
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            profile: { ...data.user.profile }
          });

          // if provider, fetch their services
          if (data.user.type === 'provider') {
            try {
              const baseUrl = getApiBaseUrl();
              const svcRes = await fetch(`${baseUrl}/api/provider/${id}/services`);
              const svcData = await svcRes.json();
              if (svcRes.ok && svcData.success) {
                setProviderServices(svcData.services || []);
              }
            } catch (e) {
              console.error('Error fetching provider services', e);
            }
          }

          // If viewing own client profile, load recent requests
          if (isSelf && data.user.type === 'client') {
            try {
              setRequestsLoading(true);
              const baseUrl = getApiBaseUrl();
              const reqRes = await fetch(`${baseUrl}/api/service-requests`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
              });
              const reqData = await reqRes.json();
              if (reqRes.ok && reqData.success) {
                setRequests(reqData.requests || []);
              }
            } catch (e) {
              console.error('Error fetching client requests', e);
            } finally {
              setRequestsLoading(false);
            }
          }
        } else {
          setError(data.error || 'Failed to load profile');
        }
      } catch (err) {
        console.error('Profile fetch error', err);
        setError('Error loading profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, currentUser, token, isSelf]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      setFormData(prev => ({
        ...prev,
        profile: { ...prev.profile, [name.split('.')[1]]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const id = profileUser.id;
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          profile: formData.profile
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileUser(data.user);
        if (isSelf) {
          updateUser(data.user);
        }
        setEditMode(false);
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      console.error('Update error', err);
      setError('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!profileUser) return <div className="error-message">No user found</div>;

  const isProvider = profileUser.type === 'provider';

  return (
    <div className="profile-container">
      <button className="btn-back" onClick={() => navigate('/')}>← Back to Home</button>
      <h1>{isSelf ? 'My Profile' : `${profileUser.name}'s Profile`}</h1>
      {isSelf && !editMode && (
        <button className="btn-edit" onClick={() => setEditMode(true)}>
          Edit Profile
        </button>
      )}
      {editMode ? (
        <form className="profile-form" onSubmit={handleSave}>
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>
          {/* common fields for all users */}
          <div className="form-group">
            <label>Phone</label>
            <input
              name="profile.phone"
              value={formData.profile.phone || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="profile.bio"
              value={formData.profile.bio || ''}
              onChange={handleChange}
            />
          </div>
          {isProvider && (
            <>
              <div className="form-group">
                <label>Specialization</label>
                <input
                  name="profile.specialization"
                  value={formData.profile.specialization || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Experience (years)</label>
                <input
                  name="profile.experience"
                  type="number"
                  value={formData.profile.experience || ''}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn-cancel" onClick={() => setEditMode(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-details">
          <p><strong>Name:</strong> {profileUser.name}</p>
          <p><strong>Email:</strong> {profileUser.email}</p>
          <p><strong>Account Type:</strong> {profileUser.type}</p>
          {/* render any profile attributes generically */}
          {Object.entries(profileUser.profile || {}).map(([key, val]) => (
            <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {val}</p>
          ))}

          {isProvider && providerServices.length > 0 && (
            <div className="provider-services">
              <h3>Offered Services</h3>
              <ul>
                {providerServices.map(svc => (
                  <li key={svc.id} onClick={() => navigate(`/service/${svc.id}`)} className="service-link">
                    {svc.name} {svc.rating > 0 && `– ⭐ ${svc.rating.toFixed(1)}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Client request history for the profile owner */}
          {isSelf && profileUser.type === 'client' && (
            <div className="client-requests">
              <h3>Your Recent Service Requests</h3>
              {requestsLoading ? (
                <div className="loading">Loading requests...</div>
              ) : requests.length === 0 ? (
                <p style={{ color: '#555' }}>You have not made any service requests yet.</p>
              ) : (
                <div className="requests-list">
                  {requests.map(req => (
                    <div key={req.id} className="request-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{req.service?.name || 'Service'}</strong>
                        <span style={{ color: '#555', fontSize: '0.85rem' }}>{req.status?.toUpperCase()}</span>
                      </div>
                      <p style={{ margin: '8px 0' }}><strong>Provider:</strong> {req.provider?.name || 'N/A'}</p>
                      {req.preferredDate && <p style={{ margin: '4px 0' }}><strong>Date:</strong> {req.preferredDate}</p>}
                      {req.preferredTime && <p style={{ margin: '4px 0' }}><strong>Time:</strong> {req.preferredTime}</p>}
                      {req.message && <p style={{ margin: '4px 0' }}><strong>Message:</strong> {req.message}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
