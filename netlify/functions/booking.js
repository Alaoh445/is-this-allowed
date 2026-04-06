// Serverless function to handle booking requests
exports.handler = async (event) => {
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
    const { name, email, phone, service, date, time, notes } = body;

    console.log(`[Booking Handler] Received booking from ${email}`);

    // Validation
    if (!name || !email || !phone || !service || !date) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Name, email, phone, service, and date are required'
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

    // Phone validation (basic)
    if (phone.length < 10) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid phone number' }),
      };
    }

    // Generate booking ID
    const bookingId = Date.now();

    // Store booking data
    console.log(`[Booking Handler] Booking details:`, { 
      bookingId, 
      name, 
      email, 
      phone, 
      service, 
      date, 
      time: time || 'TBD', 
      notes 
    });

    // You can integrate with:
    // - Calendly
    // - Acuity Scheduling
    // - Supabase
    // - Firebase
    // - Stripel
    // - Or build your own database

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        message: 'Your booking request has been received. We will contact you soon.',
        bookingId: bookingId
      }),
    };
  } catch (error) {
    console.error('[Booking Handler] Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Failed to process booking',
        details: error.message 
      }),
    };
  }
};
