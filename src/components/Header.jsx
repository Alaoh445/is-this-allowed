import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand" onClick={() => navigate('/')}>
          <div className="header-logo">⚖️</div>
          <div className="header-title">
            <h1>Is This Allowed?</h1>
            <p>Know Your Rights Instantly</p>
          </div>
        </div>
        <nav className="header-nav">
          <button 
            className="nav-button home-btn"
            onClick={() => navigate('/')}
          >
            Home
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
