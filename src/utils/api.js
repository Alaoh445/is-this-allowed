export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || '';
  const normalizedEnvUrl = envUrl.replace(/\/+$/, '');

  const hostname = window.location.hostname;
  const isVercel = hostname.includes('vercel.app') || hostname.includes('vercel-preview');
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === window.location.hostname;
  const isDev = !import.meta.env.PROD;

  // For Vercel deployments, always use relative paths (serverless functions at /api)
  if (isVercel || (import.meta.env.PROD && !isDev)) {
    return '';
  }

  // For local development (desktop and mobile via IP), use relative paths (Vite proxy)
  if (isDev) {
    return '';
  }

  // Fallback: use env variable if set, otherwise relative paths
  if (normalizedEnvUrl) {
    return normalizedEnvUrl;
  }

  return '';
};
