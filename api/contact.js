// Contact form submission endpoint
let contacts = [];

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

  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}