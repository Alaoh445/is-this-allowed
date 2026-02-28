import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [showLogin, setShowLogin] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowMobileMenu(false);
  };

  const AuthButtons = () => {
    return (
      <>
        {showLogin && (
          <button
            className="nav-button login-btn shared-color"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        )}
        <button
          className={`nav-button register-btn ${showLogin ? 'shared-color' : ''}`}
          onClick={() => {
            // navigate to register page
            setShowLogin(true);
            navigate('/register');
          }}
        >
          <span className="register-text">Register</span>
          <span
            className="register-caret"
            onClick={(e) => { e.stopPropagation(); setShowLogin(s => !s); }}
            role="button"
            aria-label="Toggle login"
          >
            ▾
          </span>
        </button>
      </>
    );
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand" onClick={() => { navigate('/'); setShowMobileMenu(false); }}>
          <div className="header-logo">⚖️</div>
          <div className="header-title">
            <h1>Is This Allowed?</h1>
            <p>Know Your Rights Instantly</p>
          </div>
        </div>

        <button className="mobile-toggle" onClick={() => setShowMobileMenu(s => !s)} aria-label="Toggle menu">
          ☰
        </button>

        <nav className="header-nav">
          <button className="nav-button services-btn shared-color" onClick={() => navigate('/services')}>Services</button>
          {isAuthenticated ? (
            <>
              <div className="nav-user">
                <span className="user-name">{user?.name}</span>
              </div>
              <button className="nav-button dashboard-btn" onClick={() => navigate(user?.type === 'client' ? '/client/dashboard' : '/provider/dashboard')}>Dashboard</button>
              <button className="nav-button logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <AuthButtons />
          )}
        </nav>

        <div className={`mobile-menu ${showMobileMenu ? 'open' : ''}`}>
          <button className="mobile-item" onClick={() => { setShowMobileMenu(false); navigate('/services'); }}>Services</button>
          {!isAuthenticated ? (
            <>
              {showLogin && <button className="mobile-item" onClick={() => { setShowMobileMenu(false); navigate('/login'); }}>Login</button>}
              <button className="mobile-item register-btn" onClick={() => { setShowLogin(true); setShowMobileMenu(false); navigate('/register'); }}>Register</button>
            </>
          ) : (
            <>
              <div className="mobile-user">Signed in as {user?.name}</div>
              <button className="mobile-item" onClick={() => { setShowMobileMenu(false); navigate(user?.type === 'client' ? '/client/dashboard' : '/provider/dashboard'); }}>Dashboard</button>
              <button className="mobile-item logout-btn" onClick={() => { handleLogout(); setShowMobileMenu(false); }}>Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
