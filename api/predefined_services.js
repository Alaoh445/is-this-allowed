// Predefined services endpoint
const predefinedServices = [
  // Legal Services
  { id: 'legal-1', name: 'Legal Consultation', category: 'legal', description: 'Professional legal advice and consultation', price: 5000, duration: '1 hour' },
  { id: 'legal-2', name: 'Contract Review', category: 'legal', description: 'Review and analysis of legal contracts', price: 3000, duration: '30 mins' },
  { id: 'legal-3', name: 'Document Drafting', category: 'legal', description: 'Drafting of legal documents and agreements', price: 4000, duration: '2 hours' },
  { id: 'legal-4', name: 'Court Representation', category: 'legal', description: 'Legal representation in court proceedings', price: 10000, duration: 'per case' },

  // Healthcare Services
  { id: 'health-1', name: 'Medical Consultation', category: 'health', description: 'General medical consultation and checkup', price: 2500, duration: '30 mins' },
  { id: 'health-2', name: 'Therapy Session', category: 'health', description: 'Professional therapy and counseling', price: 3500, duration: '1 hour' },
  { id: 'health-3', name: 'Health Assessment', category: 'health', description: 'Comprehensive health assessment', price: 2000, duration: '45 mins' },
  { id: 'health-4', name: 'Medical Report Review', category: 'health', description: 'Review and interpretation of medical reports', price: 1500, duration: '30 mins' },

  // Education Services
  { id: 'edu-1', name: 'Tutoring Session', category: 'education', description: 'One-on-one tutoring in various subjects', price: 2000, duration: '1 hour' },
  { id: 'edu-2', name: 'Academic Coaching', category: 'education', description: 'Academic performance coaching', price: 3000, duration: '1 hour' },
  { id: 'edu-3', name: 'Test Preparation', category: 'education', description: 'Preparation for exams and tests', price: 2500, duration: '1 hour' },
  { id: 'edu-4', name: 'Homework Help', category: 'education', description: 'Assistance with homework and assignments', price: 1500, duration: '45 mins' },

  // Business Services
  { id: 'biz-1', name: 'Business Consulting', category: 'business', description: 'Strategic business consulting', price: 6000, duration: '1 hour' },
  { id: 'biz-2', name: 'Financial Planning', category: 'business', description: 'Financial planning and analysis', price: 5000, duration: '1 hour' },
  { id: 'biz-3', name: 'Marketing Strategy', category: 'business', description: 'Digital marketing strategy development', price: 4500, duration: '1 hour' },
  { id: 'biz-4', name: 'Business Plan Writing', category: 'business', description: 'Professional business plan development', price: 8000, duration: 'project' },

  // Technology Services
  { id: 'tech-1', name: 'IT Support', category: 'tech', description: 'Technical support and troubleshooting', price: 3000, duration: '1 hour' },
  { id: 'tech-2', name: 'Web Development', category: 'tech', description: 'Website development and maintenance', price: 8000, duration: 'project' },
  { id: 'tech-3', name: 'Software Training', category: 'tech', description: 'Software and technology training', price: 3500, duration: '1 hour' },
  { id: 'tech-4', name: 'Data Recovery', category: 'tech', description: 'Data recovery and backup services', price: 4000, duration: 'per incident' },

  // Real Estate Services
  { id: 'real-estate-1', name: 'Property Valuation', category: 'real-estate', description: 'Professional property valuation services', price: 5000, duration: 'assessment' },
  { id: 'real-estate-2', name: 'Property Listing', category: 'real-estate', description: 'Property listing and marketing', price: 3000, duration: 'per listing' },
  { id: 'real-estate-3', name: 'Rental Management', category: 'real-estate', description: 'Property rental management services', price: 2500, duration: 'monthly' },

  // Finance Services
  { id: 'finance-1', name: 'Tax Preparation', category: 'finance', description: 'Professional tax preparation services', price: 4000, duration: 'per return' },
  { id: 'finance-2', name: 'Financial Advisory', category: 'finance', description: 'Personal financial advisory services', price: 3500, duration: '1 hour' },
  { id: 'finance-3', name: 'Investment Planning', category: 'finance', description: 'Investment portfolio planning', price: 5000, duration: 'consultation' },

  // Construction Services
  { id: 'construction-1', name: 'Home Renovation', category: 'construction', description: 'Home renovation and remodeling', price: 15000, duration: 'project' },
  { id: 'construction-2', name: 'Electrical Work', category: 'construction', description: 'Electrical installation and repair', price: 3000, duration: 'per job' },
  { id: 'construction-3', name: 'Plumbing Services', category: 'construction', description: 'Plumbing installation and repair', price: 2500, duration: 'per job' },

  // Automotive Services
  { id: 'auto-1', name: 'Car Repair', category: 'automotive', description: 'General automotive repair services', price: 5000, duration: 'per repair' },
  { id: 'auto-2', name: 'Oil Change', category: 'automotive', description: 'Engine oil change service', price: 1500, duration: '30 mins' },
  { id: 'auto-3', name: 'Car Detailing', category: 'automotive', description: 'Professional car detailing service', price: 3000, duration: '2 hours' },

  // Beauty & Wellness
  { id: 'beauty-1', name: 'Hair Styling', category: 'beauty', description: 'Professional hair styling services', price: 2000, duration: '1 hour' },
  { id: 'beauty-2', name: 'Facial Treatment', category: 'beauty', description: 'Facial and skincare treatments', price: 2500, duration: '1 hour' },
  { id: 'beauty-3', name: 'Massage Therapy', category: 'beauty', description: 'Relaxing massage therapy sessions', price: 3000, duration: '1 hour' },

  // Cleaning Services
  { id: 'cleaning-1', name: 'House Cleaning', category: 'cleaning', description: 'Professional house cleaning services', price: 2500, duration: 'per session' },
  { id: 'cleaning-2', name: 'Office Cleaning', category: 'cleaning', description: 'Commercial office cleaning', price: 3000, duration: 'per session' },
  { id: 'cleaning-3', name: 'Carpet Cleaning', category: 'cleaning', description: 'Deep carpet cleaning services', price: 2000, duration: 'per room' }
];

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
  const category = urlParts.find(part => part && part !== 'api' && part !== 'predefined_services' && !part.includes('?'));

  try {
    // Get predefined services by category
    if (method === 'GET' && category) {
      const categoryServices = predefinedServices.filter(s => s.category === category);
      return res.status(200).json({
        success: true,
        category,
        services: categoryServices,
        total: categoryServices.length
      });
    }

    // Get all predefined services
    if (method === 'GET' && !category) {
      return res.status(200).json({
        success: true,
        services: predefinedServices,
        total: predefinedServices.length
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Predefined services error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}