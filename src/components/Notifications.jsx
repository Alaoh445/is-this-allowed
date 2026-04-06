import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from '../utils/api.js';
import './Notifications.css';

export default function Notifications() {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const BASE_URL = getApiBaseUrl();

  // Fetch notifications every 5 seconds for real-time updates
  useEffect(() => {
    if (!token || !user) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/notifications`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!res.ok) {
          if (res.status === 401) {
            setNotifications([]);
            setUnreadCount(0);
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    // Fetch immediately
    fetchNotifications();
    
    // Then poll every 5 seconds
    const interval = setInterval(fetchNotifications, 5000);

    return () => clearInterval(interval);
  }, [token, user, BASE_URL]);

  const navigate = useNavigate();

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [token, BASE_URL]);

  if (!token || !user) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠️';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  return (
    <div className="notifications-container">
      <button
        className="notifications-bell"
        onClick={() => setShowDropdown(!showDropdown)}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
            <button
              className="close-btn"
              onClick={() => setShowDropdown(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => {
                const notifType = notification.type || 'info';
                return (
                  <div
                    key={notification.id}
                    className={`notification-item ${
                      notification.read ? 'read' : 'unread'
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      if (notification.url) {
                        navigate(notification.url);
                      }
                    }}
                  >
                    <div
                      className="notification-icon"
                      style={{ color: getNotificationColor(notifType) }}
                    >
                      {getNotificationIcon(notifType)}
                    </div>

                    <div className="notification-content">
                      <h4>{notification.title || 'Notification'}</h4>
                      <p>{notification.message || 'No message'}</p>
                      <small className="notification-time">
                        {new Date(notification.createdAt).toLocaleString()}
                      </small>
                    </div>

                    {!notification.read && <div className="unread-indicator"></div>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
