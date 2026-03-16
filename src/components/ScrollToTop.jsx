import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scrolls window to top whenever the pathname changes
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
