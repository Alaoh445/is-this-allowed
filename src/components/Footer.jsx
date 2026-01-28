import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: '#1a1a2e',
      color: '#e0e0e0',
      padding: '40px 20px',
      marginTop: '60px',
      borderTop: '2px solid #667eea'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '30px'
      }}>
        {/* About Section */}
        <div>
          <h3 style={{ color: '#667eea', marginBottom: '15px', fontSize: '1.2rem' }}>About Is This Allowed?</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#b0b0b0' }}>
            Is This Allowed? is your go-to resource for comprehensive answers about laws, regulations, and general knowledge. Get instant, reliable information tailored to your jurisdiction.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 style={{ color: '#667eea', marginBottom: '15px', fontSize: '1.2rem' }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <a href="/" style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.3s' }} 
                onMouseEnter={(e) => e.target.style.color = '#667eea'}
                onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>
                Home
              </a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <a href="/contact" style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.target.style.color = '#667eea'}
                onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>
                Contact Us
              </a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <a href="/privacy" style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.target.style.color = '#667eea'}
                onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>
                Privacy Policy
              </a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <a href="/terms" style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.target.style.color = '#667eea'}
                onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 style={{ color: '#667eea', marginBottom: '15px', fontSize: '1.2rem' }}>Nigerian Resources</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <a href="https://www.justice.gov.ng/" target="_blank" rel="noopener noreferrer"
                style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.target.style.color = '#667eea'}
                onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>
                Ministry of Justice Nigeria
              </a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <a href="https://www.constitution.gov.ng/" target="_blank" rel="noopener noreferrer"
                style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.target.style.color = '#667eea'}
                onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>
                Nigerian Constitution
              </a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <a href="https://nba.org.ng/" target="_blank" rel="noopener noreferrer"
                style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.target.style.color = '#667eea'}
                onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>
                Nigerian Bar Association
              </a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <a href="https://lawnigeria.com/" target="_blank" rel="noopener noreferrer"
                style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.target.style.color = '#667eea'}
                onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>
                Law Nigeria
              </a>
            </li>
          </ul>
        </div>

        {/* Legal Notice */}
        <div>
          <h3 style={{ color: '#667eea', marginBottom: '15px', fontSize: '1.2rem' }}>Legal Notice</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#b0b0b0' }}>
            The information provided is for educational purposes only and does not constitute legal advice. Always consult with a qualified attorney for your specific situation.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{
        borderTop: '1px solid #333',
        paddingTop: '20px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>
          © {currentYear} Is This Allowed? All rights reserved. | Powered by Alaoh
        </p>
        <p style={{ fontSize: '0.8rem', color: '#666', margin: '10px 0 0 0' }}>
          Questions? <a href="/contact" style={{ color: '#667eea', textDecoration: 'none' }}>Contact Support</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
