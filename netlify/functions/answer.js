const https = require('https');
const http = require('http');

exports.handler = async (event, context) => {
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ok: true }),
    };
  }

  try {
    // Parse the incoming request
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
    const { question, state = 'Nigeria' } = body;

    if (!question) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Question is required' }),
      };
    }

    // Try to call backend server if available
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    try {
      const answer = await callBackendServer(backendUrl, question, state);
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answer),
      };
    } catch (backendError) {
      console.error('Backend error:', backendError.message);
      
      // Fall back to local answer generation using template-based answers
      const answer = generateDetailedAnswer(question, state);
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answer),
      };
    }
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};

function callBackendServer(baseUrl, question, state) {
  return new Promise((resolve, reject) => {
    const protocol = baseUrl.startsWith('https') ? https : http;
    const url = new URL('/api/answer', baseUrl);
    
    const data = JSON.stringify({ question, state });
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
      timeout: 5000,
    };

    const req = protocol.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            reject(new Error('Invalid JSON response from backend'));
          }
        } else {
          reject(new Error(`Backend returned status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Backend server timeout'));
    });

    req.write(data);
    req.end();
  });
}

// Generate detailed answer based on question keywords (fallback template-based system)
function generateDetailedAnswer(question, state = 'Nigeria') {
  const lowerQuestion = question.toLowerCase();
  
  // Analyze question keywords
  const keywords = {
    rent: lowerQuestion.includes('rent'),
    eviction: lowerQuestion.includes('eviction') || lowerQuestion.includes('evict'),
    deposit: lowerQuestion.includes('deposit') || lowerQuestion.includes('security'),
    discrimination: lowerQuestion.includes('discriminat'),
    lease: lowerQuestion.includes('lease'),
    inspection: lowerQuestion.includes('inspect'),
    repair: lowerQuestion.includes('repair') || lowerQuestion.includes('maintain'),
    neighbor: lowerQuestion.includes('neighbor'),
    noise: lowerQuestion.includes('noise'),
    utility: lowerQuestion.includes('utility') || lowerQuestion.includes('water') || lowerQuestion.includes('electric')
  };

  let explanation = '';
  let actions = [];
  let relevantSources = [];
  let answer = 'It Depends';

  // RENT related
  if (keywords.rent) {
    explanation = `Regarding rent matters in Nigeria: Rental laws vary by state and local regulations. Generally, landlords must provide proper notice before any rent increases. Key points include:\n\n1. Right to peaceful enjoyment of the property\n2. Protection against arbitrary rent increases\n3. Requirement for proper written notice before changes (typically 30 days or more)\n4. Lease agreements must be honored\n5. Deposits must be held in trust\n6. Eviction procedures must be followed legally\n\nAlways check your specific state regulations and ensure any rental agreement is in writing.`;
    
    actions = [
      'Research your state\'s specific rent control and tenancy laws',
      'Review your lease agreement carefully for rent increase terms',
      'Keep all communications with your landlord in writing',
      'Document all payments and receipts',
      'Calculate proposed increases against legal limits in your state',
      'Contact your state housing authority or tenant rights organization if needed'
    ];
    
    relevantSources = [
      { title: 'Cornell Law - Landlord and Tenant Rights', url: 'https://www.law.cornell.edu/wex/landlord_and_tenant' },
      { title: 'Nolo - Rent Control and Increase Laws', url: 'https://www.nolo.com/legal-encyclopedia/rent-increase-laws-state' },
      { title: 'National Low Income Housing Coalition', url: 'https://nlihc.org/' },
      { title: 'FindLaw - Tenant Rights', url: 'https://www.findlaw.com/consumer/housing/' }
    ];
    answer = 'It Depends';
  }
  // EVICTION related
  else if (keywords.eviction) {
    explanation = `Regarding eviction: Landlords cannot evict tenants without legal cause and proper procedures. You have important rights:\n\n- Right to written notice with specific timeframe (varies by state)\n- Right to appear in court and defend yourself\n- Right to legal representation\n- Protection against retaliatory eviction\n- Right to proper service of legal notice\n\nIllegal reasons for eviction include retaliation for reporting violations, exercising tenant rights, or discriminatory reasons.`;
    
    actions = [
      'Consult a tenant rights lawyer immediately if served with eviction notice',
      'Respond to eviction notice within the required timeframe',
      'File a counterclaim if eviction is retaliatory',
      'Document all landlord harassment or property violations',
      'Attend the court hearing and present your defense',
      'Contact your local legal aid organization for free help'
    ];
    
    relevantSources = [
      { title: 'Cornell Law - Eviction', url: 'https://www.law.cornell.edu/wex/eviction' },
      { title: 'Nolo - Eviction Defense Guide', url: 'https://www.nolo.com/legal-encyclopedia/eviction-notice-basics' },
      { title: 'LawHelp - Free Legal Aid', url: 'https://www.lawhelp.org/' },
      { title: 'Legal Services Corporation', url: 'https://www.lsc.gov/' }
    ];
    answer = 'No';
  }
  // SECURITY DEPOSIT related
  else if (keywords.deposit) {
    explanation = `Regarding security deposits: Most jurisdictions have specific laws governing deposits. Generally:\n\n- Deposits are typically limited to 1-2 months of rent\n- Deposits must be returned within 30-60 days after move-out\n- Landlords must provide itemized deductions for legitimate expenses\n- Normal wear and tear is not deductible\n- Some jurisdictions require interest payments on deposits\n- Illegal deductions must be returned with penalties\n\nDeposits are held in trust and cannot be used for landlord's operating expenses.`;
    
    actions = [
      'Request a written receipt for deposit payment',
      'Take photos and video of property condition before moving in',
      'Document all property conditions in writing at move-in',
      'Perform a thorough final walk-through with landlord',
      'Request itemized list of deductions within legal timeframe',
      'Sue in small claims court if deductions are unfair or illegal'
    ];
    
    relevantSources = [
      { title: 'Nolo - Security Deposit Laws by State', url: 'https://www.nolo.com/legal-encyclopedia/security-deposits' },
      { title: 'FindLaw - Tenant Rights and Responsibilities', url: 'https://www.findlaw.com/consumer/housing/landlord-tenant-law.html' },
      { title: 'Apartment Therapy - Tenant Rights Guide', url: 'https://www.apartmenttherapy.com/' }
    ];
    answer = 'State-Dependent';
  }
  // DISCRIMINATION related
  else if (keywords.discrimination) {
    explanation = `Regarding housing discrimination: Fair housing laws prohibit discrimination based on:\n\n- Race or color\n- National origin\n- Religion\n- Sex (including gender identity and sexual orientation)\n- Disability\n- Familial status (families with children)\n- Age in some jurisdictions\n\nDiscrimination is illegal in all housing decisions including renting, financing, insuring, and selling properties.`;
    
    actions = [
      'Document all instances of discriminatory behavior with dates and details',
      'File a complaint with the relevant fair housing agency',
      'Keep records of all written communications',
      'Gather witness statements from others who can corroborate',
      'Consult with a fair housing attorney',
      'Report to your state attorney general if applicable'
    ];
    
    relevantSources = [
      { title: 'HUD - Fair Housing Information', url: 'https://www.hud.gov/fairhousing' },
      { title: 'Fair Housing Center Network', url: 'https://www.fhaction.org/' },
      { title: 'Department of Justice - Fair Housing', url: 'https://www.justice.gov/crt/fair-housing' },
      { title: 'NAACP Legal Defense Fund', url: 'https://www.naacpldf.org/' }
    ];
    answer = 'No';
  }
  // Default comprehensive answer
  else {
    const stateInfo = state && state !== 'Nigeria' ? ` in ${state} state` : '';
    explanation = `Regarding your question about "${question}"${stateInfo}:\n\nEvery legal and informational situation is unique and depends on several factors including your location, specific circumstances, and applicable laws and regulations.\n\nKey steps to get accurate information:\n1. Identify the relevant jurisdiction and applicable laws\n2. Review any contracts or written agreements\n3. Research state and local regulations\n4. Consult with a qualified professional in that field\n5. Document everything in writing\n6. Explore free resources and legal aid if needed`;

    actions = [
      'Identify the relevant jurisdiction for your specific question',
      'Search for applicable laws and regulations for your location',
      'Review any contracts, agreements, or relevant documents',
      'Consult with a qualified professional or attorney',
      'Contact legal aid or professional organizations for assistance',
      'Document all relevant information and communications'
    ];

    relevantSources = [
      { title: 'Legal Information Institute - Cornell Law', url: 'https://www.law.cornell.edu/' },
      { title: 'National Law Review', url: 'https://www.natlawreview.com/' },
      { title: 'FindLaw - Legal Information', url: 'https://www.findlaw.com/' },
      { title: 'LawHelp.org - Legal Aid', url: 'https://www.lawhelp.org/' }
    ];
    answer = 'Consult Professional';
  }

  return {
    question,
    answer,
    explanation,
    actions,
    sources: relevantSources,
    media: {
      image_url: '',
      image_caption: '',
      video_urls: [],
      map_data: {
        latitude: null,
        longitude: null,
        location_name: '',
        zoom_level: null
      }
    }
  };
}
