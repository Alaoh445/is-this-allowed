// Serverless function to handle contact form submissions
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
    const { name, email, subject, message } = body;

    console.log(`[Contact Handler] Received submission from ${email}`);

    // Validation
    if (!name || !email || !subject || !message) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'All fields are required',
          fields: { name, email, subject, message }
        }),
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid email address' }),
      };
    }

    // For Netlify, we can integrate with external services
    // For now, we'll just return success and log the data
    console.log(`[Contact Handler] Contact data:`, { name, email, subject, message });

    // You could send emails using Netlify Functions with services like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Or store in a database like Supabase/Firebase

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        message: 'Your message has been received. We will respond soon.'
      }),
    };
  } catch (error) {
    console.error('[Contact Handler] Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Failed to process contact form',
        details: error.message 
      }),
    };
  }
};
