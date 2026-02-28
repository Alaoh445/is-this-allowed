import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import process from 'process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const SEND_EMAIL = process.env.SEND_EMAILS === 'true'; // Set to true in .env to enable emails

// Get directory path for file storage
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// CORS configuration to handle mobile and cross-origin requests
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
};

app.use(cors(corsOptions));
app.use(express.json());

// ============ DATA STORAGE FUNCTIONS ============

// Save contact message to file
function saveContactMessage(data) {
  const filePath = path.join(dataDir, 'contacts.json');
  let contacts = [];
  
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    contacts = JSON.parse(fileContent || '[]');
  }
  
  contacts.push({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...data
  });
  
  fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2));
  console.log(`✅ Contact saved: ${data.email}`);
  return contacts[contacts.length - 1];
}

// Save newsletter subscriber to file
function saveNewsletterSubscriber(email) {
  const filePath = path.join(dataDir, 'subscribers.json');
  let subscribers = [];
  
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    subscribers = JSON.parse(fileContent || '[]');
  }
  
  // Check if email already subscribed
  if (subscribers.some(sub => sub.email === email)) {
    throw new Error('Email already subscribed');
  }
  
  subscribers.push({
    email,
    subscribedAt: new Date().toISOString()
  });
  
  fs.writeFileSync(filePath, JSON.stringify(subscribers, null, 2));
  console.log(`✅ Newsletter subscriber saved: ${email}`);
  return { email, subscribedAt: new Date().toISOString() };
}

// Save booking request to file
function saveBooking(data) {
  const filePath = path.join(dataDir, 'bookings.json');
  let bookings = [];
  
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    bookings = JSON.parse(fileContent || '[]');
  }
  
  bookings.push({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    status: 'pending',
    ...data
  });
  
  fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2));
  console.log(`✅ Booking saved: ${data.email} - ${data.service}`);
  return bookings[bookings.length - 1];
}

// Send email notification (basic implementation)
async function sendEmailNotification(to, subject, htmlContent) {
  if (!SEND_EMAIL) {
    console.log(`📧 Email notification (not sent - disabled). To: ${to}, Subject: ${subject}`);
    return { success: true, message: 'Email notification logged' };
  }
  
  try {
    // You can integrate with Mailgun, SendGrid, Nodemailer, etc.
    // For now, we'll just log it
    console.log(`📧 Email would be sent to ${to}`);
    console.log(`Subject: ${subject}`);
    
    // Format for logging
    const logPath = path.join(dataDir, 'email-log.json');
    let emailLog = [];
    
    if (fs.existsSync(logPath)) {
      const fileContent = fs.readFileSync(logPath, 'utf-8');
      emailLog = JSON.parse(fileContent || '[]');
    }
    
    emailLog.push({
      timestamp: new Date().toISOString(),
      to,
      subject,
      status: 'sent'
    });
    
    fs.writeFileSync(logPath, JSON.stringify(emailLog, null, 2));
    
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// ============ PROFESSIONAL SERVICES MARKETPLACE ============

// Simple JWT token functions (no external library needed)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'salt123').digest('hex');
}

function generateToken(userId, userType) {
  const payload = { userId, userType, iat: Date.now() };
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto.createHmac('sha256', 'secret-key').update(`${header}.${body}`).digest('base64');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch (e) {
    return null;
  }
}

// Save user (client or service provider)
function saveUser(userData) {
  const filePath = path.join(dataDir, 'users.json');
  let users = [];
  
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    users = JSON.parse(fileContent || '[]');
  }
  
  // Check if user already exists
  if (users.find(u => u.email === userData.email)) {
    throw new Error('Email already registered');
  }
  
  const newUser = {
    id: crypto.randomBytes(8).toString('hex'),
    createdAt: new Date().toISOString(),
    password: hashPassword(userData.password),
    ...userData
  };
  
  delete newUser.password; // Don't return password
  
  users.push({
    id: newUser.id,
    email: userData.email,
    name: userData.name,
    type: userData.type, // 'client' or 'provider'
    password: hashPassword(userData.password),
    createdAt: newUser.createdAt,
    profile: userData.profile || {}
  });
  
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  console.log(`✅ User registered: ${userData.email} (${userData.type})`);
  return newUser;
}

// Get user by email
function getUserByEmail(email) {
  const filePath = path.join(dataDir, 'users.json');
  if (!fs.existsSync(filePath)) return null;
  
  const users = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
  return users.find(u => u.email === email);
}

// Get user by ID
function getUserById(userId) {
  const filePath = path.join(dataDir, 'users.json');
  if (!fs.existsSync(filePath)) return null;
  
  const users = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
  const user = users.find(u => u.id === userId);
  if (user) {
    delete user.password; // Don't return password
  }
  return user;
}

