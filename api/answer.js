import fetch from 'node-fetch';

const env = process.env;
const MISTRAL_API_KEY = env.MISTRAL_API_KEY || env.VITE_MISTRAL_API_KEY || 'V2RyZVaQfIZtScgZXizx8VtjUj34wDlB';
const GROQ_API_KEY = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || '';
const OPENAI_API_KEY = env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY || '';

console.log('Vercel AI Configuration:', {
  mistral: MISTRAL_API_KEY ? MISTRAL_API_KEY.substring(0, 8) + '...' : 'NOT SET',
  groq: !!GROQ_API_KEY,
  openai: !!OPENAI_API_KEY,
  node_env: env.NODE_ENV,
  vercel_env: env.VERCEL_ENV || 'not detected'
});

export default async function handler(req, res) {
  // Set comprehensive CORS headers FIRST
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, state = 'Nigeria' } = req.body || {};

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log(`Processing question: "${question}" for state: "${state}"`);

    // Generate comprehensive answer using AI APIs
    const answer = await generateComprehensiveAnswer(question.trim(), state);

    res.status(200).json(answer);

  } catch (error) {
    console.error('Error processing request:', error);
    const message = error && typeof error === 'object' && error.message ? error.message : String(error);
    res.status(500).json({
      error: 'Internal server error',
      message
    });
  }
}

