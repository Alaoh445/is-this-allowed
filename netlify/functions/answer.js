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

    console.log(`[Handler] Processing question: "${question}" for state: "${state}"`);
    console.log(`[Handler] Available API Keys: Mistral=${!!MISTRAL_API_KEY}, Groq=${!!GROQ_API_KEY}, OpenAI=${!!OPENAI_API_KEY}`);

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
    console.error('[Handler] Function error:', error);
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
      console.log('[generateComprehensiveAnswer] Attempting to use Mistral AI API');
      const answer = await getMistralAnswer(question, state);
      console.log('[generateComprehensiveAnswer] Successfully got answer from Mistral');
      return answer;
    }
    // Then try Groq API if available
    else if (GROQ_API_KEY) {
      console.log('[generateComprehensiveAnswer] Attempting to use Groq API');
      const answer = await getGroqAnswer(question);
      console.log('[generateComprehensiveAnswer] Successfully got answer from Groq');
      return answer;
    }
    // Then try OpenAI if available
    else if (OPENAI_API_KEY) {
      console.log('[generateComprehensiveAnswer] Attempting to use OpenAI API');
      const answer = await getOpenAIAnswer(question);
      console.log('[generateComprehensiveAnswer] Successfully got answer from OpenAI');
      return answer;
    }
    // Try calling backend server if available
    else {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      console.log(`[generateComprehensiveAnswer] Attempting to call backend server at ${backendUrl}`);
      try {
        const answer = await callBackendServer(backendUrl, question, state);
        console.log('[generateComprehensiveAnswer] Successfully got answer from backend server');
        return answer;
      } catch (backendError) {
        console.error('[generateComprehensiveAnswer] Backend server error:', backendError.message);
        throw backendError;
      }
    }
  } catch (error) {
    console.error('[generateComprehensiveAnswer] Error:', error.message);
    console.log('[generateComprehensiveAnswer] Falling back to template answers');
    // Fallback to template answers
    return getDetailedAnswer(question, state);
  }
}

// Mistral AI integration using native fetch
async function getMistralAnswer(question, state = 'Nigeria') {
  try {
    const stateInfo = state && state !== 'Nigeria' ? `\nThe user is asking from ${state} state in Nigeria.` : "\nThe user may be asking from any state in Nigeria.";
    
    console.log('[getMistralAnswer] Sending request to Mistral API');
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
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

    console.log(`[getMistralAnswer] Response status: ${response.status}`);
    if (!response.ok) {
      const errorData = await response.text();
      console.error('[getMistralAnswer] Error response:', response.status, errorData);
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      let content = data.choices[0].message.content;
      console.log('[getMistralAnswer] Received content, parsing JSON');
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
      
      console.log('[getMistralAnswer] Successfully parsed and returning answer');
      return {
        question,
        ...parsed
      };
    }
    throw new Error('No valid response from Mistral API');
  } catch (error) {
    console.error('[getMistralAnswer] Error:', error.message);
    throw error;
  }
}

// Groq API integration using native fetch
async function getGroqAnswer(question) {
  try {
    console.log('[getGroqAnswer] Sending request to Groq API');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
  "explanation": "Detailed explanation with comprehensive information",
  "actions": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5", "Action 6"],
  "sources": [{"title": "Source Name", "url": "https://url.com"}],
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

    console.log(`[getGroqAnswer] Response status: ${response.status}`);
    if (!response.ok) {
      const errorData = await response.text();
      console.error('[getGroqAnswer] Error response:', response.status, errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      const parsed = JSON.parse(data.choices[0].message.content);
      console.log('[getGroqAnswer] Successfully parsed and returning answer');
      return { question, ...parsed };
    }
    throw new Error('No valid response from Groq API');
  } catch (error) {
    console.error('[getGroqAnswer] Error:', error.message);
    throw error;
  }
}

// OpenAI integration using native fetch
async function getOpenAIAnswer(question) {
  try {
    console.log('[getOpenAIAnswer] Sending request to OpenAI API');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

    console.log(`[getOpenAIAnswer] Response status: ${response.status}`);
    if (!response.ok) {
      const errorData = await response.text();
      console.error('[getOpenAIAnswer] Error response:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      const parsed = JSON.parse(data.choices[0].message.content);
      console.log('[getOpenAIAnswer] Successfully parsed and returning answer');
      return { question, ...parsed };
    }
    throw new Error('No valid response from OpenAI API');
  } catch (error) {
    console.error('[getOpenAIAnswer] Error:', error.message);
    throw error;
  }
}

// Call backend server
async function callBackendServer(baseUrl, question, state) {
  try {
    console.log('[callBackendServer] Sending request to backend');
    const response = await fetch(`${baseUrl}/api/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, state })
    });

    console.log(`[callBackendServer] Response status: ${response.status}`);
    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('[callBackendServer] Successfully retrieved answer from backend');
    return data;
  } catch (error) {
    console.error('[callBackendServer] Error:', error.message);
    throw error;
  }
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