// Get all services
function getAllServices() {
  const filePath = path.join(dataDir, 'services.json');
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
}

// Save a service listing
function saveService(serviceData) {
  const filePath = path.join(dataDir, 'services.json');
  let services = [];
  
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    services = JSON.parse(fileContent || '[]');
  }
  
  const newService = {
    id: crypto.randomBytes(8).toString('hex'),
    createdAt: new Date().toISOString(),
    rating: 0,
    reviews: [],
    ...serviceData
  };
  
  services.push(newService);
  fs.writeFileSync(filePath, JSON.stringify(services, null, 2));
  console.log(`✅ Service created: ${serviceData.name} by ${serviceData.providerId}`);
  return newService;
}

// Save service request
function saveServiceRequest(requestData) {
  const filePath = path.join(dataDir, 'service-requests.json');
  let requests = [];
  
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    requests = JSON.parse(fileContent || '[]');
  }
  
  const newRequest = {
    id: crypto.randomBytes(8).toString('hex'),
    createdAt: new Date().toISOString(),
    status: 'pending',
    ...requestData
  };
  
  requests.push(newRequest);
  fs.writeFileSync(filePath, JSON.stringify(requests, null, 2));
  console.log(`✅ Service request created: ${requestData.clientId} → ${requestData.serviceId}`);
  return newRequest;
}

// Get services by category
function getServicesByCategory(category) {
  const services = getAllServices();
  return services.filter(s => s.category === category);
}

// Get services by provider
function getServicesByProvider(providerId) {
  const services = getAllServices();
  return services.filter(s => s.providerId === providerId);
}

// PROFESSIONAL SERVICES CATEGORIES
const PROFESSIONAL_CATEGORIES = [
  { id: 'legal', name: 'Legal Services', icon: '⚖️', description: 'Lawyers, legal consultants, notaries' },
  { id: 'health', name: 'Healthcare', icon: '🏥', description: 'Doctors, nurses, health consultants' },
  { id: 'education', name: 'Education & Tutoring', icon: '📚', description: 'Tutors, courses, coaching' },
  { id: 'business', name: 'Business Services', icon: '💼', description: 'Consultants, accountants, marketing' },
  { id: 'tech', name: 'Technology & IT', icon: '💻', description: 'Web development, IT support, coding' },
  { id: 'real-estate', name: 'Real Estate', icon: '🏠', description: 'Agents, property management' },
  { id: 'finance', name: 'Financial Services', icon: '💰', description: 'Accountants, financial advisors, auditors' },
  { id: 'construction', name: 'Construction & Engineering', icon: '🏗️', description: 'Contractors, architects, engineers' },
  { id: 'automotive', name: 'Automotive Services', icon: '🚗', description: 'Mechanics, car dealers, repairs' },
  { id: 'beauty', name: 'Beauty & Wellness', icon: '💅', description: 'Salons, spas, wellness coaches' },
  { id: 'cleaning', name: 'Cleaning Services', icon: '🧹', description: 'House cleaning, office cleaning' },
  { id: 'plumbing', name: 'Plumbing & Repairs', icon: '🔧', description: 'Plumbers, electricians, maintenance' }
];

// ============ API ENDPOINTS ============

