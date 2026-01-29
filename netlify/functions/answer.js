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

    // Try to call the backend server if available
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
      
      // Return fallback response
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          answer: 'Unable to process at this time',
          explanation: `I'm temporarily unable to provide a detailed answer to "${question}". Please try again in a few moments or contact support.`,
          sources: [
            { title: 'Legal Information Institute - Cornell Law', url: 'https://www.law.cornell.edu/' },
            { title: 'National Law Review', url: 'https://www.natlawreview.com/' },
            { title: 'FindLaw', url: 'https://www.findlaw.com/' },
          ],
          disclaimers: [
            'This information is for educational purposes only.',
            'Always consult with a qualified attorney for legal advice.'
          ]
        }),
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

    req.write(data);
    req.end();
  });
}
