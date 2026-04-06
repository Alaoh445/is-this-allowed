export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || '';
  const normalizedEnvUrl = envUrl.replace(/\/+$/, '');

  if (normalizedEnvUrl) {
    return normalizedEnvUrl;
  }

  const hostname = window.location.hostname;

  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  // Check if we're on Vercel (vercel.app domain or Vercel preview deployments)
  if (hostname.includes('vercel.app') ||
      hostname.includes('vercel-preview') ||
      window.location.origin.includes('vercel')) {
    return ''; // Use relative paths for Vercel serverless functions
  }

  // Check for custom Vercel deployments (common patterns)
  if (import.meta.env.PROD &&
      (hostname.includes('.vercel.app') ||
       window.location.origin.includes('vercel'))) {
    return '';
  }

  // Fallback for other environments
  return 'https://is-this-allowed.onrender.com';
};
