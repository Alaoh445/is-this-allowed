import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

function Answer() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const selectedState = searchParams.get("state") || "Nigeria";
  const navigate = useNavigate();
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnswer = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        const decodedQuestion = decodeURIComponent(id);
        
        // Determine the API endpoint based on environment
        // In development with Vite proxy, use /api/answer
        // In production on Netlify, use /.netlify/functions/answer
        const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        const apiUrl = isProduction ? '/.netlify/functions/answer' : '/api/answer';
        
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
          <div style={{ marginBottom: "30px", borderRadius: "8px", overflow: "hidden" }}>
            <img 
              src={answer.media.image_url} 
              alt={answer.media.image_caption || "Answer illustration"}
              style={{
                width: "100%",
                maxHeight: "400px",
                objectFit: "cover",
                borderRadius: "8px"
              }}
              onError={(e) => e.target.style.display = "none"}
            />
            {answer.media.image_caption && (
              <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "8px", fontStyle: "italic" }}>
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
          marginBottom: "30px"
        }}>
          <h3 style={{ marginTop: "0", color: "#333" }}>📋 Detailed Explanation:</h3>
          <p style={{ 
            lineHeight: "1.8", 
            fontSize: "1.05rem",
            color: "#555",
            whiteSpace: "pre-line"
          }}>
            {answer.explanation}
          </p>
        </div>

        {answer.actions && answer.actions.length > 0 && (
          <div style={{
            backgroundColor: "#f0f7ff",
            padding: "25px",
            borderRadius: "8px",
            marginBottom: "30px"
          }}>
            <h3 style={{ marginTop: "0", color: "#333" }}>✅ Recommended Actions:</h3>
            <ul style={{ 
              lineHeight: "2.2",
              fontSize: "1rem",
              color: "#555"
            }}>
              {answer.actions.map((action, index) => (
                <li key={index} style={{ marginBottom: "8px" }}>
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
              {answer.media.video_urls.map((url, index) => {
                // Extract YouTube video ID if it's a YouTube URL
                const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
                const videoId = youtubeMatch ? youtubeMatch[1] : null;
                
                return (
                  <div key={index}>
                    {videoId ? (
                      <iframe
                        width="100%"
                        height="200"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={`Related video ${index + 1}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ borderRadius: "8px" }}
                      />
                    ) : (
                      <a href={url} target="_blank" rel="noopener noreferrer" style={{
                        color: "#667eea",
                        textDecoration: "none",
                        wordBreak: "break-all"
                      }}>
                        📺 Watch Video {index + 1}
                      </a>
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
                <li key={index} style={{ marginBottom: "10px" }}>
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