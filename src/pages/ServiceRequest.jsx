import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header.jsx';
import './ServiceRequest.css';

export default function ServiceRequest() {
  const { requestId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const fetchRequest = useCallback(async () => {
    if (!token || !requestId) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BASE_URL}/api/service-requests/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to load request');
      }
      setRequest(data.request);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, requestId, BASE_URL]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const handlePay = async () => {
    if (!request) return;
    setActionLoading(true);
    setError('');

    try {
      // For testing without real Stripe, simulate payment success
      const res = await fetch(`${BASE_URL}/api/service-requests/${request.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: 'paid' })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process payment');
      }
      setRequest(data.request);
      alert('Payment successful! Status updated to "paid".');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!request) return;
    setActionLoading(true);
    setError('');

    try {
      const res = await fetch(`${BASE_URL}/api/service-requests/${request.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: 'confirmed' })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to confirm payment');
      }
      setRequest(data.request);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const renderTimeline = () => {
    const entries = [];
    if (request?.statusHistory?.length) {
      request.statusHistory.forEach(e => {
        entries.push({ label: `Status: ${e.status}`, date: e.date });
      });
    }
    if (request?.paymentHistory?.length) {
      request.paymentHistory.forEach(e => {
        entries.push({ label: `Payment: ${e.status}`, date: e.date });
      });
    }
    const sorted = entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (sorted.length === 0) {
      return <p>No timeline available yet.</p>;
    }

    return (
      <ul className="timeline">
        {sorted.map((entry, idx) => (
          <li key={`${entry.date}-${idx}`}>
            <strong>{entry.label}</strong>
            <span>{new Date(entry.date).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderInvoice = () => {
    if (!request || !request.service) return null;

    const total = request.service.price || 0;

    return (
      <div className="invoice">
        <h2>Invoice</h2>
        <div className="invoice-section">
          <div>
            <p><strong>Service:</strong> {request.service.name}</p>
            <p><strong>Provider:</strong> {request.provider?.name || 'N/A'}</p>
            <p><strong>Client:</strong> {request.client?.name || 'N/A'}</p>
          </div>
          <div>
            <p><strong>Request ID:</strong> {request.id}</p>
            <p><strong>Created:</strong> {new Date(request.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> {request.status}</p>
            <p><strong>Payment Status:</strong> {request.paymentStatus || 'N/A'}</p>
          </div>
        </div>
        <div className="invoice-items">
          <div className="invoice-row">
            <span>Service Fee</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
        </div>
        <div className="invoice-total">
          <span>Total</span>
          <span>₦{total.toLocaleString()}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="service-request-page">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1>Request Details</h1>
        </div>

        {loading ? (
          <div className="loading">Loading request...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : !request ? (
          <div className="error-message">Request not found.</div>
        ) : (
          <div className="request-content">
            <div className="request-main">
              <section className="section">
                <h2>Timeline</h2>
                {renderTimeline()}
              </section>

              <section className="section">
                <h2>Invoice & Payment</h2>
                {renderInvoice()}

                {user?.type === 'client' && request.status === 'completed' && request.paymentStatus !== 'paid' && request.paymentStatus !== 'confirmed' && (
                  <button
                    className="btn-pay"
                    onClick={handlePay}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Redirecting to Payment...' : 'Pay Now'}
                  </button>
                )}

                {user?.type === 'provider' && (request.paymentStatus === 'paid' || request.paymentStatus === 'confirmed') && (
                  <button
                    className="btn-confirm"
                    onClick={handleConfirmPayment}
                    disabled={actionLoading || request.paymentStatus === 'confirmed'}
                  >
                    {request.paymentStatus === 'confirmed' ? 'Payment Confirmed' : (actionLoading ? 'Confirming...' : 'Confirm Payment')}
                  </button>
                )}
              </section>

              {request.review && (
                <section className="section">
                  <h2>Client Review</h2>
                  <p>Rating: {'⭐'.repeat(request.review.rating || 0)}</p>
                  <p>{request.review.comment}</p>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
