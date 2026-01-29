const https = require('https');
const http = require('http');

// API Keys from environment
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Legal sources list (same as in server.js)
const legalSources = [
  { title: "Legal Information Institute - Cornell Law", url: "https://www.law.cornell.edu/" },
  { title: "National Law Review", url: "https://www.natlawreview.com/" },
  { title: "FindLaw", url: "https://www.findlaw.com/" },
  { title: "LawHelp.org - Legal Aid", url: "https://www.lawhelp.org/" },
  { title: "State Bar Association", url: "https://www.americanbar.org/" },
  { title: "Nolo - Practical Legal Information", url: "https://www.nolo.com/" },
  { title: "JUSTIA - Free Legal Information", url: "https://www.justia.com/" },
  { title: "Avvo - Lawyer Directory", url: "https://www.avvo.com/" }
];

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

    // Try to generate comprehensive answer using AI or backend
    const answer = await generateComprehensiveAnswer(question, state);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(answer),
    };
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

// Generate comprehensive answer using AI APIs or backend
async function generateComprehensiveAnswer(question, state = 'Nigeria') {
  try {
    // Try Mistral API first (free, reliable)
    if (MISTRAL_API_KEY) {
      console.log('Using Mistral AI API');
      return await getMistralAnswer(question, state);
    }
    // Then try Groq API if available
    else if (GROQ_API_KEY) {
      console.log('Using Groq API');
      return await getGroqAnswer(question);
    }
    // Then try OpenAI if available
    else if (OPENAI_API_KEY) {
      console.log('Using OpenAI API');
      return await getOpenAIAnswer(question);
    }
    // Try calling backend server if available
    else {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      console.log(`Trying backend server at ${backendUrl}`);
      return await callBackendServer(backendUrl, question, state);
    }
  } catch (error) {
    console.error('Error generating comprehensive answer:', error.message);
    // Fallback to template answers
    return getDetailedAnswer(question, state);
  }
}

// Mistral AI integration
async function getMistralAnswer(question, state = 'Nigeria') {
  try {
    const stateInfo = state && state !== 'Nigeria' ? `\nThe user is asking from ${state} state in Nigeria.` : "\nThe user may be asking from any state in Nigeria.";
    
    const response = await fetchAPI('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: `You are a comprehensive legal information assistant. Provide detailed, accurate answers about legal matters, regulations, and general knowledge. Always provide answers in valid JSON format.

RESPONSE FORMAT (MUST be valid JSON):
{
  "answer": "Brief answer: Yes/No/It Depends/Consult Professional",
  "explanation": "2-3 paragraphs with comprehensive details and context",
  "actions": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5", "Action 6"],
  "sources": [
    {"title": "Full Resource Name", "url": "https://correct-url.com"},
    {"title": "Another Resource", "url": "https://another-correct-url.com"}
  ],
  "media": {
    "image_url": "URL or empty string",
    "image_caption": "Caption if image exists",
    "video_urls": [],
    "map_data": {
      "latitude": null,
      "longitude": null,
      "location_name": "",
      "zoom_level": null
    }
  }
}`
          },
          {
            role: 'user',
            content: `${question}${stateInfo}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      let content = data.choices[0].message.content;
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(content);
      if (!parsed.media) {
        parsed.media = {
          image_url: "",
          image_caption: "",
          video_urls: [],
          map_data: { latitude: null, longitude: null, location_name: "", zoom_level: null }
        };
      }
      
      return {
        question,
        ...parsed
      };
    }
  } catch (error) {
    console.error('Mistral API error:', error.message);
    throw error;
  }
}

