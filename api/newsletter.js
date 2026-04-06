// Newsletter subscription endpoint
let subscribers = [];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

  } catch (error) {
    console.error('Newsletter error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}