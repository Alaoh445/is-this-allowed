// User profile management endpoint
let users = [];

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
  const urlParts = req.url.split('/');
  const userId = urlParts.find(part => part && part !== 'api' && part !== 'users' && !part.includes('?'));

  try {
    // Get user profile
    if (method === 'GET' && userId) {
      const user = users.find(u => u.id === userId);
      if (!user) {
        // Return demo user for testing
        const demoUser = {
          id: userId,
          name: 'Demo User',
          email: 'demo@example.com',
          profile: {
            bio: 'Professional service provider',
            location: 'Lagos, Nigeria',
            experience: '5+ years',
            rating: 4.5,
            completedServices: 25
          },
          isProvider: userId.includes('provider'),
          createdAt: new Date().toISOString()
        };
        return res.status(200).json({ success: true, user: demoUser });
      }
      return res.status(200).json({ success: true, user });
    }

    // Update user profile
    if (method === 'PUT' && userId) {
      let user = users.find(u => u.id === userId);
      if (!user) {
        user = { id: userId };
        users.push(user);
      }

      Object.assign(user, req.body, { updatedAt: new Date().toISOString() });
      return res.status(200).json({ success: true, user });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}