// Authentication endpoints
let users = [];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}