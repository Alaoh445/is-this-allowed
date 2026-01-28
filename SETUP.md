# Is This Allowed? - Legal Rights Application

A modern web application that helps users understand their legal rights with comprehensive answers and resources.

## Project Structure

```
is-this-allowed/
├── src/                      # Frontend React code
│   ├── components/          # Reusable React components
│   │   ├── Header.jsx       # Header component
│   │   └── Header.css       # Header styles
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Home/search page
│   │   └── Answer.jsx       # Answer display page
│   ├── data/                # Static data
│   │   └── question.js      # Sample questions
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # App entry point
│   ├── index.css            # Global styles
│   └── App.css              # App styles
├── public/                  # Static assets
├── server.js                # Express backend server
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── .env                     # Environment variables
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend Server
Open a terminal and run:
```bash
npm run server
```
The server will start on `http://localhost:5000`

### 3. Start the Frontend (in a new terminal)
```bash
npm run dev
```
The frontend will start on `http://localhost:5173` (or another port if 5173 is in use)

### 4. Run Both Together (Optional)
```bash
npm run dev:all
```
This starts both the frontend and backend simultaneously using concurrently.

## Features

### Frontend
- **Modern Header**: Sleek gradient design with responsive layout
- **Dynamic Search**: Users can ask any question, not just predefined ones
- **Route-based Navigation**: Clean URL structure with React Router
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### Backend
- **Express Server**: Fast and lightweight API server
- **Knowledge Base**: Pre-loaded legal information for common questions
- **CORS Enabled**: Allows cross-origin requests from the frontend
- **Smart Matching**: Keyword-based answer matching
- **Fallback System**: Provides guidance for unknown questions

## API Endpoints

### POST `/api/answer`
Submit a question and get an answer with sources.

**Request:**
```json
{
  "question": "Can my landlord raise my rent?"
}
```

**Response:**
```json
{
  "question": "Can my landlord raise my rent?",
  "answer": "It Depends",
  "explanation": "Rent increase laws vary by location...",
  "actions": [
    "Check local rent control laws",
    "Document communications"
  ],
  "sources": [
    {
      "title": "Legal Information Institute",
      "url": "https://..."
    }
  ]
}
```

### GET `/api/health`
Health check endpoint to verify the server is running.

## Supported Questions

The backend has pre-loaded knowledge for questions about:
- **Rent & Eviction**: Rent increases, eviction procedures, security deposits
- **Discrimination**: Fair housing laws, protected classes
- **Tenant Rights**: General rights and responsibilities

For other questions, the app directs users to appropriate legal resources.

## Technologies Used

### Frontend
- React 19.2
- React Router DOM 7.13
- Vite 7.2.5

### Backend
- Express 4.18
- CORS 2.8
- Node.js

## Development

### Adding New Knowledge
Edit the `legalKnowledgeBase` object in `server.js` to add more questions:

```javascript
"keyword": {
  answer: "Yes/No/It Depends",
  explanation: "Detailed explanation...",
  actions: ["Action 1", "Action 2"],
  sources: [{ title: "Source", url: "URL" }]
}
```

### Styling
- Header styles: `src/components/Header.css`
- Global styles: `src/index.css`
- Component styles: Inline or separate CSS files

## Environment Variables

`.env` file configuration:
```
PORT=5000
NODE_ENV=development
```

## Troubleshooting

### "Failed to fetch answer" Error
- Ensure the backend server is running on port 5000
- Check browser console for CORS errors
- Verify the API endpoint is accessible

### Vite Port Already in Use
Change the port in your terminal or update `package.json` dev script

### CORS Issues
The backend already has CORS enabled, but make sure:
- The backend is running
- The frontend is making requests to `http://localhost:5000`

## Future Enhancements

- [ ] Integrate with AI APIs (OpenAI, Google Gemini)
- [ ] Add user feedback/rating system
- [ ] Database integration for storing questions
- [ ] Multi-language support
- [ ] Authentication for admin panel
- [ ] Analytics tracking
- [ ] Caching for frequently asked questions

## License

MIT License - Feel free to use this project for your purposes.

## Support

For issues or questions, please create an issue in the repository.
