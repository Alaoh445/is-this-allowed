import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

// Function to analyze question and suggest relevant services
const getSuggestedServices = (question) => {
  const questionLower = question.toLowerCase();
  const suggestions = [];

  // Legal Services
  if (questionLower.includes('law') || questionLower.includes('legal') || questionLower.includes('court') ||
      questionLower.includes('contract') || questionLower.includes('divorce') || questionLower.includes('marriage') ||
      questionLower.includes('property') || questionLower.includes('inheritance') || questionLower.includes('will')) {
    suggestions.push({
      category: 'legal',
      name: 'Legal Services',
      icon: '⚖️',
      description: 'Get professional legal advice and assistance',
      reason: 'Your question involves legal matters'
    });
  }

  // Healthcare Services
  if (questionLower.includes('health') || questionLower.includes('medical') || questionLower.includes('doctor') ||
      questionLower.includes('hospital') || questionLower.includes('treatment') || questionLower.includes('medicine') ||
      questionLower.includes('insurance') || questionLower.includes('pharmacy')) {
    suggestions.push({
      category: 'health',
      name: 'Healthcare Services',
      icon: '🏥',
      description: 'Find healthcare professionals and medical services',
      reason: 'Your question relates to health and medical matters'
    });
  }

  // Business Services
  if (questionLower.includes('business') || questionLower.includes('company') || questionLower.includes('startup') ||
      questionLower.includes('tax') || questionLower.includes('accounting') || questionLower.includes('finance') ||
      questionLower.includes('marketing') || questionLower.includes('consulting')) {
    suggestions.push({
      category: 'business',
      name: 'Business Services',
      icon: '💼',
      description: 'Professional business consulting and financial services',
      reason: 'Your question involves business or financial matters'
    });
  }

  // Education & Tutoring
  if (questionLower.includes('education') || questionLower.includes('school') || questionLower.includes('university') ||
      questionLower.includes('study') || questionLower.includes('exam') || questionLower.includes('tutor') ||
      questionLower.includes('course') || questionLower.includes('training')) {
    suggestions.push({
      category: 'education',
      name: 'Education & Tutoring',
      icon: '📚',
      description: 'Educational services and academic tutoring',
      reason: 'Your question relates to education and learning'
    });
  }

  // Technology & IT
  if (questionLower.includes('computer') || questionLower.includes('software') || questionLower.includes('website') ||
      questionLower.includes('app') || questionLower.includes('programming') || questionLower.includes('tech') ||
      questionLower.includes('internet') || questionLower.includes('digital')) {
    suggestions.push({
      category: 'tech',
      name: 'Technology & IT',
      icon: '💻',
      description: 'IT support, software development, and tech services',
      reason: 'Your question involves technology or IT matters'
    });
  }

  // Real Estate
  if (questionLower.includes('property') || questionLower.includes('house') || questionLower.includes('land') ||
      questionLower.includes('rent') || questionLower.includes('lease') || questionLower.includes('real estate') ||
      questionLower.includes('mortgage') || questionLower.includes('building')) {
    suggestions.push({
      category: 'real-estate',
      name: 'Real Estate Services',
      icon: '🏠',
      description: 'Property management and real estate services',
      reason: 'Your question involves property or real estate matters'
    });
  }

  // Construction & Engineering
  if (questionLower.includes('construction') || questionLower.includes('building') || questionLower.includes('engineer') ||
      questionLower.includes('architecture') || questionLower.includes('contractor') || questionLower.includes('repair')) {
    suggestions.push({
      category: 'construction',
      name: 'Construction & Engineering',
      icon: '🏗️',
      description: 'Construction, engineering, and repair services',
      reason: 'Your question relates to construction or engineering'
    });
  }

  // Automotive Services
  if (questionLower.includes('car') || questionLower.includes('vehicle') || questionLower.includes('auto') ||
      questionLower.includes('mechanic') || questionLower.includes('repair') || questionLower.includes('driving')) {
    suggestions.push({
      category: 'automotive',
      name: 'Automotive Services',
      icon: '🚗',
      description: 'Car repair, maintenance, and automotive services',
      reason: 'Your question involves automotive matters'
    });
  }

  // If no specific matches, suggest general professional services
  if (suggestions.length === 0) {
    suggestions.push({
      category: 'business',
      name: 'Professional Services',
      icon: '👔',
      description: 'Connect with qualified professionals for your needs',
      reason: 'Consider professional assistance for your question'
    });
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
};

function Answer() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const selectedState = searchParams.get("state") || "Nigeria";
  const navigate = useNavigate();
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestedServices, setSuggestedServices] = useState([]);

  useEffect(() => {
    const fetchAnswer = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        const decodedQuestion = decodeURIComponent(id);
        
        const apiUrl = '/api/answer';
        
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            question: decodedQuestion,
            state: selectedState 
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Answer received:", data);
        setAnswer(data);
        
        // Generate service suggestions based on the question
        const suggestions = getSuggestedServices(decodedQuestion);
        setSuggestedServices(suggestions);
        
        setError(null);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message || "Failed to fetch answer. Please try again or contact support.");
        setAnswer(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnswer();
    }
  }, [id, selectedState]);

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading comprehensive answer...</p>
          <div style={{
            border: "4px solid #667eea",
            borderRadius: "50%",
            borderTop: "4px solid transparent",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite",
            margin: "20px auto"
          }}>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
          <div style={{
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            padding: "20px",
            borderRadius: "8px",
            color: "#721c24"
          }}>
            <strong>⚠️ Connection Error:</strong> {error}
            <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>
              If you're running locally, please make sure:
              <br />✓ Backend server is running (npm run server)
              <br />✓ Server is accessible on http://localhost:5000
              <br />
              <br />If you're on the deployed site, we're experiencing a temporary issue. Please try again in a moment.
            </p>
          </div>
          <button 
            onClick={() => navigate("/")}
            style={{
              marginTop: "20px",
              padding: "12px 30px",
              backgroundColor: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Back to Home
          </button>
        </div>
      </>
    );
  }

  if (!answer) {
    return (
      <>
        <Header />
        <div style={{ padding: "40px" }}>
          <p>No answer found.</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "20px" }}>
            Back to Home
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "10px" }}>Your Question:</h2>
        <p style={{ fontSize: "1.1rem", fontStyle: "italic", color: "#555" }}>
          "{answer.question}"
        </p>

        {/* Display Featured Image if available */}
        {answer.media?.image_url && (
          <div style={{ marginBottom: "20px", borderRadius: "8px", overflow: "hidden" }}>
            <img
              src={answer.media.image_url}
              alt={answer.media.image_caption || "Answer illustration"}
              style={{
                width: "100%",
                maxHeight: "400px",
                objectFit: "cover",
                borderRadius: "8px"
              }}
              className="responsive-image"
              onError={(e) => e.target.style.display = "none"}
            />
            {answer.media.image_caption && (
              <p style={{
                fontSize: "0.9rem",
                color: "#666",
                marginTop: "8px",
                fontStyle: "italic",
                textAlign: "center"
              }}
              className="responsive-caption">
                {answer.media.image_caption}
              </p>
            )}
          </div>
        )}

        {/* Display Map if available */}
        {answer.media?.map_data?.latitude && answer.media?.map_data?.longitude && (
          <div style={{ marginBottom: "30px", borderRadius: "8px", overflow: "hidden" }}>
            <h3 style={{ marginBottom: "15px" }}>📍 Location: {answer.media.map_data.location_name || "Map"}</h3>
            <iframe
              title="Location Map"
              style={{
                width: "100%",
                height: "400px",
                border: "2px solid #667eea",
                borderRadius: "8px"
              }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${answer.media.map_data.longitude - 0.5},${answer.media.map_data.latitude - 0.5},${answer.media.map_data.longitude + 0.5},${answer.media.map_data.latitude + 0.5}&layer=mapnik&marker=${answer.media.map_data.latitude},${answer.media.map_data.longitude}`}
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        )}

        <div style={{
          backgroundColor: answer.answer === "Yes" ? "#d4edda" : 
                           answer.answer === "No" ? "#f8d7da" : "#e2e3e5",
          border: `3px solid ${
            answer.answer === "Yes" ? "#28a745" : 
            answer.answer === "No" ? "#dc3545" : "#6c757d"
          }`,
          padding: "25px",
          borderRadius: "8px",
          marginBottom: "30px",
          marginTop: "20px"
        }}>
          <h1 style={{
            color: answer.answer === "Yes" ? "green" : 
                   answer.answer === "No" ? "red" : "#333",
            margin: "0",
            fontSize: "2.5rem"
          }}>
            {answer.answer ? answer.answer.toUpperCase() : "PENDING"}
          </h1>
        </div>

        <div style={{
          backgroundColor: "#f9f9f9",
          padding: "25px",
          borderLeft: "5px solid #667eea",
          borderRadius: "4px",
          marginBottom: "20px"
        }}
        className="responsive-section">
          <h3 style={{
            marginTop: "0",
            color: "#333",
            fontSize: "1.2rem"
          }}
          className="responsive-heading">📋 Detailed Explanation:</h3>
          <p style={{
            lineHeight: "1.6",
            fontSize: "1.05rem",
            color: "#555",
            whiteSpace: "pre-line",
            marginBottom: "0"
          }}
          className="responsive-text">
            {answer.explanation}
          </p>
        </div>

        {answer.actions && answer.actions.length > 0 && (
          <div style={{
            backgroundColor: "#f0f7ff",
            padding: "25px",
            borderRadius: "8px",
            marginBottom: "20px"
          }}
          className="responsive-section">
            <h3 style={{
              marginTop: "0",
              color: "#333",
              fontSize: "1.2rem"
            }}
            className="responsive-heading">✅ Recommended Actions:</h3>
            <ul style={{
              lineHeight: "1.8",
              fontSize: "1rem",
              color: "#555",
              paddingLeft: "25px"
            }}
            className="responsive-list">
              {answer.actions.map((action, index) => (
                <li key={`action-${index}`} style={{ marginBottom: "8px" }}>
                  <strong>Step {index + 1}:</strong> {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Display Videos if available */}
        {answer.media?.video_urls && answer.media.video_urls.length > 0 && (
          <div style={{
            backgroundColor: "#f0f7ff",
            padding: "25px",
            borderRadius: "8px",
            marginBottom: "30px"
          }}>
            <h3 style={{ marginTop: "0", color: "#333" }}>🎥 Related Videos:</h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px"
            }}>
              {answer.media.video_urls.map((video, index) => {
                // Handle both string URLs and video objects
                const videoUrl = typeof video === 'string' ? video : video.url;
                const videoTitle = typeof video === 'object' ? video.title : null;
                const videoDescription = typeof video === 'object' ? video.description : null;
                
                // Extract YouTube video ID if it's a YouTube URL
                const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
                const videoId = youtubeMatch ? youtubeMatch[1] : null;
                
                return (
                  <div key={videoUrl ? videoUrl : `video-${index}`} style={{
                    backgroundColor: "white",
                    padding: "15px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}>
                    {videoId ? (
                      <div>
                        <iframe
                          width="100%"
                          height="200"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={videoTitle || `Related video ${index + 1}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ borderRadius: "8px" }}
                        />
                        {videoTitle && (
                          <h4 style={{ margin: "10px 0 5px 0", fontSize: "1rem", color: "#333" }}>
                            {videoTitle}
                          </h4>
                        )}
                        {videoDescription && (
                          <p style={{ fontSize: "0.9rem", color: "#666", margin: "0" }}>
                            {videoDescription}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{
                          color: "#667eea",
                          textDecoration: "none",
                          wordBreak: "break-all",
                          display: "block",
                          marginBottom: "8px"
                        }}>
                          📺 {videoTitle || `Watch Video ${index + 1}`}
                        </a>
                        {videoDescription && (
                          <p style={{ fontSize: "0.9rem", color: "#666", margin: "0" }}>
                            {videoDescription}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {answer.sources && answer.sources.length > 0 && (
          <div style={{
            backgroundColor: "#fff3cd",
            padding: "25px",
            borderRadius: "8px",
            borderLeft: "5px solid #ffc107",
            marginBottom: "30px"
          }}>
            <h3 style={{ marginTop: "0", color: "#856404" }}>🔗 Authoritative Sources & Resources:</h3>
            <p style={{ fontSize: "0.95rem", color: "#856404", marginBottom: "15px" }}>
              Explore these trusted sources for more detailed information:
            </p>
            <ul style={{ 
              lineHeight: "2",
              fontSize: "1rem"
            }}>
              {answer.sources.map((source, index) => (
                <li key={source.url ? source.url : `source-${index}`} style={{ marginBottom: "10px" }}>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: "#0066cc", 
                      textDecoration: "none",
                      fontWeight: "500",
                      fontSize: "1.05rem"
                    }}
                    onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                    onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                  >
                    → {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Service Suggestions */}
        {suggestedServices.length > 0 && (
          <div style={{
            backgroundColor: "#e8f5e8",
            padding: "25px",
            borderRadius: "8px",
            marginBottom: "30px",
            borderLeft: "5px solid #28a745"
          }}>
            <h3 style={{ marginTop: "0", color: "#155724" }}>💡 Professional Services That May Help:</h3>
            <p style={{ fontSize: "0.95rem", color: "#155724", marginBottom: "20px" }}>
              Based on your question, here are relevant professional services you might consider:
            </p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "15px"
            }}>
              {suggestedServices.map((service, index) => (
                <div key={service.category ? service.category : `suggestion-${index}`} style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid #c3e6cb",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
                onClick={() => navigate(`/services?category=${service.category}`)}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "10px" }}>{service.icon}</div>
                  <h4 style={{ margin: "0 0 8px 0", color: "#155724" }}>{service.name}</h4>
                  <p style={{ margin: "0 0 10px 0", color: "#666", fontSize: "0.9rem" }}>
                    {service.description}
                  </p>
                  <p style={{ margin: "0", color: "#28a745", fontSize: "0.8rem", fontStyle: "italic" }}>
                    {service.reason}
                  </p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={() => navigate('/services')}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#218838"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#28a745"}
              >
                Browse All Services
              </button>
            </div>
          </div>
        )}

        <div style={{
          backgroundColor: "#f5f5f5",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
          borderLeft: "5px solid #ffc107"
        }}>
          <p style={{ margin: "0", fontSize: "0.9rem", color: "#666" }}>
            <strong>⚖️ Disclaimer:</strong> This information is for educational purposes only and should not be considered legal advice. Laws vary by location and change frequently. Always consult with a qualified attorney in your jurisdiction for legal matters.
          </p>
        </div>

        <button 
          onClick={() => {
            window.scrollTo(0, 0);
            navigate("/");
          }}
          style={{
            padding: "12px 30px",
            backgroundColor: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#5568d3"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#667eea"}
        >
          🔍 Ask Another Question
        </button>
      </div>
      <Footer />
    </>
  );
}
export default Answer;