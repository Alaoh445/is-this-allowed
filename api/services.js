// Services management endpoint
let services = [];

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
  const serviceId = urlParts.find(part => part && part !== 'api' && part !== 'services' && !part.includes('?'));

  try {
    // Get all services
    if (method === 'GET' && !serviceId) {
      const category = req.query?.category;
      let filteredServices = services;

      if (category) {
        filteredServices = services.filter(s => s.category === category);
      }

      return res.status(200).json({
        success: true,
        services: filteredServices,
        total: filteredServices.length
      });
    }

    // Create new service
    if (method === 'POST' && !serviceId) {
      const service = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString(),
        provider: req.body.providerId || 'demo-provider'
      };
      services.push(service);

      return res.status(201).json(service);
    }

    // Get specific service
    if (method === 'GET' && serviceId) {
      const service = services.find(s => s.id === serviceId);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      return res.status(200).json(service);
    }

    // Update service
    if (method === 'PUT' && serviceId) {
      const service = services.find(s => s.id === serviceId);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      Object.assign(service, req.body, { updatedAt: new Date().toISOString() });
      return res.status(200).json(service);
    }

    // Delete service
    if (method === 'DELETE' && serviceId) {
      const index = services.findIndex(s => s.id === serviceId);
      if (index === -1) {
        return res.status(404).json({ error: 'Service not found' });
      }

      services.splice(index, 1);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Services error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}