import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './Services.css';

const PROFESSIONAL_CATEGORIES = [
  { id: 'legal', name: 'Legal Services', icon: '⚖️', description: 'Lawyers, legal consultants, contract reviews' },
  { id: 'health', name: 'Healthcare', icon: '🏥', description: 'Doctors, therapists, health consultants' },
  { id: 'education', name: 'Education & Tutoring', icon: '📚', description: 'Tutors, trainers, academic support' },
  { id: 'business', name: 'Business Services', icon: '💼', description: 'Consulting, accounting, HR services' },
  { id: 'tech', name: 'Technology & IT', icon: '💻', description: 'Developers, IT support, web designers' },
  { id: 'real-estate', name: 'Real Estate', icon: '🏠', description: 'Agents, property managers, appraisers' },
  { id: 'finance', name: 'Financial Services', icon: '💰', description: 'Financial advisors, accountants, planners' },
  { id: 'construction', name: 'Construction & Engineering', icon: '🏗️', description: 'Contractors, architects, engineers' },
  { id: 'automotive', name: 'Automotive Services', icon: '🚗', description: 'Mechanics, repairers, detailers' },
  { id: 'beauty', name: 'Beauty & Wellness', icon: '💅', description: 'Stylists, beauticians, wellness experts' },
  { id: 'cleaning', name: 'Cleaning Services', icon: '🧹', description: 'House cleaning, office cleaning, laundry' },
  { id: 'plumbing', name: 'Plumbing & Repairs', icon: '🔧', description: 'Plumbers, electricians, handymen' }
];

import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function Services() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // use relative path so serverless functions work both locally and when deployed
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = `${BASE_URL}/api/services`;
      if (selectedCategory && selectedCategory !== 'all') {
        url += `?category=${selectedCategory}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();

      if (data.success) {
        setServices(data.services || []);
      } else {
        setError(data.error || 'Failed to load services');
      }
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Error loading services: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, BASE_URL]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const getCategoryIcon = (catId) => {
    const cat = PROFESSIONAL_CATEGORIES.find(c => c.id === catId);
    return cat ? cat.icon : '📌';
  };

  const getCategoryName = (catId) => {
    const cat = PROFESSIONAL_CATEGORIES.find(c => c.id === catId);
    return cat ? cat.name : catId;
  };

  const filteredServices = services
    .filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCategoryName(service.category).toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <>
      <Header />
      <div className="services-container">
        <div style={{ marginBottom: '20px' }}>
          <span
            onClick={() => window.location.href = '/'}
            style={{
              display: 'inline-block',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#667eea',
              fontWeight: '600'
            }}
          >
            ← Back to Home
          </span>
        </div>
        <div className="services-header">
        <h1>Professional Services</h1>
        <p>Browse and request services from qualified professionals</p>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="services-layout">
        {/* Categories Sidebar */}
        <aside className="categories-sidebar">
          <h3>Categories</h3>
          <div className="categories-list">
            <button
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Services
            </button>
            {PROFESSIONAL_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Services Grid */}
        <main className="services-main">
          {selectedCategory !== 'all' && (
            <div className="category-header">
              <h2>
                {getCategoryIcon(selectedCategory)} {getCategoryName(selectedCategory)}
              </h2>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading services...</div>
          ) : filteredServices.length === 0 ? (
            <div className="no-services">
              <p>No services found matching your criteria.</p>
              <p>Try adjusting your search or browse other categories.</p>
            </div>
          ) : (
            <div className="services-grid">
              {filteredServices.map(service => (
                <Link
                  key={service.id}
                  to={`/service/${service.id}`}
                  className="service-card"
                >
                  <div className="service-image">
                    {service.image ? (
                      <img src={service.image} alt={service.name} />
                    ) : (
                      <div className="image-placeholder">
                        {getCategoryIcon(service.category)}
                      </div>
                    )}
                  </div>
                  <div className="service-info">
                    <h3>{service.name}</h3>
                    <p className="service-category">
                      {getCategoryIcon(service.category)} {getCategoryName(service.category)}
                    </p>
                    <p className="service-description">{service.description}</p>
                    <div className="service-footer">
                      <div className="service-price">
                        <span className="price">₦{service.price.toLocaleString()}</span>
                        <span className="availability">{service.availability}</span>
                      </div>
                      {service.provider && (
                        <div className="service-provider">
                          <p className="provider-name">{service.provider.name}</p>
                          {service.rating > 0 && (
                            <span className="rating">⭐ {service.rating.toFixed(1)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
      </div>
      <Footer />
    </>
  );
}
