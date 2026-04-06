// Simple in-memory storage for demo (replace with database in production)
let users = [];
let serviceRequests = [];
let contacts = [];
let subscribers = [];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { path } = req.query;
  const method = req.method;

  try {
    // Auth endpoints
    if (path === 'auth') {
      if (method === 'POST') {
        const { action, ...data } = req.body;

        if (action === 'register') {
          // Simple registration (in production, use proper auth)
          const user = {
            id: Date.now(),
            email: data.email,
            name: data.name,
            createdAt: new Date().toISOString()
          };
          users.push(user);

          return res.status(201).json({
            success: true,
            user: { id: user.id, email: user.email, name: user.name }
          });
        }

        if (action === 'login') {
          // Simple login (in production, use proper auth)
          const user = users.find(u => u.email === data.email);
          if (user) {
            return res.status(200).json({
              success: true,
              user: { id: user.id, email: user.email, name: user.name },
              token: 'demo-token-' + user.id
            });
          } else {
            return res.status(401).json({ error: 'Invalid credentials' });
          }
        }
      }
    }

    // Service requests endpoints
    if (path === 'service-requests') {
      if (method === 'GET') {
        // Get all service requests for the user
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const userRequests = serviceRequests.filter(r => r.userId === token.split('-')[2]);
        return res.status(200).json(userRequests);
      }

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
    }

    // Individual service request
    if (path && path.match(/^\d+$/)) {
      const requestId = path;
      const request = serviceRequests.find(r => r.id === requestId);

      if (!request) {
        return res.status(404).json({ error: 'Service request not found' });
      }

      if (method === 'GET') {
        return res.status(200).json(request);
      }

      if (method === 'PUT') {
        Object.assign(request, req.body, { updatedAt: new Date().toISOString() });
        return res.status(200).json(request);
      }

      if (method === 'DELETE') {
        const index = serviceRequests.findIndex(r => r.id === requestId);
        serviceRequests.splice(index, 1);
        return res.status(200).json({ success: true });
      }
    }

    // Newsletter endpoint
    if (path === 'newsletter') {
      if (method === 'POST') {
        const { email } = req.body;

        if (!email) {
          return res.status(400).json({ error: 'Email is required' });
        }

        // Check if already subscribed
        if (subscribers.some(s => s.email === email)) {
          return res.status(400).json({ error: 'Email already subscribed' });
        }

        const subscriber = {
          email,
          subscribedAt: new Date().toISOString()
        };
        subscribers.push(subscriber);

        return res.status(201).json({
          success: true,
          message: 'Successfully subscribed to newsletter'
        });
      }
    }

    // Contact endpoint
    if (path === 'contact') {
      if (method === 'POST') {
        const contact = {
          id: Date.now(),
          ...req.body,
          timestamp: new Date().toISOString()
        };
        contacts.push(contact);

        return res.status(201).json({
          success: true,
          message: 'Contact message sent successfully'
        });
      }
    }

    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}