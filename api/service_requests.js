// Service requests management endpoint
let serviceRequests = [];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const method = req.method;

  try {
    // Create new service request
    if (method === 'POST') {
      const request = {
        id: Date.now().toString(),
        ...req.body,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      serviceRequests.push(request);

      return res.status(201).json(request);
    }

    // Get all service requests
    if (method === 'GET') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userRequests = serviceRequests.filter(r => r.userId === token.split('-')[2]);
      return res.status(200).json(userRequests);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Service requests error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}