// ---- AUTHENTICATION ENDPOINTS ----

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, type, profile } = req.body;

    // Validation
    if (!email || !password || !name || !type) {
      return res.status(400).json({ error: 'Email, password, name, and type (client/provider) are required' });
    }

    if (!['client', 'provider'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "client" or "provider"' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const newUser = saveUser({ email, password, name, type, profile: profile || {} });
    const token = generateToken(newUser.id, type);

    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        type: newUser.type
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.type);
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify Token & Get User
app.post('/api/auth/verify', async (req, res) => {
  try {
    const token = req.body.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ success: true, user, token });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ---- PROFESSIONAL SERVICES ENDPOINTS ----

// Get all service categories
app.get('/api/categories', (req, res) => {
  try {
    res.json({
      success: true,
      categories: PROFESSIONAL_CATEGORIES
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all services or filter by category
app.get('/api/services', (req, res) => {
  try {
    const { category } = req.query;
    let services = getAllServices();

    if (category) {
      services = services.filter(s => s.category === category);
    }

    // Add provider details to each service
    services = services.map(service => {
      const provider = getUserById(service.providerId);
      return {
        ...service,
        provider: provider ? {
          id: provider.id,
          name: provider.name,
          profile: provider.profile
        } : null
      };
    });

    res.json({
      success: true,
      services,
      total: services.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single service
app.get('/api/services/:serviceId', (req, res) => {
  try {
    const { serviceId } = req.params;
    const services = getAllServices();
    const service = services.find(s => s.id === serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const provider = getUserById(service.providerId);
    service.provider = provider ? {
      id: provider.id,
      name: provider.name,
      email: provider.email,
      profile: provider.profile
    } : null;

    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new service (provider only)
app.post('/api/services', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = getUserById(payload.userId);
    if (!user || user.type !== 'provider') {
      return res.status(403).json({ error: 'Only service providers can create services' });
    }

    const { name, category, description, price, availability } = req.body;

    if (!name || !category || !description || !price) {
      return res.status(400).json({ error: 'Name, category, description, and price are required' });
    }

    const newService = saveService({
      providerId: user.id,
      name,
      category,
      description,
      price,
      availability: availability || 'Available',
      image: req.body.image || null,
      rating: 0,
      reviews: []
    });

    res.json({
      success: true,
      message: 'Service created successfully',
      service: newService
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get services by provider
app.get('/api/provider/:providerId/services', (req, res) => {
  try {
    const { providerId } = req.params;
    const services = getServicesByProvider(providerId);

    res.json({
      success: true,
      services,
      total: services.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---- SERVICE REQUEST ENDPOINTS ----

// Request a service (client)
app.post('/api/service-requests', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = getUserById(payload.userId);
    if (!user || user.type !== 'client') {
      return res.status(403).json({ error: 'Only clients can request services' });
    }

    const { serviceId, message, preferredDate, preferredTime } = req.body;

    if (!serviceId) {
      return res.status(400).json({ error: 'Service ID is required' });
    }

    // Verify service exists
    const services = getAllServices();
    const service = services.find(s => s.id === serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const newRequest = saveServiceRequest({
      clientId: user.id,
      serviceId,
      providerId: service.providerId,
      message: message || '',
      preferredDate: preferredDate || null,
      preferredTime: preferredTime || null,
      status: 'pending'
    });

    // Send notification to provider
    const provider = getUserById(service.providerId);
    if (provider) {
      await sendEmailNotification(
        provider.email,
        `New Service Request: ${service.name}`,
        `<h2>New Service Request</h2>
         <p>A client has requested your service: <strong>${service.name}</strong></p>
         <p><strong>Client:</strong> ${user.name}</p>
         <p><strong>Message:</strong> ${newRequest.message || 'No message'}</p>
         <p><strong>Preferred Date:</strong> ${newRequest.preferredDate || 'Not specified'}</p>`
      );
    }

    res.json({
      success: true,
      message: 'Service request submitted successfully',
      request: newRequest
    });
  } catch (error) {
    console.error('Service request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get service requests (for client or provider)
app.get('/api/service-requests', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const filePath = path.join(dataDir, 'service-requests.json');
    if (!fs.existsSync(filePath)) {
      return res.json({ success: true, requests: [] });
    }

    let requests = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');

    // Filter based on user type
    if (payload.userType === 'client') {
      requests = requests.filter(r => r.clientId === payload.userId);
    } else if (payload.userType === 'provider') {
      requests = requests.filter(r => r.providerId === payload.userId);
    }

    // Add details
    requests = requests.map(req => {
      const client = getUserById(req.clientId);
      const service = getAllServices().find(s => s.id === req.serviceId);
      return {
        ...req,
        client: client ? { id: client.id, name: client.name, email: client.email } : null,
        service: service ? { id: service.id, name: service.name, price: service.price } : null
      };
    });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update service request status (provider)
app.put('/api/service-requests/:requestId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { requestId } = req.params;
    const { status } = req.body; // accepted, declined, completed

    const filePath = path.join(dataDir, 'service-requests.json');
    let requests = [];

    if (fs.existsSync(filePath)) {
      requests = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
    }

    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (requests[requestIndex].providerId !== payload.userId) {
      return res.status(403).json({ error: 'Only the service provider can update this request' });
    }

    requests[requestIndex].status = status;
    requests[requestIndex].updatedAt = new Date().toISOString();

    fs.writeFileSync(filePath, JSON.stringify(requests, null, 2));

    // Send notification to client
    const client = getUserById(requests[requestIndex].clientId);
    if (client) {
      await sendEmailNotification(
        client.email,
        `Service Request ${status.toUpperCase()}`,
        `<h2>Service Request Update</h2>
         <p>Your service request has been <strong>${status.toUpperCase()}</strong>.</p>`
      );
    }

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      request: requests[requestIndex]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Contact Form Submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        error: 'All fields are required',
        fields: { name, email, subject, message }
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Save contact message
    const contactData = {
      name,
      email,
      subject,
      message
    };
    
    const savedContact = saveContactMessage(contactData);
    
    // Send confirmation email to user
    await sendEmailNotification(
      email,
      'We Received Your Message',
      `<h2>Thank you for contacting Is This Allowed?</h2>
       <p>Hi ${name},</p>
       <p>We have received your message and will get back to you as soon as possible.</p>
       <p><strong>Subject:</strong> ${subject}</p>
       <p>Best regards,<br/>Is This Allowed? Team</p>`
    );
    
    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@thisallowed.com';
    await sendEmailNotification(
      adminEmail,
      `New Contact Message: ${subject}`,
      `<h2>New Contact Form Submission</h2>
       <p><strong>Name:</strong> ${name}</p>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Subject:</strong> ${subject}</p>
       <p><strong>Message:</strong></p>
       <p>${message}</p>`
    );
    
    res.json({
      success: true,
      message: 'Your message has been received. We will respond soon.',
      id: savedContact.id
    });
  } catch (error) {
    console.error('Error processing contact:', error);
    res.status(500).json({ 
      error: 'Failed to process contact form',
      details: error.message 
    });
  }
});

// Newsletter Signup
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validation
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Save subscriber
    const subscriber = saveNewsletterSubscriber(email);
    
    // Send confirmation email
    await sendEmailNotification(
      email,
      'Welcome to Is This Allowed? Newsletter',
      `<h2>Welcome!</h2>
       <p>Thank you for subscribing to our newsletter.</p>
       <p>You will now receive updates about new legal resources, tips, and guides.</p>
       <p>Best regards,<br/>Is This Allowed? Team</p>`
    );
    
    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('Error processing newsletter:', error);
    
    if (error.message === 'Email already subscribed') {
      return res.status(409).json({ 
        success: false,
        error: 'Email is already subscribed' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to subscribe to newsletter',
      details: error.message 
    });
  }
});

// Booking Request
app.post('/api/booking', async (req, res) => {
  try {
    const { name, email, phone, service, date, time, notes } = req.body;
    
    // Validation
    if (!name || !email || !phone || !service || !date) {
      return res.status(400).json({ 
        error: 'Name, email, phone, service, and date are required'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Phone validation (basic)
    if (phone.length < 10) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    
    // Save booking
    const bookingData = {
      name,
      email,
      phone,
      service,
      date,
      time: time || 'TBD',
      notes: notes || ''
    };
    
    const savedBooking = saveBooking(bookingData);
    
    // Send confirmation email to user
    await sendEmailNotification(
      email,
      'Booking Request Received',
      `<h2>Thank you for your booking request</h2>
       <p>Hi ${name},</p>
       <p>We have received your booking request for <strong>${service}</strong> on <strong>${date}</strong>.</p>
       <p>We will contact you shortly to confirm the appointment.</p>
       <p><strong>Reference ID:</strong> ${savedBooking.id}</p>
       <p>Best regards,<br/>Is This Allowed? Team</p>`
    );
    
    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@thisallowed.com';
    await sendEmailNotification(
      adminEmail,
      `New Booking Request: ${service}`,
      `<h2>New Booking Request</h2>
       <p><strong>Name:</strong> ${name}</p>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Phone:</strong> ${phone}</p>
       <p><strong>Service:</strong> ${service}</p>
       <p><strong>Date:</strong> ${date}</p>
       <p><strong>Time:</strong> ${time || 'TBD'}</p>
       <p><strong>Notes:</strong> ${notes || 'None'}</p>
       <p><strong>Reference ID:</strong> ${savedBooking.id}</p>`
    );
    
    res.json({
      success: true,
      message: 'Your booking request has been received. We will contact you soon.',
      bookingId: savedBooking.id
    });
  } catch (error) {
    console.error('Error processing booking:', error);
    res.status(500).json({ 
      error: 'Failed to process booking',
      details: error.message 
    });
  }
});

// Get submissions (admin endpoint - for viewing stored data)
app.get('/api/admin/contacts', (req, res) => {
  try {
    const filePath = path.join(dataDir, 'contacts.json');
    if (!fs.existsSync(filePath)) {
      return res.json([]);
    }
    const contacts = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve contacts' });
  }
});

app.get('/api/admin/subscribers', (req, res) => {
  try {
    const filePath = path.join(dataDir, 'subscribers.json');
    if (!fs.existsSync(filePath)) {
      return res.json([]);
    }
    const subscribers = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve subscribers' });
  }
});

app.get('/api/admin/bookings', (req, res) => {
  try {
    const filePath = path.join(dataDir, 'bookings.json');
    if (!fs.existsSync(filePath)) {
      return res.json([]);
    }
    const bookings = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve bookings' });
  }
});

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