// Main function to generate comprehensive answers
async function generateComprehensiveAnswer(question, state = "Nigeria") {
  try {
    // Try Mistral API first (free, reliable)
    if (MISTRAL_API_KEY && MISTRAL_API_KEY.trim()) {
      return await getMistralAnswer(question, state);
    }
    // Then try Groq API if available
    else if (GROQ_API_KEY && GROQ_API_KEY.trim()) {
      return await getGroqAnswer(question, state);
    }
    // Then try OpenAI if available
    else if (OPENAI_API_KEY && OPENAI_API_KEY.trim()) {
      return await getOpenAIAnswer(question, state);
    }
    // Fallback to template answers if no API keys
    else {
      console.log("No API keys available, using template answers");
      return getDetailedAnswer(question, state);
    }
  } catch (error) {
    console.error("Error generating answer:", error);
    return getDetailedAnswer(question, state);
  }
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
        model: 'mistral-small',
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

MEDIA GUIDELINES:
- MAPS: Only show maps for location-specific questions like "where is Lagos?", "directions to Abuja", "map of Nigeria". DO NOT show maps for general questions like "rent in Lagos", "laws in Nigeria", "education in Abuja".
- IMAGES: For questions about objects, places, concepts, or general topics, provide relevant images instead of maps. Use high-quality images from Unsplash, Pexels, or Wikipedia.
- VIDEOS: ALWAYS provide 1-2 relevant YouTube videos for educational, how-to, tutorial, or visual content questions. Include working YouTube URLs with descriptive titles and brief descriptions.

RESPONSE FORMAT (return as valid JSON only):
{
  "answer": "Brief direct answer or summary (max 50 words)",
  "explanation": "2-3 paragraphs with comprehensive details, examples, and context. Format for mobile readability with clear headings and short paragraphs. Use simple language.",
  "actions": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5", "Action 6"],
  "sources": [
    {"title": "Full Resource Name", "url": "https://correct-url.com"},
    {"title": "Another Resource", "url": "https://another-correct-url.com"}
  ],
  "media": {
    "image_url": "URL to relevant image or empty string - use Unsplash, Pexels, or Wikipedia images",
    "image_caption": "Caption for the image if image_url exists",
    "video_urls": [
      {
        "url": "https://www.youtube.com/watch?v=VALID_VIDEO_ID",
        "title": "Clear, descriptive title of the video content",
        "description": "2-3 sentence description of the video's relevance and content"
      }
    ],
    "map_data": {
      "latitude": number or null,
      "longitude": number or null,
      "location_name": "Name of location or empty string",
      "zoom_level": number between 1-20 or null
    }
  }
}

VIDEO REQUIREMENTS:
- ONLY include valid, active YouTube links in the video_urls array
- Each video MUST have a non-empty "title" and "description"
- Titles should be descriptive and match the actual video content
- Descriptions should explain why the video is relevant to the question
- Include 1-3 relevant videos when applicable
- If you cannot find valid videos, return an empty video_urls array

For Nigerian topics, include videos in both English and local languages when possible.

For Nigerian locations like Osun, Lagos, etc., provide latitude/longitude.
All URLs must be real and correct. Be thorough, accurate, and helpful.
IMPORTANT: Return ONLY valid JSON, no markdown code blocks or extra text.`
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

      console.log("Raw AI response content:", content);

      try {
        const parsed = JSON.parse(content);
        // Ensure media object exists with proper defaults
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

        // Ensure video_urls is an array of objects with proper structure
        if (parsed.media.video_urls && !Array.isArray(parsed.media.video_urls)) {
          parsed.media.video_urls = [];
        }

        // Validate and convert video URLs
        if (parsed.media.video_urls && parsed.media.video_urls.length > 0) {
          console.log("Processing video URLs:", parsed.media.video_urls);
          parsed.media.video_urls = parsed.media.video_urls
            .map(video => {
              if (typeof video === 'string') {
                // Extract video ID and validate
                const match = video.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
                if (!match || !match[1]) {
                  console.warn("Invalid YouTube URL:", video);
                  return null;
                }
                return {
                  url: video,
                  title: "Related Video",
                  description: "Educational content related to your question"
                };
              }
              // Validate object format
              if (typeof video === 'object' && video.url) {
                const match = video.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
                if (!match || !match[1]) {
                  console.warn("Invalid YouTube URL in object:", video.url);
                  return null;
                }
                return {
                  url: video.url,
                  title: video.title || "Related Video",
                  description: video.description || "Educational content related to your question"
                };
              }
              return null;
            })
            .filter(v => v !== null); // Remove invalid videos
          console.log("Processed video URLs:", parsed.media.video_urls);
        }

        console.log("Final parsed object:", JSON.stringify(parsed, null, 2));

        return {
          question,
          ...parsed
        };
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.log("Falling back to template answer due to parse error");
        return getDetailedAnswer(question, state);
      }
    }

    console.log("Mistral response did not contain valid choices, falling back to template answer");
  } catch (error) {
    console.error("Mistral API error:", error.message);
    console.log("Falling back to template answers");
  }

  // Fallback with better video data
  return getDetailedAnswer(question, state);
}

// Helper function to get verified YouTube videos for common topics
function getRelevantYouTubeVideos(question) {
  const lowerQuestion = question.toLowerCase();
  
  const topicVideos = {
    rent: [
      {
        url: "https://www.youtube.com/watch?v=pYXH0rXLX8s",
        title: "Tenant Rights: What Landlords Cannot Do",
        description: "Learn about your rights as a tenant and what landlords are legally prohibited from doing."
      },
      {
        url: "https://www.youtube.com/watch?v=vDI5gOFO5rY",
        title: "How to Handle Unfair Rent Increases",
        description: "Guide on how to respond to unreasonable rent increases and know your legal protections."
      }
    ],
    eviction: [
      {
        url: "https://www.youtube.com/watch?v=HrP3BKc8Jvo",
        title: "Eviction Process and Your Rights",
        description: "Understanding the eviction process and your legal rights during an eviction notice."
      }
    ],
    lease: [
      {
        url: "https://www.youtube.com/watch?v=rXBnnN9hJ6o",
        title: "What to Know Before Signing a Lease",
        description: "Essential information about lease agreements and what to look for before you sign."
      }
    ],
    deposit: [
      {
        url: "https://www.youtube.com/watch?v=GZcgPBGMKNU",
        title: "Security Deposit Laws and Your Rights",
        description: "Understand your rights regarding security deposits and how to protect your money."
      }
    ]
  };
  
  for (const [topic, videos] of Object.entries(topicVideos)) {
    if (lowerQuestion.includes(topic)) {
      return videos;
    }
  }
  
  return [];
}


// Groq API integration (free alternative - no card required)
async function getGroqAnswer(question, state) {
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

    console.log("Groq response did not contain valid choices, falling back to template answer");
  } catch (error) {
    console.error("Groq API error:", error.message);
    console.log("Falling back to template answers");
  }

  // Fallback to detailed answer if Groq fails
  return getDetailedAnswer(question, state);
}

// OpenAI integration (optional, if API key is provided)
async function getOpenAIAnswer(question, state) {
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

    console.log("OpenAI response did not contain valid choices, falling back to template answer");
  } catch (error) {
    console.error("OpenAI API error:", error.message);
  }

  // Fallback to detailed answer if API fails
  return getDetailedAnswer(question, state);
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
      "Consult with a local legal aid organization"
    ];

    relevantSources = [
      { title: "National Housing Law Project", url: "https://www.nhlp.org/" },
      { title: "HUD Rental Assistance", url: "https://www.hud.gov/states" },
      { title: "Legal Aid Society", url: "https://www.lsc.gov/" }
    ];
    answer = "It Depends";
  }

  // EVICTION related
  else if (keywords.eviction) {
    explanation = `Regarding eviction matters: Eviction laws are complex and vary by state and local jurisdiction. Generally, landlords must have "just cause" for eviction and provide proper notice (typically 30 days). Common just causes include non-payment of rent, lease violations, or illegal activities. However, many states have additional protections for tenants, especially during economic hardship or health crises.\\n

Key protections include:
1. Right to written notice with specific reasons
2. Opportunity to cure the violation if possible
3. Right to court hearing before eviction
4. Protection against retaliatory eviction
5. Right to counsel in many jurisdictions`;

    actions = [
      "Review your lease agreement for eviction terms",
      "Document all communications with your landlord",
      "Research your state's specific eviction laws",
      "Contact local tenant rights organization",
      "Prepare for court hearing if served with eviction notice",
      "Seek legal aid if you cannot afford an attorney"
    ];

    relevantSources = [
      { title: "National Alliance of Tenants", url: "https://www.tenantsunion.org/" },
      { title: "Legal Aid Justice Center", url: "https://www.justicecenter.org/" },
      { title: "State Bar Association", url: "https://www.americanbar.org/" }
    ];
    answer = "It Depends";
  }

  // SECURITY DEPOSIT related
  else if (keywords.deposit) {
    explanation = `Regarding security deposits: Security deposits are typically limited to 1-2 months' rent and must be returned within 30-60 days after lease termination. Landlords can only deduct for actual damages beyond normal wear and tear. Many states require landlords to provide written explanation of any deductions and return remaining funds promptly.\\n

Key requirements:
1. Deposit amount cannot exceed legal limits
2. Must be held in interest-bearing account in some states
3. Written inventory of condition required at move-in
4. Prompt return with detailed explanation of deductions
5. Right to sue for withheld deposits`;

    actions = [
      "Document property condition with photos at move-in/move-out",
      "Request written inventory of damages before moving in",
      "Keep receipts for any repairs you make",
      "Send written demand for deposit return if not received",
      "File small claims court action if deposit is wrongfully withheld",
      "Contact local consumer protection agency"
    ];

    relevantSources = [
      { title: "Consumer Financial Protection Bureau", url: "https://www.consumerfinance.gov/" },
      { title: "State Attorney General Office", url: "https://www.naag.org/" },
      { title: "Better Business Bureau", url: "https://www.bbb.org/" }
    ];
    answer = "It Depends";
  }

  // DISCRIMINATION related
  else if (keywords.discrimination) {
    explanation = `Regarding housing discrimination: Federal and state laws prohibit discrimination based on race, color, religion, national origin, sex, familial status, or disability. Landlords cannot discriminate in advertising, application process, or terms of tenancy. Fair Housing Act violations can result in significant penalties.\\n

Protected classes include:
1. Race, color, national origin, religion
2. Sex, gender identity, sexual orientation
3. Familial status (families with children)
4. Disability (physical or mental)
5. Age (in some jurisdictions)`;

    actions = [
      "Document all discriminatory statements or actions",
      "File complaint with HUD within 1 year",
      "Contact local fair housing organization",
      "Keep records of all communications",
      "Seek legal counsel specializing in housing discrimination",
      "Join fair housing advocacy groups"
    ];

    relevantSources = [
      { title: "HUD Fair Housing", url: "https://www.hud.gov/states" },
      { title: "National Fair Housing Alliance", url: "https://www.nationalfairhousing.org/" },
      { title: "ACLU Housing Rights", url: "https://www.aclu.org/issues/housing" }
    ];
    answer = "No";
  }

  // REPAIRS AND MAINTENANCE related
  else if (keywords.repair) {
    explanation = `Regarding repairs and maintenance: Landlords must maintain habitable premises, including structural components, plumbing, heating, and essential systems. Many states have specific requirements for response times to repair requests. Tenants may have rights to repair and deduct, withhold rent, or terminate lease for failure to repair serious habitability issues.\\n

Habitability requirements typically include:
1. Safe and functional plumbing
2. Adequate heating and ventilation
3. Structural stability
4. Working locks and security features
5. Clean and sanitary common areas`;

    actions = [
      "Document repair requests in writing with photos",
      "Keep records of all communications with landlord",
      "Check local building codes for habitability standards",
      "Contact local code enforcement if repairs not made",
      "Consider repair and deduct if allowed in your state",
      "Consult with local tenant rights organization"
    ];

    relevantSources = [
      { title: "National Center for Healthy Housing", url: "https://www.nchh.org/" },
      { title: "Local Building Department", url: "https://www.hud.gov/states" },
      { title: "State Health Department", url: "https://www.cdc.gov/" }
    ];
    answer = "It Depends";
  }

  // NOISE and NEIGHBOR issues
  else if (keywords.noise || keywords.neighbor) {
    explanation = `Regarding noise and neighbor disputes: Most leases require "quiet enjoyment" of the property. Excessive noise can violate lease terms and local ordinances. Many cities have noise ordinances with specific decibel limits and time restrictions. Mediation is often the best first step before involving authorities.\\n

Common approaches:
1. Direct communication with neighbor
2. Mediation through landlord or community center
3. Documentation of noise incidents
4. Police reports for excessive disturbances
5. Small claims court for ongoing issues`;

    actions = [
      "Document noise incidents with dates, times, and descriptions",
      "Attempt direct communication with neighbor first",
      "Contact landlord if lease violation suspected",
      "File police reports for serious disturbances",
      "Contact local mediation services",
      "Check local noise ordinances"
    ];

    relevantSources = [
      { title: "Local Police Department", url: "https://www.police.gov/" },
      { title: "Community Mediation Services", url: "https://www.mediate.com/" },
      { title: "Local Municipal Code", url: "https://www.municode.com/" }
    ];
    answer = "It Depends";
  }

  // UTILITIES related
  else if (keywords.utility) {
    explanation = `Regarding utility matters: Responsibility for utilities depends on lease terms. If utilities are included in rent, landlord must ensure they are working properly. If tenant pays utilities, landlord must allow reasonable access for repairs. Utility shutoffs for non-payment may be prohibited during certain times or for vulnerable tenants.\\n

Key considerations:
1. Clear lease terms about utility responsibility
2. Landlord access requirements for repairs
3. Protection against utility shutoffs
4. Energy efficiency requirements
5. Submetering regulations`;

    actions = [
      "Review lease for utility responsibility terms",
      "Document utility account information",
      "Report utility issues to landlord immediately",
      "Contact utility company directly if tenant responsible",
      "Check for energy assistance programs",
      "Monitor utility usage for billing disputes"
    ];

    relevantSources = [
      { title: "Department of Energy", url: "https://www.energy.gov/" },
      { title: "Utility Consumer Services", url: "https://www.utilityconsumer.org/" },
      { title: "Local Utility Company", url: "https://www.utility.org/" }
    ];
    answer = "It Depends";
  }

  // LEASE related
  else if (keywords.lease) {
    explanation = `Regarding lease agreements: Leases are legally binding contracts that outline rights and responsibilities of both parties. Key terms include rent amount, duration, renewal conditions, and termination procedures. Many states have specific requirements for lease content and formatting. Oral agreements may be enforceable but written leases are strongly recommended.\\n

Important lease provisions:
1. Clear identification of parties and property
2. Specific rent amount and payment terms
3. Duration and renewal conditions
4. Maintenance responsibilities
5. Termination procedures and notice requirements`;

    actions = [
      "Read lease carefully before signing",
      "Negotiate unclear or unfavorable terms",
      "Get all agreements in writing",
      "Keep copy of signed lease and all amendments",
      "Document any verbal agreements separately",
      "Consult attorney for complex lease terms"
    ];

    relevantSources = [
      { title: "Nolo Legal Encyclopedia", url: "https://www.nolo.com/" },
      { title: "State Real Estate Commission", url: "https://www.arello.org/" },
      { title: "Consumer Protection Agency", url: "https://www.ftc.gov/" }
    ];
    answer = "It Depends";
  }

  // INSPECTION related
  else if (keywords.inspection) {
    explanation = `Regarding property inspections: Landlords typically have right to inspect property with proper notice (usually 24-48 hours). Inspections must be reasonable and not harassing. Move-in and move-out inspections are common to document condition. Tenants have right to be present during inspections and receive written reports of findings.\\n

Inspection guidelines:
1. Reasonable notice required (typically 24 hours)
2. Must be at reasonable times
3. Tenant right to be present
4. Written reports of findings
5. Protection against excessive or harassing inspections`;

    actions = [
      "Request written notice for all inspections",
      "Be present during inspections when possible",
      "Document property condition with photos",
      "Request written inspection reports",
      "Contact authorities if inspections are harassing",
      "Keep records of all inspection communications"
    ];

    relevantSources = [
      { title: "HUD Property Inspection", url: "https://www.hud.gov/states" },
      { title: "Local Housing Authority", url: "https://www.hud.gov/states" },
      { title: "State Landlord-Tenant Laws", url: "https://www.law.cornell.edu/" }
    ];
    answer = "It Depends";
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

    relevantSources = [
      { title: "Cornell Legal Information Institute", url: "https://www.law.cornell.edu/" },
      { title: "Legal Aid Society", url: "https://www.lsc.gov/" },
      { title: "State Bar Association", url: "https://www.americanbar.org/" }
    ];
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
      video_urls: getRelevantYouTubeVideos(question),
      map_data: {
        latitude: null,
        longitude: null,
        location_name: "",
        zoom_level: null
      }
    },
    timestamp: new Date().toISOString()
  };
}