// Groq API integration
async function getGroqAnswer(question) {
  try {
    const response = await fetchAPI('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gemma2-9b-it',
        messages: [
          {
            role: 'system',
            content: `You are a legal information assistant. Provide comprehensive answers in JSON format.

RESPONSE FORMAT (MUST be valid JSON):
{
  "answer": "Brief answer",
  "explanation": "Detailed explanation",
  "actions": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5", "Action 6"],
  "sources": [{"title": "Source", "url": "URL"}],
  "media": {"image_url": "", "image_caption": "", "video_urls": [], "map_data": {"latitude": null, "longitude": null, "location_name": "", "zoom_level": null}}
}`
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      const parsed = JSON.parse(data.choices[0].message.content);
      return { question, ...parsed };
    }
  } catch (error) {
    console.error('Groq API error:', error.message);
    throw error;
  }
}

// OpenAI integration
async function getOpenAIAnswer(question) {
  try {
    const response = await fetchAPI('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a legal information assistant. Provide comprehensive answers in JSON format with answer, explanation, actions array, sources array, and media object.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      const parsed = JSON.parse(data.choices[0].message.content);
      return { question, ...parsed };
    }
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    throw error;
  }
}

// Helper function for fetch
function fetchAPI(url, options) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers,
      timeout: 15000
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

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

// Fallback: Generate detailed answer based on question analysis
function getDetailedAnswer(question, state = 'Nigeria') {
  const lowerQuestion = question.toLowerCase();
  
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

  if (keywords.rent) {
    explanation = `Regarding rent matters: Rental laws vary significantly by jurisdiction. Generally, landlords must provide proper notice (typically 30-90 days) before any rent increases. Many states have rent control laws that limit the percentage of increase allowed. Rent must be reasonable and follow market standards. Your lease agreement governs the rental terms. Some protections include:\n
    
1. Right to peaceful enjoyment of the property
2. Protection against retaliatory rent increases
3. Requirement for proper notice before changes
4. Right to review and understand lease terms

Always check your specific state and local laws, as they vary widely.`;
    
    actions = [
      "Research your state's rent control laws and regulations",
      "Review your lease agreement for rent increase terms",
      "Document all communications with your landlord in writing",
      "Calculate proposed increases against legal limits",
      "Join a tenant union or contact local housing authority",
      "Consult with a tenant rights lawyer if needed"
    ];
    
    relevantSources = [
      { title: "Cornell Law - Landlord and Tenant Rights", url: "https://www.law.cornell.edu/wex/landlord_and_tenant" },
      { title: "Nolo - Rent Control and Increases", url: "https://www.nolo.com/legal-encyclopedia/rent-increase-laws-state" },
      { title: "National Low Income Housing Coalition", url: "https://nlihc.org/" },
      { title: "Tenant Union Directory", url: "https://www.dsausa.org/housing/" }
    ];
    answer = "It Depends";
  }
  else if (keywords.eviction) {
    explanation = `Regarding eviction: Landlords cannot evict tenants arbitrarily. They must have legal cause and follow proper legal procedures. You have rights including:\n
    
- Right to written notice (timing varies by state, typically 3-60 days)
- Right to appear in court and defend yourself
- Right to legal representation
- Protection against retaliatory eviction
- Right to proper service of notice

Illegal reasons for eviction include retaliation for reporting violations, exercising tenant rights, or discriminatory reasons.`;
    
    actions = [
      "Consult a tenant rights lawyer immediately if served notice",
      "Respond to eviction notice within required timeframe",
      "File counterclaim if eviction is retaliatory",
      "Document all landlord harassment or violations",
      "Attend court hearing and present your defense",
      "Contact legal aid organization in your area"
    ];
    
    relevantSources = [
      { title: "Cornell Law - Eviction", url: "https://www.law.cornell.edu/wex/eviction" },
      { title: "Nolo - Eviction Defense Guide", url: "https://www.nolo.com/legal-encyclopedia/eviction-notice-basics" },
      { title: "LawHelp - Free Legal Aid", url: "https://www.lawhelp.org/" },
      { title: "Legal Aid Organizations", url: "https://www.lawhelp.org/find-help" }
    ];
    answer = "No";
  }
  else if (keywords.deposit) {
    explanation = `Regarding security deposits: Most states have specific laws governing deposits. Generally:\n
    
- Deposits are limited to 1-2 months of rent
- Deposits must be returned within 30-60 days after move-out
- Landlords must provide itemized deductions
- Some states require interest payments on deposits
- Illegal deductions must be returned with interest
- Deposits are held in trust and cannot be used for landlord's expenses

Normal wear and tear is not deductible.`;
    
    actions = [
      "Request written receipt for deposit payment",
      "Take photos/video of property condition before moving in",
      "Document property condition in writing",
      "Perform final walk-through with landlord",
      "Request itemized list of deductions within timeframe",
      "Sue in small claims court if deductions are unfair"
    ];
    
    relevantSources = [
      { title: "Nolo - Security Deposit Laws", url: "https://www.nolo.com/legal-encyclopedia/security-deposits" },
      { title: "FindLaw - Tenant Rights", url: "https://www.findlaw.com/consumer/housing/landlord-tenant-law.html" },
      { title: "State-Specific Tenant Rights", url: "https://www.apartmenttherapy.com/tenant-rights-by-state-368896" }
    ];
    answer = "State-Dependent";
  }
  else if (keywords.discrimination) {
    explanation = `Regarding housing discrimination: Federal Fair Housing Act prohibits discrimination based on:\n
    
- Race or color
- National origin
- Religion
- Sex (including gender identity and sexual orientation)
- Disability
- Familial status (families with children)

Discrimination is illegal in all housing-related decisions including renting, financing, insuring, and selling.`;
    
    actions = [
      "Document all instances of discriminatory behavior",
      "File a complaint with HUD within one year",
      "Keep records of all communications",
      "Gather witness statements",
      "Consult with a fair housing attorney",
      "Report to state attorney general if applicable"
    ];
    
    relevantSources = [
      { title: "HUD - Fair Housing", url: "https://www.hud.gov/fairhousing" },
      { title: "Fair Housing Center Network", url: "https://www.fhaction.org/" },
      { title: "Department of Justice - Fair Housing", url: "https://www.justice.gov/crt/fair-housing" },
      { title: "NAACP Legal Defense Fund", url: "https://www.naacpldf.org/" }
    ];
    answer = "No";
  }
  else {
    const stateInfo = state && state !== "Nigeria" ? ` (in ${state} state)` : "";
    explanation = `Regarding your question about "${question}"${stateInfo}: Every legal situation is unique and depends on several factors including your location, specific circumstances, and applicable laws. Legal matters often have complex answers that depend on jurisdiction, contract terms, and individual facts.\n
    
Key steps to get accurate information:
1. Identify your jurisdiction (state, city)
2. Research applicable laws for your area
3. Review any written agreements or contracts
4. Consider consulting with a legal professional
5. Explore legal aid if cost is a concern`;

    actions = [
      "Identify the relevant jurisdiction for your question",
      `Search for state-specific laws and regulations${stateInfo}`,
      "Review any contracts or written agreements",
      "Consult with a qualified attorney in your area",
      "Contact legal aid organizations for free/low-cost help",
      "Document everything in writing"
    ];

    relevantSources = legalSources.slice(0, 5);
    answer = "Consult Legal Professional";
  }

  return {
    question,
    answer,
    explanation,
    actions,
    sources: relevantSources,
    media: {
      image_url: "",
      image_caption: "",
      video_urls: [],
      map_data: {
        latitude: null,
        longitude: null,
        location_name: "",
        zoom_level: null
      }
    }
  };
}
