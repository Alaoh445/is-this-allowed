import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// CORS configuration to handle mobile and cross-origin requests
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
};

app.use(cors(corsOptions));
app.use(express.json());

// Authoritative legal sources
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

// Function to generate comprehensive answer using AI-like approach
async function generateComprehensiveAnswer(question, state = "Nigeria") {
  try {
    // Try Mistral API first (free, reliable)
    if (MISTRAL_API_KEY) {
      return await getMistralAnswer(question, state);
    }
    // Then try Groq API if available
    else if (GROQ_API_KEY) {
      return await getGroqAnswer(question);
    }
    // Then try OpenAI if available
    else if (OPENAI_API_KEY) {
      return await getOpenAIAnswer(question);
    } 
    // Fallback to template answers
    else {
      return getDetailedAnswer(question, state);
    }
  } catch (error) {
    console.error("Error generating answer:", error);
    return getDetailedAnswer(question, state);
  }
}

// Fallback: Generate detailed answer based on question analysis
function getDetailedAnswer(question, state = "Nigeria") {
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

  let explanation = "";
  let actions = [];
  let relevantSources = [];
  let answer = "It Depends";

  // RENT related
  if (keywords.rent) {
    explanation = `Regarding rent matters: Rental laws vary significantly by jurisdiction. Generally, landlords must provide proper notice (typically 30-90 days) before any rent increases. Many states have rent control laws that limit the percentage of increase allowed. Rent must be reasonable and follow market standards. Your lease agreement governs the rental terms. Some protections include:\\n
    
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

  // EVICTION related
  else if (keywords.eviction) {
    explanation = `Regarding eviction: Landlords cannot evict tenants arbitrarily. They must have legal cause and follow proper legal procedures. You have rights including:\\n
    
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

  // SECURITY DEPOSIT related
  else if (keywords.deposit) {
    explanation = `Regarding security deposits: Most states have specific laws governing deposits. Generally:\\n
    
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

  // DISCRIMINATION related
  else if (keywords.discrimination) {
    explanation = `Regarding housing discrimination: Federal Fair Housing Act prohibits discrimination based on:\\n
    
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

  // Default comprehensive answer
  else {
    const stateInfo = state && state !== "Nigeria" ? ` (in ${state} state)` : "";
    explanation = `Regarding your question about "${question}"${stateInfo}: Every legal situation is unique and depends on several factors including your location, specific circumstances, and applicable laws. Legal matters often have complex answers that depend on jurisdiction, contract terms, and individual facts.\\n
    
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

// Mistral AI integration (free tier - no card required)
async function getMistralAnswer(question, state = "Nigeria") {
  try {
    console.log("Using Mistral AI API (free)");
    
    const stateInfo = state && state !== "Nigeria" ? `\nThe user is asking from ${state} state in Nigeria.` : "\nThe user may be asking from any state in Nigeria.";
    
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
            content: `You are a comprehensive knowledge assistant that provides detailed, accurate, and well-researched responses to ANY question - legal matters, general knowledge, current events, advice, history, science, technology, geography, and more. Provide rich multimedia information like Wikipedia and Google do.

IMPORTANT GUIDELINES:
1. Provide BROAD and COMPREHENSIVE answers with detailed explanations
2. Include multiple perspectives when relevant
3. For questions about Nigerian locations/places: provide map coordinates and location details
4. For visual topics: suggest relevant image searches and video resources
5. Always cite REAL, AUTHORITATIVE sources with correct URLs
6. Include relevant media when applicable

RESPONSE FORMAT (return as valid JSON):
{
  "answer": "Brief direct answer or summary",
  "explanation": "2-3 paragraphs with comprehensive details, examples, and context",
  "actions": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5", "Action 6"],
  "sources": [
    {"title": "Full Resource Name", "url": "https://correct-url.com"},
    {"title": "Another Resource", "url": "https://another-correct-url.com"}
  ],
  "media": {
    "image_url": "URL to relevant image or empty string",
    "image_caption": "Caption for the image if image_url exists",
    "video_urls": ["YouTube or video URL 1", "YouTube or video URL 2"],
    "map_data": {
      "latitude": number or null,
      "longitude": number or null,
      "location_name": "Name of location or empty string",
      "zoom_level": number between 1-20 or null
    }
  }
}

For Nigerian locations like Osun, Lagos, etc., provide latitude/longitude.
All URLs must be real and correct. Be thorough, accurate, and helpful.`
          },
          {
            role: 'user',
            content: `${question}${stateInfo}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Mistral API error response:", error);
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Mistral response received successfully");
    
    if (data.choices && data.choices[0]) {
      let content = data.choices[0].message.content;
      
      // Remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(content);      
      // Ensure media object exists with defaults
      if (!parsed.media) {
        parsed.media = {
          image_url: "",
          image_caption: "",
          video_urls: [],
          map_data: {
            latitude: null,
            longitude: null,
            location_name: "",
            zoom_level: null
          }
        };
      }
            return {
        question,
        ...parsed
      };
    }
  } catch (error) {
    console.error("Mistral API error:", error.message);
    console.log("Falling back to template answers");
  }
  
  // Fallback to detailed answer if Mistral fails
  return getDetailedAnswer(question);
}

// Groq API integration (free alternative - no card required)
async function getGroqAnswer(question) {
  try {
    console.log("Using Groq API (free)");
    
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
            content: `You are a legal information assistant. Provide comprehensive answers about legal rights and regulations. Your response should be helpful but not constitute legal advice. Always recommend consulting with a lawyer for specific legal matters.

Format your response as JSON with these fields:
- answer: "Yes", "No", "It Depends", or "Consult Legal Professional"
- explanation: Detailed explanation (2-3 paragraphs)
- actions: Array of 5-6 recommended actions
- sources: Array of {title, url} for relevant legal resources`
          },
          {
            role: 'user',
            content: `Please provide legal information about: ${question}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Groq API error response:", error);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Groq response received successfully");
    
    if (data.choices && data.choices[0]) {
      const content = data.choices[0].message.content;
      const parsed = JSON.parse(content);
      return {
        question,
        ...parsed
      };
    }
  } catch (error) {
    console.error("Groq API error:", error.message);
    console.log("Falling back to template answers");
  }
  
  // Fallback to detailed answer if Groq fails
  return getDetailedAnswer(question);
}

// OpenAI integration (optional, if API key is provided)
async function getOpenAIAnswer(question) {
  try {
    console.log("Using OpenAI API with key:", OPENAI_API_KEY.substring(0, 10) + "...");
    
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
            content: `You are a legal information assistant. Provide comprehensive answers about legal rights and regulations. Your response should be helpful but not constitute legal advice. Always recommend consulting with a lawyer for specific legal matters.

Format your response as JSON with these fields:
- answer: "Yes", "No", "It Depends", or "Consult Legal Professional"
- explanation: Detailed explanation (2-3 paragraphs)
- actions: Array of 5-6 recommended actions
- sources: Array of {title, url} for relevant legal resources`
          },
          {
            role: 'user',
            content: `Please provide legal information about: ${question}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error response:", error);
      throw new Error(`OpenAI API error: ${response.status} - ${error.error?.message}`);
    }

    const data = await response.json();
    console.log("OpenAI response received");
    
    if (data.choices && data.choices[0]) {
      const content = data.choices[0].message.content;
      const parsed = JSON.parse(content);
      return {
        question,
        ...parsed
      };
    }
  } catch (error) {
    console.error("OpenAI API error:", error.message);
  }
  
  // Fallback to detailed answer if API fails
  return getDetailedAnswer(question);
}

// API endpoint to get answer
app.post('/api/answer', async (req, res) => {
  try {
    const { question, state } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ error: "Question is required" });
    }

    const answer = await generateComprehensiveAnswer(question.trim(), state || "Nigeria");
    
    res.json(answer);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to process question", details: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: "Server is running",
    port: PORT,
    apiKey: OPENAI_API_KEY ? "OpenAI API configured" : "Using local knowledge base"
  });
});

// Test endpoint to verify backend is working
app.get('/', (req, res) => {
  res.json({
    message: "Is This Allowed? - Backend API",
    endpoints: {
      health: "GET /api/health",
      answer: "POST /api/answer",
      docs: "This message"
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoint: http://localhost:${PORT}/api/answer`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  if (OPENAI_API_KEY && OPENAI_API_KEY !== 'demo-key') {
    console.log(`🤖 Using OpenAI API for intelligent answers`);
  } else {
    console.log(`📚 Using local knowledge base for answers`);
    console.log(`💡 To use OpenAI API, set OPENAI_API_KEY in .env file`);
  }
});
